# Distinta componenti: Palombaro di Cartesio

> Sottofasi **0.2** e **0.4** del piano operativo. Stato al **10 ottobre 2026**: carrello Amazon **ordinato venerdì 9 ottobre alle 20:00** · lista negozio **completa, ancora da comprare** (istruzioni pezzo per pezzo in [lista-spesa-negozi.md](lista-spesa-negozi.md)).
> Prezzi e date di consegna letti nel carrello Amazon il 9 ottobre: importo reale e date vanno confermati dalla mail d'ordine.
> Livelli: **E** = indispensabile · **C** = consigliato (riduce i rischi) · **F** = facoltativo.

---

## A. Carrello Amazon definitivo

Un solo canale (Amazon.it): **niente AliExpress**, per evitare i dazi.

| # | Componente | Q.tà | Livello | Prezzo | Consegna | A cosa serve |
|---|---|---|---|---|---|---|
| A1 | **ELEGOO ESP-32 USB-C, 2 pezzi** ([B0D8T7LZF2](https://www.amazon.it/dp/B0D8T7LZF2)) | 1 conf. (2 schede) | E | 18,99 € | gio 15 ott | Controllore in tempo reale: anello interno di pressione a 100 Hz, macchina a stati (SAFE), lettura del BMP280, comando del servo, dialogo con il Mac via USB (1.5, 2.5). La seconda è una scorta |
| A2 | **GTIWUNG: 3 breadboard (400 e 830 punti) + 195 jumper** ([B0FJRPSDLR](https://www.amazon.it/dp/B0FJRPSDLR)) | 1 kit | E | 12,99 € | mar 13 ott | Banco elettronico minimo (1.5): ci sta l'ESP32, il BMP280, il condensatore e le linee di alimentazione |
| A3 | **Servo MG996R 180°, HAXIHA, 2 pezzi** ([B0F892P2WQ](https://www.amazon.it/dp/B0F892P2WQ)) | 1 conf. (2 servo) | E (1) + C (1) | 13,99 € | mar 13 ott | Attuatore: spinge e tira lo stantuffo della siringa e cambia il volume d'aria (1.7). Il secondo è per il piano B |
| A4 | **Sensore BMP280 3,3 V, 8 pezzi** (GERUI) | 1 conf. | E | 10,91 € | gio 15 ott | Misura la pressione nella bottiglia: retroazione dell'anello interno, test di tenuta (1.6), identificazione del modello. Ne servono 2, il resto sono ricambi |
| A5 | **Alimentatore TKDY 5 V 3 A con punte intercambiabili** ([B0B121C8JX](https://www.amazon.it/dp/B0B121C8JX)) | 1 | E | 15,92 € | **ven 16 ott** (Prime) | Alimenta il servo a parte, con le masse in comune: i picchi di corrente non fanno riavviare l'ESP32 (rischio R7). Include l'adattatore con presa femmina e morsetti verdi: sostituisce il vecchio A5 |
| A6 | **Asticelle a Z in acciaio inox, QUARKZMAN 1,5 × 300 mm, 10 pezzi** | 1 conf. | C | 13,99 € | gio 15 ott | Collegamento rigido tra braccetto del servo e stantuffo, con meno gioco possibile (1.7). Ne usi 1–2 |
| A7 | **Bilancino CAMRY 500 g / 0,01 g** ([B0BZS18B18](https://www.amazon.it/dp/B0BZS18B18)) | 1 | C | 8,99 € | **arrivato** (12 ott) | Pesare i palombari e tararli vicino al galleggiamento neutro (1.2); massa e volume sono parametri di G(s) (3.2) |
| A8 | **Kit saldatore Beizkna 80 W LCD, 180–520 °C** | 1 kit | E | 23,98 € | lun 12 ott | Saldare i 4 fili al BMP280 (1.3). Include stagno, supporto, 5 punte e pompetta dissaldante |

**Totale carrello: 119,76 €** (saldatore incluso). Più la spesa in negozio (sezione B).

**Non serve comprare:** il cavo USB-C per l'ESP32. Basta quello dell'iPhone 15 Pro (da USB-C a USB-C, trasmette dati): l'iPhone lavora come telecamera via Continuity Camera, senza cavo.

### Cosa NON si compra (e perché)
| Cosa | Motivo |
|---|---|
| AliExpress (ESP32, tubo, raccordi, adattatore DC, condensatore) | dazi e consegna 14–20 ott, sul percorso critico (1.4 e 1.5) |
| Adattatore a morsetti a 30 pin (Diymore, 16,99 €) | La scheda ELEGOO ha le file di pin a **25,64 mm (≈ 1,0")**: entra su una breadboard da 830 punti e lascia 4 fori liberi per ogni pin. Si ordina **dopo**, solo se la scheda non entra bene (consegna in 1–2 giorni) |
| Tubo con raccordi HUAZIZ e RUNCCI-YUN | il RUNCCI-YUN ha tubo da 4 mm esterni / 2,5 interni (non entra sul cono). Il tubo giusto da 4/6 mm si compra in negozio di acquari (B13) |
| Filo d'acciaio in ferramenta (B7) | il filo comune è troppo morbido; la piega a Z del filo armonico è difficile. Si tengono le QUARKZMAN, già piegate a Z |
| Presa DC femmina a morsetti (vecchio A5) | inclusa nell'alimentatore TKDY. Se non fosse da 5,5×2,1: [jack femmina a morsetti](https://www.amazon.it/Adattatore-spinotto-alimentazione-femmina-morsetti/dp/B018W9BT2S) |
| Supporto da tavolo per iPhone (vecchio A9) | già a casa |

---

## B. Da comprare in negozio (farmacia, ferramenta, elettronica, acquari, casalinghi)

| # | Componente | Dove | Note |
|---|---|---|---|
| B1 | Siringhe 10 ml con attacco Luer (**2 pezzi**) | farmacia | una vera e una di scorta; se servono altre si torna in farmacia |
| B2 | Contagocce di vetro o pipette (**3 pezzi**, 2 per cominciare) | farmacia | per costruire i palombari (1.2): 1 principale e 2 di riserva |
| B3 | Filo di rame rigido (zavorra) | ferramenta | — |
| B4 | Colla epossidica bicomponente | ferramenta | per sigillare il tappo (1.3); 24 h di indurimento |
| B5 | Stick di colla a caldo di ricambio | ferramenta | la pistola c'è già |
| B6 | Tavoletta di legno ≈ 30 × 15 cm (spessore 12–18 mm), **viti per legno autofilettanti 3,5 × 20 mm** (≈ 20 pezzi). Fascette di nylon: **già in casa**, non servono | ferramenta | base servo–siringa (1.7). Le fascette (già in casa) servono sul tubo (1.4). Le viti per il servo sono già nella sua confezione |
| ~~B7~~ | ~~Filo d'acciaio 1–1,5 mm~~ | — | **cancellato**: si usano le QUARKZMAN (A6) |
| B8 | Cavo a 4 fili, 50–80 cm | ferramenta / elettronica | **non trovato in ferramenta il 12 ott**: si riprova in elettronica entro **gio 15 ott** (1.3). Il 4 × 0,22 è difficile da trovare: **va bene un cavo Ethernet** (4 dei suoi fili da 24 AWG ≈ 0,2 mm², di colore pieno), oppure i 4 fili di un vecchio cavo USB. Dal BMP280 alla breadboard. Opzionale: guaina termorestringente o nastro isolante sui fili saldati |
| B9 | Vaschetta di contenimento | casalinghi | **disponibile** (12 ott) |
| B10 | Nastro isolante rosso o smalto rosso (marcatore) | ferramenta | marcatore visibile alla telecamera (1.2) |
| B11 | 2 bottiglie PET lisce (1,5–2 L e 0,5 L) | casa | **già in casa** (12 ott): Levissima da 1,5 L (principale) e da 0,5 L (aria extra). Per le prove di foratura serve un tappo di un'altra bottiglia |
| B12 | **Condensatore elettrolitico 1000 µF, ≥ 10 V** (2 pezzi; il 16 V va benissimo) | negozio di elettronica | **Indispensabile:** stabilizza il 5 V del servo ed evita che l'ESP32 si riavvii. ≈ 0,50 €, a fori passanti (non SMD). La striscia chiara sul corpo è il polo **negativo** (va al GND). Serve entro **dom 18 ott** (1.5). Se non lo trovi: kit GTIWUNG 30 pezzi 1000 µF 16 V su Amazon, 9,99 € |
| B13 | **Tubo per aria da acquario 4/6 mm** (**4 mm interno**), circa 2 m, + **2 raccordi a T** per tubo da 4 mm | negozio di acquari | ≈ 4 €. Porta una siringa da 10 ml e prova subito che il tubo si infili sul cono. Serve entro **sab 17 ott** (1.4). I raccordi vanno fissati con le fascette |
| B14 | **Multimetro con prova di continuità** (se non ne hai già uno) | elettronica / ferramenta (o Amazon) | ≈ 10–15 €. Serve per la continuità dei 4 fili del BMP280 (1.3) e per verificare che l'alimentatore dia 5 V con la polarità giusta (1.5). Entro **gio 15 ott** |
| B15 | **Carta vetrata** grana 120–180 (1 foglio) | ferramenta | ruvidare il tappo prima della colla epossidica, che si attacca male alla plastica liscia (1.3) |

**Spesa indicativa in negozio:** ≈ 20–25 € (B1–B6, B8–B13), più il multimetro se non ce l'hai.

**Stato al 12 ottobre:** comprati in farmacia e ferramenta B1–B6 e B10 (con le fascette già in casa); le bottiglie (B11) e la vaschetta (B9) sono già disponibili, e il bilancino (A7) è arrivato in anticipo. **Mancano:** B8 (cavo a 4 fili, non trovato), B12 (condensatori), B13 (tubo e raccordi), B14 (multimetro). La carta vetrata (B15) è da confermare. Spesa reale ancora da annotare.

---

## Controlli alla consegna

- [ ] **ELEGOO:** file di pin a ≈ 25,6 mm, entra sulla breadboard (poggiarla a un'estremità, con la porta USB-C che sporge). Ci sono D21, D22, D13/D18, 3V3, GND, VIN.
- [ ] **TKDY:** uscita 5 V; la presa a morsetti verdi è femmina 5,5×2,1 e la spina dell'alimentatore ci entra; polarità (positivo al centro) misurata con il multimetro.
- [ ] **Servo:** versione 180° (non a rotazione continua), squadrette incluse.
- [ ] **BMP280:** è proprio un BMP280 (non BME280), con i pin inclusi, funziona solo a 3,3 V.
- [ ] **Collegamento del servo:** il 5 V arriva con fili corti dai morsetti dell'alimentatore, **non** dalle piste della breadboard; condensatore vicino al servo; masse in comune.

---

## Decisioni

- [x] (8 ott) Ordine online **subito**, senza aspettare l'incontro di lunedì 12: i componenti sono generici e riutilizzabili (reso Amazon gratuito).
- [x] (9 ott) **Tutto su Amazon**, niente AliExpress (dazi).
- [x] (9 ott) QUARKZMAN confermate (rinvio già piegato a Z, meno rischio sulla 1.7).
- [x] (9 ott) Supporto iPhone già a casa; condensatore da comprare in negozio.
- [x] (9 ott) **Saldatore: si compra** (23,98 €), niente prestito.
- [x] (9 ott) **Budget:** accettata la spesa attuale, grazie ai risparmi fatti sul carrello (adattatore, tubo, filo e kit breadboard più economici). Carrello Amazon 119,76 € + negozio ≈ 20–25 € (+ multimetro se serve), cioè ≈ 140–145 €.
- [x] (9 ott) **Carrello Amazon confermato** (8 articoli, 119,76 €).
- [x] (9 ott, 20:00) **Ordine Amazon inviato.** Il bilancino (A7) arriva martedì 13 ottobre, in tempo per pesare i palombari nella 1.2.

## Carrello Amazon: ordinato venerdì 9 ottobre alle 20:00

- [x] A1 · ELEGOO ESP-32 USB-C ×2
- [x] A2 · GTIWUNG breadboard + jumper
- [x] A3 · Servo HAXIHA ×2
- [x] A4 · BMP280 ×8
- [x] A5 · Alimentatore TKDY 5 V 3 A
- [x] A6 · QUARKZMAN 1,5×300 mm
- [x] A7 · Bilancino CAMRY (**arrivato il 12 ottobre**, in anticipo)
- [x] A8 · Saldatore Beizkna 80 W

**Ancora da annotare (sottofase 0.4):** la spesa reale e le date di consegna di tutti gli articoli, dalla mail di conferma di Amazon. Poi gli acquisti nei negozi (vedi [lista-spesa-negozi.md](lista-spesa-negozi.md)).
