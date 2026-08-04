# Prospection MOSA

Trouve les entreprises d'un secteur, dans une zone géographique, qui n'ont
pas de site web ou dont le site est défaillant (hors ligne, sans HTTPS,
trop lent). Sort un fichier `resultats.csv` trié avec les meilleurs
prospects en premier.

## Étapes (donne ça telles quelles à Claude Code)

1. **Récupérer une clé API Google Places** (gratuite jusqu'à un certain
   volume) :
   - Aller sur https://console.cloud.google.com/
   - Créer un projet
   - Activer "Places API (New)"
   - Créer une clé API dans "Identifiants"

2. **Installer les dépendances**
   ```
   npm install
   ```

3. **Configurer la clé**
   - Copier `.env.example` en `.env`
   - Coller ta clé dans le fichier `.env`

4. **Lancer une recherche**
   ```
   node index.js "secteur1,secteur2,..." "ville1,ville2,..."
   ```
   Un seul secteur et une seule ville fonctionnent aussi. Le script boucle
   automatiquement sur toutes les combinaisons secteur × ville.

   Exemple simple :
   ```
   node index.js "fleuriste" "Gignac-la-Nerthe"
   ```
   Exemple avec plusieurs secteurs et plusieurs villes :
   ```
   node index.js "fleuriste,boulangerie" "Gignac-la-Nerthe,Martigues"
   ```

5. **Regarder le résultat**
   Deux fichiers sont créés à la racine du projet : `resultats.csv` et
   `resultats.xlsx`, avec les colonnes suivantes :
   - Secteur, Ville, Nom, Adresse, Téléphone, Site web
   - Statut (PAS DE SITE / SITE INACCESSIBLE / SITE EN ERREUR / SITE
     DÉFAILLANT / SITE LENT / OK)
   - Mobile-friendly (Oui / Non / Inconnu) : détecté via la balise
     `<meta name="viewport">` de la page
   - Âge du site (ans) : estimé via la date d'enregistrement du nom de
     domaine (RDAP), uniquement calculé pour les sites qui fonctionnent
   - Score priorité : plus le score est bas, meilleur est le prospect.
     Un site qui fonctionne mais qui est ancien ou pas adapté mobile
     obtient un score plus bas (donc plus prioritaire) qu'un site OK
     récent et mobile-friendly.

## Pour aller plus loin (à demander à Claude Code plus tard)

- Exporter aussi vers un CRM ou Google Sheets
- Ajouter l'envoi automatique d'un email de prospection aux meilleurs prospects
