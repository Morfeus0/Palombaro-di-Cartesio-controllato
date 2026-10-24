"""Test del modulo pc/dashboard/registro.py (lettura del registro, validazione e scrittura dei comandi).

Uso: .venv/bin/python -m unittest discover -s tests -p "test_*.py"
"""
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "pc" / "dashboard"))

from registro import analizza_riga, scrivi_comando, valida_angolo  # noqa: E402


class AnalizzaRiga(unittest.TestCase):
    def test_riconosce_una_misura(self):
        voce = analizza_riga("23:29:30.123 p = 103.524 kPa  T = 24.37 C  servo = 146")
        self.assertEqual(voce, {"tipo": "misura", "t": "23:29:30.123", "p": 103.524, "T": 24.37, "servo": 146})

    def test_riconosce_un_evento(self):
        voce = analizza_riga("23:29:08.074 # inviato: 146")
        self.assertEqual(voce, {"tipo": "evento", "t": "23:29:08.074", "testo": "inviato: 146"})

    def test_misura_assurda_resta_una_misura(self):
        # il 19 e il 21 ottobre il sensore perso dava questi valori: li segnala la dashboard, non il parser
        voce = analizza_riga("17:41:40.000 p = 2.481 kPa  T = 179.76 C  servo = 90")
        self.assertEqual(voce["p"], 2.481)

    def test_ignora_righe_estranee(self):
        for riga in ["", "17:34:58.745 rst:0x1 (POWERON_RESET),boot:0x13", "ets Jul 29 2019", "p = 1 kPa"]:
            with self.subTest(riga=riga):
                self.assertIsNone(analizza_riga(riga))


class ValidaAngolo(unittest.TestCase):
    def test_accetta_interi_nei_limiti(self):
        self.assertEqual(valida_angolo(36, 36, 146), 36)
        self.assertEqual(valida_angolo("146", 36, 146), 146)

    def test_rifiuta_fuori_dai_limiti(self):
        for valore in [35, 147, "26"]:
            with self.subTest(valore=valore), self.assertRaises(ValueError):
                valida_angolo(valore, 36, 146)

    def test_rifiuta_tipi_sbagliati(self):
        for valore in [None, 86.5, True, "86.5", "abc", [86]]:
            with self.subTest(valore=valore), self.assertRaises(ValueError):
                valida_angolo(valore, 36, 146)


class ScriviComando(unittest.TestCase):
    def test_scrive_un_intero_per_riga_senza_file_temporanei(self):
        with tempfile.TemporaryDirectory() as cartella:
            percorso = Path(cartella) / "comandi.txt"
            scrivi_comando(percorso, 96)
            scrivi_comando(percorso, 106)  # vince l'ultimo
            self.assertEqual(percorso.read_text(encoding="utf-8"), "106\n")
            self.assertEqual(sorted(p.name for p in Path(cartella).iterdir()), ["comandi.txt"])


if __name__ == "__main__":
    unittest.main()
