#pragma once
// Servo che muove lo stantuffo (sottofase 1.7), comandato in decimi di grado (decisione 6 della 2.4).
#include <cstdint>

namespace siringa {

constexpr int DECIMI_MIN = 360;     // 36°: sotto, il 23 ottobre la siringa si era spostata
constexpr int DECIMI_MAX = 1460;    // 146°: oltre, la prolunga può urtare il servo
constexpr int DECIMI_SAFE = DECIMI_MAX;  // SAFE: stantuffo spinto, P1 a fondo (decisione 3)

// All'accensione il servo non riceve impulsi e resta dov'è (decisione 11).
void avvia();

// Nuovo obiettivo, già dentro i limiti. Il primo comando dopo l'accensione porta il servo lì senza rampa,
// perché la posizione di partenza non si conosce: va mandata la posizione in cui si trova già.
void vaiA(int decimi);

// Ferma il servo dov'è (SAFE per sovrapressione).
void ferma();

// Un passo della rampa, da chiamare a ogni ciclo da 10 ms: circa 0,7° per ciclo, come il grado ogni 15 ms di oggi.
void passo();

// Decimi di grado per ciclo della rampa (0.2): 7 (70 °/s) in MANUALE e SAFE, 20 (200 °/s) con i controllori.
constexpr int VELOCITA_MANUALE = 7;
constexpr int VELOCITA_CONTROLLO = 20;
void velocita(int decimiPerCiclo);

bool attivo();     // ha ricevuto almeno un comando
int posizione();   // decimi di grado comandati in questo momento; -1 se non è ancora attivo

}  // namespace siringa
