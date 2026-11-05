#include "siringa.h"

#include <Arduino.h>
#include <ESP32Servo.h>

namespace siringa {
namespace {

constexpr int PIN_SERVO = 18;
constexpr int US_A_0_GRADI = 500;
constexpr int US_A_180_GRADI = 2400;
int passoDecimi = VELOCITA_MANUALE;   // per ciclo da 10 ms

Servo servo;
bool attivoOra = false;
int attuale = -1;
int obiettivo = -1;

void scrivi(int decimi) {
  const int us = US_A_0_GRADI + (decimi * (US_A_180_GRADI - US_A_0_GRADI) + 900) / 1800;
  servo.writeMicroseconds(us);
}

}  // namespace

void avvia() { servo.setPeriodHertz(50); }

void vaiA(int decimi) {
  obiettivo = constrain(decimi, DECIMI_MIN, DECIMI_MAX);
  if (!attivoOra) {
    servo.attach(PIN_SERVO, US_A_0_GRADI, US_A_180_GRADI);
    attuale = obiettivo;
    scrivi(attuale);
    attivoOra = true;
  }
}

void ferma() { obiettivo = attuale; }

void passo() {
  if (!attivoOra || attuale == obiettivo) return;
  const int differenza = obiettivo - attuale;
  attuale += constrain(differenza, -passoDecimi, passoDecimi);
  scrivi(attuale);
}

void velocita(int decimiPerCiclo) { passoDecimi = constrain(decimiPerCiclo, 1, VELOCITA_CONTROLLO); }

bool attivo() { return attivoOra; }

int posizione() { return attivoOra ? attuale : -1; }

}  // namespace siringa
