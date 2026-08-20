# -*- coding: utf-8 -*-
"""Gabarit commun à toutes les pages du site d'Entrecasteaux.

Le HTML produit est autonome : aucune étape de compilation n'est nécessaire
pour servir le site. Ce script existe pour que l'en-tête, le pied de page et
les métadonnées restent identiques d'une page à l'autre — on régénère,
on ne recopie pas.
"""

BLASON = (
    '<svg class="blason" viewBox="0 0 26 32" fill="none" aria-hidden="true">'
    '<path d="M1 1h24v19c0 6.5-6.2 9.8-12 11.5C7.2 29.8 1 26.5 1 20V1z" '
    'stroke="currentColor" stroke-width="1.4"/>'
    '<path d="M6.5 20V11l3-2.4 3 2.4v9M13 20v-7.5l3-2.4 3 2.4V20" '
    'stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/>'
    '<path d="M4.5 20h17" stroke="currentColor" stroke-width="1.2"/></svg>'
)

FAVICON = (
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 26 32'%3E"
    "%3Cpath d='M1 1h24v19c0 6.5-6.2 9.8-12 11.5C7.2 29.8 1 26.5 1 20V1z' fill='%232C4A3B'/%3E"
    "%3Cpath d='M6.5 21V11l3-2.4 3 2.4v10M13 21v-8.5l3-2.4 3 2.4V21' stroke='%23F0EEE9' "
    "stroke-width='1.6' fill='none'/%3E%3C/svg%3E"
)

ALERTE = '''<div class="alerte" id="bandeauAlerte">
  <div class="wrap">
    <span class="pastille-pouls" aria-hidden="true"></span>
    <span><strong data-i18n="alerte.titre">Risque incendie rouge</strong> —
      <span data-i18n="alerte.texte">travaux et débroussaillement interdits sur la commune.</span></span>
    <a href="http://www.entrecasteaux.fr/downloads/feu_interdit.pdf" target="_blank" rel="noopener"
       data-i18n="alerte.lien">Consulter le bulletin</a>
    <button class="fermer" id="fermerAlerte" type="button" aria-label="Fermer l’alerte">&times;</button>
  </div>
</div>'''

BARRE_NAV = '''<div class="barre-nav">
  <div class="wrap">
    <a href="index.html" class="marque" aria-label="Entrecasteaux — accueil">
      ''' + BLASON + '''
      <span>
        <span class="marque-nom">Entrecasteaux</span>
        <span class="marque-sous" data-i18n="marque.sous">Var · Provence Verte</span>
      </span>
    </a>

    <button class="burger" id="burger" type="button" aria-expanded="false"
            aria-controls="nav" data-i18n-attr="aria-label:nav.menu" aria-label="Menu">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           stroke-width="1.7" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
    </button>

    <nav class="nav" id="nav" data-i18n-attr="aria-label:nav.principale"
         aria-label="Navigation principale"></nav>

    <div class="outils">
      <div class="langue" role="group" aria-label="Langue / Language / Lingua">
        <button type="button" data-lang="fr" aria-pressed="true">FR</button>
        <button type="button" data-lang="en" aria-pressed="false">EN</button>
        <button type="button" data-lang="it" aria-pressed="false">IT</button>
      </div>
      <button class="icone-btn" id="basculerTheme" type="button" aria-pressed="false"
              data-i18n-attr="aria-label:theme.basculer" aria-label="Basculer le thème">
        <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor"
             stroke-width="1.6" aria-hidden="true">
          <path d="M16.5 11.5A7 7 0 0 1 8.5 3.5a7 7 0 1 0 8 8z"/></svg>
      </button>
      <button class="icone-btn" id="ouvrirRecherche" type="button" aria-label="Rechercher">
        <svg width="17" height="17" viewBox="0 0 20 20" fill="none" stroke="currentColor"
             stroke-width="1.6" aria-hidden="true">
          <circle cx="8.5" cy="8.5" r="5.5"/><path d="M12.7 12.7 17 17"/></svg>
      </button>
    </div>
  </div>
</div>'''

PIED = '''<footer class="pied">
  <div class="wrap">
    <div class="pied-grille">
      <div>
        <div class="pied-marque">Entrecasteaux</div>
        <p style="margin-top:var(--esp-4);max-width:34ch" data-i18n="pied.baseline">Site officiel de la
          commune. Toutes les infos et alertes au quotidien également sur Facebook et l’application City All.</p>
        <div class="reseaux">
          <a href="https://www.facebook.com/ville.entrecasteaux" target="_blank" rel="noopener" aria-label="Facebook">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M11.5 18v-7h2.4l.4-2.8h-2.8V6.4c0-.8.2-1.4 1.4-1.4h1.5V2.5c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.1H6v2.8h2.5v7h3z"/></svg>
          </a>
          <a href="http://www.entrecasteaux.fr" target="_blank" rel="noopener" aria-label="Ancien site de la commune">
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor"
                 stroke-width="1.4" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/>
              <path d="M2.5 10h15M10 2.5c2 2.4 3 4.9 3 7.5s-1 5.1-3 7.5c-2-2.4-3-4.9-3-7.5s1-5.1 3-7.5z"/></svg>
          </a>
        </div>
      </div>
      <div><h4 data-i18n="sec.pages">Le site</h4><ul id="piedPages"></ul></div>
      <div><h4 data-i18n="nav.municipalite">Municipalité</h4><ul id="piedMunicipalite"></ul></div>
      <div><h4 data-i18n="pied.legal">Informations légales</h4><ul id="piedLegal"></ul></div>
    </div>
    <div class="pied-bas">
      <span>© 2026 Commune d’Entrecasteaux · Place du Général Estève, 83570</span>
      <span class="droite">
        <a href="#haut" data-i18n="pied.haut">Haut de page ↑</a>
      </span>
    </div>
  </div>
</footer>

<div class="recherche" id="recherche" data-ouvert="0">
  <div class="recherche-boite">
    <label class="sr" for="champRecherche">Rechercher sur le site</label>
    <input type="search" id="champRecherche" autocomplete="off"
           data-i18n-attr="placeholder:recherche.placeholder"
           placeholder="Rechercher une page, une démarche…">
    <div class="resultats" id="resultats" role="listbox" aria-label="Résultats"></div>
  </div>
</div>'''

SCHEMA = '''<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "GovernmentOffice",
  "name": "Mairie d’Entrecasteaux",
  "alternateName": "Commune d’Entrecasteaux",
  "url": "https://www.entrecasteaux.fr/",
  "telephone": "+33494372288",
  "email": "mairie@entrecasteaux.fr",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Place du Général Estève",
    "postalCode": "83570",
    "addressLocality": "Entrecasteaux",
    "addressRegion": "Var",
    "addressCountry": "FR"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": 43.5167, "longitude": 6.2425 },
  "areaServed": { "@type": "City", "name": "Entrecasteaux" },
  "openingHoursSpecification": [
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Friday"], "opens": "08:30", "closes": "12:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday","Friday"], "opens": "13:30", "closes": "16:30" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Tuesday","Thursday"], "opens": "08:30", "closes": "12:00" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Tuesday","Thursday"], "opens": "14:30", "closes": "16:30" },
    { "@type": "OpeningHoursSpecification", "dayOfWeek": "Wednesday", "opens": "08:30", "closes": "12:00" }
  ]
}
</script>'''


def heros(titre_html, meta_html, bas_html="", page=False, position="center 45%", alt=""):
    classe = "heros heros--page" if page else "heros"
    return f'''<header class="{classe}" id="haut">
  <div class="heros-media">
    <picture>
      <source type="image/webp" sizes="100vw"
              srcset="assets/img/village-crepuscule-760.webp 760w,
                      assets/img/village-crepuscule.webp 1140w">
      <source type="image/jpeg" sizes="100vw"
              srcset="assets/img/village-crepuscule-760.jpg 760w,
                      assets/img/village-crepuscule.jpg 1140w">
      <img src="assets/img/village-crepuscule.jpg" alt="{alt}"
           width="1140" height="457" fetchpriority="high" decoding="async"
           style="object-position:{position}">
    </picture>
  </div>
  <div class="heros-contenu">
    <div class="heros-haut">
      {titre_html}
      {meta_html}
    </div>
    {bas_html}
  </div>
</header>'''


def meta_commune():
    return '''<div class="heros-meta">
      <span class="cp chiffres">83570</span>
      <span data-i18n="marque.sous">Var · Provence Verte</span><br>
      <span class="chiffres">43°31′N 6°14′E</span> · <span class="chiffres">97–354 m</span>
      <div class="heros-releve" id="meteoReleve">
        <span data-i18n="meteo.chargement">Relevé en cours…</span>
      </div>
    </div>'''


def meta_page(fil_ariane):
    return f'''<div class="heros-meta">
      <nav aria-label="Fil d’Ariane">
        <a href="index.html" data-i18n="retour.accueil">Retour à l’accueil</a>
        <span aria-hidden="true"> / </span><span>{fil_ariane}</span>
      </nav>
      <div class="heros-releve">
        <span><i class="rond rond--plein" aria-hidden="true"></i>83570 Entrecasteaux</span>
      </div>
    </div>'''


def page(*, fichier, page_id, titre, description, corps, heros_html,
         body_attrs="", og_titre=None):
    og_titre = og_titre or titre
    return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{titre}</title>
<meta name="description" content="{description}">
<meta name="theme-color" content="#2C4A3B" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#0B1013" media="(prefers-color-scheme: dark)">
<meta name="color-scheme" content="light dark">
<link rel="canonical" href="https://www.entrecasteaux.fr/{fichier}">
<link rel="icon" href="{FAVICON}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Commune d’Entrecasteaux">
<meta property="og:locale" content="fr_FR">
<meta property="og:title" content="{og_titre}">
<meta property="og:description" content="{description}">
<meta property="og:image" content="assets/img/og-entrecasteaux.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Le village d’Entrecasteaux au crépuscule, dominé par son château">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="assets/img/og-entrecasteaux.jpg">
<link rel="preload" as="font" type="font/woff2" href="assets/polices/archivo-latin.woff2" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="assets/polices/instrument-sans-latin.woff2" crossorigin>
<link rel="preload" as="image" type="image/webp" href="assets/img/village-crepuscule.webp"
      imagesrcset="assets/img/village-crepuscule-760.webp 760w, assets/img/village-crepuscule.webp 1140w"
      imagesizes="100vw">
<link rel="stylesheet" href="assets/css/polices.css">
<link rel="stylesheet" href="assets/css/tokens.css">
<link rel="stylesheet" href="assets/css/base.css">
<link rel="stylesheet" href="assets/css/composants.css">
{SCHEMA}
</head>
<body data-page="{page_id}"{(" " + body_attrs) if body_attrs else ""}>

<a class="evitement" href="#contenu" data-i18n="evitement">Aller au contenu principal</a>

{ALERTE}

{heros_html}

{BARRE_NAV}

<main id="contenu">
{corps}
</main>

{PIED}

<script src="assets/js/donnees.js"></script>
<script src="assets/js/site.js"></script>
</body>
</html>
'''
