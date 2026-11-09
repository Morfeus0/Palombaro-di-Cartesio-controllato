"""Verdetti dei «Fatto quando» della fase 4 dai CSV del ponte (pc/bridge.py, colonne del firmware 0.2).

- 4.4 · gradini di pressione: assestamento entro ±max(10 % del gradino, 50 Pa) in meno di 0,5 s, rimanendoci;
        tenuta: errore medio della pressione mentre il servo compensa la perdita d'aria.
- 4.3 · On-Off: ampiezza e periodo del ciclo limite (attraversamenti in salita della quota voluta, isteresi 1 mm,
        primo ciclo scartato perché è il transitorio).
- 4.5 · gradini di quota: sovraelongazione e assestamento entro ±5 mm (foglio A4: meno di 10 s);
        M4: il tratto continuo più lungo con la quota entro ±1 cm da quella voluta, almeno 60 s.

Perché 50 Pa: il servo si muove a passi di 1°, cioè circa 36 Pa (0,16 ml/°, circa 28° per kPa): una fascia più
stretta direbbe «non assestato» anche a un PI che ondeggia di un solo passo.

Uso:  .venv/bin/python pc/analisi_f4.py dati/<giorno>/<giorno>_<esperimento>_NN.csv[.gz] [--prova 4.3|4.4|4.5]
                                         [--figura uscita.png]
Senza --prova stampa tutte le analisi possibili (nel file del PD, per esempio, anche i «gradini di pressione»).
"""
import csv
import gzip
import sys
from pathlib import Path
from typing import Callable, Iterable, NamedTuple

import numpy as np

STATI_AUTOMATICI = ("H", "C")          # HOLD e CALIBRAZIONE: il PI insegue p_rif
FUSIONE_S = 0.1                        # salti del riferimento più vicini di così sono lo stesso gradino (gemello, 9 nov)

# 4.4
SALTO_MIN_PA = 100.0                   # sotto, è il PID che muove il riferimento, non un gradino
FASCIA_MIN_PA = 50.0
FASCIA_RELATIVA = 0.10
ASSESTAMENTO_MAX_PRESSIONE_S = 0.5
FINESTRA_PRESSIONE_S = 5.0
CONFERMA_PRESSIONE_S = 0.5             # dentro la fascia almeno così a lungo, se no è un'oscillazione che resta
ERRORE_MEDIO_MAX_PA = 20.0             # metà di un passo del servo
TRANSITORIO_S = 1.0
TENUTA_PRESSIONE_MIN_S = 10.0

# 4.3
ISTERESI_CICLO_M = 0.001

# 4.5 e M4
SALTO_MIN_QUOTA_M = 0.005
FASCIA_QUOTA_M = 0.005
ASSESTAMENTO_MAX_QUOTA_S = 10.0
FINESTRA_QUOTA_S = 30.0
CONFERMA_QUOTA_S = 2.0
FASCIA_M4_M = 0.01
DURATA_M4_S = 60.0
STESSO_RIF_M = 0.0001


class Campione(NamedTuple):
    t: float                   # s dal primo campione (orologio dell'ESP32)
    p: float                   # Pa
    u: float                   # ° del servo
    stato: str                 # M, C, H, T, S
    quota: float | None        # m sopra P1 fermo sul fondo; None se non arrivata o P1 perso
    p_rif: float               # Pa, 0 fuori dagli stati automatici
    quota_rif: float | None    # m, solo in HOLD


class Gradino(NamedTuple):
    inizio: float              # s
    ampiezza: float            # nuovo riferimento − vecchio (Pa o m)
    fascia: float
    assestamento: float | None  # s dal gradino; None se non si assesta nella finestra
    sovraelongazione: float    # frazione dell'ampiezza
    superato: bool


class Tenuta(NamedTuple):
    inizio: float
    durata: float
    errore_medio: float        # Pa
    rumore: float              # Pa, deviazione standard dell'errore
    deriva_servo: float        # °/min: quanto il servo si sposta per compensare la perdita
    superato: bool


class Ciclo(NamedTuple):
    periodo: float             # s
    periodo_std: float
    ampiezza: float            # m, metà del picco-picco
    centro: float              # m
    cicli: int


class TenutaQuota(NamedTuple):
    inizio: float
    durata: float
    errore_max: float          # m
    rms: float                 # m
    superato: bool


def _numero(testo: str | None, default=None):
    return default if testo is None or testo == "" else float(testo)


def leggi(righe: Iterable[str]) -> list[Campione]:
    """I campioni di un CSV del ponte; vanno bene anche i file di prima, senza le colonne dei riferimenti."""
    out, t0 = [], None
    for r in csv.DictReader(x for x in righe if not x.startswith("#")):
        t_ms = float(r["t_esp_ms"])
        t0 = t_ms if t0 is None else t0
        quota = _numero(r["quota_dmm"])
        persa = r.get("vista") == "2"
        rif = _numero(r.get("quota_rif_dmm"))
        out.append(Campione(
            t=(t_ms - t0) / 1000,
            p=float(r["p_pa"]),
            u=float(r["u_decimi"]) / 10,
            stato=r["stato"],
            quota=None if quota is None or persa else quota / 10_000,
            p_rif=_numero(r.get("p_rif_pa"), 0.0),
            quota_rif=None if rif is None else rif / 10_000,
        ))
    return out


def apri(percorso: Path) -> tuple[list[str], list[Campione]]:
    """(righe dell'intestazione, campioni) di un CSV, anche compresso (.csv.gz)."""
    aperto = gzip.open(percorso, "rt", encoding="utf-8") if percorso.suffix == ".gz" else percorso.open(encoding="utf-8")
    with aperto as f:
        righe = f.readlines()
    return [r.strip() for r in righe if r.startswith("#")], leggi(righe)


def _gradini(c: list[Campione], y: Callable, rif: Callable, attivo: Callable, salto_min: float,
             fascia_di: Callable, finestra_s: float, conferma_s: float, limite_s: float) -> list[Gradino]:
    salti = [i for i in range(1, len(c))
             if attivo(c[i]) and attivo(c[i - 1]) and abs(rif(c[i]) - rif(c[i - 1])) >= salto_min]
    gruppi: list[list[int]] = []                       # [primo salto, ultimo salto] dello stesso gradino
    for i in salti:
        if gruppi and c[i].t - c[gruppi[-1][1]].t <= FUSIONE_S:
            gruppi[-1][1] = i
        else:
            gruppi.append([i, i])
    gradini = []
    for n, (i, ultimo) in enumerate(gruppi):
        fine = gruppi[n + 1][0] if n + 1 < len(gruppi) else len(c)
        finestra = [x for x in c[i:fine] if x.t - c[i].t <= finestra_s and attivo(x) and y(x) is not None]
        if not finestra:
            continue
        ampiezza = rif(c[ultimo]) - rif(c[i - 1])
        if abs(ampiezza) < salto_min:                  # su e giù nello stesso istante: un picco, non un gradino
            continue
        fascia = fascia_di(abs(ampiezza))
        fuori = [k for k, x in enumerate(finestra) if abs(y(x) - rif(x)) > fascia]
        if not fuori:
            assestamento = 0.0
        elif fuori[-1] + 1 < len(finestra) and finestra[-1].t - finestra[fuori[-1] + 1].t >= conferma_s:
            assestamento = finestra[fuori[-1] + 1].t - c[i].t
        else:
            assestamento = None
        verso = 1 if ampiezza > 0 else -1
        oltre = max((y(x) - rif(x)) * verso for x in finestra)
        gradini.append(Gradino(
            inizio=c[i].t, ampiezza=ampiezza, fascia=fascia, assestamento=assestamento,
            sovraelongazione=max(0.0, oltre / abs(ampiezza)),
            superato=assestamento is not None and assestamento < limite_s))
    return gradini


def _pressione_attiva(x: Campione) -> bool:
    return x.stato in STATI_AUTOMATICI and x.p_rif > 0


def gradini_pressione(c: list[Campione]) -> list[Gradino]:
    """4.4: ogni salto della pressione voluta di almeno 100 Pa negli stati automatici."""
    return _gradini(c, lambda x: x.p, lambda x: x.p_rif, _pressione_attiva, SALTO_MIN_PA,
                    lambda a: max(FASCIA_RELATIVA * a, FASCIA_MIN_PA),
                    FINESTRA_PRESSIONE_S, CONFERMA_PRESSIONE_S, ASSESTAMENTO_MAX_PRESSIONE_S)


def _quota_attiva(x: Campione) -> bool:
    return x.stato == "H" and x.quota_rif is not None


def gradini_quota(c: list[Campione]) -> list[Gradino]:
    """4.5: ogni cambio della quota voluta di almeno 5 mm in HOLD (fascia ±5 mm, foglio A4)."""
    return _gradini(c, lambda x: x.quota, lambda x: x.quota_rif, _quota_attiva, SALTO_MIN_QUOTA_M,
                    lambda a: FASCIA_QUOTA_M, FINESTRA_QUOTA_S, CONFERMA_QUOTA_S, ASSESTAMENTO_MAX_QUOTA_S)


def _tratti(c: list[Campione], dentro: Callable[[Campione, Campione], bool]) -> list[list[Campione]]:
    """Tratti consecutivi in cui dentro(primo del tratto, campione) resta vero."""
    tratti, attuale = [], []
    for x in c:
        if attuale and dentro(attuale[0], x):
            attuale.append(x)
        else:
            if attuale:
                tratti.append(attuale)
            attuale = [x] if dentro(x, x) else []
    if attuale:
        tratti.append(attuale)
    return tratti


def _durata(tratto: list[Campione]) -> float:
    passo = tratto[1].t - tratto[0].t if len(tratto) > 1 else 0.0
    return tratto[-1].t - tratto[0].t + passo


def tenuta_pressione(c: list[Campione]) -> Tenuta | None:
    """4.4: nel tratto più lungo con la pressione voluta ferma, errore medio e deriva del servo (dopo 1 s)."""
    tratti = _tratti(c, lambda a, x: _pressione_attiva(x) and abs(x.p_rif - a.p_rif) < SALTO_MIN_PA)
    if not tratti:
        return None
    lungo = max(tratti, key=_durata)
    tratto = [x for x in lungo if x.t - lungo[0].t >= TRANSITORIO_S]
    if len(tratto) < 2 or _durata(tratto) < TENUTA_PRESSIONE_MIN_S:
        return None
    errore = np.array([x.p - x.p_rif for x in tratto])
    pendenza = np.polyfit([x.t for x in tratto], [x.u for x in tratto], 1)[0]
    medio = float(errore.mean())
    return Tenuta(inizio=tratto[0].t, durata=_durata(tratto), errore_medio=medio, rumore=float(errore.std()),
                  deriva_servo=float(pendenza * 60), superato=abs(medio) < ERRORE_MEDIO_MAX_PA)


def ciclo_limite(c: list[Campione]) -> Ciclo | None:
    """4.3: nel tratto più lungo in HOLD con la stessa quota voluta, i cicli tra due attraversamenti in salita."""
    tratti = _tratti(c, lambda a, x: _quota_attiva(x) and abs(x.quota_rif - a.quota_rif) < STESSO_RIF_M)
    if not tratti:
        return None
    validi = [x for x in max(tratti, key=_durata) if x.quota is not None]
    salite, armato = [], False
    for k, x in enumerate(validi):
        e = x.quota - x.quota_rif
        if e < -ISTERESI_CICLO_M:
            armato = True
        elif armato and e > ISTERESI_CICLO_M:
            salite.append(k)
            armato = False
    cicli = list(zip(salite[1:], salite[2:]))          # il primo ciclo è il transitorio
    if not cicli:
        return None
    periodi = [validi[b].t - validi[a].t for a, b in cicli]
    alti = [max(x.quota for x in validi[a:b]) for a, b in cicli]
    bassi = [min(x.quota for x in validi[a:b]) for a, b in cicli]
    return Ciclo(periodo=float(np.mean(periodi)), periodo_std=float(np.std(periodi)),
                 ampiezza=float(np.mean([(h - b) / 2 for h, b in zip(alti, bassi)])),
                 centro=float(np.mean([(h + b) / 2 for h, b in zip(alti, bassi)])), cicli=len(cicli))


def tenuta_quota(c: list[Campione]) -> TenutaQuota | None:
    """M4: il tratto continuo più lungo in HOLD con la stessa quota voluta e l'errore entro ±1 cm."""
    def dentro(a: Campione, x: Campione) -> bool:
        return (_quota_attiva(x) and x.quota is not None and abs(x.quota_rif - a.quota_rif) < STESSO_RIF_M
                and abs(x.quota - x.quota_rif) <= FASCIA_M4_M)

    tratti = _tratti(c, dentro)
    if not tratti:
        return None
    migliore = max(tratti, key=_durata)
    errore = np.array([x.quota - x.quota_rif for x in migliore])
    durata = _durata(migliore)
    return TenutaQuota(inizio=migliore[0].t, durata=durata, errore_max=float(np.abs(errore).max()),
                       rms=float(np.sqrt(np.mean(errore ** 2))), superato=durata >= DURATA_M4_S)


def _v(valore: float, cifre: int) -> str:
    return f"{valore:.{cifre}f}".replace(".", ",")


def _esito(superato: bool) -> str:
    return "SUPERATO" if superato else "non superato"


def _righe_44(c: list[Campione]) -> list[str]:
    righe = []
    for g in gradini_pressione(c):
        ass = "non si assesta" if g.assestamento is None else f"assestamento {_v(g.assestamento, 2)} s"
        righe.append(f"4.4 gradino di pressione a {_v(g.inizio, 1)} s: {g.ampiezza:+.0f} Pa, fascia ±{g.fascia:.0f} Pa,"
                     f" {ass}, sovraelongazione {g.sovraelongazione * 100:.0f} % → {_esito(g.superato)}")
    if (tp := tenuta_pressione(c)) is not None:
        righe.append(f"4.4 tenuta della pressione per {_v(tp.durata, 0)} s: errore medio {_v(tp.errore_medio, 1)} Pa"
                     f" (rumore {tp.rumore:.0f} Pa), servo {_v(tp.deriva_servo, 2)} °/min → {_esito(tp.superato)}")
    return righe


def _righe_43(c: list[Campione]) -> list[str]:
    if (cl := ciclo_limite(c)) is None:
        return []
    return [f"4.3 ciclo limite: ampiezza ±{_v(cl.ampiezza * 100, 2)} cm intorno a {_v(cl.centro * 100, 2)} cm,"
            f" periodo {_v(cl.periodo, 2)} s (± {_v(cl.periodo_std, 2)}), {cl.cicli} cicli"
            f" (gemello con ±5 mm e ±700 Pa a 5 cm: ±2,2 cm e 6,1 s)"]


def _righe_45(c: list[Campione]) -> list[str]:
    righe = []
    for g in gradini_quota(c):
        ass = "non si assesta" if g.assestamento is None else f"assestamento {_v(g.assestamento, 1)} s"
        righe.append(f"4.5 gradino di quota a {_v(g.inizio, 1)} s: {_v(g.ampiezza * 100, 1)} cm, {ass},"
                     f" sovraelongazione {g.sovraelongazione * 100:.0f} % → {_esito(g.superato)}")
    if (tq := tenuta_quota(c)) is not None:
        righe.append(f"M4 quota entro ±1 cm per {_v(tq.durata, 1)} s di fila (da {_v(tq.inizio, 1)} s):"
                     f" errore massimo {_v(tq.errore_max * 1000, 1)} mm, RMS {_v(tq.rms * 1000, 1)} mm"
                     f" → {_esito(tq.superato)}")
    return righe


# Quali analisi fa ogni prova; nella 4.5 anche il ciclo limite, perché col solo P si vede l'oscillazione.
PROVE = {"4.3": (_righe_43,), "4.4": (_righe_44,), "4.5": (_righe_45, _righe_43)}


def rapporto(c: list[Campione], prova: str | None = None) -> list[str]:
    """Le righe del verdetto, in italiano: tutte le analisi che il file permette, o solo quelle della prova scelta
    (le altre non si calcolano nemmeno: un loro errore non deve togliere il verdetto della prova giusta)."""
    if prova is not None and prova not in PROVE:
        raise ValueError(f"prova sconosciuta: {prova} (si può scegliere tra {', '.join(PROVE)})")
    sezioni = PROVE[prova] if prova is not None else (_righe_44, _righe_43, _righe_45)
    righe = [riga for sezione in sezioni for riga in sezione(c)]
    return righe or ["nessuna analisi possibile: servono campioni in HOLD o CALIBRAZIONE con i riferimenti"]


def disegna(c: list[Campione], uscita: Path, titolo: str) -> None:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    t = np.array([x.t for x in c])
    fig, (a, b, s) = plt.subplots(3, 1, figsize=(10, 8), sharex=True)
    a.plot(t, [x.p / 1000 for x in c], label="pressione")
    a.plot(t, [x.p_rif / 1000 if x.p_rif > 0 else np.nan for x in c], "--", label="voluta")
    a.set_ylabel("kPa")
    b.plot(t, [np.nan if x.quota is None else x.quota * 100 for x in c], label="quota")
    b.plot(t, [np.nan if x.quota_rif is None else x.quota_rif * 100 for x in c], "--", label="voluta")
    b.set_ylabel("cm")
    s.plot(t, [x.u for x in c], label="servo")
    s.set_ylabel("°")
    s.set_xlabel("tempo [s]")
    for asse in (a, b, s):
        asse.grid(alpha=0.3)
        asse.legend(loc="upper right")
    a.set_title(titolo)
    fig.tight_layout()
    fig.savefig(uscita, dpi=120)
    plt.close(fig)


def main(argomenti: list[str]) -> int:
    if not argomenti:
        print(__doc__)
        return 2
    percorso = Path(argomenti[0])
    intestazione, c = apri(percorso)
    print(percorso.name)
    for riga in intestazione:
        print("  " + riga)
    prova = argomenti[argomenti.index("--prova") + 1] if "--prova" in argomenti else None
    for riga in rapporto(c, prova):
        print(riga)
    if "--figura" in argomenti:
        uscita = Path(argomenti[argomenti.index("--figura") + 1])
        disegna(c, uscita, percorso.name)
        print(f"figura: {uscita}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
