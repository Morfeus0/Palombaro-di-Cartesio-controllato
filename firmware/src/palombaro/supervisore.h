#pragma once
// Regole di sicurezza del firmware 0.2 (sottofase 4.2; docs/protocollo.md sezione 6, decisioni 9 e 10).
// Funzioni pure, senza Arduino, provate sul Mac (pio test). L'ESP32 decide da solo di andare in SAFE;
// da SAFE si esce solo con un comando M di una persona.
#include <cstdint>

namespace supervisore {

enum class Stato { MANUALE, CALIBRAZIONE, HOLD, SAFE };

struct Soglie {
  // 10 nov sera (Gabriele: «sii più chill»): l'avvio del video ferma il Mac fino a 1,15 s e la telecamera fino a 1,9 s;
  // in una pausa il PI della pressione tiene l'ultima pressione voluta e P1 deriva piano (costante di tempo circa 3 s)
  uint32_t macMutoMs = 2000;        // nessuna riga valida dal Mac (né Z né B); era 500 ms
  uint32_t quotaMutaMs = 2500;      // nessuna quota nuova (telecamera ferma); 9 nov: 300 ms (pause di 184 e 256 ms);
                                    // 10 nov: una pausa di oltre 300 ms in HOLD; poi 600 ms, sopra macMutoMs: la quota
                                    // si conta dal fotogramma (qualche ms prima dell'arrivo), quindi con soglie uguali
                                    // un Mac fermo risultava sempre TELECAMERA_MUTA e MAC_MUTO non compariva (decisione)
  // erroreMaxM ed erroreLungoMs: decisione di Gabriele del 9 novembre (6 cm per più di 5 s)
  float pressioneMaxPa = 106500.0f; // decisione 9: +5 kPa sopra 101,5 kPa
  float erroreMaxM = 0.06f;         // errore di quota «grande» (proposta, piano 4.2)
  uint32_t erroreLungoMs = 5000;    // ... per più di 5 s
};

struct Ingressi {
  Stato stato = Stato::MANUALE;
  uint32_t msDaRigaMac = 0;
  uint32_t msDaQuota = 0;
  int vista = 0;                    // 0 trovato, 1 buco breve, 2 perso (riga Z)
  float pressionePa = 0.0f;
  bool sensoreOk = true;
  uint32_t msErroreGrande = 0;      // da quanto l'errore di quota supera erroreMaxM
};

// Il motivo per andare in SAFE (come nella riga X), oppure nullptr se va tutto bene.
// In MANUALE contano solo pressione e sensore; negli stati automatici anche Mac, telecamera, P1 ed errore.
const char* motivoSafe(const Ingressi& in, const Soglie& s);

// Aggiorna il tempo passato con l'errore di quota sopra la soglia; torna a zero appena l'errore è piccolo.
uint32_t aggiornaErroreGrande(uint32_t msPrima, float erroreM, uint32_t dtMs, const Soglie& s);

}  // namespace supervisore
