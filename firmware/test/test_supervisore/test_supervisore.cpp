// Test delle regole di sicurezza del firmware 0.2 (sottofase 4.2, docs/protocollo.md sezione 6): sul Mac, senza scheda.
// Uso (dalla cartella firmware): pio test -e protocollo
#include <cstring>

#include <unity.h>

#include "palombaro/supervisore.h"

using namespace supervisore;

void setUp() {}
void tearDown() {}

Ingressi tuttoBene(Stato s) {
  Ingressi in;
  in.stato = s;
  in.msDaRigaMac = 20;
  in.msDaQuota = 17;
  in.vista = 0;
  in.pressionePa = 102000.0f;
  in.sensoreOk = true;
  in.msErroreGrande = 0;
  return in;
}

void assertMotivo(const char* atteso, const char* motivo) {
  if (atteso == nullptr) {
    TEST_ASSERT_NULL(motivo);
  } else {
    TEST_ASSERT_NOT_NULL(motivo);
    TEST_ASSERT_EQUAL_STRING(atteso, motivo);
  }
}

void test_tutto_bene_nessun_motivo() {
  const Soglie s;
  assertMotivo(nullptr, motivoSafe(tuttoBene(Stato::HOLD), s));
  assertMotivo(nullptr, motivoSafe(tuttoBene(Stato::MANUALE), s));
}

void test_mac_muto_conta_solo_negli_stati_automatici() {
  const Soglie s;
  Ingressi in = tuttoBene(Stato::HOLD);
  in.msDaRigaMac = 501;
  assertMotivo("MAC_MUTO", motivoSafe(in, s));
  in.stato = Stato::MANUALE;
  assertMotivo(nullptr, motivoSafe(in, s));        // in MANUALE il servo resta dov'è
}

void test_telecamera_muta_e_p1_perso() {
  const Soglie s;
  Ingressi in = tuttoBene(Stato::CALIBRAZIONE);
  in.msDaQuota = 184;                               // 5 nov: avvio della registrazione video
  assertMotivo(nullptr, motivoSafe(in, s));
  in.msDaQuota = 256;                               // 1 nov: Mac fermo (decisione 9 nov: soglia 300 ms)
  assertMotivo(nullptr, motivoSafe(in, s));
  in.msDaQuota = 301;
  assertMotivo("TELECAMERA_MUTA", motivoSafe(in, s));
  in = tuttoBene(Stato::HOLD);
  in.vista = 2;
  assertMotivo("PERSO", motivoSafe(in, s));
  in.vista = 1;                                     // buco breve: il riconoscimento tiene l'ultima posizione
  assertMotivo(nullptr, motivoSafe(in, s));
}

void test_pressione_e_sensore_valgono_anche_in_manuale() {
  const Soglie s;
  Ingressi in = tuttoBene(Stato::MANUALE);
  in.pressionePa = 106600.0f;
  assertMotivo("PRESSIONE", motivoSafe(in, s));
  in = tuttoBene(Stato::MANUALE);
  in.sensoreOk = false;
  assertMotivo("SENSORE", motivoSafe(in, s));
}

void test_in_safe_nessun_nuovo_motivo() {
  const Soglie s;
  Ingressi in = tuttoBene(Stato::SAFE);
  in.msDaRigaMac = 10000;
  in.pressionePa = 107000.0f;
  assertMotivo(nullptr, motivoSafe(in, s));        // già in SAFE: niente da fare
}

void test_errore_grande_troppo_a_lungo() {
  const Soglie s;
  uint32_t ms = 0;
  for (int i = 0; i < 499; i++) ms = aggiornaErroreGrande(ms, 0.07f, 10, s);   // 4,99 s con 7 cm di errore
  Ingressi in = tuttoBene(Stato::HOLD);
  in.msErroreGrande = ms;
  assertMotivo(nullptr, motivoSafe(in, s));
  ms = aggiornaErroreGrande(ms, 0.07f, 20, s);
  in.msErroreGrande = ms;
  assertMotivo("ERRORE", motivoSafe(in, s));
  TEST_ASSERT_EQUAL_UINT32(0, aggiornaErroreGrande(ms, 0.02f, 10, s));        // l'errore torna piccolo: si riparte
}

int main() {
  UNITY_BEGIN();
  RUN_TEST(test_tutto_bene_nessun_motivo);
  RUN_TEST(test_mac_muto_conta_solo_negli_stati_automatici);
  RUN_TEST(test_telecamera_muta_e_p1_perso);
  RUN_TEST(test_pressione_e_sensore_valgono_anche_in_manuale);
  RUN_TEST(test_in_safe_nessun_nuovo_motivo);
  RUN_TEST(test_errore_grande_troppo_a_lungo);
  return UNITY_END();
}
