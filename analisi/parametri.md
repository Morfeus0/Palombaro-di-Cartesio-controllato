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

> Completata il 5 novembre con i dati già raccolti (Claude). Le voci «stima» si potranno raffinare con una pesata
> di P1 sul bilancino all'estrazione (decisione di Gabriele) e con l'identificazione (3.4).

### Siringa e servo

| Grandezza | Valore | Fonte |
|---|---|---|
| Corsa utile del servo | 36°–146° (110°) | limiti del firmware (1.7, 2.5) |
| Volume per grado | **0,16 ml/°** (al centro della corsa; la leva non è lineare agli estremi) | tabella comando → ml del 23 ottobre: 86° ≈ 11 ml, 136° ≈ 3 ml |
| Volume spostato da 36° a 146° | circa **17,6 ml** | stessa tabella |
| Gioco a ogni inversione | circa 10° (circa 1,6 ml) | 23 ottobre |

### Aria del circuito

Con la legge di Boyle, Δp/p = ΔV/V: dal guadagno misurato si ricava il volume d'aria «efficace», che comprende anche
le pareti della bottiglia che cedono.

| Misura | Δp per la corsa 36°→146° | Guadagno K_v | Volume efficace p/K_v |
|---|---|---|---|
| 1 novembre, subito dopo la chiusura | +3,6…+4,0 kPa | circa 0,21 kPa/ml | circa 480 ml |
| 5 novembre, 16:13 (circuito chiuso a 36°) | +2,8…+2,9 kPa (picco, poi cede) | **0,16 kPa/ml** | **circa 640 ml** |

Aria «vera»: la parte vuota della bottiglia da 1,5 L sopra l'acqua (circa 150–200 ml, dopo i 50 ml d'acqua aggiunti il
23 ottobre), il tubo B (65 cm, 4 mm interni: circa 8 ml) e la siringa (fino a circa 18 ml): **circa 180–230 ml**. Le
pareti valgono quindi altri **250–450 ml**, più dei 210–235 ml stimati il 18 ottobre con un'altra configurazione: il
cedimento dipende da quanto è stata compressa la bottiglia e da quanto tempo prima. Per il modello si usa il valore
misurato più vicino alle prove della 3.3, **K_v = 157 Pa/ml** (`analisi/modello.m`); la differenza tra le due sessioni è
uno dei motivi per tenere un anello integrale sulla pressione (fase 4).

- **Perdita del circuito:** circa 40 Pa al minuto a +3,6 kPa (1 novembre), cioè una costante di tempo di circa
  **90 minuti**; il 5 novembre, in un'ora con tratti in pressione, la pressione a 36° è scesa di 0,28 kPa.
- **Rientro delle pareti in depressione:** a 36° dopo una chiusura a 56° la pressione è risalita da 101,54 a 101,68 kPa
  in 3 minuti (5 novembre): in depressione le pareti cedono più facilmente e lentamente.

### Palombaro P1

| Grandezza | Valore | Fonte |
|---|---|---|
| Pipetta tagliata | circa 6 cm, foro di 6–7 mm con ugello di 15 mm incollato | 19 ottobre |
| Rame | 0,8 mm, 55 cm, **2,35 g** (0,26 ml) | 19 ottobre, bilancino |
| Massa a secco | **3,05 g** prima dell'ugello | 19 ottobre, bilancino (±0,02 g) |
| Volume interno | circa 2,3 ml | pesata pieno d'acqua, poco affidabile (esce acqua dal foro) |
| Volume dei materiali V_s | circa 1,0 ml (stima: plastica, rame, nastro) | — |
| Bolla all'equilibrio V_b | circa **2,1 ml** (stima) | proposta e taratura; le pesate con l'acqua dentro non erano affidabili |
| Massa con l'acqua interna m = ρ(V_s + V_b) | circa **3,09 g** | condizione di equilibrio |
| Spinta per kPa, b_p = ρ g V_b / p_b | **0,020 g per kPa** (1,98·10⁻⁷ N/Pa) | modello; la taratura del 19 ottobre stimava «circa 0,02 g per kPa» |
| Pressione nella bolla all'equilibrio p_b* | **103,60 kPa** (soglia dal fondo 101,64 kPa + ρg × 0,20 m) | 5 novembre |
| Deriva della soglia | da −0,2 kPa al giorno a galla fino a −0,2 kPa all'ora sul fondo in pressione | 28 ottobre – 5 novembre |

**Nota sulle incertezze.** V_b e V_s non sono misurati direttamente; ma la loro incertezza pesa poco sul modello:
la pendenza dell'equilibrio (ρg) non ne dipende, e nel polo instabile entra solo il rapporto b_p/m_eff, che la 3.4
ricava direttamente dalle fughe.
