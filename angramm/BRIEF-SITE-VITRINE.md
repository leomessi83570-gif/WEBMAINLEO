# Brief : faire un site vitrine haut de gamme, vite et sans erreurs

À donner à Claude au début de la session. Ce n'est pas un modèle à copier. Ce sont les **méthodes**, les **erreurs à éviter** et les **retours client** appris en construisant angramm.com (agence créative / production vidéo). Le design, la structure et le contenu doivent partir du projet du collègue.

---

## 1. Comment travailler avec le client (le plus important)

- **Avant de coder, poser 3 ou 4 questions courtes** : la cible, la langue du site, les 3 sites de référence qu'il aime, et ce qui doit être vu en premier.
- **Une modification à la fois**, petite, puis une capture pour montrer le résultat. Le client valide sur des captures et des vidéos d'écran, pas sur du code.
- **Ne pas en faire plus que demandé.** Quand le client demande de « remonter un peu un texte », c'est un peu. Une version plus ambitieuse a été refusée, et il a fallu revenir en arrière.
- **Revenir en arrière immédiatement** quand le client le demande, sans discuter. Garder un commit par retour pour pouvoir le faire.
- **Répondre simplement** : étapes numérotées, sans jargon, dans la langue du client. Quand il envoie une capture d'erreur (hébergeur, DNS), lire exactement ce qu'elle dit avant de répondre.
- **Être honnête sur ce qu'on ne sait pas**, par exemple une option payante d'un hébergeur. Le dire, plutôt qu'affirmer.

## 2. Retours client à retenir (ce qui a plu, ce qui a déplu)

- **Simplicité** : le client a régulièrement demandé d'**enlever** des choses (titres de page inutiles, sections en trop, effets). Partir minimal.
- **Le travail d'abord** : les vidéos et les images doivent occuper l'écran. Le texte est court et peu présent.
- **Formats adaptés à l'écran** : les vidéos horizontales sur ordinateur, les verticales sur téléphone. Ne jamais montrer un film vertical perdu au milieu d'un écran large. Quand un film existe en deux formats, n'en afficher qu'un par écran.
- **L'ordre des projets est un choix du client.** Le rendre facile à changer, dans un seul fichier de contenu.
- **Typographie** : deux polices maximum, avec un contraste net (une linéale grasse pour la navigation et les titres, une serif pour les textes). Le client remarque les détails : retours à la ligne, interlignage, alignements.
- **Pas de gadgets** : le curseur personnalisé a été retiré parce qu'il était jugé gênant. Pas d'animation qui retarde l'accès au contenu.
- **Alignements précis** : si un texte est à côté d'une vidéo, leurs hauts et leurs bas doivent s'aligner. Le client le voit tout de suite.
- **Aucun saut au chargement** : un texte qui bouge après l'affichage a été signalé comme un bug.
- **Galerie photo** : une mosaïque avec agrandissement au clic et navigation précédent/suivant (clavier + swipe). Mettre en premier les photos choisies par le client.

## 3. Choix techniques qui évitent les ennuis

- **Site statique** : HTML/CSS/JS générés par un petit script (par exemple Node, sans dépendances) à partir de fichiers de contenu JSON. Pas de WordPress ni de base de données. C'est rapide, ça s'héberge partout, et il n'y a rien à maintenir.
- **Contenu séparé du code** : textes, projets et ordre sont dans des JSON, et le build régénère tout. Modifier un texte ne doit pas demander de toucher au HTML.
- **Cache** : ajouter `?v=<hash>` aux fichiers CSS et JS, sinon le client voit l'ancienne version et croit que rien n'a changé.
- **Polices auto-hébergées** (`.woff2`), avec `preload`.
- **Mobile** : utiliser `100svh` plutôt que `100vh` (sinon la barre Safari coupe le contenu). Vérifier les marges et les tailles de texte sur iPhone.

## 4. Vidéos

- Encodage : H.264, `-crf 23`, `-movflags +faststart` (**obligatoire**, sinon la vidéo attend d'être entièrement téléchargée), 1080p maximum, 20 à 50 Mo par film et jamais plus de 100 Mo.
- Prévoir une version courte et muette (environ 3 Mo) pour les aperçus et les boucles, plus une image `poster`.
- Attributs `muted playsinline autoplay loop` + `poster` sur les vidéos d'ambiance, sinon iOS bloque la lecture.
- Ce qui n'est pas visible au premier écran se charge plus tard (`preload="none"` + IntersectionObserver).

## 5. Erreurs techniques réellement rencontrées

1. **Mise en page calculée en JavaScript** : provoque un saut visible. Préférer le CSS (grid/flex). Si un calcul est inévitable, cacher le bloc jusqu'à `document.fonts.ready` + le calcul, puis l'afficher en fondu.
2. **Modification par recherche/remplacement** : elle a touché deux endroits identiques (la même liste dans deux pages). Toujours vérifier le nombre d'occurrences avant de modifier.
3. **Serveur de test local** : il s'arrête parfois. Le relancer plutôt que conclure que le site est cassé.
4. **Ne rien livrer sans test** à trois tailles (1440×900, 1920×1080, iPhone 390×844) avec Playwright. Faire des captures et les regarder vraiment.

## 6. Mise en ligne

- Vérifier les **limites de taille de fichier** de l'hébergeur à cause des vidéos :
  - Cloudflare Pages : 25 Mo maximum par fichier ;
  - GitHub Pages : gratuit, 100 Mo par fichier, dépôt public obligatoire ;
  - Netlify gratuit : affiche un badge « Powered by Netlify » ;
  - OVH Starter : suffisant pour un site statique, sans WordPress ni CDN.
- DNS chez OVH :
  - le CNAME `www` est refusé tant qu'une ligne A ou TXT existe déjà sur `www`. Modifier ou supprimer ces lignes d'abord ;
  - ne jamais toucher aux lignes MX, SPF ou autoconfig (ce sont celles du mail).
- Activer le HTTPS (Let's Encrypt) et rediriger `www` vers le domaine principal.

## 7. SEO, à intégrer dès le départ

- Pour chaque page : `<title>` et meta description uniques, URL canonique, Open Graph, et une image de partage 1200×630.
- JSON-LD : `Organization` (ou `LocalBusiness` si c'est local), plus `VideoObject` pour les vidéos.
- `sitemap.xml` (avec les balises vidéo), `robots.txt` qui pointe vers le sitemap, et une page 404.
- **Langue du site = langue de la cible.** Un site en anglais se trouve mal sur les recherches en français.
- Après la mise en ligne, le client fait lui-même :
  1. Google Search Console : vérification par balise meta, plus simple que le DNS, puis envoi du sitemap ;
  2. Bing Webmaster ;
  3. une fiche Google Business Profile ;
  4. le lien du site sur Instagram et dans les crédits des partenaires.
