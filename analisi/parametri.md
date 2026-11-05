# Parametri statici del banco (sottofase 3.2)

> Anticipata al 5 novembre 2026 (decisione di Gabriele; nel piano era 10–11 novembre).
> Dati: `dati/2026-11-05/`. Programma: `pc/equilibrio.py` (3 test).

## 1. Pressione di equilibrio in funzione della quota

### Che cosa si misura

P1 sta fermo a una quota `z` quando la sua bolla ha il volume che pareggia il peso. La bolla sente la pressione
dell'aria della bottiglia più quella dell'acqua che ha sopra, ρ·g·(H − z): salendo, l'acqua sopra diminuisce, e
per tenere la bolla uguale serve più pressione nella bottiglia. La teoria dà una retta

    Δp_eq(z) = Δp_eq(0) + ρ·g·z,     ρ·g = 997,6 kg/m³ × 9,806 m/s² = 0,0978 kPa/cm  (acqua a 22,7 °C)

con la pendenza che non dipende da P1 (solo dall'acqua) e l'intercetta che dice quanto P1 è pesante.

### Come

- **Quota 0 (P1 fermo sul fondo):** la soglia di distacco, scendendo con il servo a passi di 4° e circa 10 s per passo
  (17:08): si stacca a 58°, **+0,19 kPa**. Alle 16:13, a passi di 10°, era a 56°, +0,15…+0,18 kPa.
- **Quote intermedie, P1 tenuto a mano dalla dashboard:** P1 non sta mai fermo (è instabile), oscilla di ±1–2 cm.
  In un tratto lontano dal fondo e dalla superficie si prende il pezzo tra il primo e l'ultimo passaggio verso l'alto
  per la quota media del tratto: lì P1 parte e arriva alla stessa quota nello stesso verso, quindi in media non
  accelera, e la pressione media del pezzo è quella di equilibrio alla quota media (modello lineare
  z'' = −a·(p − p_eq(z)) − b·z'). Pezzi di almeno 15 s.
- Sovrapressione rispetto alla stanza alla chiusura del circuito (101,64 kPa, 16:08:42, servo a 36°).
- Le medie su finestre fisse di 4 s, provate prima, davano punti sparsi di ±0,4 kPa e una pendenza di 0,129 kPa/cm:
  una finestra che taglia l'oscillazione a metà non ha accelerazione media nulla.

### Punti

| File | Tratto | Quota media [cm] | Δp di equilibrio [kPa] |
|---|---|---|---|
| soglia dal fondo (registro, 17:08) | — | 0,00 | +0,19 |
| `2026-11-05_prova_01.csv` | 46–64 s | 11,81 | +1,379 |
| `2026-11-05_prova_01.csv` | 92–116 s | 8,11 | +1,021 |
| `2026-11-05_prova_03.csv` | 32–69 s | 13,78 | +1,648 |
| `2026-11-05_prova_04.csv` | 44–86 s | 12,50 | +1,547 |
| `2026-11-05_tenute_01.csv` | 134–185 s | 13,94 | +1,369 |
| `2026-11-05_tenute_01.csv` | 235–259 s | 9,46 | +1,150 |

### Retta e confronto con la teoria

| | Pendenza [kPa/cm] | Intercetta [kPa] |
|---|---|---|
| **7 punti (con il fondo)** | **0,098 ± 0,010** | +0,21 ± 0,10 |
| 6 punti (solo le tenute, 8–14 cm) | 0,088 ± 0,023 | +0,33 ± 0,28 |
| **Teoria ρ·g** | **0,0978** | — |

**La pendenza misurata coincide con ρ·g entro l'incertezza (±10 %).** Scarto quadratico medio dei punti dalla
retta: 0,10 kPa, cioè circa 1 cm di quota. L'intercetta (+0,21 kPa) torna con la soglia misurata sul fondo.

### Limiti

- Le tenute a mano coprono solo 8–14 cm: a 3 cm (troppo vicino al fondo) e a 15 cm non sono riuscite. La pendenza
  la tiene soprattutto il punto sul fondo; senza, l'incertezza sale a ±25 %.
- Il riferimento di 101,64 kPa è la stanza alla chiusura; la deriva di P1 nella sessione è piccola
  (soglia dal fondo da +0,15…+0,18 alle 16:13 a +0,19 kPa alle 17:08).
- Con il controllo automatico (fase 4) le tenute saranno strette e si potranno ripetere su tutta la colonna.

## 2. Massa, volumi e volume d'aria del circuito

Da completare: dai dati della siringa (ml per comando) e della corsa (kPa tra 36° e 146°), più l'eventuale pesata
di P1 sul bilancino all'estrazione (decisione di Gabriele).
