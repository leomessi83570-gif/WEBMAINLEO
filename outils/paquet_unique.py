#!/usr/bin/env python3
"""Fabrique une version du site en un seul fichier HTML, ouvrable hors ligne.

À quoi ça sert : montrer le site à quelqu'un qui n'a ni serveur local ni accès
au dépôt. Le fichier produit s'ouvre d'un double-clic, sans réseau.

Comment ça marche : la page d'accueil porte déjà les six rubriques sous forme
de sections ancrées (#actualite, #agenda, #decouvrir, #demarches, #mairie).
On part donc d'elle, on remplace les liens vers les autres pages par ces
ancres, et on incorpore styles, scripts, polices et photo en data-URI. Aucun
routage à écrire, et surtout aucun identifiant en double — c'est ce qui
casserait le JavaScript si on empilait les six pages dans un même document.

Ce n'est PAS le site livrable : la version de production reste les six pages
de `site/`, qui se partagent les mêmes fichiers au lieu de les recopier.

    python3 outils/paquet_unique.py [-o chemin.html]
"""
from __future__ import annotations

import argparse
import base64
import re
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
SITE = RACINE / "site"
CSS = SITE / "assets" / "css"

# Les feuilles, dans l'ordre où la page les charge : l'ordre porte la cascade.
FEUILLES = ["polices.css", "tokens.css", "base.css", "composants.css"]
SCRIPTS = ["donnees.js", "site.js"]

# Chaque page du site → l'ancre qui lui correspond sur la page d'accueil.
ANCRES = {
    "index.html": "#haut",
    "actualites.html": "#actualite",
    "agenda.html": "#agenda",
    "decouvrir.html": "#decouvrir",
    "demarches.html": "#demarches",
    "mairie.html": "#mairie",
}

BANDEAU = """<div class="bandeau-apercu">
  <div class="wrap">
    <strong>Aperçu hors ligne</strong> — fichier unique, sans réseau. Les six
    rubriques du site sont ici regroupées sur une seule page : les entrées de
    menu y descendent par ancre. La version livrable est en six pages
    distinctes, dans <code>site/</code>.
  </div>
</div>
<style>
  .bandeau-apercu{
    background:var(--or-100);
    color:var(--sab-700);
    border-bottom:1px solid var(--or-500);
    font-size:var(--ts-sm);
  }
  .bandeau-apercu .wrap{padding-block:var(--esp-3)}
  .bandeau-apercu code{
    font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
    font-size:.92em;
  }
  @media (prefers-color-scheme: dark){
    :root:not([data-theme="clair"]) .bandeau-apercu{
      background:var(--sab-700);color:var(--arg-200);border-bottom-color:var(--sab-600);
    }
  }
  :root[data-theme="sombre"] .bandeau-apercu{
    background:var(--sab-700);color:var(--arg-200);border-bottom-color:var(--sab-600);
  }
</style>
"""


def data_uri(chemin: Path, type_mime: str) -> str:
    return f"data:{type_mime};base64,{base64.b64encode(chemin.read_bytes()).decode()}"


def feuilles_incorporees() -> str:
    """Concatène les CSS en remplaçant les url(...) de polices par des data-URI.

    On ne garde que les sous-ensembles « latin » : le français y tient en
    entier, et embarquer aussi latin-ext ajouterait ~130 Ko de base64 pour des
    caractères que ce site n'affiche jamais.
    """
    morceaux = []
    for nom in FEUILLES:
        txt = (CSS / nom).read_text(encoding="utf-8")

        if nom == "polices.css":
            txt = retirer_blocs_latin_ext(txt)
            def remplacer(m: re.Match) -> str:
                fichier = (CSS / m.group(1)).resolve()
                if not fichier.exists():
                    print(f"  ! police introuvable : {m.group(1)}", file=sys.stderr)
                    return m.group(0)
                return f'url("{data_uri(fichier, "font/woff2")}")'
            txt = re.sub(r'url\("([^"]+\.woff2)"\)', remplacer, txt)

        morceaux.append(f"/* ── {nom} ── */\n{txt}")
    return "\n".join(morceaux)


def retirer_blocs_latin_ext(css: str) -> str:
    """Supprime les @font-face dont l'url pointe vers un fichier latin-ext."""
    return re.sub(
        r"@font-face\s*\{[^}]*latin-ext\.woff2[^}]*\}\s*",
        "",
        css,
        flags=re.S,
    )


def scripts_incorpores() -> str:
    morceaux = []
    for nom in SCRIPTS:
        txt = (SITE / "assets" / "js" / nom).read_text(encoding="utf-8")
        if nom == "donnees.js":
            txt = rediriger_vers_ancres(txt)
        morceaux.append(f"/* ── {nom} ── */\n{txt}")
    return "\n\n".join(morceaux)


def rediriger_vers_ancres(texte: str) -> str:
    """Remplace toute référence à une page du site par son ancre d'accueil.

    Traite d'abord les formes avec fragment (`decouvrir.html#patrimoine`), pour
    ne pas laisser traîner un `#decouvrir#patrimoine`.
    """
    for page, ancre in ANCRES.items():
        texte = re.sub(re.escape(page) + r"#[\w-]+", ancre, texte)
        texte = texte.replace(page, ancre)
    return texte


def photo_incorporee(html: str) -> str:
    """Remplace le <picture> responsive par une seule image en data-URI.

    Un srcset en data-URI ferait porter au fichier les deux tailles pour rien :
    hors ligne, le navigateur n'économise aucun octet en choisissant la petite.
    """
    photo = SITE / "assets" / "img" / "village-crepuscule.jpg"
    uri = data_uri(photo, "image/jpeg")

    def remplacer(m: re.Match) -> str:
        balise_img = re.search(r"<img\b[^>]*>", m.group(0), re.S)
        if not balise_img:
            return m.group(0)
        return re.sub(
            r'src="[^"]*"', f'src="{uri}"', balise_img.group(0), count=1
        )

    return re.sub(r"<picture>.*?</picture>", remplacer, html, flags=re.S)


def construire() -> str:
    html = (SITE / "index.html").read_text(encoding="utf-8")

    # Métadonnées qui pointent vers des fichiers voisins : sans serveur, elles
    # ne résolvent pas. On les retire plutôt que de laisser des 404.
    html = re.sub(r'\s*<link rel="preload"[^>]*>', "", html)
    html = re.sub(r'\s*<link rel="canonical"[^>]*>', "", html)
    html = re.sub(r'\s*<meta (?:property="og:image|name="twitter:image)[^>]*>', "", html)

    html = photo_incorporee(html)
    html = rediriger_vers_ancres(html)

    html = re.sub(
        r'<link rel="stylesheet"[^>]*>\s*',
        "",
        html,
    ).replace("</head>", f"<style>\n{feuilles_incorporees()}\n</style>\n</head>", 1)

    html = re.sub(r'<script src="[^"]*"></script>\s*', "", html)
    html = html.replace(
        "</body>", f"<script>\n{scripts_incorpores()}\n</script>\n</body>", 1
    )

    html = html.replace('<a class="evitement"', BANDEAU + '<a class="evitement"', 1)
    return html


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument(
        "-o", "--sortie", type=Path,
        default=RACINE / "entrecasteaux-apercu.html",
        help="chemin du fichier produit",
    )
    args = ap.parse_args()

    html = construire()
    args.sortie.write_text(html, encoding="utf-8")

    # On cherche les références restantes hors <script> : le JavaScript
    # incorporé contient des concaténations qui ressemblent à des attributs.
    sans_script = re.sub(r"<script\b.*?</script>", "", html, flags=re.S)
    restants = sorted(set(re.findall(
        r'(?:src|href)="((?!data:|#|https?:|mailto:|tel:)[^"]+)"', sans_script)))
    if restants:
        print("  ! références externes restantes : " + ", ".join(restants), file=sys.stderr)

    print(f"écrit : {args.sortie} — {args.sortie.stat().st_size / 1024:.0f} Ko")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
