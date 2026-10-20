# ANGRAMM® — site vitrine

Site statique (HTML/CSS/JS, aucune dépendance), dans l'esprit de 530degres.agency :
nav fine répartie sur la largeur avec le logo au centre, films plein écran qui défilent au scroll,
page Projets en grille aérée (l'aperçu s'anime au survol), curseur flèche sur mesure.

Pages : `/` (films), `/projets/`, `/studio/` (texte, clients, contact), `/work/<slug>/` (un film).

## Structure

```
content/site.json       infos du studio (domaine, description, texte « Studio », contact)
content/projects.json   liste des projets (ordre = ordre d'affichage)
build.mjs               génère les pages HTML + sitemap.xml + robots.txt + llms.txt
site/                   dossier à mettre en ligne
  assets/               style.css, main.js
  fonts/                Archivo variable (OFL), la typo de marque
  media/<slug>/         full.mp4 (film d'origine, sans réencodage), preview.mp4 (8 s, survol de la grille), poster.jpg
```

## Typo

Le logo est dessiné dans une grotesque de type Helvetica Neue Bold élargie.
Équivalent libre retenu : **Archivo** (Google Fonts, licence OFL), axe de largeur à **112 %**,
graisse **600**, en capitales. Si ANGRAMM a la licence de la typo d'origine
(Neue Haas Grotesk / Helvetica Now Display), il suffit de remplacer le fichier dans `site/fonts/`.

## Ajouter un projet

1. Créer `site/media/<slug>/` avec :
   ```bash
   ffmpeg -i source.mp4 -c copy -movflags +faststart full.mp4
   ffmpeg -ss 20 -t 8 -i source.mp4 -an -vf "scale=-2:'min(720,ih)'" -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart preview.mp4
   ffmpeg -ss 20 -i source.mp4 -frames:v 1 -q:v 2 poster.jpg
   ```
2. Ajouter l'entrée dans `content/projects.json` (`start` = seconde où démarre le film sur l'accueil, `short` = nom court optionnel pour l'accueil,
   `credits` = liste optionnelle `{ "role": "Réalisation", "name": "…" }`, `date` = AAAA-MM-JJ).
3. `node build.mjs`

## Aperçu local

```bash
node build.mjs && cd site && python3 -m http.server 8000
```

## Mise en ligne

Netlify, Vercel ou Cloudflare Pages : dossier racine `angramm`, commande de build
`node build.mjs`, dossier publié `angramm/site`.
Quand le catalogue grossit, héberger les vidéos sur un CDN vidéo (Bunny Stream, Cloudflare Stream, Mux)
plutôt que dans le dépôt git.

## À valider avec ANGRAMM

- [ ] Nom de domaine (`content/site.json` → `url`) : toutes les URLs SEO en dépendent
- [ ] Textes « Studio » et description (rédigés à partir des films, à confirmer)
- [ ] Client et titre réels du projet « Volcan », titres officiels des autres films, années, crédits
- [ ] E-mail de contact
- [ ] Fichiers vidéo originaux (4K / 1080p) : les versions actuelles sont des exports Instagram en 720p
- [ ] Logo vectoriel (SVG) pour remplacer le logotype texte

## SEO déjà en place

- Pages pré-rendues (aucun contenu dépendant du JS), une URL par projet (`/work/<slug>/`)
- `title`, `description`, `canonical`, Open Graph (dont `og:video`), Twitter card
- JSON-LD : `Organization`, `WebSite`, `ItemList` (accueil), `VideoObject` + `BreadcrumbList` (projets)
- `sitemap.xml` avec extension vidéo, `robots.txt`, `llms.txt`
- Police auto-hébergée et préchargée, poster préchargé (LCP), vidéos chargées à la demande
