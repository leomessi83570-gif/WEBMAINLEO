#!/usr/bin/env python3
"""Ouvre chaque page dans un vrai navigateur et vérifie ce que le JS a produit.

Pourquoi ce script existe : le pied de page et la recherche sont remplis par
JavaScript, et une exception au chargement les laisse simplement vides. Rien ne
casse visiblement — la page s'affiche, le contenu principal est là — et le
défaut peut survivre à plusieurs relectures. C'est exactement ce qui s'est passé
quand la navigation est passée de douze à six rubriques : `rendrePied()`
indexait `EC.MENUS[1]` par position, « Agenda » n'a pas de volet, et le pied de
page s'est vidé sur les six pages sans que personne ne le remarque.

Le script vérifie donc trois choses, dans un navigateur réel :
  - aucune erreur JavaScript au chargement ;
  - les régions remplies par script ne sont pas vides ;
  - la page ne déborde pas horizontalement.

    python3 outils/verifier_pages.py
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
import tempfile
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

RACINE = Path(__file__).resolve().parent.parent
SITE = RACINE / "site"
CHROME = Path("/opt/pw-browsers/chromium-1194/chrome-linux/chrome")

# id → la page doit-elle le remplir ? (sinon l'élément peut être absent)
REGIONS = {
    "nav": "navigation principale",
    "piedPages": "pied — le site",
    "piedMunicipalite": "pied — municipalité",
    "piedLegal": "pied — informations légales",
}
# Régions propres à certaines pages seulement.
REGIONS_OPTIONNELLES = {
    "listeActus": "liste des actualités",
    "listeAgenda": "liste de l'agenda",
    "listeDemarches": "liste des démarches",
    "etatOuverture": "état d'ouverture de la mairie",
}

SONDE = """
<script>
(function () {
  var erreurs = [];
  window.addEventListener('error', function (e) {
    erreurs.push(String(e.message) + ' @ ' + (e.filename || '?') + ':' + e.lineno);
  });
  window.__erreurs = erreurs;
  window.addEventListener('load', function () {
    setTimeout(function () {
      var vides = [];
      Object.keys(window.__regions).forEach(function (id) {
        var el = document.getElementById(id);
        if (el && !el.innerHTML.trim()) { vides.push(id); }
      });
      var pre = document.createElement('pre');
      pre.id = 'SONDE';
      pre.textContent = '@@' + JSON.stringify({
        erreurs: erreurs,
        vides: vides,
        absents: Object.keys(window.__requis).filter(function (id) {
          return !document.getElementById(id);
        }),
        largeur: document.documentElement.clientWidth,
        defilement: document.documentElement.scrollWidth
      }) + '@@';
      document.body.appendChild(pre);
    }, 1200);
  });
})();
</script>
"""


def servir(racine: Path) -> tuple[ThreadingHTTPServer, int]:
    """Un serveur local : `file://` fausserait le test (CORS, chemins relatifs)."""
    class Handler(SimpleHTTPRequestHandler):
        def __init__(self, *a, **kw):
            super().__init__(*a, directory=str(racine), **kw)

        def log_message(self, *a):  # silence
            pass

    httpd = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
    Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, httpd.server_address[1]


def sonder(url: str, profil: Path) -> dict:
    sortie = subprocess.run(
        [
            str(CHROME), "--headless=new", "--disable-gpu", "--no-sandbox",
            "--hide-scrollbars", f"--user-data-dir={profil}",
            "--window-size=500,900", "--virtual-time-budget=9000", "--dump-dom", url,
        ],
        capture_output=True, text=True,
    ).stdout
    m = re.search(r"@@(\{.*?\})@@", sortie, re.S)
    if not m:
        return {"erreurs": ["la sonde n'a pas répondu"], "vides": [], "absents": [],
                "largeur": 0, "defilement": 0}
    return json.loads(m.group(1))


def main() -> int:
    if not CHROME.exists():
        print(f"Chromium introuvable : {CHROME}", file=sys.stderr)
        return 1

    pages = sorted(SITE.glob("*.html"))
    fautes = 0

    with tempfile.TemporaryDirectory() as tmp:
        travail = Path(tmp) / "site"
        # Copie instrumentée : on n'écrit jamais la sonde dans le site livrable.
        subprocess.run(["cp", "-r", str(SITE), str(travail)], check=True)
        prelude = (
            "<script>window.__regions = " + json.dumps(REGIONS | REGIONS_OPTIONNELLES)
            + "; window.__requis = " + json.dumps(REGIONS) + ";</script>"
        )
        for f in travail.glob("*.html"):
            f.write_text(
                f.read_text(encoding="utf-8").replace("</body>", prelude + SONDE + "</body>"),
                encoding="utf-8",
            )

        httpd, port = servir(travail)
        try:
            for page in pages:
                r = sonder(f"http://127.0.0.1:{port}/{page.name}", Path(tmp) / f"p-{page.stem}")
                soucis = []
                soucis += [f"erreur JS : {e}" for e in r["erreurs"]]
                soucis += [f"région vide : {REGIONS_OPTIONNELLES.get(v, REGIONS.get(v, v))}"
                           for v in r["vides"]]
                soucis += [f"région absente : {REGIONS[a]}" for a in r["absents"]]
                if r["defilement"] > r["largeur"] + 1:
                    soucis.append(
                        f"défilement horizontal : {r['defilement']} px pour "
                        f"{r['largeur']} px de large")
                if soucis:
                    fautes += len(soucis)
                    print(f"✗ {page.name}")
                    for s in soucis:
                        print(f"    {s}")
                else:
                    print(f"✓ {page.name}")
        finally:
            httpd.shutdown()

    print()
    if fautes:
        print(f"{fautes} problème(s) sur {len(pages)} pages.", file=sys.stderr)
        return 1
    print(f"{len(pages)} pages : aucune erreur JS, aucune région vide, "
          f"aucun débordement.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
