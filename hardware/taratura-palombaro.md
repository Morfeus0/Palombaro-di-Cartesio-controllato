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

**Filo di rame:** diametro 0,8 mm (rotolo da 12 m), circa **0,45 g ogni 10 cm**, cioè 0,045 g al centimetro.
2 mm di filo valgono 0,01 g, la risoluzione del bilancino.

Se dopo le misure si toglie o si aggiunge rame, si pesa il pezzetto (`Δm`) e si corregge:
`m_secco ± Δm` e `V_materiali ± Δm / 8,96`.

## Condizioni della prova

- Data: 19 ottobre 2026 (P1 e R1)
- Altezza dell'acqua nella bottiglia `H` (dal fondo alla superficie): ___ cm
- Temperatura dell'acqua (o della stanza): ___ °C (sensore nel tappo: 24–27 °C)
- Acqua lasciata riposare dalla sera prima? bottiglia principale sì (dal 18); caraffa e gemella con acqua minerale appena aperta

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
| Segno di riconoscimento | ugello (punta di pipetta incollata) | senza ugello | — |
| Rame: diametro e massa avvolta | 0,8 mm, 55 cm, **2,35 g** (poi alcuni tagli da 2 mm) | 0,8 mm, 50 cm (circa 2,25 g) | |
| `m_secco` [g] | **3,05** (prima dell'ugello) | | |
| `m_pieno` [g] | 5,34–5,40 ⚠️ (esce acqua dal foro largo) | | |
| `V_interno` [ml] | | | |
| `V_materiali` lettura 1 / 2 / 3 [ml] | 2,00 e −5,12 ⚠️ non validi (aria dentro, acqua persa) | | |
| `V_materiali` media [ml] | | | |
| `m_tarato` [g] | 5,14 / 5,91 / 5,44 ⚠️ (vedi note) | | |
| `V_acqua` [ml] | | | |
| `V_bolla` [ml] | | | |
| `E` [g] | | | |
| Pressione neutra stimata [kPa] | | | |

## Prova finale (bottiglia chiusa, 5 ripetizioni)

| | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| P1 scende spingendo il servo a 146 (circa +2,4 kPa) | ✅ | ✅ | ✅ | ✅ | ✅ |
| P1 risale **dal fondo** tornando a 36 (circa 0 kPa) | ✅ | ✅ | ✅ | ✅ | ✅ |

23 ottobre, 23:29–23:34, bottiglia nuova, servo comandato dalla seriale: scende in circa 2 s, risale in circa 2,5 s. Soglie misurate a passi (23:22–23:27): **va a fondo a circa +2,2 kPa** (comando 136), **risale dal fondo a circa +0,4 kPa** (comando 66). Dopo +50 ml d'acqua e qualche goccia di soluzione sul pelo dell'acqua, altri 3 cicli su 3 (23:55–23:59). Senza soluzione fresca il menisco lo tratteneva anche a +2,6 kPa (23:52).

## Note

**19 ottobre: la taratura non è riuscita.** Le lezioni sono nel diario. In breve:
- **Pipetta:** 15 cm. Tettarella 4 × 1,3 cm; gambo 11 cm, largo da 8 a 3 mm. Si taglia 2 cm sotto la tettarella: palombaro di circa 6 cm, foro di 6–7 mm.
- **Il foro largo fa uscire acqua** a ogni spostamento: le pesate con l'acqua dentro non valgono (`m_tarato` 5,44 > `m_pieno` 5,37). Per `V_materiali` il palombaro deve essere pieno d'acqua **senza bolle**, così affonda e resta appeso al filo; dai materiali ci si aspetta circa 1,0 ml.
- **Fascia utile stretta:** P_neutra ≈ 101,5 kPa × E / V_bolla. Con circa 2 ml di bolla, la fascia +2…+3 kPa è larga circa 0,02 g, cioè meno di una goccia. Correzione fine solo con il rame (2 mm = 0,009 g).
- **Tensione superficiale (ipotesi):** con la punta fuori dall'acqua il menisco trattiene il palombaro fino a circa 3 mN (0,3 g), più della spinta tolta dalla siringa (circa 0,02 g per kPa). **Confermato la sera del 19.** Il rimedio è una **soluzione** di detersivo (una goccia in un cucchiaino d'acqua; la goccia pura va a fondo) messa sul pelo dell'acqua e strofinata sulla punta del palombaro, più il **marcatore senza pieghe** (le pieghe trattengono aria). Con questi due accorgimenti P1 scende e risale con una sola corsa della siringa da 20 ml (21:51–21:56, tra 0 e circa +3,6 kPa).
- **21 ottobre, dopo due giorni a galla** (circuito lasciato chiuso con la siringa collegata): con il tubo aperto la stanza è a **100,65 kPa** (101,55 la sera del 19). Chiuso a 20 ml alle 17:46 e spinto 2 ml alla volta fino a 0: **P1 non scende**. Scende con un **colpetto** sulla bottiglia o con una **spinta rapida** della siringa, staccandosi sempre **di colpo**: è di nuovo il menisco (punta asciutta), con 0,9 kPa in meno di margine. Pressioni non registrate: il sensore era guasto (vedi `hardware/collegamenti.md`). Le soglie vanno rimisurate **con P1 già sott'acqua**, ribagnando la punta con la soluzione alla prossima apertura del tappo.
- **23 ottobre:** con la bottiglia aperta da due giorni P1 era **sul fondo** (stanza a 101,36 kPa contro 100,75 del 21, circa 1,5 °C in meno, aria della bolla disciolta). Tirando fino a −2,2 kPa si è staccato appena dal fondo. Nella bottiglia si era formata **schiuma** di detersivo: **bottiglia cambiata** e P1 ritarato con lo stesso metodo del 19 (marcatore, soluzione sulla punta e sul pelo dell'acqua). **R1 e R2 non si fanno** (decisione di Gabriele, per risparmiare tempo): la 1.2 si chiude con il solo P1. Le misure di massa e di bolla (pesate non valide del 19) sono sostituite dalle soglie in kPa.
- **Nella gemella**, P1 a 5,44 g scende con una stretta della mano (10–20 kPa) e risale dal fondo; **con la siringa non scende** (P1 fermo a +12–14 kPa). R1 (50 cm di rame) scende a circa +8–10 kPa; con 2 cm di rame in più affonda anche a zero.
