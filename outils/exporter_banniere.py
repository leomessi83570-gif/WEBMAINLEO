#!/usr/bin/env python3
"""Exporte les bannières (OG / partage social) en PNG.

Direction artistique : Editorial + Bold Typography sur photo pleine page,
identique au héros du site — le lien partagé et la page d'accueil doivent
se reconnaître au premier coup d'œil.

Le gabarit `banniere-og.html` référence les polices et la photo par des
chemins relatifs ; on les inline en data-URI avant la capture, parce que
Chromium en `file://` bloque le chargement CORS des polices et que le
réseau sortant n'atteint pas fonts.gstatic.com depuis le rendu.

    python3 outils/exporter_banniere.py
"""
from __future__ import annotations

import base64
import mimetypes
import re
import subprocess
import sys
import tempfile
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
OUTILS = RACINE / "outils"
POLICES = RACINE / "site" / "assets" / "polices"
IMG = RACINE / "site" / "assets" / "img"

CHROME = Path("/opt/pw-browsers/chromium-1194/chrome-linux/chrome")

# (gabarit, sortie, largeur, hauteur)
FORMATS = [
    ("banniere-og.html", IMG / "og-entrecasteaux.jpg", 1200, 630),
]


def data_uri(chemin: Path) -> str:
    type_mime = mimetypes.guess_type(chemin.name)[0] or "application/octet-stream"
    if chemin.suffix == ".woff2":
        type_mime = "font/woff2"
    elif chemin.suffix == ".ttf":
        type_mime = "font/ttf"
    return f"data:{type_mime};base64,{base64.b64encode(chemin.read_bytes()).decode()}"


def bloc_polices() -> str:
    """@font-face en data-URI, pour un rendu identique hors ligne."""
    # Les mêmes fichiers que le site : la bannière ne peut pas dériver.
    faces = [
        ("Archivo", "400 800", "62% 125%", POLICES / "archivo-latin.woff2"),
        ("Instrument Sans", "400 600", "100%", POLICES / "instrument-sans-latin.woff2"),
    ]
    morceaux = []
    for famille, graisse, chasse, fichier in faces:
        if not fichier.exists():
            print(f"  ! police absente : {fichier.name} — rendu dégradé", file=sys.stderr)
            continue
        morceaux.append(
            "@font-face{"
            f"font-family:'{famille}';font-style:normal;"
            f"font-weight:{graisse};font-stretch:{chasse};font-display:block;"
            f"src:url({data_uri(fichier)});"
            "}"
        )
    return "<style>" + "".join(morceaux) + "</style>"


def preparer(gabarit: Path) -> str:
    html = gabarit.read_text(encoding="utf-8")

    # Les <link> vers Google Fonts ne résolvent pas au rendu : on les retire.
    html = re.sub(r'\s*<link rel="preconnect"[^>]*>', "", html)
    html = re.sub(r'\s*<link href="https://fonts\.googleapis[^>]*>', "", html)
    html = html.replace("</head>", bloc_polices() + "\n</head>")

    # Photos en relatif → data-URI.
    for src in set(re.findall(r'<img src="([^"]+)"', html)):
        fichier = (gabarit.parent / src).resolve()
        if fichier.exists():
            html = html.replace(f'src="{src}"', f'src="{data_uri(fichier)}"')
    return html


# Chromium headless réserve du décor de fenêtre : le viewport fait ~87 px de
# moins que --window-size. On demande donc plus haut, puis on recadre.
MARGE_FENETRE = 140


def capturer(html: str, sortie: Path, largeur: int, hauteur: int) -> None:
    with tempfile.TemporaryDirectory() as tmp:
        page = Path(tmp) / "page.html"
        page.write_text(html, encoding="utf-8")
        profil = Path(tmp) / "profil"
        subprocess.run(
            [
                str(CHROME), "--headless=new", "--disable-gpu", "--no-sandbox",
                "--hide-scrollbars", "--force-device-scale-factor=1",
                f"--user-data-dir={profil}",
                f"--window-size={largeur},{hauteur + MARGE_FENETRE}",
                "--virtual-time-budget=8000",
                f"--screenshot={sortie}",
                page.as_uri(),
            ],
            check=True, capture_output=True,
        )


def main() -> int:
    if not CHROME.exists():
        print(f"Chromium introuvable : {CHROME}", file=sys.stderr)
        return 1
    IMG.mkdir(parents=True, exist_ok=True)
    for nom, sortie, largeur, hauteur in FORMATS:
        gabarit = OUTILS / nom
        brut = sortie.with_suffix(".capture.png")
        capturer(preparer(gabarit), brut, largeur, hauteur)
        from PIL import Image

        with Image.open(brut) as im:
            cadre = im.convert("RGB").crop((0, 0, largeur, hauteur))
        brut.unlink()
        # Photo pleine page : le JPEG tient sous 200 Ko là où le PNG frôle 1 Mo.
        cadre.save(sortie, "JPEG", quality=86, optimize=True, progressive=True)
        taille = (largeur, hauteur)
        print(f"écrit : {sortie.relative_to(RACINE)} — {taille[0]}×{taille[1]}, "
              f"{sortie.stat().st_size} octets")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
