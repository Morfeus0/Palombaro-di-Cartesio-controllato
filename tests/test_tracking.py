"""Test di pc/tracking.py (riconoscimento del marcatore rosso di P1, sottofase 2.2).

Uso: .venv/bin/python -m unittest discover -s tests -p "test_*.py"
Le immagini sono sintetiche: uno sfondo grigio con dentro rettangoli dei colori che servono alla prova.
"""
import sys
import unittest
from pathlib import Path

import cv2
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "pc"))

import tracking as tr  # noqa: E402

ROSSO = (0, 0, 220)  # BGR: tinta 0, saturazione piena
GRIGIO = 170


def colore_hsv(tinta: int, saturazione: int = 220, valore: int = 200) -> tuple[int, int, int]:
    """Un colore BGR con la tinta di OpenCV (0–180) voluta: serve per il rame (tinta 8–16)."""
    pixel = np.uint8([[[tinta, saturazione, valore]]])
    return tuple(int(c) for c in cv2.cvtColor(pixel, cv2.COLOR_HSV2BGR)[0, 0])


def scena(alto: int = 300, largo: int = 200) -> np.ndarray:
    return np.full((alto, largo, 3), GRIGIO, dtype=np.uint8)


def rettangolo(immagine: np.ndarray, x: int, y: int, w: int, h: int, colore=ROSSO) -> np.ndarray:
    copia = immagine.copy()
    copia[y:y + h, x:x + w] = colore
    return copia


class TrovaMarcatore(unittest.TestCase):
    def test_centro_di_un_rettangolo_rosso(self):
        m = tr.trova_marcatore(rettangolo(scena(), 60, 100, 20, 40))
        self.assertIsNotNone(m)
        self.assertAlmostEqual(m.x, 69.5, places=1)  # pixel 60–79: centro 69,5
        self.assertAlmostEqual(m.y, 119.5, places=1)
        self.assertEqual(m.area, 800)
        self.assertEqual(m.riquadro, (60, 100, 20, 40))

    def test_niente_rosso_niente_marcatore(self):
        self.assertIsNone(tr.trova_marcatore(scena()))

    def test_il_rame_non_e_il_marcatore(self):
        rame = rettangolo(scena(), 60, 100, 20, 40, colore_hsv(12))
        self.assertIsNone(tr.trova_marcatore(rame))

    def test_zona_troppo_piccola_ignorata(self):
        self.assertIsNone(tr.trova_marcatore(rettangolo(scena(), 60, 100, 5, 5), area_min=50))

    def test_tra_due_rossi_sceglie_il_piu_grande(self):
        # in cima alla colonna c'è un pezzetto del filo rosso del cavo del sensore (24 ottobre)
        immagine = rettangolo(rettangolo(scena(), 90, 10, 8, 8), 60, 150, 20, 40)
        m = tr.trova_marcatore(immagine, area_min=20)
        self.assertAlmostEqual(m.y, 169.5, places=1)

    def test_il_rosso_fuori_dalla_colonna_non_conta(self):
        immagine = rettangolo(scena(), 150, 100, 30, 60)  # fuori dalla colonna, e più grande
        immagine = rettangolo(immagine, 40, 200, 20, 20)
        m = tr.trova_marcatore(immagine, roi=(20, 50, 80, 220), area_min=20)
        self.assertAlmostEqual(m.x, 49.5, places=1)  # coordinate dell'immagine intera, non della colonna
        self.assertAlmostEqual(m.y, 209.5, places=1)
        self.assertEqual(m.riquadro, (40, 200, 20, 20))

    def test_marcatore_tagliato_dal_bordo_della_colonna(self):
        immagine = rettangolo(scena(), 60, 100, 20, 40)
        m = tr.trova_marcatore(immagine, roi=(0, 120, 200, 180), area_min=20)
        self.assertAlmostEqual(m.y, 129.5, places=1)  # solo la parte visibile: righe 120–139
        self.assertEqual(m.area, 400)

    def test_qualcosa_di_rosso_troppo_grande_copre_la_scena(self):
        # 24 ottobre, video 03: una mano davanti alla telecamera, la pelle è «rossa» per migliaia di pixel
        immagine = rettangolo(rettangolo(scena(), 60, 200, 20, 20), 100, 20, 80, 100)
        self.assertIsNone(tr.trova_marcatore(immagine, area_min=20, area_max=1000))

    def test_colonna_fuori_dall_immagine(self):
        with self.assertRaises(ValueError):
            tr.trova_marcatore(scena(), roi=(500, 500, 50, 50))


class Inseguitore(unittest.TestCase):
    def setUp(self):
        self.con = rettangolo(scena(), 60, 100, 20, 40)
        self.senza = scena()

    def test_trovato(self):
        ins = tr.Inseguitore(area_min=20)
        r = ins.aggiorna(self.con, 0.0)
        self.assertTrue(r["trovato"])
        self.assertFalse(r["perso"])
        self.assertAlmostEqual(r["y"], 119.5, places=1)

    def test_un_buco_breve_non_e_una_perdita(self):
        ins = tr.Inseguitore(area_min=20, tolleranza_s=0.2)
        ins.aggiorna(self.con, 0.0)
        r = ins.aggiorna(self.senza, 0.1)
        self.assertFalse(r["trovato"])
        self.assertFalse(r["perso"])
        self.assertAlmostEqual(r["y"], 119.5, places=1)  # resta l'ultima posizione buona
        self.assertAlmostEqual(r["da_quanto_s"], 0.1)

    def test_oltre_la_tolleranza_e_perso(self):
        ins = tr.Inseguitore(area_min=20, tolleranza_s=0.2)
        ins.aggiorna(self.con, 0.0)
        ins.aggiorna(self.senza, 0.1)
        r = ins.aggiorna(self.senza, 0.3)
        self.assertTrue(r["perso"])
        r = ins.aggiorna(self.con, 0.4)
        self.assertTrue(r["trovato"])
        self.assertFalse(r["perso"])

    def test_salto_impossibile_scartato(self):
        ins = tr.Inseguitore(area_min=20, tolleranza_s=0.2)
        ins.aggiorna(self.con, 0.0)
        r = ins.aggiorna(rettangolo(scena(), 60, 240, 20, 40), 1 / 60)  # 140 pixel in un fotogramma
        self.assertFalse(r["trovato"])
        self.assertAlmostEqual(r["y"], 119.5, places=1)

    def test_movimento_vero_accettato(self):
        ins = tr.Inseguitore(area_min=20)
        ins.aggiorna(self.con, 0.0)
        r = ins.aggiorna(rettangolo(scena(), 60, 108, 20, 40), 1 / 60)  # 8 pixel: come P1 che scende
        self.assertTrue(r["trovato"])
        self.assertAlmostEqual(r["y"], 127.5, places=1)

    def test_dopo_la_perdita_accetta_la_nuova_posizione(self):
        ins = tr.Inseguitore(area_min=20, tolleranza_s=0.2)
        ins.aggiorna(self.con, 0.0)
        ins.aggiorna(self.senza, 0.5)
        r = ins.aggiorna(rettangolo(scena(), 60, 240, 20, 40), 0.6)
        self.assertTrue(r["trovato"])
        self.assertAlmostEqual(r["y"], 259.5, places=1)

    def test_mai_visto_e_perso(self):
        r = tr.Inseguitore(area_min=20).aggiorna(self.senza, 0.0)
        self.assertTrue(r["perso"])
        self.assertIsNone(r["y"])


class Riassunto(unittest.TestCase):
    def test_percentuale_e_buco_piu_lungo(self):
        righe = [{"t": i * 0.1, "trovato": i not in (3, 4, 5), "x": 10.0, "y": float(i)} for i in range(10)]
        r = tr.riassunto(righe)
        self.assertEqual(r["fotogrammi"], 10)
        self.assertAlmostEqual(r["trovati_pct"], 70.0)
        self.assertAlmostEqual(r["buco_max_s"], 0.4)  # dall'ultimo visto (0,2 s) al primo ritrovato (0,6 s)
        self.assertEqual(r["perdite"], 1)
        self.assertAlmostEqual(r["y_min"], 0.0)
        self.assertAlmostEqual(r["y_max"], 9.0)

    def test_sempre_trovato(self):
        righe = [{"t": i / 60, "trovato": True, "x": 10.0, "y": 50.0} for i in range(60)]
        r = tr.riassunto(righe)
        self.assertEqual(r["buco_max_s"], 0.0)
        self.assertEqual(r["perdite"], 0)
        self.assertAlmostEqual(r["y_dev_px"], 0.0)


if __name__ == "__main__":
    unittest.main()
