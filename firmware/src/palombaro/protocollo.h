#pragma once
// Righe del protocollo tra Mac ed ESP32 (docs/protocollo.md, sezione 3): "$TIPO,campo,campo*CC\n", dove CC è lo XOR
// dei byte tra '$' e '*' in due cifre esadecimali. Funzioni pure, senza Arduino: si provano sul Mac (pio test).
#include <cstddef>
#include <cstdint>

namespace protocollo {

constexpr size_t RIGA_MAX = 96;  // caratteri, '\n' escluso: le righe più lunghe si scartano
constexpr size_t CAMPI_MAX = 10;

enum class Esito { OK, NON_PROTOCOLLO, CONTROLLO, FORMATO };

struct Messaggio {
  char tipo[3];                    // una o due lettere
  size_t n;                        // quanti campi
  const char* campi[CAMPI_MAX];    // puntano dentro la riga analizzata
};

uint8_t controllo(const char* corpo, size_t lunghezza);

// Scrive "$<corpo>*CC\n" in buf; restituisce la lunghezza, 0 se non ci sta o supera RIGA_MAX.
size_t componi(char* buf, size_t capienza, const char* corpo);

// Analizza una riga senza '\n' e la spezza sul posto (le virgole diventano '\0').
Esito analizza(char* riga, Messaggio& m);

// Un numero intero scritto tutto e solo con cifre (e un segno davanti).
bool intero(const char* testo, long& valore);

}  // namespace protocollo
