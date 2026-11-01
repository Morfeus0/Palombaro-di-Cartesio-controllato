"""Ponte tra Mac ed ESP32 e registrazione degli esperimenti (sottofase 2.6, docs/protocollo.md).

Prende il posto di pc/registra_seriale.py con il firmware 0.1: è l'unico programma che apre la porta della scheda.
- Registro: ogni riga della seriale con l'orario al millisecondo, come prima (la dashboard lo segue uguale).
- Comandi: le righe del file dei comandi (quelle della dashboard) vanno alla scheda: un angolo intero diventa `$S`,
  le righe `$…` passano così come sono; `ESPERIMENTO <nome> [parametri]` apre un CSV, `FINE` lo chiude.
- Quota: telecamera.py manda a ogni fotogramma un pacchetto UDP su 127.0.0.1 ("quota_dmm,t_fotogramma,vista");
  il ponte lo inoltra subito come `$Z` con la sua età in millisecondi (stesso orologio, niente da sincronizzare).
- Battito: `$B` ogni 200 ms, perché la scheda sappia che il Mac è vivo.
- Esperimento: una riga per ogni riga T della scheda (100 al secondo) con l'ultima quota arrivata e la sua età.
  File `dati/<giorno>/<giorno>_<esperimento>_NN.csv` con l'intestazione dei metadati.

Uso:  nohup .venv/bin/python pc/bridge.py dati/<giorno>/<giorno>_bridge.log dati/<giorno>/comandi.txt > /dev/null 2>&1 &
      .venv/bin/python pc/bridge.py verifica dati/<giorno>/<giorno>_<esperimento>_NN.csv
"""
import os
import re
import socket
import sys
import time
from pathlib import Path
from typing import NamedTuple

import serial

from protocollo import PORTA_QUOTA, analizza, comando_servo, componi

PORTA_SERIALE = "/dev/cu.usbserial-0001"
BAUD = 460800
PERIODO_BATTITO_S = 0.2
PERIODO_COMANDI_S = 0.1
COLONNE = "t_mac,seq,t_esp_ms,p_pa,u_decimi,stato,quota_dmm,eta_quota_ms,vista"
# «Fatto quando» della 2.6: quota, pressione e comando insieme ad almeno 20 Hz per 5 minuti, senza buchi.
INTERVALLO_MAX_S = 1 / 20
DURATA_MIN_S = 5 * 60


class Quota(NamedTuple):
    dmm: int        # decimi di millimetro sopra P1 fermo sul fondo (decisione 5)
    t: float        # arrivo del fotogramma sul Mac (time.time())
    vista: int      # 0 trovato, 1 buco breve, 2 perso


def orario(t: float) -> str:
    return time.strftime("%H:%M:%S", time.localtime(t)) + f".{int(t % 1 * 1000):03d}"


def leggi_datagramma(dati: bytes) -> Quota | None:
    try:
        dmm, t, vista = dati.decode("ascii").split(",")
        q = Quota(int(dmm), float(t), int(vista))
    except (UnicodeDecodeError, ValueError):
        return None
    return q if q.vista in (0, 1, 2) else None


def riga_z(seq: int, q: Quota, adesso: float) -> str:
    return componi(f"Z,{seq},{q.dmm},{max(0, round((adesso - q.t) * 1000))},{q.vista}")


def nome_esperimento(cartella: Path, giorno: str, esperimento: str) -> Path:
    pulito = re.sub(r"[^a-z0-9]+", "-", esperimento.lower()).strip("-") or "esperimento"
    numero = 1
    while (percorso := cartella / f"{giorno}_{pulito}_{numero:02d}.csv").exists():
        numero += 1
    return percorso


def riga_csv(adesso: float, campi_t: list[str], q: Quota | None) -> str:
    seq, t_esp, p, u, stato = campi_t[:5]
    quota = ",," if q is None else f"{q.dmm},{max(0, round((adesso - q.t) * 1000))},{q.vista}"
    return f"{adesso:.3f},{seq},{t_esp},{p},{u},{stato},{quota}"


def verifica(righe) -> dict:
    """Durata, intervallo massimo tra righe T e tratto più lungo senza una quota fresca (età oltre 50 ms)."""
    t_prec, t0, buco_inizio = None, None, None
    r = {"righe": 0, "intervallo_max_s": 0.0, "buco_quota_s": 0.0, "durata_s": 0.0}
    for riga in righe:
        if not riga.strip() or riga.startswith(("#", "t_mac")):
            continue
        campi = riga.strip().split(",")
        t = float(campi[0])
        t0 = t if t0 is None else t0
        if t_prec is not None:
            r["intervallo_max_s"] = max(r["intervallo_max_s"], t - t_prec)
        t_prec = t
        r["righe"] += 1
        fresca = campi[6] != "" and campi[7] != "" and int(campi[7]) / 1000 <= INTERVALLO_MAX_S
        if fresca:
            buco_inizio = None
        else:
            buco_inizio = t if buco_inizio is None else buco_inizio
            r["buco_quota_s"] = max(r["buco_quota_s"], t - buco_inizio + 0.01)
    r["durata_s"] = 0.0 if t0 is None else t_prec - t0
    r["superato"] = (r["durata_s"] >= DURATA_MIN_S and r["intervallo_max_s"] <= INTERVALLO_MAX_S
                     and r["buco_quota_s"] == 0.0)
    return r


class Ponte:
    def __init__(self, registro: Path, comandi: Path):
        self.registro, self.comandi = registro, comandi
        self.log = registro.open("a", encoding="utf-8")
        self.porta: serial.Serial | None = None
        self.udp = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.udp.bind(("127.0.0.1", PORTA_QUOTA))
        self.udp.setblocking(False)
        self.quota: Quota | None = None
        self.seq_z = self.seq_b = 0
        self.csv = None
        self.prossimo_battito = self.prossimi_comandi = 0.0
        self.resto = b""

    def scrivi_log(self, testo: str) -> None:
        self.log.write(f"{orario(time.time())} {testo}\n")
        self.log.flush()

    def invia(self, riga: str) -> None:
        if self.porta:
            self.porta.write((riga + "\n").encode("ascii"))

    def apri_porta(self) -> None:
        porta = serial.Serial()
        porta.port, porta.baudrate, porta.timeout = PORTA_SERIALE, BAUD, 0
        porta.dtr = porta.rts = False
        porta.open()
        self.porta = porta
        self.scrivi_log("# porta aperta (ponte)")

    def comando(self, riga: str) -> None:
        parole = riga.split(maxsplit=2)
        if parole[0] == "ESPERIMENTO" and len(parole) >= 2:
            self.apri_esperimento(parole[1], parole[2] if len(parole) > 2 else "")
        elif parole[0] == "FINE":
            self.chiudi_esperimento()
        else:
            uscita = riga if riga.startswith("$") else comando_servo(riga)
            if uscita:
                self.invia(uscita)
                self.scrivi_log(f"# inviato: {uscita}")

    def apri_esperimento(self, nome: str, parametri: str) -> None:
        self.chiudi_esperimento()
        giorno = time.strftime("%Y-%m-%d")
        percorso = nome_esperimento(self.registro.parent, giorno, nome)
        self.csv = percorso.open("w", encoding="utf-8")
        for chiave, valore in (("esperimento", nome), ("data", time.strftime("%Y-%m-%d %H:%M:%S")),
                               ("parametri", parametri), ("firmware", "palombaro 0.1, protocollo 1"),
                               ("quota", "decimi di mm sopra P1 fermo sul fondo; età dal fotogramma, ms")):
            self.csv.write(f"# {chiave}: {valore}\n")
        self.csv.write(COLONNE + "\n")
        self.scrivi_log(f"# esperimento iniziato: {percorso.name}")

    def chiudi_esperimento(self) -> None:
        if self.csv:
            nome = Path(self.csv.name).name
            self.csv.close()
            self.csv = None
            self.scrivi_log(f"# esperimento chiuso: {nome}")

    def leggi_comandi(self) -> None:
        if not self.comandi.exists():
            return
        righe = [r.strip() for r in self.comandi.read_text(encoding="utf-8").splitlines() if r.strip()]
        os.remove(self.comandi)
        for riga in righe:
            self.comando(riga)

    def leggi_quote(self, adesso: float) -> None:
        while True:
            try:
                dati = self.udp.recv(64)
            except BlockingIOError:
                return
            q = leggi_datagramma(dati)
            if q:
                self.quota = q
                self.seq_z += 1
                self.invia(riga_z(self.seq_z, q, adesso))

    def leggi_seriale(self, adesso: float) -> None:
        dati = self.porta.read(self.porta.in_waiting or 1)
        if not dati:
            return
        *righe, self.resto = (self.resto + dati).split(b"\n")
        for grezza in righe:
            riga = grezza.decode("utf-8", errors="replace").rstrip("\r")
            self.log.write(f"{orario(adesso)} {riga}\n")
            if self.csv and (analizzata := analizza(riga)) and analizzata[0] == "T":
                self.csv.write(riga_csv(adesso, analizzata[1], self.quota) + "\n")
        self.log.flush()

    def passo(self) -> None:
        adesso = time.time()
        self.leggi_quote(adesso)
        self.leggi_seriale(adesso)
        if adesso >= self.prossimo_battito:
            self.seq_b += 1
            self.invia(componi(f"B,{self.seq_b}"))
            self.prossimo_battito = adesso + PERIODO_BATTITO_S
        if adesso >= self.prossimi_comandi:
            self.leggi_comandi()
            self.prossimi_comandi = adesso + PERIODO_COMANDI_S
        time.sleep(0.002)

    def gira(self) -> None:
        while True:
            try:
                if self.porta is None:
                    self.apri_porta()
                self.passo()
            except (serial.SerialException, OSError) as errore:
                self.scrivi_log(f"# porta persa: {errore}; riprovo tra 2 s")
                self.porta = None
                time.sleep(2)


def main() -> None:
    if sys.argv[1] == "verifica":
        with open(sys.argv[2], encoding="utf-8") as f:
            r = verifica(f)
        print(f"{Path(sys.argv[2]).name}: {r['righe']} righe in {r['durata_s'] / 60:.1f} minuti, "
              f"intervallo massimo {r['intervallo_max_s'] * 1000:.0f} ms, "
              f"tratto più lungo senza quota fresca {r['buco_quota_s'] * 1000:.0f} ms")
        print("FATTO QUANDO SUPERATO" if r["superato"] else "fatto quando NON superato")
        return
    Ponte(Path(sys.argv[1]), Path(sys.argv[2])).gira()


if __name__ == "__main__":
    main()
