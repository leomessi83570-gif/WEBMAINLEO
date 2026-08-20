#!/usr/bin/env python3
"""Audite les contrastes de la palette, thème clair et thème sombre.

Une palette chaude se casse toujours au même endroit : l'or et la terre cuite
descendent sous 4,5:1 sur fond clair bien avant qu'on le voie à l'œil. Ce script
résout les jetons sémantiques en couleurs réelles et vérifie chaque paire
réellement employée dans l'interface, avec le seuil qui s'applique à elle.

    python3 outils/verifier_contrastes.py
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
JETONS = RACINE / "site" / "assets" / "css" / "tokens.css"

# (avant-plan, arrière-plan, seuil, description)
# 4.5 = texte courant · 3.0 = grand texte (≥ 24px, ou ≥ 18,66px gras)
#       et éléments d'interface non textuels (bordures, icônes porteuses de sens)
PAIRES = [
    ("--texte",            "--fond",       4.5, "corps de texte"),
    ("--texte",            "--fond-doux",  4.5, "corps sur section douce"),
    ("--texte",            "--fond-eleve", 4.5, "corps sur carte"),
    ("--texte-doux",       "--fond",       4.5, "texte secondaire"),
    ("--texte-doux",       "--fond-doux",  4.5, "texte secondaire sur section douce"),
    ("--texte-tenu",       "--fond",       4.5, "mentions, sur-titres"),
    ("--texte-tenu",       "--fond-doux",  4.5, "mentions sur section douce"),
    ("--accent",           "--fond",       4.5, "lien / accent sur fond"),
    ("--accent",           "--fond-doux",  4.5, "lien sur section douce"),
    ("--accent",           "--fond-eleve", 4.5, "lien sur carte"),
    ("--accent-survol",    "--fond",       4.5, "lien survolé"),
    ("--second",           "--fond",       4.5, "accent secondaire"),
    ("--second",           "--fond-doux",  4.5, "accent secondaire sur section douce"),
    ("--danger",           "--fond",       4.5, "texte d'erreur"),
    ("--danger",           "--danger-doux",4.5, "erreur sur son fond"),
    ("--succes",           "--fond",       4.5, "confirmation"),
    ("--attention",        "--fond",       4.5, "avertissement"),
    ("--texte-sur-accent", "--accent",     4.5, "libellé de bouton plein"),
    ("--texte-inverse",    "--fond-inverse", 4.5, "texte sur bandeau inversé"),
    ("--anneau",           "--fond",       3.0, "anneau de focus"),
]


def canal(v: float) -> float:
    v /= 255
    return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4


def luminance(rvb: tuple[int, int, int]) -> float:
    r, g, b = rvb
    return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b)


def contraste(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    la, lb = luminance(a), luminance(b)
    haut, bas = max(la, lb), min(la, lb)
    return (haut + 0.05) / (bas + 0.05)


def en_rvba(valeur: str) -> tuple[int, int, int, float] | None:
    """(r, v, b, alpha). L'alpha compte : `--danger-doux` est un rouge à 14 %,
    et le comparer sans le composer sur le fond donnerait 1,00:1."""
    valeur = valeur.strip()
    m = re.fullmatch(r"#([0-9a-fA-F]{6})", valeur)
    if m:
        h = m.group(1)
        return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 1.0
    m = re.fullmatch(
        r"rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*(?:/\s*([\d.]+)\s*)?\)", valeur)
    if m:
        r, v, b, a = m.groups()
        return int(r), int(v), int(b), float(a) if a else 1.0
    return None


def composer(dessus, dessous) -> tuple[int, int, int]:
    """Aplatit une couleur semi-transparente sur son fond."""
    r, v, b, a = dessus
    if a >= 1:
        return r, v, b
    fr, fv, fb = dessous
    return (round(r * a + fr * (1 - a)),
            round(v * a + fv * (1 - a)),
            round(b * a + fb * (1 - a)))


def fin_de_bloc(css: str, debut_accolade: int) -> int:
    """Indice juste après l'accolade fermante appariée à celle de `debut`.

    Un `re.sub` non gourmand se trompe de fermante dès qu'un bloc en contient un
    autre — c'est le cas de `@media { :root { … } }`, et l'erreur est
    silencieuse : les valeurs du thème sombre se retrouvent dans le thème clair.
    """
    profondeur = 0
    for i in range(debut_accolade, len(css)):
        if css[i] == "{":
            profondeur += 1
        elif css[i] == "}":
            profondeur -= 1
            if profondeur == 0:
                return i + 1
    raise ValueError("accolade non refermée dans tokens.css")


def extraire(css: str, motif: str) -> tuple[str, str]:
    """Détache le premier bloc correspondant à `motif` : (contenu, reste du CSS)."""
    m = re.search(motif, css)
    if not m:
        return "", css
    debut = css.index("{", m.start())
    fin = fin_de_bloc(css, debut)
    return css[debut + 1:fin - 1], css[:m.start()] + css[fin:]


def declarations(css: str) -> dict[str, str]:
    return {
        nom: val.strip()
        for nom, val in re.findall(r"(--[\w-]+)\s*:\s*([^;]+);", css)
    }


def blocs(css: str) -> tuple[dict[str, str], dict[str, str]]:
    """Renvoie (jetons du thème clair, surcharges du thème sombre)."""
    # Les deux déclarations du thème sombre — la bascule manuelle et la
    # préférence système — portent les mêmes valeurs ; on lit la première et on
    # écarte les deux du thème clair.
    bascule, reste = extraire(css, r':root\[data-theme="sombre"\]\s*\{')
    systeme, reste = extraire(reste, r"@media \(prefers-color-scheme: dark\)\s*\{")

    sombre = declarations(bascule) or declarations(systeme)
    return declarations(reste), sombre


def resoudre(nom: str, table: dict[str, str], vus: set[str] | None = None):
    """Suit les var(--x) jusqu'à une couleur littérale."""
    vus = vus or set()
    if nom in vus or nom not in table:
        return None
    vus.add(nom)
    val = table[nom]
    direct = en_rvba(val)
    if direct:
        return direct
    m = re.match(r"var\(\s*(--[\w-]+)", val)
    if m:
        return resoudre(m.group(1), table, vus)
    return None


def auditer(nom_theme: str, table: dict[str, str]) -> int:
    print(f"\n── {nom_theme} " + "─" * (56 - len(nom_theme)))
    echecs = 0
    page = resoudre("--fond", table)
    page = composer(page, (255, 255, 255)) if page else (255, 255, 255)

    for jeton_av, jeton_ar, seuil, desc in PAIRES:
        brut_av, brut_ar = resoudre(jeton_av, table), resoudre(jeton_ar, table)
        if brut_av is None or brut_ar is None:
            print(f"  ? {desc:38s} jeton non résolu ({jeton_av} / {jeton_ar})")
            continue
        ar = composer(brut_ar, page)
        av = composer(brut_av, ar)
        r = contraste(av, ar)
        ok = r >= seuil
        echecs += 0 if ok else 1
        marque = "✓" if ok else "✗"
        print(f"  {marque} {desc:38s} {r:5.2f}:1  (seuil {seuil})")
    return echecs


def main() -> int:
    css = JETONS.read_text(encoding="utf-8")
    clair, surcharges = blocs(css)
    sombre = dict(clair)
    sombre.update(surcharges)

    echecs = auditer("Thème clair", clair) + auditer("Thème sombre", sombre)

    print()
    if echecs:
        print(f"{echecs} paire(s) sous le seuil.", file=sys.stderr)
        return 1
    print("Toutes les paires passent.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
