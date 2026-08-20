#!/usr/bin/env python3
"""Vérifie qu'aucun fichier ne référence un jeton de design inexistant.

Un `var(--esp-9)` qui n'existe pas ne casse rien bruyamment : la propriété est
simplement ignorée et la mise en page se décale de quelques pixels sans que
personne ne s'en aperçoive. D'où ce contrôle.

    python3 outils/verifier_jetons.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
FEUILLES = sorted((RACINE / "site" / "assets" / "css").glob("*.css"))
CIBLES = FEUILLES + sorted((RACINE / "site").glob("*.html")) \
       + sorted((RACINE / "presentation").glob("*.html"))


def main() -> int:
    definis: set[str] = set()
    for f in FEUILLES:
        definis |= set(re.findall(r"^\s*(--[\w-]+)\s*:", f.read_text(encoding="utf-8"), re.M))

    fautes = 0
    for f in CIBLES:
        inconnus = sorted(
            nom for nom in set(re.findall(r"var\(\s*(--[\w-]+)", f.read_text(encoding="utf-8")))
            if nom not in definis
        )
        if inconnus:
            fautes += len(inconnus)
            print(f"✗ {f.relative_to(RACINE)} → {', '.join(inconnus)}", file=sys.stderr)

    if fautes:
        print(f"\n{fautes} référence(s) à un jeton inexistant.", file=sys.stderr)
        return 1
    print(f"✓ {len(definis)} jetons définis, aucune référence orpheline "
          f"dans {len(CIBLES)} fichiers.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
