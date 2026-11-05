#include "supervisore.h"

namespace supervisore {

const char* motivoSafe(const Ingressi& in, const Soglie& s) {
  if (in.stato == Stato::SAFE) return nullptr;
  if (!in.sensoreOk) return "SENSORE";
  if (in.pressionePa > s.pressioneMaxPa) return "PRESSIONE";
  if (in.stato == Stato::MANUALE) return nullptr;
  if (in.msDaRigaMac > s.macMutoMs) return "MAC_MUTO";
  if (in.msDaQuota > s.quotaMutaMs) return "TELECAMERA_MUTA";
  if (in.vista == 2) return "PERSO";
  if (in.msErroreGrande > s.erroreLungoMs) return "ERRORE";
  return nullptr;
}

uint32_t aggiornaErroreGrande(uint32_t msPrima, float erroreM, uint32_t dtMs, const Soglie& s) {
  const float assoluto = erroreM < 0.0f ? -erroreM : erroreM;
  return assoluto > s.erroreMaxM ? msPrima + dtMs : 0;
}

}  // namespace supervisore
