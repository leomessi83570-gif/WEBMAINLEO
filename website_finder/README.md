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
   node index.js "secteur" "ville ou zone"
   ```
   Exemple :
   ```
   node index.js "fleuriste" "Gignac-la-Nerthe"
   ```

5. **Regarder le résultat**
   Le fichier `resultats.csv` est créé à la racine du projet, trié avec
   en premier : les entreprises sans site, puis les sites défaillants,
   puis les sites qui fonctionnent bien.

## Pour aller plus loin (à demander à Claude Code plus tard)

- Boucler automatiquement sur plusieurs secteurs / plusieurs villes
- Exporter aussi en fichier Excel
- Ajouter un score de priorité plus fin (âge du site, mobile-friendly...)
