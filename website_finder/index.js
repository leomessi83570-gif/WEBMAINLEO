// Prospection MOSA — trouve les entreprises sans site web ou avec un site défaillant
// Usage : node index.js "secteur d'activité" "ville ou zone"
// Exemple : node index.js "fleuriste" "Gignac-la-Nerthe"

import axios from "axios";
import { createObjectCsvWriter } from "csv-writer";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const [secteur, zone] = process.argv.slice(2);

if (!API_KEY) {
  console.error("❌ Il manque GOOGLE_PLACES_API_KEY dans le fichier .env");
  process.exit(1);
}
if (!secteur || !zone) {
  console.error('Usage : node index.js "secteur" "ville ou zone"');
  console.error('Exemple : node index.js "fleuriste" "Gignac-la-Nerthe"');
  process.exit(1);
}

// 1. Cherche les entreprises via l'API Google Places (Text Search)
async function chercherEntreprises(query) {
  const url = "https://places.googleapis.com/v1/places:searchText";
  const resultats = [];
  let pageToken = undefined;

  for (let page = 0; page < 3; page++) {
    const body = { textQuery: query, languageCode: "fr" };
    if (pageToken) body.pageToken = pageToken;

    const res = await axios.post(url, body, {
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask":
          "places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,nextPageToken",
      },
    });

    resultats.push(...(res.data.places || []));
    pageToken = res.data.nextPageToken;
    if (!pageToken) break;

    // Google exige un court délai avant d'utiliser le nextPageToken
    await new Promise((r) => setTimeout(r, 2000));
  }

  return resultats;
}

// 2. Vérifie l'état d'un site web (code HTTP, HTTPS, temps de réponse)
async function verifierSite(url) {
  const debut = Date.now();
  try {
    const res = await axios.get(url, {
      timeout: 6000,
      maxRedirects: 5,
      validateStatus: () => true, // on veut analyser même les erreurs
    });
    const tempsMs = Date.now() - debut;
    const https = url.startsWith("https://");

    if (res.status >= 400) return `SITE EN ERREUR (code ${res.status})`;
    if (!https) return "SITE DÉFAILLANT (pas de HTTPS)";
    if (tempsMs > 4000) return `SITE LENT (${tempsMs}ms)`;
    return "OK";
  } catch (err) {
    return "SITE INACCESSIBLE (hors ligne ou expiré)";
  }
}

// 3. Boucle principale
async function main() {
  console.log(`🔎 Recherche : "${secteur}" à "${zone}"...`);
  const places = await chercherEntreprises(`${secteur} ${zone}`);
  console.log(`→ ${places.length} entreprises trouvées. Vérification des sites...`);

  const lignes = [];
  for (const p of places) {
    const nom = p.displayName?.text || "?";
    const adresse = p.formattedAddress || "";
    const tel = p.nationalPhoneNumber || "";
    const site = p.websiteUri || "";

    let statut;
    if (!site) {
      statut = "PAS DE SITE";
    } else {
      statut = await verifierSite(site);
    }

    console.log(`  • ${nom} — ${statut}`);
    lignes.push({ nom, adresse, tel, site, statut });
  }

  // Trie pour mettre les meilleurs prospects en premier
  const priorite = (s) => (s === "PAS DE SITE" ? 0 : s === "OK" ? 9 : 1);
  lignes.sort((a, b) => priorite(a.statut) - priorite(b.statut));

  const writer = createObjectCsvWriter({
    path: "resultats.csv",
    header: [
      { id: "nom", title: "Nom" },
      { id: "adresse", title: "Adresse" },
      { id: "tel", title: "Téléphone" },
      { id: "site", title: "Site web" },
      { id: "statut", title: "Statut" },
    ],
  });
  await writer.writeRecords(lignes);

  console.log(`\n✅ Terminé. Résultats dans resultats.csv (${lignes.length} entreprises).`);
}

main().catch((err) => {
  console.error("❌ Erreur :", err.message);
  process.exit(1);
});
