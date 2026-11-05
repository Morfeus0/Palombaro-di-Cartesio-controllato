"""Fughe di P1 dall'equilibrio, comandate dal Mac (sottofase 3.3, 5 novembre).

Decisione di Gabriele (5 novembre): al posto di partenze a mano da quote diverse, partenze **automatiche** da due
stati noti e ripetibili, P1 fermo sul fondo (fughe verso l'alto) e P1 a galla in superficie (fughe verso il basso),
con gradini di pressione di ampiezza fissa. La quota resta in anello aperto: il programma regola solo la
**pressione** (il servo si muove finché la pressione è quella voluta) e non guarda la quota per correggerla,
la guarda solo per capire quando P1 è arrivato in fondo o in cima.

Usa i programmi che girano già: scrive gli angoli nel file dei comandi del ponte (pc/bridge.py) e le righe
ESPERIMENTO/FINE in esperimento.txt (un CSV per prova), legge la pressione dal registro del ponte e la quota
dallo stato della telecamera (pc/telecamera.py). Durante le prove la dashboard non si tocca.

Uso:  .venv/bin/python pc/anello_aperto.py dati/<giorno> [--soglia-kpa 101.83]
"""
import argparse
import json
import os
import signal
import sys
import time
from pathlib import Path
from typing import NamedTuple

ANGOLO_MIN, ANGOLO_MAX = 36, 146
GUADAGNO_GRADI_KPA = 28        # 1° → circa 35 Pa (5 novembre, chiusura a 36°)
PASSO_MAX_GRADI = 12           # per ogni correzione
BANDA_KPA = 0.015              # entro questa distanza dal valore voluto il servo non si muove
PERIODO_S = 0.25
PENDENZA_KPA_CM = 0.098        # ρg, misurata nella 3.2
QUOTA_CIMA_CM = 18.0           # P1 a galla (5 novembre: fino a 18,5 cm), per l'equilibrio in superficie
TRAGUARDO_CIMA_CM = 15.0       # oltre questa quota la fuga verso l'alto è finita
QUOTA_FONDO_CM = 1.0           # sotto: P1 è sul fondo (5 nov: appoggiato storto si legge fino a 0,6 cm)
QUOTA_STACCATO_CM = 1.5        # sopra: P1 si è staccato dal fondo
SU = [0.1, 0.2, 0.3, 0.1, 0.2, 0.3]        # kPa sotto la soglia di distacco dal fondo
GIU = [0.2, 0.4, 0.2, 0.4]                 # kPa sopra l'equilibrio in superficie


class Lettura(NamedTuple):
    p_kpa: float
    angolo: float


def ultima_riga_t(testo: str) -> Lettura | None:
    """L'ultima riga T completa del registro del ponte: «HH:MM:SS.mmm $T,seq,t_ms,p,u,…»."""
    righe = testo.splitlines() if testo.endswith("\n") else testo.splitlines()[:-1]
    for riga in reversed(righe):
        if " $T," in riga:
            campi = riga.split(",")
            try:
                return Lettura(int(campi[3]) / 1000, int(campi[4]) / 10)
            except (IndexError, ValueError):
                continue
    return None


def nuovo_angolo(angolo: float, p_kpa: float, voluta_kpa: float) -> int:
    """Un passo del regolatore di pressione: più pressione = angolo più grande (lo stantuffo spinge)."""
    errore = voluta_kpa - p_kpa
    if abs(errore) < BANDA_KPA:
        return int(round(angolo))
    passo = max(-PASSO_MAX_GRADI, min(PASSO_MAX_GRADI, round(GUADAGNO_GRADI_KPA * errore)))
    passo = passo or (1 if errore > 0 else -1)
    return int(max(ANGOLO_MIN, min(ANGOLO_MAX, round(angolo) + passo)))


def scrivi_atomico(percorso: Path, testo: str) -> None:
    temporaneo = percorso.with_name(f".{percorso.name}.tmp")
    temporaneo.write_text(testo, encoding="utf-8")
    os.replace(temporaneo, percorso)


class Banco:
    def __init__(self, cartella: Path):
        giorno = cartella.name
        self.registro = cartella / f"{giorno}_bridge.log"
        self.comandi = cartella / "comandi.txt"
        self.esperimento = cartella / "esperimento.txt"
        self.stato = cartella / "telecamera" / "stato.json"
        self.eventi = (cartella / f"{giorno}_anello_aperto_eventi.log").open("a", encoding="utf-8")

    def nota(self, testo: str) -> None:
        riga = f"{time.strftime('%H:%M:%S')} {testo}"
        print(riga, flush=True)
        self.eventi.write(riga + "\n")
        self.eventi.flush()

    def pressione(self) -> Lettura:
        with self.registro.open("rb") as f:
            f.seek(max(0, f.seek(0, os.SEEK_END) - 4096))
            lettura = ultima_riga_t(f.read().decode("utf-8", "replace"))
        if lettura is None:
            raise RuntimeError("nel registro del ponte non c'è una riga T: il ponte gira?")
        return lettura

    def quota_cm(self) -> float | None:
        try:
            m = json.loads(self.stato.read_text(encoding="utf-8")).get("marcatore") or {}
        except (OSError, ValueError):
            return None
        return m["quota_mm"] / 10 if m.get("trovato") and m.get("quota_mm") is not None else None

    def angolo(self, gradi: int) -> None:
        scrivi_atomico(self.comandi, f"{int(gradi)}\n")

    def apri(self, nome: str, parametri: str) -> None:
        scrivi_atomico(self.esperimento, f"ESPERIMENTO {nome} {parametri}\n")

    def chiudi(self) -> None:
        scrivi_atomico(self.esperimento, "FINE\n")

    def regola(self, voluta_kpa: float, secondi: float, fine=None) -> bool:
        """Tiene la pressione voluta per `secondi`; si ferma prima (True) se fine(quota) diventa vera."""
        limite = time.time() + secondi
        while time.time() < limite:
            lettura = self.pressione()
            angolo = nuovo_angolo(lettura.angolo, lettura.p_kpa, voluta_kpa)
            if angolo != round(lettura.angolo):
                self.angolo(angolo)
            q = self.quota_cm()
            if fine and q is not None and fine(q):
                return True
            time.sleep(PERIODO_S)
        return False

    def aspetta_quota(self, condizione, secondi: float) -> bool:
        limite = time.time() + secondi
        while time.time() < limite:
            q = self.quota_cm()
            if q is not None and condizione(q):
                return True
            time.sleep(PERIODO_S)
        return False

    def a_fondo(self) -> None:
        """Servo tutto spinto finché P1 è fermo sul fondo; se resta su, chiede un colpetto."""
        self.angolo(ANGOLO_MAX)
        if not self.aspetta_quota(lambda q: q < QUOTA_FONDO_CM, 25):
            self.nota("P1 non scende: colpetto sulla bottiglia, per favore")
            self.aspetta_quota(lambda q: q < QUOTA_FONDO_CM, 120)
        time.sleep(4)


def trova_soglia(banco: Banco, partenza_kpa: float) -> float:
    """Dal fondo, pressione giù di 0,03 kPa ogni 12 s finché P1 si stacca: è la soglia di distacco."""
    banco.a_fondo()
    voluta = partenza_kpa + 0.30
    while voluta > partenza_kpa - 1.0:
        if banco.regola(voluta, 12, fine=lambda q: q > QUOTA_STACCATO_CM):
            banco.nota(f"soglia di distacco: {voluta:.3f} kPa")
            return voluta
        voluta -= 0.03
    raise RuntimeError("P1 non si stacca neanche 1 kPa sotto la soglia attesa")


def fuga_su(banco: Banco, soglia: float, delta: float, n: int) -> bool:
    banco.a_fondo()
    if banco.regola(soglia + 0.15, 10, fine=lambda q: q > QUOTA_STACCATO_CM):
        banco.nota(f"prova {n}: P1 si è staccato prima del gradino, non valida")
        return False
    banco.apri("anello_aperto", f"prova {n} su, gradino a {delta:.2f} kPa sotto la soglia {soglia:.3f} kPa")
    banco.regola(soglia + 0.15, 2)
    # 5 nov: dopo il riavvio della telecamera la superficie si legge a circa 16,1 cm (prima 18,5): traguardo a 15
    arrivato = banco.regola(soglia - delta, 30, fine=lambda q: q > TRAGUARDO_CIMA_CM)
    time.sleep(0.5)
    banco.chiudi()
    banco.nota(f"prova {n} su, −{delta:.2f} kPa: {'arrivato in cima' if arrivato else 'non arrivato in 30 s'}")
    banco.aspetta_quota(lambda q: q > TRAGUARDO_CIMA_CM, 15)
    return arrivato


def fuga_giu(banco: Banco, soglia: float, delta: float, n: int) -> bool:
    cima = soglia + PENDENZA_KPA_CM * QUOTA_CIMA_CM
    banco.regola(cima - 0.3, 6)
    banco.apri("anello_aperto", f"prova {n} giù, gradino a {delta:.2f} kPa sopra l'equilibrio in cima {cima:.3f} kPa")
    banco.regola(cima - 0.3, 2)
    arrivato = banco.regola(cima + delta, 30, fine=lambda q: q < QUOTA_FONDO_CM)
    time.sleep(0.5)
    banco.chiudi()
    banco.nota(f"prova {n} giù, +{delta:.2f} kPa: {'arrivato sul fondo' if arrivato else 'non sceso in 30 s'}")
    return arrivato


def main() -> None:
    parser = argparse.ArgumentParser(description="Fughe di P1 dall'equilibrio (3.3)")
    parser.add_argument("cartella", type=Path, help="dati/<giorno>, dove gira il ponte")
    parser.add_argument("--soglia-kpa", type=float, default=101.83, help="soglia di distacco attesa (assoluta)")
    parser.add_argument("--soglia-nota", action="store_true", help="usa --soglia-kpa così com'è, senza cercarla")
    parser.add_argument("--su", type=float, nargs="+", default=SU, help="gradini delle fughe verso l'alto, kPa")
    parser.add_argument("--giu", type=float, nargs="+", default=GIU, help="gradini delle fughe verso il basso, kPa")
    parser.add_argument("--primo", type=int, default=1, help="numero della prima prova (per continuare una serie)")
    a = parser.parse_args()
    # fermato da fuori (kill): si passa comunque dal finally, che chiude il file e rimette il servo a 36
    signal.signal(signal.SIGTERM, lambda *_: sys.exit("fermato da fuori"))
    banco = Banco(a.cartella)
    banco.nota("inizio: non toccare la dashboard fino alla fine")
    try:
        soglia = a.soglia_kpa if a.soglia_nota else trova_soglia(banco, a.soglia_kpa)
        n, giu = a.primo - 1, list(a.giu)
        for delta in a.su:
            n += 1
            if fuga_su(banco, soglia, delta, n) and giu:
                n += 1
                fuga_giu(banco, soglia, giu.pop(0), n)
        banco.nota(f"fine: {n} prove")
    finally:
        banco.chiudi()
        banco.angolo(ANGOLO_MIN)
        banco.nota("servo a 36: pressione vicino alla stanza")


if __name__ == "__main__":
    main()
