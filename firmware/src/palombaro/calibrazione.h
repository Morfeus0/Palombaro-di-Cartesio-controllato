#pragma once
// Stato CALIBRAZIONE del firmware 0.2 (sottofase 4.2): trova p0, la pressione di equilibrio con P1 sul fondo,
// cioè l'altezza della retta p_eq(h) = p0 + rho g h (3.2) che l'anello esterno usa come punto di partenza.
// Fasi: FONDO (pressione alta finché P1 è fermo sul fondo) → DISCESA (rampa lenta finché P1 si stacca) → FATTA.
// Funzioni pure, senza Arduino, provate sul Mac (pio test). La pressione voluta la insegue l'anello interno PI.
#include <cstdint>

namespace calibrazione {

struct Parametri {
  float sovrapressioneFondoPa = 1500.0f; // sopra la pressione di partenza, per mandare P1 sul fondo
  uint32_t fondoMinMs = 6000;            // almeno tanto in FONDO
  float quotaFondoM = 0.010f;            // sotto questa quota P1 è sul fondo (appoggiato storto si legge fino a 0,6 cm)
  uint32_t fermoSulFondoMs = 3000;       // ... da almeno tanto
  float partenzaDiscesaPa = 600.0f;      // la rampa parte da qui (sopra la pressione di partenza)
  float rampaPaS = 30.0f;                // velocità della discesa
  float quotaStaccoM = 0.015f;           // sopra questa quota P1 si è staccato
  float ritardoStaccoS = 4.0f;           // quanto ci mette P1 da staccato ad arrivare a quotaStacco (3.3: 4,4–5,7 s)
  float discesaMaxPa = 3000.0f;          // se P1 non si stacca dopo tanta discesa, la calibrazione fallisce
  // 9 nov: nei primi 3 s della discesa (90 Pa) P1 deve restare sotto quotaFondo. Se si stacca prima, la rampa è
  // partita già sotto la soglia (calibrazione avviata con la pressione troppo bassa) e p0 uscirebbe troppo basso.
  // Errori più piccoli di circa 100 Pa non li vede: per quelli resta la regola di partire poco sopra la soglia.
  uint32_t fermoInizioDiscesaMs = 3000;
};

// FALLITA: P1 non si stacca mai; PARTENZA_BASSA: si stacca subito (si riparte con la pressione più alta).
enum class Fase { FONDO, DISCESA, FATTA, FALLITA, PARTENZA_BASSA };

struct Stato {
  Fase fase = Fase::FONDO;
  float pPartenza = 0.0f;
  float pVoluta = 0.0f;
  uint32_t msInFase = 0;
  uint32_t msSulFondo = 0;
  float p0 = 0.0f;                       // risultato, valido quando fase == FATTA
};

void avvia(Stato& st, float pMisurata);

// Un passo (dtMs): restituisce la pressione voluta [Pa]. quotaValida = la quota è fresca e P1 è visto.
float passo(Stato& st, const Parametri& par, uint32_t dtMs, bool quotaValida, float quotaM);

}  // namespace calibrazione
