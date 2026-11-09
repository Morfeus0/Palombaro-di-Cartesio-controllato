// Test dello stato CALIBRAZIONE del firmware 0.2 (sottofase 4.2): sul Mac, senza scheda.
// Uso (dalla cartella firmware): pio test -e protocollo
#include <unity.h>

#include "palombaro/calibrazione.h"

using namespace calibrazione;

void setUp() {}
void tearDown() {}

constexpr uint32_t DT = 10;   // ms, il ciclo dell'ESP32

// Fa girare la calibrazione per «ms» con P1 alla quota data; restituisce l'ultima pressione voluta.
float gira(Stato& st, const Parametri& par, uint32_t ms, float quotaM) {
  float p = 0.0f;
  for (uint32_t t = 0; t < ms; t += DT) p = passo(st, par, DT, true, quotaM);
  return p;
}

void test_prima_porta_p1_sul_fondo() {
  const Parametri par;
  Stato st;
  avvia(st, 101640.0f);
  TEST_ASSERT_TRUE(st.fase == Fase::FONDO);
  TEST_ASSERT_FLOAT_WITHIN(0.1f, 101640.0f + par.sovrapressioneFondoPa, passo(st, par, DT, true, 0.12f));
}

void test_aspetta_p1_fermo_sul_fondo_prima_di_scendere() {
  const Parametri par;
  Stato st;
  avvia(st, 101640.0f);
  gira(st, par, 10000, 0.12f);                   // 10 s con P1 ancora in alto: resta in FONDO
  TEST_ASSERT_TRUE(st.fase == Fase::FONDO);
  gira(st, par, 2000, 0.003f);                   // sul fondo da 2 s: non basta
  TEST_ASSERT_TRUE(st.fase == Fase::FONDO);
  gira(st, par, 1100, 0.003f);                   // sul fondo da più di 3 s: comincia la discesa
  TEST_ASSERT_TRUE(st.fase == Fase::DISCESA);
}

void test_la_discesa_va_a_30_pa_al_secondo_e_trova_lo_stacco() {
  const Parametri par;
  Stato st;
  avvia(st, 101640.0f);
  gira(st, par, 6000, 0.003f);
  TEST_ASSERT_TRUE(st.fase == Fase::DISCESA);
  const float inizio = passo(st, par, DT, true, 0.003f);
  TEST_ASSERT_FLOAT_WITHIN(0.5f, 101640.0f + par.partenzaDiscesaPa, inizio);
  const float dopo10s = gira(st, par, 10000, 0.003f);
  TEST_ASSERT_FLOAT_WITHIN(1.0f, inizio - 300.0f, dopo10s);
  passo(st, par, DT, true, 0.02f);               // P1 a 2 cm: si è staccato
  TEST_ASSERT_TRUE(st.fase == Fase::FATTA);
  // p0 = pressione allo stacco + la discesa dei ~4 s che P1 impiega ad arrivare a 1,5 cm
  TEST_ASSERT_FLOAT_WITHIN(1.0f, dopo10s + par.rampaPaS * par.ritardoStaccoS, st.p0);
}

void test_quota_non_valida_non_fa_finire_la_discesa() {
  const Parametri par;
  Stato st;
  avvia(st, 101640.0f);
  gira(st, par, 6000, 0.003f);
  passo(st, par, DT, false, 0.05f);              // quota non valida (buco): non si conta come stacco
  TEST_ASSERT_TRUE(st.fase == Fase::DISCESA);
}

void test_fallisce_se_p1_non_si_stacca() {
  const Parametri par;
  Stato st;
  avvia(st, 101640.0f);
  gira(st, par, 6000, 0.003f);
  gira(st, par, static_cast<uint32_t>(par.discesaMaxPa / par.rampaPaS * 1000.0f) + 1000, 0.003f);
  TEST_ASSERT_TRUE(st.fase == Fase::FALLITA);
}

// 9 novembre (decisione di Gabriele): se la calibrazione parte con la pressione troppo bassa, la discesa comincia già
// sotto la soglia e P1 si stacca subito; prima si salvava un p0 troppo basso senza accorgersene.
void test_p1_che_si_stacca_subito_annulla_la_calibrazione() {
  const Parametri par;
  Stato st;
  avvia(st, 100700.0f);                          // per esempio servo a 36, ben sotto la soglia
  gira(st, par, 6000, 0.003f);
  TEST_ASSERT_TRUE(st.fase == Fase::DISCESA);
  gira(st, par, 1500, 0.003f);                   // P1 ancora sul fondo per 1,5 s...
  gira(st, par, 500, 0.012f);                    // ... poi già a 1,2 cm prima dei 3 s: partenza troppo bassa
  TEST_ASSERT_TRUE(st.fase == Fase::PARTENZA_BASSA);
  const float p = st.pVoluta;
  gira(st, par, 1000, 0.03f);                    // fase finale: niente più cambi e niente p0
  TEST_ASSERT_TRUE(st.fase == Fase::PARTENZA_BASSA);
  TEST_ASSERT_EQUAL_FLOAT(p, st.pVoluta);
  TEST_ASSERT_EQUAL_FLOAT(0.0f, st.p0);
}

void test_p1_che_si_stacca_dopo_i_primi_secondi_va_bene() {
  const Parametri par;
  Stato st;
  avvia(st, 101640.0f);
  gira(st, par, 6000, 0.003f);
  gira(st, par, par.fermoInizioDiscesaMs + 10, 0.003f);   // sul fondo per tutti i primi 3 s
  gira(st, par, 500, 0.012f);                              // si stacca dopo: è una calibrazione normale
  TEST_ASSERT_TRUE(st.fase == Fase::DISCESA);
  passo(st, par, DT, true, 0.02f);
  TEST_ASSERT_TRUE(st.fase == Fase::FATTA);
}

void test_un_buco_della_quota_all_inizio_non_annulla() {
  const Parametri par;
  Stato st;
  avvia(st, 101640.0f);
  gira(st, par, 6000, 0.003f);
  passo(st, par, DT, false, 0.05f);              // quota non valida all'inizio della discesa: non conta
  TEST_ASSERT_TRUE(st.fase == Fase::DISCESA);
}

int main() {
  UNITY_BEGIN();
  RUN_TEST(test_p1_che_si_stacca_subito_annulla_la_calibrazione);
  RUN_TEST(test_p1_che_si_stacca_dopo_i_primi_secondi_va_bene);
  RUN_TEST(test_un_buco_della_quota_all_inizio_non_annulla);
  RUN_TEST(test_prima_porta_p1_sul_fondo);
  RUN_TEST(test_aspetta_p1_fermo_sul_fondo_prima_di_scendere);
  RUN_TEST(test_la_discesa_va_a_30_pa_al_secondo_e_trova_lo_stacco);
  RUN_TEST(test_quota_non_valida_non_fa_finire_la_discesa);
  RUN_TEST(test_fallisce_se_p1_non_si_stacca);
  return UNITY_END();
}
