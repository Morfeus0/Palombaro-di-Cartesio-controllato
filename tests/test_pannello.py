"""Test del pannello di controllo della dashboard (5.5): validazione dei comandi e delle registrazioni.

Uso: .venv/bin/python -m unittest tests/test_pannello.py
"""
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "pc" / "dashboard"))

from pannello import manda_comando, prepara_comando, riga_esperimento  # noqa: E402
from registro import analizza_riga, scrivi_comando  # noqa: E402

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "pc"))
from protocollo import componi  # noqa: E402


class Comandi(unittest.TestCase):
    def test_comando_valido_ha_il_controllo(self):
        self.assertEqual(prepara_comando("R,1000"), componi("R,1000"))

    def test_comandi_non_validi_non_passano(self):
        for cattivo in ["", "R,10,5", "K,Z,1,2", "K,P,0,02,0,4", "X", None, 42, "M,VOLA", "R," + "1" * 100]:
            with self.subTest(cattivo=cattivo), self.assertRaises(ValueError):
                prepara_comando(cattivo)

    def test_manda_aggiunge_senza_cancellare(self):
        with tempfile.TemporaryDirectory() as cartella:
            cartella = Path(cartella)
            manda_comando(cartella, prepara_comando("M,HOLD"))
            manda_comando(cartella, prepara_comando("E"))
            righe = (cartella / "comandi.txt").read_text(encoding="utf-8").splitlines()
            self.assertEqual(righe, [componi("M,HOLD"), componi("E")])


    def test_angolo_del_cursore_non_cancella_i_comandi(self):
        with tempfile.TemporaryDirectory() as cartella:
            cartella = Path(cartella)
            manda_comando(cartella, prepara_comando("E"))
            scrivi_comando(cartella / "comandi.txt", 96)
            scrivi_comando(cartella / "comandi.txt", 106)
            righe = (cartella / "comandi.txt").read_text(encoding="utf-8").splitlines()
            self.assertEqual(righe, [componi("E"), "106"])


class Esperimenti(unittest.TestCase):
    def test_inizio_con_durata_e_note(self):
        self.assertEqual(riga_esperimento("inizia", "5-4-onda", "120", "onda 2 cm, 20 s"),
                         "ESPERIMENTO 5-4-onda onda 2 cm; 20 s, durata=120")

    def test_fine(self):
        self.assertEqual(riga_esperimento("fine"), "FINE")

    def test_valori_non_validi(self):
        for argomenti in [("vai", "x"), ("inizia", "Prova"), ("inizia", "a b"), ("inizia", "../x"),
                          ("inizia", "ok", "0"), ("inizia", "ok", "99999"), ("inizia", "ok", "dieci"),
                          ("inizia", "ok", None, "riga\nnuova")]:
            with self.subTest(argomenti=argomenti), self.assertRaises(ValueError):
                riga_esperimento(*argomenti)


class Registro(unittest.TestCase):
    def test_riga_c_diventa_quota(self):
        riga = "12:00:00.000 " + componi("C,12,34567,840,15,1000,-760.0,12.3,-4.5,100900")
        self.assertEqual(analizza_riga(riga), {"tipo": "quota", "t": "12:00:00.000", "quota": 8.4, "rif": 10.0})

    def test_riga_t_porta_lo_stato(self):
        riga = "12:00:00.000 " + componi("T,1,100,100480,900,H,100900,1.0,2.0,2350")
        self.assertEqual(analizza_riga(riga)["stato"], "H")


if __name__ == "__main__":
    unittest.main()
