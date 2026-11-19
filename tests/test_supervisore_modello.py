"""Test del modello del supervisore (analisi/supervisore.py, 5.7): le proprietà valgono e i controlli scattano.

Uso: .venv/bin/python -m unittest tests/test_supervisore_modello.py
"""
import sys
import unittest
from pathlib import Path
from unittest import mock

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "analisi"))
import supervisore as S  # noqa: E402


class Proprieta(unittest.TestCase):
    def test_firmware_e_tracking_rispettano_tutte_le_proprieta(self):
        for tracking in (False, True):
            with self.subTest(tracking=tracking):
                self.assertTrue(all(ok for _, ok, _ in S.verifica(tracking)))

    def test_una_uscita_da_safe_verso_hold_viene_scoperta(self):
        originali = S.transizioni
        guasta = lambda t: originali(t) + [S.Transizione("errore di progetto", "SAFE", "HOLD")]  # noqa: E731
        with mock.patch.object(S, "transizioni", guasta):
            esiti = dict((nome[:2], ok) for nome, ok, _ in S.verifica(False))
        self.assertFalse(esiti["P4"])
        self.assertFalse(esiti["P5"])   # HOLD raggiunto senza p0 noto e senza servo

    def test_hold_senza_controllo_di_p0_viene_scoperto(self):
        originali = S.transizioni
        def senza_p0(t):
            return [S.Transizione(x.nome, x.da, x.a, tuple(c for c in x.richiede if c[0] != "p0"), x.imposta, x.tipo)
                    for x in originali(t)]
        with mock.patch.object(S, "transizioni", senza_p0):
            esiti = dict((nome[:2], ok) for nome, ok, _ in S.verifica(False))
        self.assertFalse(esiti["P5"])


if __name__ == "__main__":
    unittest.main()
