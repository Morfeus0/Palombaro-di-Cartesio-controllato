// Firmware 0.2 del palombaro (sottofasi 4.2–4.5): stati MANUALE, CALIBRAZIONE, HOLD e SAFE, con i controllori.
// Contratto: docs/protocollo.md (versione 1, più i comandi R e K e la riga C descritti lì). 0.1: sottofase 2.5.
//
// Tutto gira in un solo ciclo periodico da 10 ms (100 Hz), in un task di FreeRTOS: lettura dei messaggi dal Mac,
// lettura del sensore, controllori, regole di sicurezza, un passo della rampa del servo e la telemetria T.
// Cascata (analisi/progetto_controllori.m): ogni 3 cicli l'anello esterno sulla quota sceglie la pressione voluta
// (equilibrio stimato p0 + rho g h_rif, più la correzione del PID o dell'On-Off); a ogni ciclo l'anello interno PI
// muove il servo finché la pressione è quella voluta. Le parti senza Arduino (controllo, supervisore, calibrazione,
// protocollo) hanno i loro test sul Mac: pio test -e protocollo.
#include <Arduino.h>
#include <cmath>
#include <cstdarg>
#include <cstdlib>
#include <cstring>
#include <esp_system.h>
#include <esp_timer.h>

#include "calibrazione.h"
#include "controllo.h"
#include "protocollo.h"
#include "sensore.h"
#include "siringa.h"
#include "supervisore.h"

namespace {

using supervisore::Stato;

constexpr const char* VERSIONE = "0.2";
constexpr int VERSIONE_PROTOCOLLO = 1;
constexpr uint32_t BAUD = 460800;                 // decisione 1
constexpr uint32_t PERIODO_MS = 10;               // 100 Hz
constexpr int64_t PERIODO_US = PERIODO_MS * 1000;
constexpr uint32_t CICLI_AL_SECONDO = 1000 / PERIODO_MS;
constexpr uint32_t CICLI_ANELLO_ESTERNO = 3;      // 30 ms: circa 33 Hz, la quota arriva a 60 Hz
constexpr float RHO_G = 9782.5f;                  // Pa/m, pendenza della retta di equilibrio (3.1, 3.2)
constexpr long QUOTA_RIF_MIN_DMM = 100;           // 1 cm
constexpr long QUOTA_RIF_MAX_DMM = 1700;          // 17 cm: oltre c'è il menisco della superficie

struct Contatori {
  uint32_t errControllo = 0;
  uint32_t errFormato = 0;
  uint32_t persi = 0;       // salti nei numeri di sequenza di Z e B
  uint32_t letture = 0;     // letture valide del sensore nell'ultimo secondo
  int64_t scartoMaxUs = 0;  // massimo |periodo − 10 ms| nell'ultimo secondo
  uint32_t ritardi = 0;     // cicli arrivati in ritardo di più di un periodo (dall'avvio)
};

struct Quota {
  bool ricevuta = false;
  float m = 0.0f;           // metri sopra P1 fermo sul fondo
  uint32_t istanteMs = 0;   // millis() dell'istante a cui si riferisce (arrivo − età)
  long etaMs = 0;
  int vista = 2;            // 0 trovato, 1 buco breve, 2 perso
};

// Guadagni iniziali dal progetto in simulazione (analisi/progetto_controllori.m, 5 novembre): PI della pressione
// 0,02 °/Pa e 0,4 °/(Pa·s); PID della quota 475 Pa/cm, 11,9 Pa/(cm·s), 400 Pa·s/cm, N = 10. Si cambiano con K.
controllo::Pi pi{0.02f, 0.4f, 0.01f, 36.0f, 146.0f};
controllo::Pid pid{47500.0f, 1190.0f, 40000.0f, 10.0f, 0.03f, -2000.0f, 2000.0f};
controllo::OnOff onOff{0.005f, 700.0f};
bool usaOnOff = false;
supervisore::Soglie soglie;
calibrazione::Parametri parCalibrazione;
calibrazione::Stato statoCalibrazione;

Stato stato = Stato::MANUALE;
Contatori cont;
bool sensoreOk = false;
sensore::Lettura ultima{0.0f, 0.0f};
Quota quota;
uint32_t ultimaRigaMacMs = 0;
uint32_t msErroreGrande = 0;
bool p0Noto = false;
float p0 = 0.0f;                  // Pa, pressione di equilibrio con P1 sul fondo
float quotaRif = 0.05f;           // m
float pVoluta = 0.0f;             // Pa, riferimento dell'anello interno (0 in MANUALE e SAFE)
float correzione = 0.0f;          // Pa, uscita dell'anello esterno
uint32_t seqT = 0;
uint32_t seqC = 0;
long ultimaSeqZ = -1;
long ultimaSeqB = -1;
char riga[protocollo::RIGA_MAX + 1];
size_t lunghezzaRiga = 0;
bool rigaTroppoLunga = false;

const char* nomeStato(Stato s) {
  switch (s) {
    case Stato::CALIBRAZIONE: return "CALIBRAZIONE";
    case Stato::HOLD: return "HOLD";
    case Stato::SAFE: return "SAFE";
    default: return "MANUALE";
  }
}

char letteraStato(Stato s) {
  switch (s) {
    case Stato::CALIBRAZIONE: return 'C';
    case Stato::HOLD: return 'H';
    case Stato::SAFE: return 'S';
    default: return 'M';
  }
}

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

bool automatico(Stato s) { return s == Stato::CALIBRAZIONE || s == Stato::HOLD; }

void cambiaStato(Stato nuovo, const char* motivo) {
  if (nuovo == stato) return;
  invia("X,%s,%s,%s", nomeStato(stato), nomeStato(nuovo), motivo);
  stato = nuovo;
  siringa::velocita(automatico(nuovo) ? siringa::VELOCITA_CONTROLLO : siringa::VELOCITA_MANUALE);
  if (!automatico(nuovo)) pVoluta = 0.0f;
}

// SAFE (decisioni 3 e 9): stantuffo spinto e P1 a fondo; per sovrapressione invece il servo si ferma dov'è.
void entraInSafe(const char* motivo) {
  cambiaStato(Stato::SAFE, motivo);
  if (strcmp(motivo, "PRESSIONE") == 0) siringa::ferma(); else siringa::vaiA(siringa::DECIMI_SAFE);
}

bool quotaFresca(uint32_t adessoMs) {
  return quota.ricevuta && quota.vista != 2 && adessoMs - quota.istanteMs <= soglie.quotaMutaMs;
}

void contaSequenza(long seq, long& ultimaSeq) {
  if (ultimaSeq >= 0 && seq > ultimaSeq + 1) cont.persi += static_cast<uint32_t>(seq - ultimaSeq - 1);
  ultimaSeq = seq;
}

void rigaQuota(const protocollo::Messaggio& m) {
  long seq = 0, dmm = 0, eta = 0, vista = 0;
  if (m.n != 4 || !protocollo::intero(m.campi[0], seq) || !protocollo::intero(m.campi[1], dmm) ||
      !protocollo::intero(m.campi[2], eta) || !protocollo::intero(m.campi[3], vista) || eta < 0) {
    cont.errFormato++;
    return;
  }
  contaSequenza(seq, ultimaSeqZ);
  quota.ricevuta = true;
  quota.m = static_cast<float>(dmm) / 10000.0f;
  quota.etaMs = eta;
  quota.istanteMs = millis() - static_cast<uint32_t>(eta);
  quota.vista = static_cast<int>(vista);
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

// Avvio degli anelli: l'integrale del PI parte dalla posizione attuale del servo, così il servo non salta.
void avviaControllo() {
  controllo::azzera(pi, static_cast<float>(siringa::posizione()) / 10.0f);
  controllo::azzera(pid, quota.m);
  controllo::azzera(onOff);
  msErroreGrande = 0;
}

void comandoModalita(const protocollo::Messaggio& m) {
  const uint32_t adesso = millis();
  if (m.n != 1) {
    cont.errFormato++;
    return;
  }
  const char* richiesta = m.campi[0];
  if (strcmp(richiesta, "SAFE") == 0) {
    entraInSafe("RICHIESTA");
    invia("OK,M");
  } else if (strcmp(richiesta, "MANUALE") == 0) {
    if (!sensoreOk) { invia("NO,M,SENSORE"); return; }
    siringa::ferma();                             // da qualunque stato: il servo resta dov'è
    cambiaStato(Stato::MANUALE, "RICHIESTA");
    invia("OK,M");
  } else if (strcmp(richiesta, "CALIBRAZIONE") == 0 || strcmp(richiesta, "HOLD") == 0) {
    const bool hold = strcmp(richiesta, "HOLD") == 0;
    if (stato == Stato::SAFE) { invia("NO,M,SAFE"); return; }       // prima MANUALE: decide una persona
    if (!sensoreOk) { invia("NO,M,SENSORE"); return; }
    if (!siringa::attivo()) { invia("NO,M,SERVO_FERMO"); return; }  // il servo deve aver ricevuto S
    if (!quotaFresca(adesso)) { invia("NO,M,QUOTA"); return; }
    if (hold && !p0Noto) { invia("NO,M,EQUILIBRIO"); return; }      // serve CALIBRAZIONE o K,E
    avviaControllo();
    if (!hold) calibrazione::avvia(statoCalibrazione, ultima.pressionePa);
    cambiaStato(hold ? Stato::HOLD : Stato::CALIBRAZIONE, "RICHIESTA");
    invia("OK,M");
  } else {
    invia("NO,M,NON_DISPONIBILE");                // TRACKING arriva con la fase 5
  }
}

void comandoRiferimento(const protocollo::Messaggio& m) {
  long dmm = 0;
  if (m.n != 1 || !protocollo::intero(m.campi[0], dmm)) {
    cont.errFormato++;
  } else if (dmm < QUOTA_RIF_MIN_DMM || dmm > QUOTA_RIF_MAX_DMM) {
    invia("NO,R,FUORI_LIMITI");
  } else {
    quotaRif = static_cast<float>(dmm) / 10000.0f;
    invia("OK,R");
  }
}

// K,P,kp,ki (°/Pa, °/(Pa·s)) · K,Z,kp,ki,kd,n (Pa/cm, Pa/(cm·s), Pa·s/cm, 1/s) · K,O,isteresi_mm,ampiezza_Pa
// · K,E,p0_Pa. Z e O scelgono anche quale anello esterno usare in HOLD.
void comandoGuadagni(const protocollo::Messaggio& m) {
  float v[4] = {0, 0, 0, 0};
  const size_t valori = m.n > 0 ? m.n - 1 : 0;
  bool ok = m.n >= 2 && valori <= 4;
  for (size_t i = 0; ok && i < valori; i++) ok = protocollo::decimale(m.campi[i + 1], v[i]) && v[i] >= 0.0f;
  if (!ok) { invia("NO,K,FUORI_LIMITI"); return; }
  const char anello = m.campi[0][0];
  if (anello == 'P' && valori == 2) {
    pi.kp = v[0]; pi.ki = v[1];
  } else if (anello == 'Z' && valori == 4 && v[3] > 0.0f) {
    pid.kp = v[0] * 100.0f; pid.ki = v[1] * 100.0f; pid.kd = v[2] * 100.0f; pid.n = v[3];
    usaOnOff = false;
  } else if (anello == 'O' && valori == 2 && v[0] > 0.0f) {
    onOff.isteresi = v[0] / 1000.0f; onOff.ampiezza = v[1];
    usaOnOff = true;
  } else if (anello == 'E' && valori == 1 && v[0] > 90000.0f && v[0] < 110000.0f) {
    p0 = v[0]; p0Noto = true;
  } else {
    invia("NO,K,FUORI_LIMITI");
    return;
  }
  invia("OK,K");
}

void gestisci(const protocollo::Messaggio& m) {
  long seq = 0;
  ultimaRigaMacMs = millis();
  if (strcmp(m.tipo, "Z") == 0) {
    rigaQuota(m);
  } else if (strcmp(m.tipo, "B") == 0) {
    if (m.n == 1 && protocollo::intero(m.campi[0], seq)) contaSequenza(seq, ultimaSeqB); else cont.errFormato++;
  } else if (strcmp(m.tipo, "S") == 0) {
    comandoServo(m);
  } else if (strcmp(m.tipo, "M") == 0) {
    comandoModalita(m);
  } else if (strcmp(m.tipo, "R") == 0) {
    comandoRiferimento(m);
  } else if (strcmp(m.tipo, "K") == 0) {
    comandoGuadagni(m);
  } else if (strcmp(m.tipo, "E") == 0) {
    entraInSafe("EMERGENZA");
    invia("OK,E");
  } else if (strcmp(m.tipo, "V") == 0) {
    invia("V,%s,%d", VERSIONE, VERSIONE_PROTOCOLLO);
  } else if (strcmp(m.tipo, "P") == 0) {
    invia("NO,P,NON_DISPONIBILE");                // profili di TRACKING: fase 5
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
    return;                                       // il supervisore porta in SAFE (SENSORE)
  }
  cont.letture++;
}

void rigaC(uint32_t tMs, float proporzionale) {
  invia("C,%lu,%lu,%ld,%ld,%ld,%.1f,%.1f,%.1f,%ld", static_cast<unsigned long>(seqC++),
        static_cast<unsigned long>(tMs), lroundf(quota.m * 10000.0f), quota.etaMs, lroundf(quotaRif * 10000.0f),
        proporzionale, usaOnOff ? 0.0f : pid.integrale, usaOnOff ? 0.0f : pid.derivata, lroundf(pVoluta));
}

// I controllori: CALIBRAZIONE e HOLD scelgono la pressione voluta; il PI la insegue muovendo il servo.
void controlla(uint32_t numero, uint32_t tMs) {
  const bool fresca = quotaFresca(tMs);
  if (stato == Stato::CALIBRAZIONE) {
    pVoluta = calibrazione::passo(statoCalibrazione, parCalibrazione, PERIODO_MS, fresca, quota.m);
    if (statoCalibrazione.fase == calibrazione::Fase::FATTA) {
      p0 = statoCalibrazione.p0;
      p0Noto = true;
      Serial.printf("# calibrazione fatta: p0 = %ld Pa\n", lroundf(p0));
      avviaControllo();
      cambiaStato(Stato::HOLD, "CALIBRATO");
    } else if (statoCalibrazione.fase == calibrazione::Fase::FALLITA) {
      entraInSafe("CALIBRAZIONE");
      return;
    } else if (statoCalibrazione.fase == calibrazione::Fase::PARTENZA_BASSA) {
      Serial.println("# calibrazione annullata: P1 staccato subito, ripartire con la pressione poco sopra la soglia");
      entraInSafe("PARTENZA_BASSA");
      return;
    }
  }
  if (stato == Stato::HOLD && numero % CICLI_ANELLO_ESTERNO == 0) {
    correzione = usaOnOff ? controllo::passo(onOff, quotaRif, quota.m) : controllo::passo(pid, quotaRif, quota.m);
    pVoluta = p0 + RHO_G * quotaRif + correzione;
    msErroreGrande = supervisore::aggiornaErroreGrande(msErroreGrande, quota.m - quotaRif,
                                                       PERIODO_MS * CICLI_ANELLO_ESTERNO, soglie);
    rigaC(tMs, usaOnOff ? correzione : pid.kp * (quota.m - quotaRif));
  }
  if (automatico(stato)) {
    const float u = controllo::passo(pi, pVoluta - ultima.pressionePa);
    siringa::vaiA(static_cast<int>(lroundf(u * 10.0f)));
  }
}

void sorveglia(uint32_t tMs) {
  supervisore::Ingressi in;
  in.stato = stato;
  in.msDaRigaMac = tMs - ultimaRigaMacMs;
  in.msDaQuota = quota.ricevuta ? tMs - quota.istanteMs : 0xFFFFFFFFu;
  in.vista = quota.vista;
  in.pressionePa = ultima.pressionePa;
  in.sensoreOk = sensoreOk;
  in.msErroreGrande = msErroreGrande;
  const char* motivo = supervisore::motivoSafe(in, soglie);
  if (motivo != nullptr) entraInSafe(motivo);
}

// Una volta al secondo: salute del sensore (identità e misura continua), riconnessione, riga A.
void ognisecondo(uint32_t tMs) {
  if (sensoreOk && !sensore::sano()) {
    sensoreOk = false;
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
  const uint32_t tMs = millis();
  controlla(numero, tMs);
  sorveglia(tMs);
  siringa::passo();
  const bool aut = automatico(stato);
  invia("T,%lu,%lu,%ld,%d,%c,%ld,%.1f,%.1f,%ld", static_cast<unsigned long>(seqT++), static_cast<unsigned long>(tMs),
        sensoreOk ? lroundf(ultima.pressionePa) : 0L, siringa::posizione(), letteraStato(stato),
        lroundf(pVoluta), aut ? pi.kp * (pVoluta - ultima.pressionePa) : 0.0f, aut ? pi.integrale : 0.0f,
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
