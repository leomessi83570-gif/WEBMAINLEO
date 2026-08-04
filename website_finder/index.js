// Prospection MOSA — trouve les entreprises sans site web ou avec un site défaillant
// Usage : node index.js "secteur1,secteur2,..." "ville1,ville2,..."
// Exemple : node index.js "fleuriste,boulangerie" "Gignac-la-Nerthe,Marseille"

import axios from "axios";
import { createObjectCsvWriter } from "csv-writer";
import ExcelJS from "exceljs";
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const [secteursArg, zonesArg] = process.argv.slice(2);

if (!API_KEY) {
  console.error("❌ Il manque GOOGLE_PLACES_API_KEY dans le fichier .env");
  process.exit(1);
}
if (!secteursArg || !zonesArg) {
  console.error('Usage : node index.js "secteur1,secteur2" "ville1,ville2"');
  console.error('Exemple : node index.js "fleuriste,boulangerie" "Gignac-la-Nerthe,Marseille"');
  process.exit(1);
}

const REGEX_VIEWPORT = /<meta[^>]+name=["']viewport["'][^>]+content=["'][^"']*width=device-width/i;

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

// 2. Vérifie l'état d'un site web (code HTTP, HTTPS, temps de réponse, mobile-friendly)
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
    const html = typeof res.data === "string" ? res.data : "";
    const mobileFriendly = html ? REGEX_VIEWPORT.test(html) : null;

    let statut;
    if (res.status >= 400) statut = `SITE EN ERREUR (code ${res.status})`;
    else if (!https) statut = "SITE DÉFAILLANT (pas de HTTPS)";
    else if (tempsMs > 4000) statut = `SITE LENT (${tempsMs}ms)`;
    else statut = "OK";

    return { statut, mobileFriendly };
  } catch (err) {
    return { statut: "SITE INACCESSIBLE (hors ligne ou expiré)", mobileFriendly: null };
  }
}

// 3. Estime l'âge d'un site via la date d'enregistrement du nom de domaine (RDAP, sans clé requise)
async function ageDuSite(url) {
  try {
    const { hostname } = new URL(url);
    const domaine = hostname.replace(/^www\./, "");
    const labels = domaine.split(".");
    const domainePrincipal = labels.length > 2 ? labels.slice(-2).join(".") : domaine;

    const res = await axios.get(`https://rdap.org/domain/${domainePrincipal}`, { timeout: 5000 });
    const evenement = (res.data.events || []).find((e) => e.eventAction === "registration");
    if (!evenement) return null;

    const ageMs = Date.now() - new Date(evenement.eventDate).getTime();
    return Math.round((ageMs / (365.25 * 24 * 3600 * 1000)) * 10) / 10;
  } catch {
    return null;
  }
}

// 4. Calcule un score de priorité (plus bas = meilleur prospect)
function calculerScore(statut, mobileFriendly, ageAns) {
  let score;
  if (statut === "PAS DE SITE") score = 0;
  else if (statut.startsWith("SITE INACCESSIBLE")) score = 10;
  else if (statut.startsWith("SITE EN ERREUR")) score = 15;
  else if (statut.startsWith("SITE DÉFAILLANT")) score = 20;
  else if (statut.startsWith("SITE LENT")) score = 25;
  else score = 50; // site OK

  if (score === 50) {
    if (mobileFriendly === false) score -= 15; // pas adapté mobile : bon prospect pour une refonte
    if (typeof ageAns === "number" && ageAns >= 8) score -= 10; // site ancien
    else if (typeof ageAns === "number" && ageAns >= 5) score -= 5;
  }

  return score;
}

// 5. Export Excel (en plus du CSV)
async function exporterExcel(lignes, chemin) {
  const workbook = new ExcelJS.Workbook();
  const feuille = workbook.addWorksheet("Prospects");

  feuille.columns = [
    { header: "Secteur", key: "secteur", width: 20 },
    { header: "Ville", key: "ville", width: 20 },
    { header: "Nom", key: "nom", width: 30 },
    { header: "Adresse", key: "adresse", width: 40 },
    { header: "Téléphone", key: "tel", width: 18 },
    { header: "Site web", key: "site", width: 30 },
    { header: "Statut", key: "statut", width: 30 },
    { header: "Mobile-friendly", key: "mobileFriendly", width: 16 },
    { header: "Âge du site (ans)", key: "ageSite", width: 18 },
    { header: "Score priorité", key: "score", width: 14 },
  ];
  feuille.getRow(1).font = { bold: true };
  feuille.addRows(lignes);

  await workbook.xlsx.writeFile(chemin);
}

// 6. Boucle principale — sur tous les secteurs x toutes les villes
async function main() {
  const secteurs = secteursArg.split(",").map((s) => s.trim()).filter(Boolean);
  const villes = zonesArg.split(",").map((v) => v.trim()).filter(Boolean);

  const lignes = [];

  for (const secteur of secteurs) {
    for (const ville of villes) {
      console.log(`\n🔎 Recherche : "${secteur}" à "${ville}"...`);
      const places = await chercherEntreprises(`${secteur} ${ville}`);
      console.log(`→ ${places.length} entreprises trouvées. Vérification des sites...`);

      for (const p of places) {
        const nom = p.displayName?.text || "?";
        const adresse = p.formattedAddress || "";
        const tel = p.nationalPhoneNumber || "";
        const site = p.websiteUri || "";

        let statut;
        let mobileFriendly = null;
        let ageSite = null;

        if (!site) {
          statut = "PAS DE SITE";
        } else {
          const resultat = await verifierSite(site);
          statut = resultat.statut;
          mobileFriendly = resultat.mobileFriendly;
          if (statut === "OK") ageSite = await ageDuSite(site);
        }

        const score = calculerScore(statut, mobileFriendly, ageSite);

        console.log(`  • ${nom} — ${statut}${ageSite !== null ? ` — ${ageSite} ans` : ""}`);
        lignes.push({
          secteur,
          ville,
          nom,
          adresse,
          tel,
          site,
          statut,
          mobileFriendly: mobileFriendly === null ? "Inconnu" : mobileFriendly ? "Oui" : "Non",
          ageSite: ageSite === null ? "Inconnu" : ageSite,
          score,
        });
      }
    }
  }

  // Trie pour mettre les meilleurs prospects en premier
  lignes.sort((a, b) => a.score - b.score);

  const writerCsv = createObjectCsvWriter({
    path: "resultats.csv",
    header: [
      { id: "secteur", title: "Secteur" },
      { id: "ville", title: "Ville" },
      { id: "nom", title: "Nom" },
      { id: "adresse", title: "Adresse" },
      { id: "tel", title: "Téléphone" },
      { id: "site", title: "Site web" },
      { id: "statut", title: "Statut" },
      { id: "mobileFriendly", title: "Mobile-friendly" },
      { id: "ageSite", title: "Âge du site (ans)" },
      { id: "score", title: "Score priorité" },
    ],
  });
  await writerCsv.writeRecords(lignes);
  await exporterExcel(lignes, "resultats.xlsx");

  console.log(
    `\n✅ Terminé. ${lignes.length} entreprises. Résultats dans resultats.csv et resultats.xlsx.`
  );
}

main().catch((err) => {
  console.error("❌ Erreur :", err.message);
  process.exit(1);
});
