"""Test di pc/analisi_f4.py (verdetti dei «Fatto quando» della fase 4 dai CSV del ponte).

Dati sintetici con risposta nota: un primo ordine, un ciclo limite sinusoidale, una tenuta con un'uscita.
Uso: .venv/bin/python -m unittest tests.test_analisi_f4
"""
import math
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "pc"))

import analisi_f4 as af  # noqa: E402

TS = 0.01  # una riga T ogni 10 ms


def campioni(durata: float, p=None, p_rif=None, quota=None, quota_rif=None, stato="H") -> list:
    """Campioni sintetici: ogni argomento è una funzione del tempo (o None)."""
    out = []
    for i in range(int(round(durata / TS))):
        t = i * TS
        out.append(af.Campione(
            t=t,
            p=p(t) if p else 101_000.0,
            u=86.0,
            stato=stato,
            quota=quota(t) if quota else None,
            p_rif=p_rif(t) if p_rif else 0.0,
            quota_rif=quota_rif(t) if quota_rif else None,
        ))
    return out


def primo_ordine(t0: float, da: float, a: float, tau: float):
    return lambda t: da if t < t0 else a + (da - a) * math.exp(-(t - t0) / tau)


class Lettura(unittest.TestCase):
    TESTO = (
        "# esperimento: gradini\n"
        "# firmware: palombaro 0.2, protocollo 1\n"
        "t_mac,seq,t_esp_ms,p_pa,u_decimi,stato,quota_dmm,eta_quota_ms,vista,p_rif_pa,quota_rif_dmm\n"
        "1000.000,1,5000,101500,860,H,1523,20,0,101520,1500\n"
        "1000.010,2,5010,101510,862,H,,,,101520,1500\n"
        "1000.020,3,5020,101515,862,H,1530,25,2,101520,\n"
        "1000.030,4,5030,101515,862,M,1530,25,0,0,\n"
    )

    def test_unita_e_campi_vuoti(self):
        c = af.leggi(self.TESTO.splitlines(keepends=True))
        self.assertEqual(len(c), 4)
        self.assertAlmostEqual(c[0].t, 0.0)
        self.assertAlmostEqual(c[1].t, 0.01)
        self.assertAlmostEqual(c[0].quota, 0.1523)          # decimi di mm → metri
        self.assertAlmostEqual(c[0].quota_rif, 0.15)
        self.assertAlmostEqual(c[0].u, 86.0)                # decimi di grado → gradi
        self.assertIsNone(c[1].quota)                        # nessuna quota arrivata
        self.assertIsNone(c[2].quota)                        # vista = 2: P1 perso, la quota non vale
        self.assertIsNone(c[2].quota_rif)

    def test_file_di_prima_senza_riferimenti(self):
        vecchio = ("t_mac,seq,t_esp_ms,p_pa,u_decimi,stato,quota_dmm,eta_quota_ms,vista\n"
                   "1000.000,1,5000,101500,860,M,1523,20,0\n")
        c = af.leggi(vecchio.splitlines(keepends=True))
        self.assertEqual(c[0].p_rif, 0.0)
        self.assertIsNone(c[0].quota_rif)


class GradiniPressione(unittest.TestCase):
    """4.4 · «Fatto quando»: un gradino di pressione si assesta in meno di 0,5 s senza oscillazioni che restano."""

    def test_primo_ordine_veloce_supera(self):
        rif = lambda t: 101_000.0 if t < 1 else 101_400.0
        c = campioni(4, p=primo_ordine(1, 101_000, 101_400, 0.1), p_rif=rif)
        g = af.gradini_pressione(c)
        self.assertEqual(len(g), 1)
        self.assertAlmostEqual(g[0].ampiezza, 400, delta=1)
        # fascia ±50 Pa (il 10 % di 400 è 40, sotto un passo del servo): 0,1·ln(400/50) ≈ 0,21 s
        self.assertAlmostEqual(g[0].assestamento, 0.21, delta=0.02)
        self.assertTrue(g[0].superato)

    def test_primo_ordine_lento_non_supera(self):
        rif = lambda t: 101_000.0 if t < 1 else 101_400.0
        g = af.gradini_pressione(campioni(4, p=primo_ordine(1, 101_000, 101_400, 0.3), p_rif=rif))
        self.assertAlmostEqual(g[0].assestamento, 0.62, delta=0.03)
        self.assertFalse(g[0].superato)

    def test_oscillazione_che_resta_non_si_assesta(self):
        rif = lambda t: 101_000.0 if t < 1 else 101_400.0
        p = lambda t: 101_000.0 if t < 1 else 101_400.0 + 120 * math.sin(2 * math.pi * 2 * t)
        g = af.gradini_pressione(campioni(4, p=p, p_rif=rif))
        self.assertIsNone(g[0].assestamento)
        self.assertFalse(g[0].superato)

    def test_sovraelongazione(self):
        rif = lambda t: 101_000.0 if t < 1 else 101_400.0
        # primo picco a 10·(t−1) ≈ π: e^(−0,314/0,3) ≈ 0,35 del gradino
        p = lambda t: 101_000.0 if t < 1 else 101_400.0 - 400 * math.exp(-(t - 1) / 0.3) * math.cos(10 * (t - 1))
        g = af.gradini_pressione(campioni(4, p=p, p_rif=rif))
        self.assertAlmostEqual(g[0].sovraelongazione, 0.35, delta=0.03)

    def test_gradino_arrivato_in_due_campioni_conta_una_volta(self):
        # gemello del 9 novembre: +391 Pa arrivati come +195 e +196 in due righe consecutive
        rif = lambda t: 101_000.0 if t < 1 else (101_195.0 if t < 1.01 else 101_391.0)
        g = af.gradini_pressione(campioni(4, p=primo_ordine(1, 101_000, 101_391, 0.1), p_rif=rif))
        self.assertEqual(len(g), 1)
        self.assertAlmostEqual(g[0].ampiezza, 391, delta=1)
        self.assertTrue(g[0].superato)

    def test_su_e_giu_nello_stesso_istante_non_e_un_gradino(self):
        # gemello del PD, 9 novembre: +150 Pa e −150 Pa a 10 ms di distanza davano un gradino di 0 Pa (divisione per 0)
        rif = lambda t: 101_150.0 if 1 <= t < 1.01 else 101_000.0
        self.assertEqual(af.gradini_pressione(campioni(4, p=lambda t: 101_000.0, p_rif=rif)), [])

    def test_piccoli_movimenti_del_riferimento_non_sono_gradini(self):
        # in HOLD con il PID il riferimento si muove di poco a ogni passo dell'anello esterno
        rif = lambda t: 101_000.0 + 30 * math.sin(t)
        self.assertEqual(af.gradini_pressione(campioni(4, p=rif, p_rif=rif)), [])

    def test_fuori_dagli_stati_automatici_nessun_gradino(self):
        # in MANUALE e SAFE p_rif vale 0: il passaggio a HOLD non è un gradino del PI
        c = campioni(2, p_rif=lambda t: 0.0, stato="M") + [
            x._replace(t=x.t + 2) for x in campioni(2, p_rif=lambda t: 101_000.0, p=lambda t: 101_000.0)]
        self.assertEqual(af.gradini_pressione(c), [])


class TenutaPressione(unittest.TestCase):
    """4.4 · il PI compensa la perdita d'aria: errore medio piccolo mentre il servo si sposta piano."""

    def test_perdita_compensata(self):
        c = campioni(60, p=lambda t: 101_400.0 + 5 * math.sin(3 * t), p_rif=lambda t: 101_400.0)
        c = [x._replace(u=86.0 + 0.05 * x.t) for x in c]       # il servo avanza di 3° al minuto
        r = af.tenuta_pressione(c)
        self.assertAlmostEqual(r.errore_medio, 0, delta=2)
        self.assertAlmostEqual(r.deriva_servo, 3.0, delta=0.1)  # gradi al minuto
        self.assertTrue(r.superato)


class CicloLimite(unittest.TestCase):
    """4.3 · On-Off: ampiezza e periodo del ciclo limite (in simulazione circa ±2 cm e 6 s)."""

    def test_sinusoide_di_6_s(self):
        quota = lambda t: 0.10 + 0.02 * math.sin(2 * math.pi * t / 6)
        r = af.ciclo_limite(campioni(40, quota=quota, quota_rif=lambda t: 0.10))
        self.assertAlmostEqual(r.periodo, 6.0, delta=0.05)
        self.assertAlmostEqual(r.ampiezza, 0.02, delta=0.0005)
        self.assertAlmostEqual(r.centro, 0.10, delta=0.001)
        self.assertGreaterEqual(r.cicli, 4)

    def test_il_rumore_non_conta_come_attraversamenti(self):
        quota = lambda t: 0.10 + 0.02 * math.sin(2 * math.pi * t / 6) + 0.0003 * math.sin(2 * math.pi * 25 * t)
        r = af.ciclo_limite(campioni(40, quota=quota, quota_rif=lambda t: 0.10))
        self.assertAlmostEqual(r.periodo, 6.0, delta=0.1)

    def test_senza_oscillazione_nessun_ciclo(self):
        self.assertIsNone(af.ciclo_limite(campioni(40, quota=lambda t: 0.10, quota_rif=lambda t: 0.10)))


class TenutaQuota(unittest.TestCase):
    """4.5 · M4: quota mantenuta per 60 s entro ±1 cm, di fila."""

    def test_settanta_secondi_dentro_superano(self):
        quota = lambda t: 0.10 + 0.005 * math.sin(t)
        r = af.tenuta_quota(campioni(70, quota=quota, quota_rif=lambda t: 0.10))
        self.assertAlmostEqual(r.durata, 70, delta=0.05)
        self.assertAlmostEqual(r.errore_max, 0.005, delta=0.0002)
        self.assertTrue(r.superato)

    def test_un_uscita_spezza_il_tratto(self):
        quota = lambda t: 0.115 if 30 <= t < 30.2 else 0.10
        r = af.tenuta_quota(campioni(70, quota=quota, quota_rif=lambda t: 0.10))
        self.assertAlmostEqual(r.durata, 39.8, delta=0.05)
        self.assertFalse(r.superato)

    def test_quota_mancante_spezza_il_tratto(self):
        quota = lambda t: None if 20 <= t < 20.5 else 0.10
        r = af.tenuta_quota(campioni(70, quota=quota, quota_rif=lambda t: 0.10))
        self.assertAlmostEqual(r.durata, 49.5, delta=0.05)

    def test_un_cambio_di_riferimento_spezza_il_tratto(self):
        rif = lambda t: 0.10 if t < 35 else 0.12
        r = af.tenuta_quota(campioni(70, quota=rif, quota_rif=rif))
        self.assertAlmostEqual(r.durata, 35, delta=0.05)


class GradiniQuota(unittest.TestCase):
    """4.5 · confronto P/PD: sovraelongazione e assestamento sul gradino di quota (fascia ±5 mm, foglio A4)."""

    def test_gradino_di_5_cm(self):
        rif = lambda t: 0.05 if t < 2 else 0.10
        g = af.gradini_quota(campioni(15, quota=primo_ordine(2, 0.05, 0.10, 1.0), quota_rif=rif))
        self.assertEqual(len(g), 1)
        self.assertAlmostEqual(g[0].ampiezza, 0.05, delta=1e-6)
        self.assertAlmostEqual(g[0].assestamento, math.log(10), delta=0.03)   # 1·ln(5 cm / 5 mm)
        self.assertTrue(g[0].superato)                                          # sotto i 10 s del foglio A4


class Rapporto(unittest.TestCase):
    """Con --prova si stampa solo l'analisi di quella prova (gemello del 9 novembre: nel file del PD i movimenti
    del riferimento sembravano gradini di pressione della 4.4)."""

    def setUp(self):
        rif = lambda t: 0.05 if t < 2 else 0.10
        self.c = campioni(15, quota=primo_ordine(2, 0.05, 0.10, 1.0), quota_rif=rif,
                          p_rif=lambda t: 101_000.0 if t < 2 else 101_500.0,
                          p=lambda t: 101_000.0 if t < 2 else 101_500.0)

    def test_solo_la_prova_scelta(self):
        righe = af.rapporto(self.c, prova="4.5")
        self.assertTrue(righe)
        self.assertTrue(all(r.startswith(("4.5", "M4", "4.3")) for r in righe))

    def test_prova_44_senza_quota(self):
        self.assertTrue(all(r.startswith("4.4") for r in af.rapporto(self.c, prova="4.4")))

    def test_le_analisi_delle_altre_prove_non_si_fanno(self):
        # un riferimento di pressione che farebbe fallire la 4.4 non deve toccare il verdetto della 4.5
        def esplode(_):
            raise AssertionError("analisi della 4.4 fatta con --prova 4.5")
        originale = af.gradini_pressione
        af.gradini_pressione = esplode
        try:
            self.assertTrue(af.rapporto(self.c, prova="4.5"))
        finally:
            af.gradini_pressione = originale

    def test_prova_sconosciuta(self):
        with self.assertRaises(ValueError):
            af.rapporto(self.c, prova="4.9")


if __name__ == "__main__":
    unittest.main()
