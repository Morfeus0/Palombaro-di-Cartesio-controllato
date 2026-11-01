// Test del modulo del protocollo (docs/protocollo.md): girano sul Mac, senza scheda.
// Uso (dalla cartella firmware): pio test -e protocollo
#include <cstdio>
#include <cstring>

#include <unity.h>

#include "palombaro/protocollo.h"

using namespace protocollo;

void setUp() {}
void tearDown() {}

// Il controllo è lo XOR dei byte tra '$' e '*': "Z,1" -> 'Z' ^ ',' ^ '1'.
void test_controllo_xor() {
  const char corpo[] = "Z,1";
  TEST_ASSERT_EQUAL_HEX8('Z' ^ ',' ^ '1', controllo(corpo, strlen(corpo)));
}

void test_componi_aggiunge_dollaro_controllo_e_a_capo() {
  char buf[RIGA_MAX + 2];
  const size_t n = componi(buf, sizeof(buf), "OK,S");
  char atteso[16];
  snprintf(atteso, sizeof(atteso), "$OK,S*%02X\n", controllo("OK,S", 4));
  TEST_ASSERT_EQUAL_STRING(atteso, buf);
  TEST_ASSERT_EQUAL(strlen(atteso), n);
}

void test_componi_rifiuta_righe_troppo_lunghe() {
  char lungo[RIGA_MAX + 10];
  memset(lungo, 'A', sizeof(lungo) - 1);
  lungo[sizeof(lungo) - 1] = '\0';
  char buf[RIGA_MAX + 20];
  TEST_ASSERT_EQUAL(0, componi(buf, sizeof(buf), lungo));
}

void test_analizza_una_riga_valida() {
  char riga[RIGA_MAX + 2];
  componi(riga, sizeof(riga), "S,1460");
  riga[strlen(riga) - 1] = '\0';  // il lettore toglie il '\n'
  Messaggio m;
  TEST_ASSERT_EQUAL(Esito::OK, analizza(riga, m));
  TEST_ASSERT_EQUAL_STRING("S", m.tipo);
  TEST_ASSERT_EQUAL(1, m.n);
  TEST_ASSERT_EQUAL_STRING("1460", m.campi[0]);
}

void test_analizza_riga_senza_campi() {
  char riga[RIGA_MAX + 2];
  componi(riga, sizeof(riga), "E");
  riga[strlen(riga) - 1] = '\0';
  Messaggio m;
  TEST_ASSERT_EQUAL(Esito::OK, analizza(riga, m));
  TEST_ASSERT_EQUAL_STRING("E", m.tipo);
  TEST_ASSERT_EQUAL(0, m.n);
}

void test_controllo_sbagliato_si_scarta() {
  char riga[] = "$S,1460*00";
  Messaggio m;
  TEST_ASSERT_EQUAL(Esito::CONTROLLO, analizza(riga, m));
}

void test_riga_senza_dollaro_non_e_protocollo() {
  char riga[] = "146";
  Messaggio m;
  TEST_ASSERT_EQUAL(Esito::NON_PROTOCOLLO, analizza(riga, m));
}

void test_riga_senza_asterisco_e_malformata() {
  char riga[] = "$S,1460";
  Messaggio m;
  TEST_ASSERT_EQUAL(Esito::FORMATO, analizza(riga, m));
}

void test_tipo_troppo_lungo_e_malformato() {
  char riga[RIGA_MAX + 2];
  componi(riga, sizeof(riga), "XYZ,1");
  riga[strlen(riga) - 1] = '\0';
  Messaggio m;
  TEST_ASSERT_EQUAL(Esito::FORMATO, analizza(riga, m));
}

void test_intero_accetta_solo_numeri_interi() {
  long v = 0;
  TEST_ASSERT_TRUE(intero("1460", v));
  TEST_ASSERT_EQUAL(1460, v);
  TEST_ASSERT_TRUE(intero("-25", v));
  TEST_ASSERT_EQUAL(-25, v);
  TEST_ASSERT_FALSE(intero("14.6", v));
  TEST_ASSERT_FALSE(intero("", v));
  TEST_ASSERT_FALSE(intero("12a", v));
}

int main() {
  UNITY_BEGIN();
  RUN_TEST(test_controllo_xor);
  RUN_TEST(test_componi_aggiunge_dollaro_controllo_e_a_capo);
  RUN_TEST(test_componi_rifiuta_righe_troppo_lunghe);
  RUN_TEST(test_analizza_una_riga_valida);
  RUN_TEST(test_analizza_riga_senza_campi);
  RUN_TEST(test_controllo_sbagliato_si_scarta);
  RUN_TEST(test_riga_senza_dollaro_non_e_protocollo);
  RUN_TEST(test_riga_senza_asterisco_e_malformata);
  RUN_TEST(test_tipo_troppo_lungo_e_malformato);
  RUN_TEST(test_intero_accetta_solo_numeri_interi);
  return UNITY_END();
}
