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
