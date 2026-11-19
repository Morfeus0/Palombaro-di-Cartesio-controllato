"""Sottofase 5.3: filtro α-β sulla quota della telecamera, provato sui dati registrati il 10 novembre.

Confronta tre stime della velocità di P1 a partire dalla quota misurata:
  - differenza: (z_k − z_(k−1)) / (t_k − t_(k−1)) a ogni fotogramma, la stima più semplice;
  - firmware: la derivata filtrata dell'anello esterno di oggi, s/(1 + s/N) con N = 10 1/s, Tustin a 30 ms
    sulla quota tenuta fra un fotogramma e l'altro (firmware/src/palombaro/controllo.cpp, passo);
  - α-β: x⁻ = x + T·v; r = z − x⁻; x = x⁻ + α·r; v = v + (β/T)·r, a ogni fotogramma, con T variabile.
    β = α²/(2 − α) (Benedict–Bordner): resta un solo parametro da tarare.

Misure (criterio della 5.3: rumore sulla velocità ridotto almeno di 5 volte senza ritardo apprezzabile):
  - rumore: deviazione standard della velocità stimata con P1 fermo sul fondo (prova 4-4, 55 s);
  - ritardo: spostamento che massimizza la somiglianza con una velocità di riferimento non causale
    (quota levigata avanti e indietro, poi differenza centrale), sul gradino 5 → 10 cm della prova di M4.

Uso:  .venv/bin/python pc/filtro_ab.py [--grafico analisi/figure/filtro_ab.png]
"""
from __future__ import annotations

import argparse
import csv
import sys
from dataclasses import dataclass
from pathlib import Path

import numpy as np

RADICE = Path(__file__).resolve().parent.parent
FERMO = RADICE / "dati" / "2026-11-10" / "2026-11-10_4-4-gradini-pressione_07.csv"
MOTO = RADICE / "dati" / "2026-11-10" / "2026-11-10_4-5-pid-m4_04.csv"
N_FIRMWARE = 10.0           # 1/s, banda del filtro sul derivativo nel firmware 0.2
TS_ESTERNO = 0.030          # s, periodo dell'anello esterno nel firmware 0.2
RIDUZIONE_MINIMA = 5.0      # criterio della 5.3
ALFE = (0.05, 0.08, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.6, 0.8)


@dataclass(frozen=True)
class Serie:
    t: np.ndarray   # s, istante del fotogramma (orologio dell'ESP32 meno l'età della quota)
    z: np.ndarray   # m


@dataclass(frozen=True)
class Esito:
    nome: str
    rumore: float      # m/s, deviazione standard con P1 fermo
    riduzione: float   # rispetto alla differenza semplice
    ritardo: float     # s


def leggi_righe(percorso: Path) -> list[dict[str, str]]:
    with percorso.open(encoding="utf-8") as f:
        return list(csv.DictReader(r for r in f if not r.startswith("#")))


def fotogrammi(righe: list[dict[str, str]]) -> Serie:
    """Un campione per fotogramma: l'età della quota riparte da capo quando arriva un fotogramma nuovo."""
    t: list[float] = []
    z: list[float] = []
    eta_prec = None
    for r in righe:
        if not r["quota_dmm"] or not r["eta_quota_ms"]:
            eta_prec = None
            continue
        eta = int(r["eta_quota_ms"])
        if eta_prec is not None and eta < eta_prec:
            istante = (int(r["t_esp_ms"]) - eta) / 1000.0
            if not t or istante > t[-1]:
                t.append(istante)
                z.append(int(r["quota_dmm"]) * 1e-4)
        eta_prec = eta
    if len(t) < 10:
        raise ValueError("troppo pochi fotogrammi riconosciuti")
    return Serie(np.asarray(t), np.asarray(z))


def tenuta_30ms(righe: list[dict[str, str]]) -> Serie:
    """La quota come la vede l'anello esterno: l'ultimo valore ricevuto, un ciclo ogni 30 ms (3 righe a 100 Hz)."""
    valide = [r for r in righe if r["quota_dmm"]]
    passo = round(TS_ESTERNO / 0.010)
    t = np.asarray([int(r["t_esp_ms"]) / 1000.0 for r in valide[::passo]])
    z = np.asarray([int(r["quota_dmm"]) * 1e-4 for r in valide[::passo]])
    return Serie(t, z)


def differenza(s: Serie) -> np.ndarray:
    v = np.zeros_like(s.z)
    v[1:] = np.diff(s.z) / np.diff(s.t)
    return v


def derivata_firmware(s: Serie, n: float = N_FIRMWARE, ts: float = TS_ESTERNO) -> np.ndarray:
    """Come pid.derivata nel firmware con Kd = 1: velocità in m/s."""
    a, b = (2 - n * ts) / (2 + n * ts), 2 * n / (2 + n * ts)
    v = np.zeros_like(s.z)
    for k in range(1, len(s.z)):
        v[k] = a * v[k - 1] + b * (s.z[k] - s.z[k - 1])
    return v


def beta_di(alfa: float) -> float:
    return alfa ** 2 / (2 - alfa)


def alfa_beta(s: Serie, alfa: float, beta: float | None = None) -> tuple[np.ndarray, np.ndarray]:
    if not 0 < alfa < 1:
        raise ValueError("alfa deve stare fra 0 e 1")
    beta = beta_di(alfa) if beta is None else beta
    x, v = np.empty_like(s.z), np.zeros_like(s.z)
    x[0] = s.z[0]
    for k in range(1, len(s.z)):
        dt = s.t[k] - s.t[k - 1]
        previsto = x[k - 1] + dt * v[k - 1]
        r = s.z[k] - previsto
        x[k] = previsto + alfa * r
        v[k] = v[k - 1] + beta / dt * r
    return x, v


def riferimento(s: Serie, griglia: np.ndarray, finestra_s: float = 0.15) -> np.ndarray:
    """Velocità non causale: quota interpolata, media mobile avanti e indietro, differenza centrale."""
    passo = griglia[1] - griglia[0]
    z = np.interp(griglia, s.t, s.z)
    n = max(1, round(finestra_s / passo))
    nucleo = np.ones(n) / n
    # Bordi ripetuti: con lo zero ai bordi la media mobile inventerebbe una discesa di centimetri.
    estesa = np.pad(z, (n, n), mode="edge")
    liscia = np.convolve(np.convolve(estesa, nucleo, mode="same")[::-1], nucleo, mode="same")[::-1][n:-n]
    return np.gradient(liscia, passo)


def ritardo(t: np.ndarray, v: np.ndarray, griglia: np.ndarray, v_rif: np.ndarray, massimo_s: float = 0.4) -> float:
    """Spostamento (s) che rende la stima più simile al riferimento: positivo se la stima arriva dopo."""
    passo = griglia[1] - griglia[0]
    stima = np.interp(griglia, t, v)
    migliore, scarto_min = 0.0, np.inf
    for k in range(0, round(massimo_s / passo) + 1):
        scarto = np.mean((stima[k:] - v_rif[: len(v_rif) - k]) ** 2)
        if scarto < scarto_min:
            migliore, scarto_min = k * passo, scarto
    return migliore


def valuta(fermo: list[dict[str, str]], moto: list[dict[str, str]], inizio: float, fine: float) -> list[Esito]:
    f_fermo, f_moto = fotogrammi(fermo), fotogrammi(moto)
    t_fermo, t_moto = tenuta_30ms(fermo), tenuta_30ms(moto)
    t0 = f_moto.t[0]
    griglia = np.arange(t0 + inizio, t0 + fine, 0.005)
    v_rif = riferimento(f_moto, griglia)
    stime = [("differenza", differenza(f_fermo), f_moto.t, differenza(f_moto)),
             (f"firmware N = {N_FIRMWARE:g}", derivata_firmware(t_fermo), t_moto.t, derivata_firmware(t_moto))]
    for a in ALFE:
        stime.append((f"α-β α = {a:g}", alfa_beta(f_fermo, a)[1], f_moto.t, alfa_beta(f_moto, a)[1]))
    base = float(np.std(stime[0][1][len(stime[0][1]) // 10:]))
    esiti = []
    for nome, v_fermo, tm, v_moto in stime:
        rumore = float(np.std(v_fermo[len(v_fermo) // 10:]))   # scarta l'avvio del filtro
        esiti.append(Esito(nome, rumore, base / rumore, ritardo(tm, v_moto, griglia, v_rif)))
    return esiti


def tabella(esiti: list[Esito]) -> str:
    righe = ["| stima | rumore con P1 fermo [mm/s] | riduzione | ritardo [ms] | criterio 5.3 |",
             "|---|---:|---:|---:|---|"]
    for e in esiti:
        ok = "sì" if e.riduzione >= RIDUZIONE_MINIMA else "no"
        righe.append(f"| {e.nome} | {1000 * e.rumore:.2f} | {e.riduzione:.1f}× | {1000 * e.ritardo:.0f} | {ok} |"
                     .replace(".", ","))
    return "\n".join(righe)


def grafico(moto: list[dict[str, str]], alfa: float, uscita: Path) -> None:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    s, tf = fotogrammi(moto), tenuta_30ms(moto)
    t, tt = s.t - s.t[0], tf.t - s.t[0]
    sel, sf = (t > 28) & (t < 42), (tt > 28) & (tt < 42)
    fig, ax = plt.subplots(figsize=(10, 4.5), dpi=140)
    ax.plot(t[sel], 1000 * differenza(s)[sel], color="#bbb", lw=0.8, label="differenza fra fotogrammi")
    ax.plot(tt[sf], 1000 * derivata_firmware(tf)[sf], color="#c0392b", lw=1.4, label="firmware 0.2 (N = 10)")
    ax.plot(t[sel], 1000 * alfa_beta(s, alfa)[1][sel], color="#1f5f8b", lw=1.4, label=f"α-β (α = {alfa:g})")
    ax.set(xlabel="tempo dall'avvio [s]", ylabel="velocità di P1 [mm/s]",
           title="Velocità stimata sul gradino 5 → 10 cm (prova di M4, 10 novembre)")
    ax.set_ylim(-40, 40)
    ax.legend(loc="upper right")
    ax.grid(alpha=0.3)
    fig.tight_layout()
    uscita.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(uscita)


def main(argomenti: list[str]) -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--grafico", type=Path, help="salva il confronto sul gradino di M4")
    p.add_argument("--alfa", type=float, default=0.2, help="α mostrato nel grafico")
    a = p.parse_args(argomenti)
    fermo, moto = leggi_righe(FERMO), leggi_righe(MOTO)
    # Il gradino 5 → 10 cm della prova di M4 arriva circa 30 s dopo l'avvio: finestra fino a 20 s dopo.
    print(tabella(valuta(fermo, moto, inizio=25.0, fine=50.0)))
    if a.grafico:
        grafico(moto, a.alfa, a.grafico)
        print(f"Grafico: {a.grafico}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
