"""Test di pc/calibrazione.py (dai pixel ai centimetri, sottofase 2.3).

Uso: .venv/bin/python -m unittest discover -s tests -p "test_*.py"
Le immagini e i punti sono sintetici, con valori noti da ritrovare.
"""
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "pc"))

import calibrazione as cal  # noqa: E402


def nastro_inclinato(pendenza: float, x0: float, larghezza: int = 30) -> np.ndarray:
    """Sfondo scuro con una striscia chiara il cui bordo sinistro è x = x0 + pendenza · y."""
    img = np.full((600, 300), 15, dtype=np.uint8)
    for y in range(600):
        sinistra = x0 + pendenza * y
        xs = np.arange(300)
        img[y, (xs >= sinistra) & (xs < sinistra + larghezza)] = 180
    return img


def tacche(passo: float, alto: int = 400, fase: float = 1.0) -> np.ndarray:
    """Profilo chiaro con un minimo ogni `passo` pixel: le tacche dei millimetri lungo il nastro."""
    y = np.arange(alto, dtype=float)
    return 150 - 60 * np.exp(-0.5 * ((y - fase + passo / 2) % passo - passo / 2) ** 2 / 0.6 ** 2)


class BordoNastro(unittest.TestCase):
    def test_ritrova_la_pendenza(self):
        pendenza, intercetta = cal.bordo_nastro(nastro_inclinato(-0.025, 150), 100, 220)
        self.assertAlmostEqual(pendenza, -0.025, places=3)
        self.assertAlmostEqual(intercetta, 150, delta=1.0)

    def test_angolo_in_gradi(self):
        self.assertAlmostEqual(cal.angolo_gradi(-0.025), -1.432, places=2)

    def test_niente_nastro(self):
        with self.assertRaises(ValueError):
            cal.bordo_nastro(np.full((100, 100), 15, dtype=np.uint8), 0, 100)


class PassoTacche(unittest.TestCase):
    def test_passo_uniforme(self):
        self.assertAlmostEqual(cal.passo_tacche(tacche(3.25)), 3.25, places=2)

    def test_passo_che_cambia_lungo_il_nastro(self):
        # in alto 3,4 px per tacca, in basso 3,1: come il metro del 24 ottobre
        profilo = np.concatenate([tacche(3.4, 300), tacche(3.1, 300)])
        tratti = cal.passi_a_tratti(profilo, finestra=200, passo_finestre=100)
        self.assertAlmostEqual(tratti[0][1], 3.4, places=1)
        self.assertAlmostEqual(tratti[-1][1], 3.1, places=1)


class Verticale(unittest.TestCase):
    def test_una_riga_orizzontale_del_mondo_ha_la_stessa_coordinata(self):
        # con la telecamera ruotata, una riga orizzontale vera scende di -pendenza pixel per ogni pixel a destra
        pendenza = -0.025
        s1 = cal.verticale(100.0, 500.0, pendenza, centro_x=960)
        s2 = cal.verticale(1100.0, 500.0 - pendenza * 1000, pendenza, centro_x=960)
        self.assertAlmostEqual(s1, s2, places=6)

    def test_al_centro_non_cambia_niente(self):
        self.assertAlmostEqual(cal.verticale(960.0, 321.0, -0.025, centro_x=960), 321.0)


class ModelloQuota(unittest.TestCase):
    def test_ritrova_una_prospettiva_nota(self):
        vero = (30.0, -0.04, 0.0002)  # h = (a + b·s) / (1 + c·s)
        s = np.array([100.0, 300.0, 500.0, 700.0, 900.0])
        h = (vero[0] + vero[1] * s) / (1 + vero[2] * s)
        modello = cal.adatta_quota(list(zip(s, h)))
        for si in (200.0, 650.0, 850.0):
            atteso = (vero[0] + vero[1] * si) / (1 + vero[2] * si)
            self.assertAlmostEqual(cal.quota(modello, si), atteso, places=6)

    def test_due_punti_danno_una_retta(self):
        modello = cal.adatta_quota([(100.0, 25.0), (900.0, 5.0)])
        self.assertAlmostEqual(cal.quota(modello, 500.0), 15.0)

    def test_un_punto_non_basta(self):
        with self.assertRaises(ValueError):
            cal.adatta_quota([(100.0, 25.0)])

    def test_scarti_dei_punti(self):
        modello = cal.adatta_quota([(100.0, 25.0), (500.0, 15.1), (900.0, 5.0)])
        scarti = cal.scarti(modello, [(100.0, 25.0), (500.0, 15.1), (900.0, 5.0)])
        self.assertLess(max(abs(e) for e in scarti), 1e-6)  # tre punti, tre parametri: passa per tutti


class File(unittest.TestCase):
    def test_salva_e_rilegge(self):
        with tempfile.TemporaryDirectory() as cartella:
            file = Path(cartella) / "calibrazione.json"
            dati = {"pendenza": -0.0254, "centro_x": 960, "modello": [30.0, -0.04, 0.0002]}
            cal.salva(file, dati)
            self.assertEqual(cal.leggi(file), dati)

    def test_file_assente(self):
        self.assertIsNone(cal.leggi(Path("/non/esiste/calibrazione.json")))


if __name__ == "__main__":
    unittest.main()
