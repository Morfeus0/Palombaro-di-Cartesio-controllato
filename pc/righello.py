"""Il palombaro fa da righello (sottofase 2.3, deciso con Gabriele il 28 ottobre 2026).

L'inquadratura cambia da una sessione all'altra (telefono rimesso nella pinza, zoom della Fotocamera Continuity) e un
righello accanto alla bottiglia non sta nel piano di P1 (27 ottobre: scala sbagliata di circa il 15 %). Quindi la quota
si ricava da P1 stesso, a ogni sessione:
- **zero:** la posizione ferma più bassa di P1, cioè P1 appoggiato sul fondo (ci sta all'avvio e in SAFE);
- **scala:** il marcatore rosso ha un'altezza fisica fissa; la sua altezza in pixel dice quanti pixel vale un
  millimetro proprio dove si trova P1, con la prospettiva e la lente dell'acqua comprese. Se P1 si è mosso abbastanza,
  si stima anche come cambia la scala con l'altezza (k); se no si usa k = 0 (scala uniforme).
La quota è in millimetri sopra la posizione del marcatore con P1 sul fondo.

L'altezza «vera» del marcatore per il programma (ALTEZZA_MARCATORE_MM) si misura una volta sola con lo spiedino segnato
ogni 2 cm nella bottiglia: corregge anche l'errore dei bordi della maschera del rosso.
"""
from collections import deque
from dataclasses import dataclass

import numpy as np

# PROVVISORIA: dal video 05 del 24 ottobre (marcatore alto circa 69 px, P1 salito di 653 px per circa 17,3 cm,
# cioè circa 3,8 px/mm). Il valore vero viene dalla prova con lo spiedino.
ALTEZZA_MARCATORE_MM = 18.0
FINESTRA_FERMO_S = 1.0       # P1 è fermo se in questo tempo la sua y non cambia più di SPOSTAMENTO_FERMO_PX
SPOSTAMENTO_FERMO_PX = 2.0
VICINO_AL_FONDO_PX = 6.0     # l'altezza del marcatore sul fondo si prende dai campioni entro questa distanza
ESCURSIONE_MIN_PX = 200.0    # per stimare k servono campioni distribuiti su almeno tanti pixel di altezza
CAMPIONI_MAX = 6000          # circa 100 s a 60 fotogrammi al secondo
RICALCOLO_SCALA_S = 0.5      # la scala si riadatta al più due volte al secondo (o subito, se cambia il fondo)


@dataclass(frozen=True)
class Scala:
    altezza_px: float  # altezza del marcatore in pixel con P1 sul fondo
    k: float           # variazione relativa dell'altezza del marcatore per pixel di y (prospettiva); 0 = uniforme
    y_fondo: float     # y del marcatore con P1 sul fondo


def quota_mm(y: float, scala: Scala, altezza_mm: float) -> float:
    """Millimetri sopra il fondo: integrale di mm per pixel, che vale altezza_mm / (altezza_px · (1 + k·(y − y_fondo)))."""
    d = y - scala.y_fondo
    pixel_equivalenti = -d if abs(scala.k * d) < 1e-9 else -np.log(1 + scala.k * d) / scala.k
    return float(altezza_mm / scala.altezza_px * pixel_equivalenti)


def adatta_scala(campioni: list[tuple[float, float]], y_fondo: float, k_predefinito: float = 0.0) -> Scala:
    """Scala dai campioni (y, altezza del marcatore in pixel): retta se P1 si è mosso abbastanza, se no il valore sul fondo."""
    y = np.array([c[0] for c in campioni], dtype=float)
    h = np.array([c[1] for c in campioni], dtype=float)
    if y.size >= 20 and y.max() - y.min() >= ESCURSIONE_MIN_PX:
        tenuti = np.ones(y.size, dtype=bool)
        for _ in range(2):  # retta, via i campioni lontani (riflessi, marcatore tagliato), di nuovo
            b, a = np.polyfit(y[tenuti] - y_fondo, h[tenuti], 1)
            scarti = h - (a + b * (y - y_fondo))
            tenuti = np.abs(scarti) <= 3 * max(np.median(np.abs(scarti[tenuti])), 0.1)
        return Scala(altezza_px=float(a), k=float(b / a), y_fondo=y_fondo)
    vicini = h[np.abs(y - y_fondo) <= VICINO_AL_FONDO_PX]
    return Scala(altezza_px=float(np.median(vicini if vicini.size else h)), k=k_predefinito, y_fondo=y_fondo)


class Righello:
    """Raccoglie posizione e altezza del marcatore e dà la quota di P1 in millimetri, ricalibrandosi da solo."""

    def __init__(self, altezza_mm: float = ALTEZZA_MARCATORE_MM, k_predefinito: float = 0.0):
        self.altezza_mm, self.k_predefinito = altezza_mm, k_predefinito
        self.ricomincia()

    def ricomincia(self) -> None:
        """Da capo, per esempio quando cambia la colonna o l'inquadratura."""
        self.campioni: deque[tuple[float, float]] = deque(maxlen=CAMPIONI_MAX)
        self.finestra: deque[tuple[float, float]] = deque()
        self.y_fondo: float | None = None
        self.t_ultimo = 0.0
        self._scala: Scala | None = None
        self._t_scala = float("-inf")

    def aggiorna(self, t: float, y: float, altezza_px: float) -> None:
        self.t_ultimo = t
        self.campioni.append((y, altezza_px))
        self.finestra.append((t, y))
        while self.finestra and self.finestra[0][0] < t - FINESTRA_FERMO_S:
            self.finestra.popleft()
        ys = [v for _, v in self.finestra]
        durata = t - self.finestra[0][0]
        if durata >= 0.9 * FINESTRA_FERMO_S and max(ys) - min(ys) <= SPOSTAMENTO_FERMO_PX:
            ferma = float(np.median(ys))
            if self.y_fondo is None or ferma > self.y_fondo:  # il fondo è la posizione ferma più bassa
                self.y_fondo = ferma

    def scala(self) -> Scala | None:
        if self.y_fondo is None:
            return None
        vecchia = self.t_ultimo - self._t_scala >= RICALCOLO_SCALA_S
        if self._scala is None or vecchia or self._scala.y_fondo != self.y_fondo:
            self._scala = adatta_scala(list(self.campioni), self.y_fondo, self.k_predefinito)
            self._t_scala = self.t_ultimo
        return self._scala

    def quota_mm(self, y: float) -> float | None:
        scala = self.scala()
        return None if scala is None else quota_mm(y, scala, self.altezza_mm)
