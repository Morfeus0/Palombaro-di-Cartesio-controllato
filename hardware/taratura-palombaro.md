# Taratura dei palombari (sottofase 1.2)

> Si compila durante la 1.2. Le masse sono in grammi e i volumi in millilitri (1 g d'acqua = 1 ml).
> Questi valori sostituiranno i parametri provvisori del modello (`landing/sim.js`: massa 3,04 g,
> volume del materiale 1,0 ml, bolla 2,1 ml) nella 3.2.

## Formule

| Grandezza | Come si ottiene |
|---|---|
| `m_secco` | palombaro asciutto e vuoto (con rame e marcatore), sul bilancino |
| `m_pieno` | pieno d'acqua **senza aria** (tettarella montata sott'acqua), asciugato fuori |
| `V_interno` | `m_pieno − m_secco` |
| `V_materiali` | Archimede: bicchiere d'acqua sul bilancino, tara, palombaro **pieno d'acqua** appeso a un filo e tutto immerso senza toccare: la lettura è `V_materiali` |
| `m_tarato` | palombaro tarato (con la sua acqua dentro), asciugato fuori |
| `V_acqua` | `m_tarato − m_secco` |
| `V_bolla` | `V_interno − V_acqua` |
| Spinta in eccesso `E` | `(V_materiali + V_bolla) − m_secco`, in grammi: deve essere **positiva e piccola** (centesimi di grammo) |
| Pressione neutra in superficie | circa `101,3 kPa × E / V_bolla` |

Se dopo le misure si toglie o si aggiunge rame, si pesa il pezzetto (`Δm`) e si corregge:
`m_secco ± Δm` e `V_materiali ± Δm / 8,96`.

## Condizioni della prova

- Data: 
- Altezza dell'acqua nella bottiglia `H` (dal fondo alla superficie): ___ cm
- Temperatura dell'acqua (o della stanza): ___ °C
- Acqua lasciata riposare dalla sera prima? sì / no

## Controllo del bilancino

Masse ufficiali delle monete in euro: 2 € = 8,50 g · 1 € = 7,50 g · 50 c = 7,80 g · 20 c = 5,74 g · 10 c = 4,10 g · 5 c = 3,92 g · 2 c = 3,06 g · 1 c = 2,30 g.
Le monete consumate pesano qualche centesimo in meno.

| Prova | Moneta | Atteso [g] | Letture [g] |
|---|---|---|---|
| Ripetibilità, prima serie | 2 c | 3,06 | 3,05 / 3,06 / 3,06 |
| Ripetibilità, prima serie | 1 € | 7,50 | 7,54 / 7,45 / 7,46 (la prima è anomala: bilancino appena acceso) |
| Ripetibilità, seconda serie (5 pesate al centro) | 1 € | 7,50 | 7,47 / 7,45 / 7,46 / 7,45 / 7,45 (media 7,46) |
| Posizione (centro / bordo) | 1 € | 7,50 | 7,46 / 7,45 |
| Somma (2 monete insieme) | 1 € + 2 c | 10,52 (dalle pesate singole) | 10,53–10,54 |
| Ritorno a zero dopo ogni pesata | — | 0,00 | sì |

**Esito (15 ott):** bilancino affidabile. Incertezza di una singola pesata: **±0,02 g**.
Dopo l'accensione bisogna aspettare 2–3 minuti prima della prima pesata.

## Misure

| | P1 (principale) | R1 (riserva) | R2 (riserva) |
|---|---|---|---|
| Segno di riconoscimento | | | |
| Rame: diametro e massa avvolta | | | |
| `m_secco` [g] | | | |
| `m_pieno` [g] | | | |
| `V_interno` [ml] | | | |
| `V_materiali` lettura 1 / 2 / 3 [ml] | | | |
| `V_materiali` media [ml] | | | |
| `m_tarato` [g] | | | |
| `V_acqua` [ml] | | | |
| `V_bolla` [ml] | | | |
| `E` [g] | | | |
| Pressione neutra stimata [kPa] | | | |

## Prova finale (bottiglia chiusa, 5 ripetizioni)

| | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| P1 scende con una leggera pressione | | | | | |
| P1 risale lasciando | | | | | |
| P1 risale **dal fondo** lasciando | | | | | |

## Note
