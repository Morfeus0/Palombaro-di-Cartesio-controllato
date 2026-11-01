// Firmware 0.1 del palombaro (sottofase 2.5): l'ossatura su cui poggeranno i controllori della fase 4.
// Contratto: docs/protocollo.md (versione 1, rivista il 1 novembre 2026). Stati di questa versione: MANUALE e SAFE.
//
// Tutto gira in un solo ciclo periodico da 10 ms (100 Hz), in un task di FreeRTOS: lettura dei messaggi dal Mac,
// lettura del sensore, controlli di sicurezza, un passo della rampa del servo e la telemetria T. Un solo task vuol
// dire nessuna variabile condivisa tra due flussi; un comando aspetta al massimo un ciclo.
// La regolarità del periodo (il «Fatto quando» della 2.5) la misura il firmware stesso e la manda nella riga A.
#include <Arduino.h>
#include <cstdarg>
#include <cstdlib>
#include <cstring>
#include <esp_system.h>
#include <esp_timer.h>

#include "protocollo.h"
#include "sensore.h"
#include "siringa.h"

namespace {

constexpr const char* VERSIONE = "0.1";
constexpr int VERSIONE_PROTOCOLLO = 1;
constexpr uint32_t BAUD = 460800;                 // decisione 1
constexpr uint32_t PERIODO_MS = 10;               // 100 Hz
constexpr int64_t PERIODO_US = PERIODO_MS * 1000;
constexpr uint32_t CICLI_AL_SECONDO = 1000 / PERIODO_MS;
// Decisione 9: SAFE oltre +5 kPa. Il firmware non conosce la pressione della stanza: +5 kPa sopra 101,5 kPa
// (stanza misurata tra 100,5 e 101,6 kPa dal 17 ottobre al 1 novembre).
constexpr float PRESSIONE_MAX_PA = 106500.0f;

enum class Stato { MANUALE, SAFE };

struct Contatori {
  uint32_t errControllo = 0;
  uint32_t errFormato = 0;
  uint32_t persi = 0;       // salti nei numeri di sequenza di Z e B
  uint32_t letture = 0;     // letture valide del sensore nell'ultimo secondo
  int64_t scartoMaxUs = 0;  // massimo |periodo − 10 ms| nell'ultimo secondo
  uint32_t ritardi = 0;     // cicli arrivati in ritardo di più di un periodo (dall'avvio)
};

Stato stato = Stato::MANUALE;
Contatori cont;
bool sensoreOk = false;
sensore::Lettura ultima{0.0f, 0.0f};
uint32_t seqT = 0;
long ultimaSeqZ = -1;
long ultimaSeqB = -1;
char riga[protocollo::RIGA_MAX + 1];
size_t lunghezzaRiga = 0;
bool rigaTroppoLunga = false;

const char* nomeStato(Stato s) { return s == Stato::SAFE ? "SAFE" : "MANUALE"; }

const char* nomeRiavvio() {
  switch (esp_reset_reason()) {
    case ESP_RST_POWERON: return "POWERON";
    case ESP_RST_BROWNOUT: return "BROWNOUT";
    case ESP_RST_SW: return "SW";
    case ESP_RST_PANIC: return "PANIC";
    case ESP_RST_EXT: return "EXT";
    default: return "ALTRO";
  }
}

// Una riga del protocollo: il corpo si scrive come con printf, "$", controllo e "\n" li aggiunge componi().
void invia(const char* formato, ...) {
  char corpo[protocollo::RIGA_MAX];
  va_list argomenti;
  va_start(argomenti, formato);
  vsnprintf(corpo, sizeof(corpo), formato, argomenti);
  va_end(argomenti);
  char buf[protocollo::RIGA_MAX + 2];
  const size_t n = protocollo::componi(buf, sizeof(buf), corpo);
  if (n > 0) Serial.write(reinterpret_cast<const uint8_t*>(buf), n);
}

void cambiaStato(Stato nuovo, const char* motivo) {
  if (nuovo == stato) return;
  invia("X,%s,%s,%s", nomeStato(stato), nomeStato(nuovo), motivo);
  stato = nuovo;
}

// SAFE (decisioni 3 e 9): stantuffo spinto e P1 a fondo; per sovrapressione invece il servo si ferma dov'è.
void entraInSafe(const char* motivo) {
  if (strcmp(motivo, "PRESSIONE") == 0) {
    siringa::ferma();
  } else {
    siringa::vaiA(siringa::DECIMI_SAFE);
  }
  cambiaStato(Stato::SAFE, motivo);
}

void contaSequenza(long seq, long& ultimaSeq) {
  if (ultimaSeq >= 0 && seq > ultimaSeq + 1) cont.persi += static_cast<uint32_t>(seq - ultimaSeq - 1);
  ultimaSeq = seq;
}

void comandoServo(const protocollo::Messaggio& m) {
  long decimi = 0;
  if (m.n != 1 || !protocollo::intero(m.campi[0], decimi)) {
    cont.errFormato++;
    return;
  }
  if (stato != Stato::MANUALE) {
    invia("NO,S,%s", nomeStato(stato));
  } else if (decimi < siringa::DECIMI_MIN || decimi > siringa::DECIMI_MAX) {
    invia("NO,S,FUORI_LIMITI");
  } else {
    siringa::vaiA(static_cast<int>(decimi));
    invia("OK,S");
  }
}

void comandoModalita(const protocollo::Messaggio& m) {
  if (m.n != 1) {
    cont.errFormato++;
  } else if (strcmp(m.campi[0], "SAFE") == 0) {
    entraInSafe("RICHIESTA");
    invia("OK,M");
  } else if (strcmp(m.campi[0], "MANUALE") != 0) {
    invia("NO,M,NON_DISPONIBILE");  // CALIBRAZIONE, HOLD e TRACKING arrivano con la fase 4
  } else if (!sensoreOk) {
    invia("NO,M,SENSORE");
  } else {
    if (stato == Stato::SAFE) siringa::ferma();  // da SAFE si esce solo con M: il servo resta dov'è
    cambiaStato(Stato::MANUALE, "RICHIESTA");
    invia("OK,M");
  }
}

void gestisci(const protocollo::Messaggio& m) {
  long seq = 0;
  if (strcmp(m.tipo, "Z") == 0) {
    if (m.n == 4 && protocollo::intero(m.campi[0], seq)) contaSequenza(seq, ultimaSeqZ); else cont.errFormato++;
  } else if (strcmp(m.tipo, "B") == 0) {
    if (m.n == 1 && protocollo::intero(m.campi[0], seq)) contaSequenza(seq, ultimaSeqB); else cont.errFormato++;
  } else if (strcmp(m.tipo, "S") == 0) {
    comandoServo(m);
  } else if (strcmp(m.tipo, "M") == 0) {
    comandoModalita(m);
  } else if (strcmp(m.tipo, "E") == 0) {
    entraInSafe("EMERGENZA");
    invia("OK,E");
  } else if (strcmp(m.tipo, "V") == 0) {
    invia("V,%s,%d", VERSIONE, VERSIONE_PROTOCOLLO);
  } else if (strcmp(m.tipo, "R") == 0 || strcmp(m.tipo, "P") == 0 || strcmp(m.tipo, "K") == 0) {
    invia("NO,%s,NON_DISPONIBILE", m.tipo);
  } else {
    invia("NO,%s,SCONOSCIUTO", m.tipo);
  }
}

void analizzaRiga() {
  protocollo::Messaggio m;
  switch (protocollo::analizza(riga, m)) {
    case protocollo::Esito::OK: gestisci(m); break;
    case protocollo::Esito::CONTROLLO: cont.errControllo++; break;
    case protocollo::Esito::FORMATO: cont.errFormato++; break;
    case protocollo::Esito::NON_PROTOCOLLO: break;  // testo per le persone o rumore: non si interpreta
  }
}

// Legge senza bloccare tutto quello che è arrivato; ogni riga completa si analizza subito.
void leggiSeriale() {
  while (Serial.available() > 0) {
    const char c = static_cast<char>(Serial.read());
    if (c == '\r') continue;
    if (c != '\n') {
      if (lunghezzaRiga < protocollo::RIGA_MAX) riga[lunghezzaRiga++] = c; else rigaTroppoLunga = true;
      continue;
    }
    riga[lunghezzaRiga] = '\0';
    if (rigaTroppoLunga) cont.errFormato++; else if (lunghezzaRiga > 0) analizzaRiga();
    lunghezzaRiga = 0;
    rigaTroppoLunga = false;
  }
}

void leggiSensore() {
  if (!sensoreOk) return;
  if (!sensore::leggi(ultima)) {
    sensoreOk = false;
    entraInSafe("SENSORE");
    return;
  }
  cont.letture++;
  if (ultima.pressionePa > PRESSIONE_MAX_PA) entraInSafe("PRESSIONE");
}

// Una volta al secondo: salute del sensore (identità e misura continua), riconnessione, riga A.
void ognisecondo(uint32_t tMs) {
  if (sensoreOk && !sensore::sano()) {
    sensoreOk = false;
    entraInSafe("SENSORE");
  } else if (!sensoreOk && sensore::avvia()) {
    sensoreOk = true;  // si resta in SAFE: decide una persona, con M
  }
  invia("A,%lu,%ld,%lu,%lu,%lu,%lu,%s,%ld,%lu,%u", static_cast<unsigned long>(tMs),
        lroundf(ultima.temperaturaC * 100.0f), static_cast<unsigned long>(cont.letture),
        static_cast<unsigned long>(cont.errControllo), static_cast<unsigned long>(cont.errFormato),
        static_cast<unsigned long>(cont.persi), nomeRiavvio(), static_cast<long>(cont.scartoMaxUs),
        static_cast<unsigned long>(cont.ritardi), sensoreOk ? sensore::indirizzo() : 0);
  cont.letture = 0;
  cont.scartoMaxUs = 0;
}

void ciclo(uint32_t numero, int64_t scartoUs) {
  if (scartoUs > cont.scartoMaxUs) cont.scartoMaxUs = scartoUs;
  leggiSeriale();
  leggiSensore();
  siringa::passo();
  const uint32_t tMs = millis();
  invia("T,%lu,%lu,%ld,%d,%c,0,0.0,0.0,%ld", static_cast<unsigned long>(seqT++), static_cast<unsigned long>(tMs),
        sensoreOk ? lroundf(ultima.pressionePa) : 0L, siringa::posizione(), stato == Stato::SAFE ? 'S' : 'M',
        lroundf(ultima.temperaturaC * 100.0f));
  if (numero % CICLI_AL_SECONDO == 0) ognisecondo(tMs);
}

void taskPeriodico(void*) {
  TickType_t risveglio = xTaskGetTickCount();
  int64_t precedente = esp_timer_get_time();
  for (uint32_t numero = 1;; numero++) {
    vTaskDelayUntil(&risveglio, pdMS_TO_TICKS(PERIODO_MS));
    const int64_t adesso = esp_timer_get_time();
    const int64_t periodo = adesso - precedente;
    precedente = adesso;
    if (numero == 1) {  // il primo «periodo» va dalla nascita del task al primo risveglio: non è un periodo vero
      ciclo(numero, 0);
      continue;
    }
    if (periodo > 2 * PERIODO_US) cont.ritardi++;
    ciclo(numero, llabs(periodo - PERIODO_US));
  }
}

}  // namespace

void setup() {
  Serial.setRxBufferSize(1024);
  Serial.setTxBufferSize(4096);
  Serial.begin(BAUD);
  siringa::avvia();  // nessun impulso finché il Mac non manda S, M o E (decisione 11)
  sensoreOk = sensore::avvia();
  Serial.printf("# palombaro %s, protocollo %d, riavvio: %s, sensore %s\n", VERSIONE, VERSIONE_PROTOCOLLO,
                nomeRiavvio(), sensoreOk ? "presente" : "ASSENTE");
  invia("V,%s,%d", VERSIONE, VERSIONE_PROTOCOLLO);
  invia("X,AVVIO,MANUALE,AVVIO");
  if (!sensoreOk) entraInSafe("SENSORE");
  xTaskCreatePinnedToCore(taskPeriodico, "ciclo100Hz", 8192, nullptr, 5, nullptr, 1);
}

void loop() { vTaskDelay(portMAX_DELAY); }  // tutto il lavoro è nel task periodico
