#include "calibrazione.h"

namespace calibrazione {

void avvia(Stato& st, float pMisurata) {
  st = Stato{};
  st.pPartenza = pMisurata;
}

float passo(Stato& st, const Parametri& par, uint32_t dtMs, bool quotaValida, float quotaM) {
  switch (st.fase) {
    case Fase::FONDO:
      st.pVoluta = st.pPartenza + par.sovrapressioneFondoPa;
      st.msInFase += dtMs;
      st.msSulFondo = (quotaValida && quotaM < par.quotaFondoM) ? st.msSulFondo + dtMs : 0;
      if (st.msInFase >= par.fondoMinMs && st.msSulFondo >= par.fermoSulFondoMs) {
        st.fase = Fase::DISCESA;
        st.msInFase = 0;
        st.pVoluta = st.pPartenza + par.partenzaDiscesaPa;
      }
      break;
    case Fase::DISCESA:
      if (quotaValida && quotaM > par.quotaStaccoM) {
        // P1 si è staccato già da un po': la pressione vera di stacco era più alta di quella di adesso
        st.p0 = st.pVoluta + par.rampaPaS * par.ritardoStaccoS;
        st.fase = Fase::FATTA;
        break;
      }
      // Dal tempo trascorso, non togliendo un pezzetto a ogni ciclo: in float a 32 bit (come sull'ESP32) 0,3 Pa tolti
      // da 101 640 si arrotondano ogni volta, e in 1000 cicli la rampa sbaglierebbe di 3 Pa (trovato dai test).
      st.msInFase += dtMs;
      {
        const float discesa = par.rampaPaS * static_cast<float>(st.msInFase) / 1000.0f;
        st.pVoluta = st.pPartenza + (par.partenzaDiscesaPa - discesa);
        if (discesa > par.discesaMaxPa) st.fase = Fase::FALLITA;
      }
      break;
    case Fase::FATTA:
    case Fase::FALLITA:
      break;
  }
  return st.pVoluta;
}

}  // namespace calibrazione
