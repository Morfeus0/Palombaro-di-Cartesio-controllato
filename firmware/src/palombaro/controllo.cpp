#include "controllo.h"

namespace controllo {
namespace {

float limita(float x, float lo, float hi) { return x < lo ? lo : (x > hi ? hi : x); }

}  // namespace

void azzera(Pi& pi, float uIniziale) { pi.integrale = uIniziale; }

float passo(Pi& pi, float errorePa) {
  // Integrale con il metodo dei rettangoli; anti-windup per «clamping»: a fine corsa l'integrale si aggiorna solo
  // se l'errore lo riporta verso l'interno (con Tustin un errore grande appena finito spingerebbe nel verso sbagliato).
  const float proporzionale = pi.kp * errorePa;
  const float nuovo = pi.integrale + pi.ki * errorePa * pi.ts;
  const float libero = proporzionale + nuovo;
  const bool spingeOltre = (libero > pi.uMax && errorePa > 0.0f) || (libero < pi.uMin && errorePa < 0.0f);
  if (!spingeOltre) pi.integrale = nuovo;
  return limita(proporzionale + pi.integrale, pi.uMin, pi.uMax);
}

void azzera(Pid& pid, float misuraIniziale) {
  pid.integrale = 0.0f;
  pid.derivata = 0.0f;
  pid.misuraPrec = misuraIniziale;
}

float passo(Pid& pid, float rifM, float misuraM) {
  const float errore = misuraM - rifM;
  // Derivata filtrata Kd·s/(1 + s/N) della misura, con Tustin:
  // d_k = a·d_(k−1) + b·(m_k − m_(k−1)),  a = (2 − N·Ts)/(2 + N·Ts),  b = 2·Kd·N/(2 + N·Ts)
  const float den = 2.0f + pid.n * pid.ts;
  pid.derivata = (2.0f - pid.n * pid.ts) / den * pid.derivata
                 + 2.0f * pid.kd * pid.n / den * (misuraM - pid.misuraPrec);
  pid.misuraPrec = misuraM;
  const float proporzionale = pid.kp * errore;
  const float nuovo = pid.integrale + pid.ki * errore * pid.ts;
  const float libero = proporzionale + nuovo + pid.derivata;
  const bool spingeOltre = (libero > pid.uMax && errore > 0.0f) || (libero < pid.uMin && errore < 0.0f);
  if (!spingeOltre) pid.integrale = nuovo;
  return limita(proporzionale + pid.integrale + pid.derivata, pid.uMin, pid.uMax);
}

void azzera(OnOff& oo) { oo.spinge = false; }

float passo(OnOff& oo, float rifM, float misuraM) {
  const float errore = misuraM - rifM;
  if (errore > oo.isteresi) oo.spinge = true;        // P1 troppo in alto: più pressione
  else if (errore < -oo.isteresi) oo.spinge = false; // troppo in basso: meno pressione
  return oo.spinge ? oo.ampiezza : -oo.ampiezza;
}

}  // namespace controllo
