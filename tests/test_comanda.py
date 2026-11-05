"""Test di pc/comanda.py (comandi del firmware 0.2 attraverso il ponte).

Uso: .venv/bin/python -m unittest discover -s tests -p "test_*.py"
"""
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "pc"))

import comanda as co  # noqa: E402
from protocollo import analizza  # noqa: E402


class Prepara(unittest.TestCase):
    def test_righe_valide_con_controllo(self):
        for corpo in ("M,CALIBRAZIONE", "R,1000", "K,Z,475,11.9,400,10", "K,P,0.02,0.4", "K,E,101640", "E", "V"):
            riga = co.prepara(corpo)
            self.assertTrue(riga.startswith("$") and "*" in riga)
            tipo, campi = analizza(riga)                         # il controllo torna
            self.assertEqual([tipo] + campi, corpo.split(","))

    def test_errori_di_battitura_fermati_prima_della_scheda(self):
        for corpo in ("M,HOLDD", "R,10.5", "K,Z,475,11,400", "K,Z,475,11,400,1O", "X,1", "E,1", "K,P,0,02,0.4"):
            with self.assertRaises(ValueError, msg=corpo):
                co.prepara(corpo)


class Manda(unittest.TestCase):
    def test_aggiunge_senza_cancellare_i_comandi_non_ancora_letti(self):
        with tempfile.TemporaryDirectory() as d:
            cartella = Path(d)
            (cartella / "comandi.txt").write_text("1460\n", encoding="utf-8")
            co.manda([co.prepara("R,1000")], cartella)
            righe = (cartella / "comandi.txt").read_text(encoding="utf-8").splitlines()
            self.assertEqual(righe[0], "1460")
            self.assertTrue(righe[1].startswith("$R,1000*"))


if __name__ == "__main__":
    unittest.main()
