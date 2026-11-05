"""Test di pc/righello.py (il palombaro fa da righello: quota in mm senza riferimenti esterni, 2.3).

Uso: .venv/bin/python -m unittest discover -s tests -p "test_*.py"
"""
import math
import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "pc"))

import righello as r  # noqa: E402
import tracking as tr  # noqa: E402


class AltezzaMarcatore(unittest.TestCase):
    def test_altezza_di_un_rettangolo(self):
        img = np.full((300, 200, 3), 170, dtype=np.uint8)
        img[100:140, 60:80] = (0, 0, 220)  # 40 righe di rosso
        m = tr.trova_marcatore(img, area_min=20)
        self.assertAlmostEqual(m.altezza, 40.0, delta=0.1)


class Quota(unittest.TestCase):
    def test_scala_uniforme(self):
        scala = r.Scala(altezza_px=60.0, k=0.0, y_fondo=900.0)
        # 60 px di marcatore = 18 mm: 300 px sopra il fondo sono 90 mm
        self.assertAlmostEqual(r.quota_mm(600.0, scala, 18.0), 90.0)
        self.assertAlmostEqual(r.quota_mm(900.0, scala, 18.0), 0.0)

    def test_scala_che_cambia_con_l_altezza(self):
        scala = r.Scala(altezza_px=60.0, k=-0.0002, y_fondo=900.0)  # più in alto il marcatore è più grande
        passi = np.linspace(600.0, 900.0, 30001)
        mm_per_px = 18.0 / (60.0 * (1 + scala.k * (passi - 900.0)))
        atteso = float(np.sum((mm_per_px[1:] + mm_per_px[:-1]) / 2 * np.diff(passi)))
        self.assertAlmostEqual(r.quota_mm(600.0, scala, 18.0), atteso, places=3)


class AdattaScala(unittest.TestCase):
    def test_ritrova_la_pendenza(self):
        y = np.linspace(300.0, 900.0, 400)
        h = 60.0 * (1 - 0.0003 * (y - 900.0))
        scala = r.adatta_scala(list(zip(y, h)), y_fondo=900.0)
        self.assertAlmostEqual(scala.altezza_px, 60.0, places=3)
        self.assertAlmostEqual(scala.k, -0.0003, places=6)

    def test_poco_movimento_usa_la_pendenza_data(self):
        y = np.linspace(880.0, 900.0, 100)
        h = np.full_like(y, 60.0)
        scala = r.adatta_scala(list(zip(y, h)), y_fondo=900.0, k_predefinito=-0.0001)
        self.assertAlmostEqual(scala.altezza_px, 60.0)
        self.assertAlmostEqual(scala.k, -0.0001)


class Righello(unittest.TestCase):
    def fermo_sul_fondo(self, rig: r.Righello, secondi: float = 2.0, y: float = 900.0, t0: float = 0.0) -> None:
        for i in range(int(secondi * 60)):
            rig.aggiorna(t0 + i / 60, y + 0.2 * math.sin(i), 60.0)

    def test_prima_del_fondo_nessuna_quota(self):
        rig = r.Righello(altezza_mm=18.0)
        rig.aggiorna(0.0, 500.0, 60.0)
        self.assertIsNone(rig.quota_mm(500.0))

    def test_lo_zero_e_p1_fermo_sul_fondo(self):
        rig = r.Righello(altezza_mm=18.0)
        self.fermo_sul_fondo(rig)
        self.assertAlmostEqual(rig.quota_mm(900.0), 0.0, delta=0.1)
        self.assertAlmostEqual(rig.quota_mm(600.0), 90.0, delta=0.5)

    def test_il_fondo_e_la_posizione_ferma_piu_bassa(self):
        rig = r.Righello(altezza_mm=18.0)
        self.fermo_sul_fondo(rig, y=700.0)  # fermo a mezz'acqua (tenuto dal servo)
        self.fermo_sul_fondo(rig, y=900.0, t0=2.0)  # poi sul fondo
        self.assertAlmostEqual(rig.quota_mm(900.0), 0.0, delta=0.1)

    def test_in_movimento_non_e_fermo(self):
        rig = r.Righello(altezza_mm=18.0)
        for i in range(120):
            rig.aggiorna(i / 60, 900.0 - 3 * i, 60.0)  # sale di 3 px a fotogramma
        self.assertIsNone(rig.quota_mm(700.0))

    def test_ricomincia_da_capo(self):
        rig = r.Righello(altezza_mm=18.0)
        self.fermo_sul_fondo(rig)
        rig.ricomincia()
        self.assertIsNone(rig.quota_mm(900.0))


class TabellaSpiedino(unittest.TestCase):
    TAB = r.Tabella(quote_mm=(0.0, 20.0, 40.0, 60.0), y_px=(1000.0, 920.0, 880.0, 780.0),
                    y_fondo_px=960.0, altezza_fondo_px=60.0)

    def test_segue_i_tratti_della_tabella(self):
        self.assertAlmostEqual(self.TAB.mm(920.0), 20.0)
        self.assertAlmostEqual(self.TAB.mm(900.0), 30.0)   # tratto schiacciato: 40 px per 20 mm
        self.assertAlmostEqual(self.TAB.mm(830.0), 50.0)   # tratto allargato: 100 px per 20 mm

    def test_oltre_i_segni_prolunga_il_tratto(self):
        self.assertAlmostEqual(self.TAB.mm(730.0), 70.0)
        self.assertAlmostEqual(self.TAB.mm(1040.0), -10.0)

    def test_zero_e_scala_della_sessione(self):
        # sessione con lo zoom al 90 % e l'immagine spostata: il fondo è a 900, il marcatore alto 54 px
        self.assertAlmostEqual(r.quota_da_tabella(900.0, 900.0, 54.0, self.TAB), 0.0)
        y = 900.0 + 0.9 * (830.0 - 960.0)
        self.assertAlmostEqual(r.quota_da_tabella(y, 900.0, 54.0, self.TAB), 50.0 - 10.0)

    def test_righello_con_tabella(self):
        rig = r.Righello(tabella=self.TAB)
        for i in range(120):
            rig.aggiorna(i / 60, 960.0, 60.0)
        self.assertAlmostEqual(rig.quota_mm(960.0), 0.0)
        self.assertAlmostEqual(rig.quota_mm(830.0), 40.0)

    def test_altezza_sul_fondo_ricordata_quando_p1_resta_a_lungo_in_cima(self):
        # 5 novembre: P1 a galla per minuti, marcatore inclinato (80 px); i campioni del fondo escono dalla memoria
        # e la quota si calcolava con l'altezza sbagliata (12,7 cm invece di circa 19)
        rig = r.Righello(tabella=self.TAB)
        for i in range(120):
            rig.aggiorna(i / 60, 960.0, 60.0)
        for i in range(r.CAMPIONI_MAX + 10):
            rig.aggiorna(2 + i / 60, 700.0 + (i % 2), 80.0)
        self.assertAlmostEqual(rig.quota_mm(830.0), 40.0)

    def test_tabella_vera_del_progetto(self):
        tab = r.carica_tabella()
        self.assertIsNotNone(tab)
        self.assertEqual(len(tab.quote_mm), len(tab.y_px))
        self.assertTrue(all(a > b for a, b in zip(tab.y_px, tab.y_px[1:])))


if __name__ == "__main__":
    unittest.main()
