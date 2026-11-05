#pragma once
// Regolatori del firmware 0.2 (sottofasi 4.1–4.5): funzioni pure, senza Arduino, provate sul Mac (pio test).
// Progetto e guadagni: analisi/progetto_controllori.m.
//
// Cascata (docs/protocollo.md): l'anello esterno sulla quota sceglie una correzione della pressione, che si somma
// all'equilibrio stimato alla quota voluta; l'anello interno PI muove il servo finché la pressione è quella voluta.
// Convenzioni: quote in metri, pressioni in pascal, servo in gradi. Più pressione = P1 scende.

namespace controllo {

// PI sulla pressione: errore = p_voluta − p_misurata [Pa] → angolo del servo [°], con anti-windup a fine corsa.
struct Pi {
  float kp;      // °/Pa
  float ki;      // °/(Pa·s)
  float ts;      // s
  float uMin;    // °
  float uMax;    // °
  float integrale = 0.0f;
};

// PID sulla quota: correzione della pressione [Pa] = Kp·e + Ki·∫e + derivata filtrata della MISURA,
// con e = h_misurata − h_voluta (P1 troppo in alto → più pressione). La derivata sulla misura non dà un colpo
// quando cambia il riferimento; è filtrata (N) e discretizzata con Tustin.
struct Pid {
  float kp;      // Pa/m
  float ki;      // Pa/(m·s)
  float kd;      // Pa·s/m
  float n;       // 1/s, banda del filtro sul derivativo
  float ts;      // s
  float uMin;    // Pa
  float uMax;    // Pa
  float integrale = 0.0f;
  float derivata = 0.0f;
  float misuraPrec = 0.0f;
};

// On-Off con isteresi: ±ampiezza [Pa]; cambia solo quando l'errore esce dalla fascia ±isteresi [m].
struct OnOff {
  float isteresi;   // m
  float ampiezza;   // Pa
  bool spinge = false;
};

void azzera(Pi& pi, float uIniziale);           // l'integrale parte dal comando attuale: nessun salto del servo
float passo(Pi& pi, float errorePa);

void azzera(Pid& pid, float misuraIniziale);
float passo(Pid& pid, float rifM, float misuraM);

void azzera(OnOff& oo);                          // parte tirando: P1 sale (dal fondo è l'unica cosa che serve)
float passo(OnOff& oo, float rifM, float misuraM);

}  // namespace controllo
