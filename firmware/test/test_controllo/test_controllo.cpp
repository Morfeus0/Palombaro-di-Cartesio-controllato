// Test dei regolatori del firmware 0.2 (sottofasi 4.1/4.2): girano sul Mac, senza scheda.
// Uso (dalla cartella firmware): pio test -e protocollo
#include <unity.h>

#include "palombaro/controllo.h"

using namespace controllo;

void setUp() {}
void tearDown() {}

// --- PI della pressione: uscita in gradi del servo, errore in pascal -----------------------------------------
void test_pi_parte_dal_valore_iniziale() {
  Pi pi{0.02f, 0.4f, 0.01f, 36.0f, 146.0f};
  azzera(pi, 66.0f);
  TEST_ASSERT_FLOAT_WITHIN(1e-4f, 66.0f, passo(pi, 0.0f));
}

void test_pi_proporzionale_piu_integrale() {
  Pi pi{0.02f, 0.4f, 0.01f, 36.0f, 146.0f};
  azzera(pi, 66.0f);
  // 100 Pa di errore: 2° subito, e l'integrale cresce di 0,4 · 100 · 0,01 = 0,4° a ciclo
  TEST_ASSERT_FLOAT_WITHIN(1e-3f, 66.0f + 2.0f + 0.4f, passo(pi, 100.0f));
  TEST_ASSERT_FLOAT_WITHIN(1e-3f, 66.0f + 2.0f + 0.8f, passo(pi, 100.0f));
}

void test_pi_anti_windup_a_fine_corsa() {
  Pi pi{0.02f, 0.4f, 0.01f, 36.0f, 146.0f};
  azzera(pi, 145.0f);
  for (int i = 0; i < 500; i++) passo(pi, 2000.0f);       // errore grande e lungo: uscita ferma a 146
  TEST_ASSERT_FLOAT_WITHIN(1e-3f, 146.0f, passo(pi, 2000.0f));
  // appena l'errore cambia segno l'uscita scende subito: l'integrale non si è caricato oltre il limite
  TEST_ASSERT_TRUE(passo(pi, -200.0f) < 146.0f - 3.0f);
}

// --- PID della quota: uscita in pascal (correzione della pressione), quote in metri ---------------------------
Pid pidProva() {
  Pid pid{47000.0f, 0.0f, 29000.0f, 10.0f, 1.0f / 30.0f, -2000.0f, 2000.0f};
  azzera(pid, 0.10f);
  return pid;
}

void test_pid_proporzionale_sull_errore() {
  Pid pid = pidProva();
  azzera(pid, 0.11f);
  // P1 fermo 1 cm sopra il riferimento: più pressione (P1 deve scendere), 470 Pa
  TEST_ASSERT_FLOAT_WITHIN(1.0f, 470.0f, passo(pid, 0.10f, 0.11f));
}

void test_pid_derivata_sulla_misura_niente_colpo_al_cambio_di_riferimento() {
  Pid pid = pidProva();
  passo(pid, 0.10f, 0.10f);
  // il riferimento salta di 5 cm con P1 fermo: solo il proporzionale (−2350 Pa, limitato a −2000), niente derivata
  TEST_ASSERT_FLOAT_WITHIN(1.0f, -2000.0f, passo(pid, 0.15f, 0.10f));
  pid = pidProva();
  passo(pid, 0.10f, 0.10f);
  TEST_ASSERT_FLOAT_WITHIN(1.0f, -470.0f, passo(pid, 0.11f, 0.10f));
}

void test_pid_derivata_filtrata_quando_p1_sale() {
  Pid pid = pidProva();
  passo(pid, 0.10f, 0.10f);
  // P1 sale di 1 mm in un fotogramma (3 cm/s): la derivata spinge giù, ma filtrata (meno di Kd·v = 870 Pa)
  const float u = passo(pid, 0.10f, 0.101f);
  TEST_ASSERT_TRUE(u > 47.0f + 100.0f);
  TEST_ASSERT_TRUE(u < 47.0f + 870.0f);
}

void test_pid_integrale_corregge_un_errore_costante() {
  Pid pid{47000.0f, 3133.0f, 0.0f, 10.0f, 1.0f / 30.0f, -2000.0f, 2000.0f};
  azzera(pid, 0.10f);
  const float primo = passo(pid, 0.10f, 0.105f);
  float u = primo;
  for (int i = 0; i < 300; i++) u = passo(pid, 0.10f, 0.105f);   // 10 s con 5 mm di errore
  TEST_ASSERT_TRUE(u > primo + 100.0f);                           // l'integrale ha aggiunto pressione
}

// --- On-Off con isteresi: uscita ±ampiezza in pascal ------------------------------------------------------------
void test_on_off_cambia_solo_fuori_dall_isteresi() {
  OnOff oo{0.005f, 300.0f};
  azzera(oo);
  TEST_ASSERT_EQUAL_FLOAT(-300.0f, passo(oo, 0.10f, 0.10f));     // parte con meno pressione (P1 sale)
  TEST_ASSERT_EQUAL_FLOAT(-300.0f, passo(oo, 0.10f, 0.104f));    // dentro l'isteresi: non cambia
  TEST_ASSERT_EQUAL_FLOAT(300.0f, passo(oo, 0.10f, 0.106f));     // 6 mm sopra: più pressione
  TEST_ASSERT_EQUAL_FLOAT(300.0f, passo(oo, 0.10f, 0.097f));     // dentro l'isteresi dall'altra parte
  TEST_ASSERT_EQUAL_FLOAT(-300.0f, passo(oo, 0.10f, 0.094f));    // 6 mm sotto: meno pressione
}

int main() {
  UNITY_BEGIN();
  RUN_TEST(test_pi_parte_dal_valore_iniziale);
  RUN_TEST(test_pi_proporzionale_piu_integrale);
  RUN_TEST(test_pi_anti_windup_a_fine_corsa);
  RUN_TEST(test_pid_proporzionale_sull_errore);
  RUN_TEST(test_pid_derivata_sulla_misura_niente_colpo_al_cambio_di_riferimento);
  RUN_TEST(test_pid_derivata_filtrata_quando_p1_sale);
  RUN_TEST(test_pid_integrale_corregge_un_errore_costante);
  RUN_TEST(test_on_off_cambia_solo_fuori_dall_isteresi);
  return UNITY_END();
}
