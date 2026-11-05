"""Pressione di equilibrio di P1 in funzione della quota (sottofase 3.2).

Metodo (5 novembre): in un tratto in cui P1 resta lontano dal fondo e dalla superficie, si prende il pezzo
tra il primo e l'ultimo passaggio verso l'alto per la quota media del tratto. Lì P1 parte e arriva alla stessa
quota con la stessa direzione, quindi in media non accelera: con il modello lineare
z'' = −a·(p − p_eq(z)) − b·z' la pressione media del pezzo è p_eq alla quota media, anche se P1 oscilla.

Uso:  .venv/bin/python pc/equilibrio.py <riferimento_kPa> <esperimento.csv> [altri.csv …]
"""
import csv
import sys
from pathlib import Path
from typing import NamedTuple

import numpy as np

QUOTA_MIN_CM, QUOTA_MAX_CM = 1.0, 17.8   # fuori: P1 sul fondo o contro il menisco in superficie
TRATTO_MIN_S, PEZZO_MIN_S = 20.0, 15.0


class Punto(NamedTuple):
    file: str
    da_s: float
    a_s: float
    quota_cm: float
    dp_kpa: float


def carica(percorso: Path, riferimento_kpa: float) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    with percorso.open(encoding="utf-8") as f:
        righe = [r for r in csv.DictReader(x for x in f if not x.startswith("#")) if r["quota_dmm"] != ""]
    t = np.array([float(r["t_mac"]) for r in righe])
    quota = np.array([int(r["quota_dmm"]) / 100 for r in righe])
    dp = np.array([int(r["p_pa"]) / 1000 - riferimento_kpa for r in righe])
    return t - t[0], quota, dp


def punti_di_equilibrio(nome: str, t: np.ndarray, quota: np.ndarray, dp: np.ndarray) -> list[Punto]:
    lontano = (quota > QUOTA_MIN_CM) & (quota < QUOTA_MAX_CM)
    punti, i, n = [], 0, len(quota)
    while i < n:
        if not lontano[i]:
            i += 1
            continue
        j = i
        while j < n and lontano[j]:
            j += 1
        if t[j - 1] - t[i] >= TRATTO_MIN_S:
            media = quota[i:j].mean()
            salite = np.where((quota[i:j - 1] < media) & (quota[i + 1:j] >= media))[0] + i
            if len(salite) >= 2 and t[salite[-1]] - t[salite[0]] >= PEZZO_MIN_S:
                a, b = salite[0], salite[-1]
                punti.append(Punto(nome, float(t[a]), float(t[b]), float(quota[a:b].mean()), float(dp[a:b].mean())))
        i = j
    return punti


def retta(quote: np.ndarray, pressioni: np.ndarray) -> tuple[float, float, float, float]:
    """Pendenza e intercetta ai minimi quadrati, con le loro deviazioni standard."""
    a = np.column_stack([quote, np.ones_like(quote)])
    c = np.linalg.lstsq(a, pressioni, rcond=None)[0]
    residui = pressioni - a @ c
    cov = (residui ** 2).sum() / (len(quote) - 2) * np.linalg.inv(a.T @ a)
    return float(c[0]), float(c[1]), float(np.sqrt(cov[0, 0])), float(np.sqrt(cov[1, 1]))


def main() -> None:
    riferimento = float(sys.argv[1])
    punti = []
    for nome in sys.argv[2:]:
        punti += punti_di_equilibrio(Path(nome).stem, *carica(Path(nome), riferimento))
    for p in punti:
        print(f"{p.file}: {p.da_s:5.0f}–{p.a_s:5.0f} s  quota {p.quota_cm:5.2f} cm  Δp {p.dp_kpa:+.3f} kPa")
    if len(punti) >= 3:
        s, q0, es, eq = retta(np.array([p.quota_cm for p in punti]), np.array([p.dp_kpa for p in punti]))
        print(f"pendenza {s:.4f} ± {es:.4f} kPa/cm, intercetta {q0:+.3f} ± {eq:.3f} kPa")


if __name__ == "__main__":
    main()
