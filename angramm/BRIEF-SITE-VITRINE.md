# Brief : construire un site vitrine vidéo du niveau d'ANGRAMM

À donner à Claude au début de la session. Ce sont les décisions et les pièges appris en construisant angramm.com (agence créative / production audiovisuelle, Marseille).

## 1. Ce qu'on vise

- Un site **statique**, sans framework, sans dépendances et sans base de données : rapide, hébergeable partout (Netlify, OVH, GitHub Pages) et sans maintenance.
- La vidéo est le produit : plein écran, démarrage instantané, et aucun saut de mise en page.
- Typographie très sobre : une linéale grasse pour la navigation et les titres (Helvetica Bold), une serif pour le texte (EB Garamond). Fond noir, texte blanc.

## 2. Architecture (à reproduire telle quelle)

```
site-projet/
  build.mjs              # générateur Node pur (node build.mjs), écrit tout le HTML dans site/
  content/site.json      # nom, url, langue, description, textes, email, instagram
  content/projects.json  # liste des films (ordre = ordre d'affichage)
  content/bts.json       # photos coulisses (facultatif)
  site/                  # dossier publié
    assets/style.css, main.js, og.jpg
    fonts/*.woff2        # polices auto-hébergées (pas de Google Fonts)
    media/<slug>/full.mp4, preview.mp4, poster.webp, thumb.webp, still-1..4.webp
    _headers, _redirects, robots.txt, sitemap.xml, llms.txt, 404.html
netlify.toml             # base = dossier du projet, command = "node build.mjs", publish = "site"
```

Champs d'un film dans `projects.json` : `slug`, `client`, `short`, `title`, `summary` (1 à 2 phrases en anglais), `location`, `date`, `duration` (en secondes), `width`, `height`, `lines` (2 lignes affichées sur le film), puis les options `hideDesktop`, `hideMobile` et `canonicalOf` (quand le même film existe en 16:9 et en 9:16).

Le build génère :
- l'accueil (reels plein écran) ;
- /films/ (grille 4:5) ;
- /work/<slug>/ (une page par film) ;
- /team/ (mosaïque photos + lightbox) ;
- /contact/ ;
- la page 404 ;
- le sitemap avec les balises vidéo, le JSON-LD (Organization, VideoObject), les balises Open Graph et `?v=<hash>` sur le CSS et le JS (cache cassé automatiquement).

## 3. Vidéos (c'est 80 % de la qualité)

- Pour chaque film, encode avec ffmpeg :
  - `full.mp4` : H.264, `-crf 23`, `-preset slow`, `-movflags +faststart`, AAC 128k, 1080p max. Vise 20 à 50 Mo et **jamais plus de 100 Mo**.
  - `preview.mp4` : boucle muette de 6 à 10 s, 720p, `-an`, environ 2 à 4 Mo.
  - `poster.webp` : 1re image, même ratio que la vidéo.
  - `thumb.webp` : vignette 4:5 pour la grille.
- **`+faststart` est obligatoire**, sinon la vidéo ne démarre qu'une fois entièrement téléchargée.
- Mets toujours `muted playsinline autoplay loop` + `poster` sur les vidéos d'ambiance (sinon iOS bloque l'autoplay).
- Sépare les formats : l'ordinateur reçoit les films 16:9, le téléphone reçoit les films 9:16 (filtrés par une media query ou une classe, pas en JavaScript après le chargement).
- Charge en différé (`preload="none"`, IntersectionObserver) tout ce qui n'est pas au premier écran.

## 4. Les pièges qu'on a vraiment rencontrés

1. **Saut de texte au chargement.** Si du JavaScript ajuste une mise en page (aligner un texte sur une vidéo, par exemple), le texte s'affiche d'abord mal placé puis se décale. Solution : faire la mise en page en CSS pur (grid), ou masquer le bloc (`opacity:0`) jusqu'à `document.fonts.ready` + le calcul, puis l'afficher en fondu.
2. **Polices** : héberger les `.woff2` dans le site, `preload` la police du texte et utiliser `font-display: swap`, en gardant à l'esprit le point 1.
3. **Unités de hauteur sur mobile** : utiliser `100svh` (et non `100vh`), sinon la barre d'adresse de Safari coupe le contenu.
4. **Curseur personnalisé** : à éviter, c'était jugé gênant et on l'a retiré.
5. **Une modification Python ou sed qui cible du HTML** peut toucher deux endroits (par exemple, la même liste dans Contact et dans la 404). Cibler précisément et vérifier.
6. **Tester à 3 tailles** avant chaque livraison, avec Playwright : 1440×900, 1920×1080 et iPhone (390×844). Faire des captures et les regarder.
7. **Le client valide sur des captures et des vidéos d'écran.** Faire une petite modification à la fois, et revenir en arrière tout de suite si on te le demande.

## 5. Hébergement et domaine

- Les limites de taille de fichier comptent à cause des vidéos :
  - Cloudflare Pages refuse les fichiers de plus de 25 Mo, donc il est inutilisable ici ;
  - GitHub Pages est gratuit, accepte les fichiers jusqu'à 100 Mo et 1 Go au total, mais le dépôt doit être public ;
  - l'offre gratuite de Netlify affiche un badge « Powered by Netlify » ;
  - OVH Starter (environ 1 Go) fonctionne pour un site statique, à remplir par FTP. Ne pas installer WordPress ni le CDN.
- DNS OVH vers Netlify :
  - A `@` → `75.2.60.5` ;
  - CNAME `www` → `<site>.netlify.app.`
  - OVH refuse le CNAME tant qu'il reste une ligne A ou TXT (« 3|welcome ») sur `www` : il faut d'abord la modifier ou la supprimer. Si la suppression échoue, réinitialiser la zone avec les entrées minimales.
- Ne pas toucher aux lignes MX, SPF/TXT, autoconfig et SRV (ce sont celles du mail).
- Chez OVH, recréer `_headers` et `_redirects` dans un `.htaccess` (cache, compression, 404, redirections 301).

## 6. SEO (déjà inclus dans le build)

- Pour chaque page : un `<title>` et une meta description uniques, une URL canonique, Open Graph et Twitter, ainsi que `og.jpg` en 1200×630.
- JSON-LD : `Organization` (nom, ville, email, sameAs Instagram) et un `VideoObject` par film (`thumbnailUrl`, `uploadDate`, `duration`, `contentUrl`).
- Un `sitemap.xml` avec les balises `video:video`, un `robots.txt` qui pointe vers le sitemap et un `llms.txt`.
- Après la mise en ligne, actions manuelles du client :
  1. Google Search Console : propriété « Préfixe d'URL » avec la balise meta (pas besoin de toucher au DNS), puis envoi de `sitemap.xml` ;
  2. Bing Webmaster, en important les réglages depuis Google ;
  3. une fiche Google Business Profile ;
  4. le lien du site dans la bio Instagram et dans les crédits des partenaires.
- Langue : si la cible est française, prévoir le site en français, ou les deux langues avec `hreflang`.

## 7. Méthode de travail conseillée

1. D'abord le contenu (JSON) et l'encodage des médias, ensuite le build, ensuite le style.
2. Construire une page à la fois, la tester en local (`python3 -m http.server` dans `site/`), puis faire des captures Playwright.
3. Faire un commit par retour du client, avec un message clair. Ne jamais casser le build : `node build.mjs` doit afficher « OK ».
4. Toujours répondre au client en français, simplement, avec des étapes numérotées et sans jargon.
