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

int main() {
  UNITY_BEGIN();
  RUN_TEST(test_prima_porta_p1_sul_fondo);
  RUN_TEST(test_aspetta_p1_fermo_sul_fondo_prima_di_scendere);
  RUN_TEST(test_la_discesa_va_a_30_pa_al_secondo_e_trova_lo_stacco);
  RUN_TEST(test_quota_non_valida_non_fa_finire_la_discesa);
  RUN_TEST(test_fallisce_se_p1_non_si_stacca);
  return UNITY_END();
}
