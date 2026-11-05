#include "protocollo.h"

#include <cctype>
#include <cerrno>
#include <cstdio>
#include <cstdlib>
#include <cstring>

namespace protocollo {

uint8_t controllo(const char* corpo, size_t lunghezza) {
  uint8_t cc = 0;
  for (size_t i = 0; i < lunghezza; i++) cc ^= static_cast<uint8_t>(corpo[i]);
  return cc;
}

size_t componi(char* buf, size_t capienza, const char* corpo) {
  const size_t lunghezza = strlen(corpo);
  const size_t totale = lunghezza + 4;  // '$' + corpo + '*' + due cifre
  if (totale > RIGA_MAX || totale + 2 > capienza) return 0;
  const int scritti = snprintf(buf, capienza, "$%s*%02X\n", corpo, controllo(corpo, lunghezza));
  return scritti > 0 ? static_cast<size_t>(scritti) : 0;
}

namespace {

int cifraEsadecimale(char c) {
  if (c >= '0' && c <= '9') return c - '0';
  if (c >= 'A' && c <= 'F') return c - 'A' + 10;
  return -1;
}

}  // namespace

Esito analizza(char* riga, Messaggio& m) {
  if (riga[0] != '$') return Esito::NON_PROTOCOLLO;
  const size_t lunghezza = strlen(riga);
  if (lunghezza > RIGA_MAX || lunghezza < 5 || riga[lunghezza - 3] != '*') return Esito::FORMATO;
  const int alta = cifraEsadecimale(riga[lunghezza - 2]);
  const int bassa = cifraEsadecimale(riga[lunghezza - 1]);
  if (alta < 0 || bassa < 0) return Esito::FORMATO;
  char* corpo = riga + 1;
  const size_t lunghezzaCorpo = lunghezza - 4;
  if (controllo(corpo, lunghezzaCorpo) != alta * 16 + bassa) return Esito::CONTROLLO;
  corpo[lunghezzaCorpo] = '\0';  // via "*CC"

  char* virgola = strchr(corpo, ',');
  const size_t lunghezzaTipo = virgola ? static_cast<size_t>(virgola - corpo) : strlen(corpo);
  if (lunghezzaTipo < 1 || lunghezzaTipo > 2) return Esito::FORMATO;
  for (size_t i = 0; i < lunghezzaTipo; i++) {
    if (!isupper(static_cast<unsigned char>(corpo[i]))) return Esito::FORMATO;
  }
  memcpy(m.tipo, corpo, lunghezzaTipo);
  m.tipo[lunghezzaTipo] = '\0';
  m.n = 0;
  while (virgola) {
    if (m.n == CAMPI_MAX) return Esito::FORMATO;
    *virgola = '\0';
    m.campi[m.n++] = virgola + 1;
    virgola = strchr(virgola + 1, ',');
  }
  return Esito::OK;
}

bool intero(const char* testo, long& valore) {
  if (testo == nullptr || *testo == '\0' || isspace(static_cast<unsigned char>(*testo))) return false;
  char* fine = nullptr;
  errno = 0;
  const long v = strtol(testo, &fine, 10);
  if (errno != 0 || *fine != '\0') return false;
  valore = v;
  return true;
}

bool decimale(const char* testo, float& valore) {
  if (testo == nullptr || *testo == '\0' || isspace(static_cast<unsigned char>(*testo))) return false;
  for (const char* c = testo; *c != '\0'; c++) {
    // solo cifre, segno e punto: niente «nan», «inf», esponenti o virgole
    if (!isdigit(static_cast<unsigned char>(*c)) && *c != '.' && *c != '-' && *c != '+') return false;
  }
  char* fine = nullptr;
  errno = 0;
  const float v = strtof(testo, &fine);
  if (errno != 0 || *fine != '\0') return false;
  valore = v;
  return true;
}

}  // namespace protocollo
