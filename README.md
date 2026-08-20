# Site de la commune d’Entrecasteaux

Site officiel de la mairie d’Entrecasteaux (83570, Var). Six pages HTML statiques,
sans dépendance externe au chargement, sans build à déployer.

```
site/                       ← ce qui est mis en ligne, tel quel
  index.html  actualites.html  agenda.html
  decouvrir.html  demarches.html  mairie.html
  assets/css/   polices · tokens · base · composants
  assets/js/    donnees.js (contenu + i18n) · site.js (comportements)
  assets/img/   photo du village (WebP + JPEG, 2 tailles) · image de partage
  assets/polices/  Archivo et Instrument Sans, auto-hébergées

outils/                     ← ne part pas en production
  generer.py            régénère les 6 pages depuis le gabarit commun
  gabarit.py            en-tête, barre de nav, pied de page, métadonnées
  banniere-og.html      gabarit de l’image de partage
  exporter_banniere.py  capture cette bannière en 1200 × 630
  verifier_jetons.py    garde-fou : aucun var(--x) orphelin
  verifier_contrastes.py audit WCAG de la palette, clair et sombre
  verifier_pages.py     ouvre les 6 pages dans Chromium : erreurs JS, régions
                        vides, débordement horizontal
  paquet_unique.py      aperçu en un seul fichier HTML, ouvrable hors ligne

presentation/               ← support de présentation au conseil municipal
  conseil-municipal.html
```

## Régénérer

```bash
python3 outils/generer.py           # les 6 pages
python3 outils/verifier_jetons.py     # aucun var(--x) orphelin
python3 outils/verifier_contrastes.py # contrastes, thèmes clair et sombre
python3 outils/verifier_pages.py      # les 6 pages dans un vrai navigateur
python3 outils/exporter_banniere.py # image de partage (nécessite Chromium + Pillow)
```

Les pages sont **générées**, pas éditées à la main : l’en-tête, la navigation et
le pied de page sont identiques partout parce qu’ils viennent d’une seule source
(`outils/gabarit.py`). Modifier `site/index.html` directement, c’est voir la
modification disparaître au prochain `generer.py`.

## Regarder le site

Trois façons, de la plus simple à la plus fidèle.

**Un seul fichier, sans rien installer.** `entrecasteaux-apercu.html` s'ouvre
d'un double-clic, hors ligne : styles, scripts, polices et photo y sont
incorporés. Les six rubriques y sont regroupées sur une page et les entrées de
menu descendent par ancre. C'est un aperçu, pas le livrable.

```bash
python3 outils/paquet_unique.py   # pour le régénérer après une modification
```

**Le vrai site, en local.** C'est la version à six pages, celle qui sera mise
en ligne :

```bash
python3 -m http.server 8765 --directory site
# puis http://localhost:8765
```

Ouvrir `site/index.html` directement en `file://` ne marchera qu'à moitié : les
liens entre pages fonctionneront, mais pas le plan OpenStreetMap.

## Décisions de conception

### Le héros

Reprend le gabarit fourni (`index_5`) : nom de la commune en très grand calé en
haut à gauche, bloc d’identité en haut à droite (code postal, territoire,
coordonnées, altitude, météo du jour), photo plein cadre, barre de navigation
juste en dessous.

Une difficulté propre à Entrecasteaux : le nom fait treize signes là où le
gabarit d’origine en portait huit. À chasse normale, le titre déborde. La chasse
étroite d’Archivo (police variable, axe `wdth` 62–125 %) réglée à **66 %** ramène
le mot à 4,42 em de large, crénage compris — ce qui le laisse tenir sur une seule
ligne de 320 px à 1920 px de large. C’est la raison d’être du choix de police.

Le voile posé sur la photo n’est pas décoratif : le titre est blanc sur des
façades claires. Mesuré sur le rendu, le pire contraste sous les lettres est de
**4,69:1** — au-dessus du seuil de 4,5:1 du texte courant, alors que le grand
texte n’exige que 3:1. Il est teinté sable et non bleu-noir : un voile froid sur
une photo de Provence en tue la lumière.

### Les jetons de design

Trois couches, dans `assets/css/tokens.css` :

```
primitive   --or-800: #6E4A08        un émail du blason
    ↓
sémantique  --accent: var(--or-800)  une intention
    ↓
composant   --nav-couleur-actif: var(--texte)
```

Aucune couleur en dur hors de la couche primitive. C'est ce qui a permis de
refaire toute la palette en ne touchant qu'à un fichier : les composants ne
connaissent que des rôles.

### La palette vient du blason

**« De gueules au pal d'or accosté de deux tours donjonnées d'argent, ouvertes
du champ, ajourées et maçonnées de sable. »** Rouge, or, argent, noir : la
palette décline ces quatre émaux plutôt que d'inventer des couleurs.

| Émail | Rôle dans l'interface |
|---|---|
| **Or** | Les fonds — papier crème — et l'accent : liens, boutons, marque |
| **Gueules** | Les sections alternées en terre cuite pâle, les alertes, le champ du blason |
| **Argent** | Les filets et les surfaces élevées |
| **Sable** | Les textes et le thème sombre — brun chaud, jamais bleuté |
| *Garrigue* | Contrepoint olive, hors blason |

Les fonds ne sont pas blancs : le papier est un crème pastel (`#FDF7E8`), les
sections alternées une terre cuite pâle (`#F6E4D8`), les cartes un cran plus
clair que le papier. C'est là que se joue la chaleur d'ensemble — bien plus que
sur les accents, qui n'occupent que quelques pour cent de la surface.

Une section reste sombre, l'agenda et le pied de page, dans un brun-rouge
profond : tout en pastel, la page perdrait son rythme et l'œil n'aurait plus de
point d'ancrage.

Le vert de garrigue ne figure pas dans les armes : il est ajouté parce que sans
lui une page tout en or et terre cuite vire au monochrome.

Deux points sur lesquels la palette se joue :

**L'or a deux registres, et c'est délibéré.** Les tons foncés (`--or-800`)
portent le texte et tiennent 7,9:1 sur fond clair ; les tons vifs (`--or-500`)
ne servent qu'aux aplats — blason, filets, jauges. Un or lisible n'est plus
solaire, un or solaire n'est plus lisible : il en faut deux.

**Les trois marqueurs de la page d'accueil prennent trois émaux distincts** —
Sécurité en gueules, Solidarité en or, Vie pratique en garrigue. Deux rouges
voisins se confondraient d'un coup d'œil.

Des fonds teintés rapprochent tous les textes de leur arrière-plan : c'est le
risque du pastel, et il ne se voit pas à l'œil. `outils/verifier_contrastes.py`
résout les jetons en couleurs réelles, compose les fonds semi-transparents et
vérifie chaque paire dans les deux thèmes. Le plus juste est à 4,95:1 (les
mentions sur la section terre cuite), pour un seuil de 4,5. C'est aussi lui qui
a révélé que la palette d'origine descendait à 3,77:1 sur les marqueurs de
catégorie et 3,94:1 sur les sur-titres.

### Les polices sont auto-hébergées

Appeler `fonts.googleapis.com` transmet l’adresse IP du visiteur à chaque page.
Sur un site public, la CNIL considère ce transfert comme à éviter. Les deux
fichiers sont donc servis par la commune (`site/assets/polices/`), sous licence
SIL Open Font License 1.1 — voir `THIRD_PARTY_LICENSES.md`. `exporter_banniere.py`
lit ces mêmes fichiers, pour que l'image de partage ne puisse pas dériver de la
typographie du site.

Conséquence : le site ne fait **aucun** appel réseau vers un tiers au chargement.
La seule ressource externe est le plan OpenStreetMap de la page Mairie, chargé en
`loading="lazy"`, donc seulement si le visiteur descend jusqu’à lui.

### La navigation

L’arborescence d’origine mettait côte à côte six pages et six menus déroulants,
soit douze entrées, avec « Découvrir » en double. Elle est ramenée à **six
rubriques**, une par intention d’usage : Actualités, Agenda, Découvrir,
Démarches, Vie pratique, Mairie.

Quand une rubrique porte à la fois une page et des liens profonds, le libellé et
le chevron sont deux cibles distinctes : le libellé mène à la page, le chevron
ouvre le volet. Un bouton qui fait deux choses selon l’endroit où l’on clique est
une source d’erreur.

Sur mobile, le tiroir est en `display: none` quand il est fermé, et pas seulement
translaté hors écran : un élément `position: fixed` déplacé reste compté dans la
largeur de défilement du document sous Chrome, ce qui provoque un défilement
horizontal parasite — et il resterait atteignable au clavier.

### Le contenu est séparé du code

`assets/js/donnees.js` regroupe tout ce qui bouge — actualités, agenda,
démarches, arborescence, dictionnaire des trois langues. Les structures sont
plates et sérialisables : elles correspondent une pour une à des collections de
CMS, si la commune souhaite un jour éditer depuis une interface.

Chaque rubrique de navigation porte une clé (`id`). Le pied de page et l'index
de recherche la désignent par cette clé, jamais par sa position : indexer
`EC.MENUS[1]` avait vidé le pied de page des six pages le jour où la navigation
est passée de douze à six entrées.

### Pourquoi un test qui ouvre un navigateur

Le pied de page, la navigation et l'état d'ouverture de la mairie sont remplis
par JavaScript. Une exception au chargement les laisse simplement **vides** : la
page s'affiche, le contenu principal est là, rien ne signale le problème. Le
défaut ci-dessus a survécu à plusieurs relectures pour cette raison.

`outils/verifier_pages.py` ouvre les six pages dans Chromium et vérifie qu'il
n'y a aucune erreur JS, qu'aucune région pilotée par script n'est vide, et que
rien ne déborde horizontalement. Il a été validé en réintroduisant le défaut :
21 problèmes signalés, sortie 1.

## Ce qui reste à faire avant une mise en ligne

- Déclaration d’accessibilité, mentions légales et politique de confidentialité,
  obligatoires pour un site public — les liens du pied de page pointent pour
  l’instant vers les pages de l’ancien site.
- Vérifier les horaires, tarifs et dates repris de l’ancien site auprès du
  secrétariat : ils ont été retranscrits, pas confirmés.
- Redirections depuis les anciennes adresses `articles.php?pg=artNN`.
- Remplacer la photo du héros par un cliché haute définition : celle utilisée ici
  fait 1140 × 457 px, ce qui suffit tout juste au format employé.
