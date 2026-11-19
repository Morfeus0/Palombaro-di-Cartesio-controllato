"""Sottofase 5.7: il supervisore del firmware come automa e come rete di Petri, con la verifica delle proprietà.

Il modello ricopia le regole di firmware/src/palombaro/principale.cpp (comandoModalita, comandoServo, controlla,
entraInSafe) e supervisore.cpp (motivoSafe) del firmware 0.2. Con --tracking aggiunge lo stato TRACKING della
5.4 come progettato (stesse condizioni di HOLD per entrare, fine del profilo → HOLD, stessi guasti degli stati
automatici): così le proprietà si controllano prima di scrivere il firmware.

Rete di Petri: un posto per stato (uno solo marcato) e due posti complementari per ogni condizione
(sensore_ok/sensore_ko, servo_attivo/servo_spento, quota_fresca/quota_vecchia, p0_noto/p0_ignoto). Le condizioni
che una transizione legge senza cambiarle sono archi in ingresso e in uscita sullo stesso posto (cappio).

Proprietà controllate sul grafo di raggiungibilità (tutte le marcature raggiungibili dalla marcatura iniziale):
  P1 sicurezza strutturale: rete 1-limitata, un solo stato marcato in ogni marcatura;
  P2 assenza di blocchi: in ogni marcatura c'è almeno una transizione abilitata;
  P3 SAFE è raggiungibile da ogni marcatura, con una sola transizione dagli stati diversi da SAFE;
  P4 da SAFE si esce solo verso MANUALE (decide una persona);
  P5 CALIBRAZIONE, HOLD e TRACKING solo con servo attivo; HOLD e TRACKING solo con p0 noto;
  P6 ogni stato è raggiungibile (nessuno stato morto);
  P7 da ogni marcatura si può tornare a MANUALE (reversibilità verso lo stato di partenza).

Uso:  .venv/bin/python analisi/supervisore.py [--tracking]
"""
from __future__ import annotations

import argparse
import sys
from collections import deque
from dataclasses import dataclass

CONDIZIONI = ("sensore", "servo", "quota", "p0")
NOMI_CONDIZIONI = {"sensore": ("sensore_ok", "sensore_ko"), "servo": ("servo_attivo", "servo_spento"),
                   "quota": ("quota_fresca", "quota_vecchia"), "p0": ("p0_noto", "p0_ignoto")}
AUTOMATICI = ("CALIBRAZIONE", "HOLD")


@dataclass(frozen=True)
class Transizione:
    nome: str
    da: str | None                   # stato di partenza (None: in qualunque stato, lo stato non cambia)
    a: str | None
    richiede: tuple[tuple[str, bool], ...] = ()   # condizioni lette
    imposta: tuple[tuple[str, bool], ...] = ()    # condizioni scritte
    tipo: str = "comando"            # comando (persona o Mac), automatico (firmware), guasto, ambiente


def stati_di(tracking: bool) -> list[str]:
    return ["MANUALE", "CALIBRAZIONE", "HOLD", "SAFE"] + (["TRACKING"] if tracking else [])


def transizioni(tracking: bool) -> list[Transizione]:
    stati = stati_di(tracking)
    automatici = list(AUTOMATICI) + (["TRACKING"] if tracking else [])
    t: list[Transizione] = []
    entra = (("sensore", True), ("servo", True), ("quota", True))       # comandoModalita: SENSORE, SERVO_FERMO, QUOTA
    for s in stati:
        if s != "SAFE":
            t.append(Transizione(f"M,SAFE da {s}", s, "SAFE"))
            t.append(Transizione(f"E da {s}", s, "SAFE"))
            t.append(Transizione(f"guasto SENSORE da {s}", s, "SAFE", (("sensore", False),), tipo="guasto"))
            t.append(Transizione(f"guasto PRESSIONE da {s}", s, "SAFE", tipo="guasto"))
            t.append(Transizione(f"M,CALIBRAZIONE da {s}", s, "CALIBRAZIONE", entra))
            t.append(Transizione(f"M,HOLD da {s}", s, "HOLD", entra + (("p0", True),)))
        if s != "MANUALE":
            t.append(Transizione(f"M,MANUALE da {s}", s, "MANUALE", (("sensore", True),)))
    for s in automatici:
        for motivo in ("MAC_MUTO", "PERSO", "ERRORE"):
            t.append(Transizione(f"guasto {motivo} da {s}", s, "SAFE", tipo="guasto"))
        t.append(Transizione(f"guasto TELECAMERA_MUTA da {s}", s, "SAFE", (("quota", False),), tipo="guasto"))
    t += [
        Transizione("calibrazione fatta", "CALIBRAZIONE", "HOLD", imposta=(("p0", True),), tipo="automatico"),
        Transizione("calibrazione fallita", "CALIBRAZIONE", "SAFE", tipo="automatico"),
        Transizione("PARTENZA_BASSA", "CALIBRAZIONE", "SAFE", tipo="automatico"),
        Transizione("S in MANUALE (servo acceso)", "MANUALE", "MANUALE", (("sensore", True),), (("servo", True),)),
        Transizione("K,E (p0 dato a mano)", None, None, imposta=(("p0", True),)),
        Transizione("sensore perso", None, None, (("sensore", True),), (("sensore", False),), "ambiente"),
        Transizione("sensore ritrovato", None, None, (("sensore", False),), (("sensore", True),), "ambiente"),
        Transizione("telecamera ferma", None, None, (("quota", True),), (("quota", False),), "ambiente"),
        Transizione("telecamera riparte", None, None, (("quota", False),), (("quota", True),), "ambiente"),
    ]
    if tracking:
        t.append(Transizione("P (profilo) da HOLD", "HOLD", "TRACKING", entra + (("p0", True),)))
        t.append(Transizione("fine del profilo", "TRACKING", "HOLD", tipo="automatico"))
    return t


Marcatura = tuple[str, tuple[bool, ...]]   # (stato, valori delle condizioni nell'ordine di CONDIZIONI)


def abilitata(m: Marcatura, tr: Transizione) -> bool:
    stato, valori = m
    if tr.da is not None and tr.da != stato:
        return False
    vale = dict(zip(CONDIZIONI, valori))
    return all(vale[c] == v for c, v in tr.richiede)


def scatta(m: Marcatura, tr: Transizione) -> Marcatura:
    stato, valori = m
    vale = {**dict(zip(CONDIZIONI, valori)), **dict(tr.imposta)}
    return (tr.a if tr.a is not None else stato, tuple(vale[c] for c in CONDIZIONI))


def raggiungibili(iniziale: Marcatura, rete: list[Transizione]) -> dict[Marcatura, list[tuple[str, Marcatura]]]:
    grafo: dict[Marcatura, list[tuple[str, Marcatura]]] = {}
    coda = deque([iniziale])
    while coda:
        m = coda.popleft()
        if m in grafo:
            continue
        grafo[m] = [(tr.nome, scatta(m, tr)) for tr in rete if abilitata(m, tr)]
        coda.extend(dopo for _, dopo in grafo[m] if dopo not in grafo)
    return grafo


def posti(m: Marcatura, stati: list[str]) -> dict[str, int]:
    """La marcatura come rete di Petri: token per posto (stati e coppie di condizioni complementari)."""
    marc = {s: int(m[0] == s) for s in stati}
    for c, v in zip(CONDIZIONI, m[1]):
        vero, falso = NOMI_CONDIZIONI[c]
        marc[vero], marc[falso] = int(v), int(not v)
    return marc


def raggiunge(grafo: dict, partenza: Marcatura, obiettivo) -> bool:
    visti, coda = {partenza}, deque([partenza])
    while coda:
        m = coda.popleft()
        if obiettivo(m):
            return True
        for _, dopo in grafo[m]:
            if dopo not in visti:
                visti.add(dopo)
                coda.append(dopo)
    return False


def verifica(tracking: bool) -> list[tuple[str, bool, str]]:
    rete, stati = transizioni(tracking), stati_di(tracking)
    iniziale: Marcatura = ("MANUALE", (True, False, False, False))   # all'avvio: sensore ok, servo spento
    grafo = raggiungibili(iniziale, rete)
    vale = lambda m, c: dict(zip(CONDIZIONI, m[1]))[c]  # noqa: E731
    esiti = []
    limitata = all(max(posti(m, stati).values()) <= 1 and sum(posti(m, stati)[s] for s in stati) == 1 for m in grafo)
    esiti.append(("P1 rete 1-limitata, un solo stato marcato", limitata, f"{len(grafo)} marcature raggiungibili"))
    bloccate = [m for m, archi in grafo.items() if not archi]
    esiti.append(("P2 nessun blocco", not bloccate, f"{len(bloccate)} marcature senza transizioni"))
    un_passo = all(any(d[0] == "SAFE" for _, d in grafo[m]) for m in grafo if m[0] != "SAFE")
    esiti.append(("P3 SAFE raggiungibile da ogni marcatura, in un passo", un_passo and
                  all(raggiunge(grafo, m, lambda x: x[0] == "SAFE") for m in grafo), "E e M,SAFE sempre abilitati"))
    uscite = {d[0] for m in grafo if m[0] == "SAFE" for _, d in grafo[m] if d[0] != "SAFE"}
    esiti.append(("P4 da SAFE si esce solo verso MANUALE", uscite == {"MANUALE"}, f"uscite: {sorted(uscite)}"))
    p5 = all(vale(m, "servo") for m in grafo if m[0] not in ("MANUALE", "SAFE")) and \
        all(vale(m, "p0") for m in grafo if m[0] in ("HOLD", "TRACKING"))
    esiti.append(("P5 stati automatici con servo attivo; HOLD/TRACKING con p0 noto", p5,
                  "invariante su tutte le marcature"))
    visti = {m[0] for m in grafo}
    esiti.append(("P6 ogni stato è raggiungibile", visti == set(stati), f"raggiunti: {sorted(visti)}"))
    attesa = sum(1 for m in grafo if m[0] == "SAFE" and not vale(m, "sensore"))
    ritorno = all(raggiunge(grafo, m, lambda x: x[0] == "MANUALE") for m in grafo)
    esiti.append(("P7 da ogni marcatura si torna a MANUALE", ritorno,
                  f"in {attesa} marcature di SAFE serve prima il ritorno del sensore"))
    return esiti


def main(argomenti: list[str]) -> int:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--tracking", action="store_true", help="aggiunge lo stato TRACKING progettato per la 5.4")
    a = p.parse_args(argomenti)
    esiti = verifica(a.tracking)
    print(f"Supervisore del firmware 0.2{' + TRACKING (5.4, progetto)' if a.tracking else ''}")
    print("| proprietà | esito | dettaglio |\n|---|---|---|")
    for nome, ok, dettaglio in esiti:
        print(f"| {nome} | {'verificata' if ok else 'NON VERIFICATA'} | {dettaglio} |")
    return 0 if all(ok for _, ok, _ in esiti) else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
