# Prompt per la nuova chat (sabato 17 ottobre 2026)

> Copia tutto il testo sotto la riga e incollalo come primo messaggio della nuova chat.

---

Ciao. Riprendo il progetto **Palombaro di Cartesio controllato** da una chat precedente, che ha esaurito il contesto. Prima di tutto leggi questi file del progetto, per avere il quadro completo:

- `Piano operativo/piano-operativo-palombaro.md`: il piano, con le sottofasi e i criteri "Fatto quando";
- `diario.md`: in particolare le voci del **15 e del 16 ottobre**, che descrivono nel dettaglio il lavoro degli ultimi due giorni;
- `hardware/taratura-palombaro.md`, `hardware/lista-spesa-negozi.md`, `hardware/distinta-componenti.md`;
- `firmware/src/main.cpp`: il programma di prova del sensore, attualmente caricato sull'ESP32;
- `landing/progresso-dati.js`: i dati del bollettino di avanzamento.

## Come voglio lavorare
- Guidami **passo per passo e in dettaglio**, un passo alla volta: aspetta che ti dica che ho finito prima di passare al successivo. Sono alle prime armi con l'hardware: ho imparato a saldare il 15 ottobre.
- **Quando ti mando foto** (file `.HEIC` nella cartella Download), convertile e ingrandisci le zone importanti prima di rispondere: ci sono dettagli piccoli (saldature, colonne della breadboard).
- **Quando l'ESP32 è collegato al Mac**, sei tu a caricare il programma e a leggere la seriale (`pio run -t upload --upload-port /dev/cu.usbserial-0001` dalla cartella `firmware`, e lettura con il Python di PlatformIO `~/.platformio/penv/bin/python` con pyserial, aprendo la porta con DTR e RTS a False). Se la porta è occupata, probabilmente ho un monitor seriale aperto: dimmelo.
- **Per qualunque verifica di contatto, tensione o continuità** chiedimi di usare il **multimetro**. Niente prove indirette: il 15 ottobre ci hanno fatto perdere ore.
- A fine giornata aggiorna il **diario** (con orari e divisione del tempo per attività) e il **bollettino** `landing/progresso-dati.js`, poi fai commit e push.

## Dove siamo (sera del 16 ottobre)
**1.3 · Tappo con il sensore: quasi chiusa.**
- Il primo BMP280 si era **guastato** (calore delle rifusioni). Sostituito con uno nuovo: **funziona** (0x76, chip ID 0x58, circa 101 kPa, rumore ±2–3 Pa) e reagisce a soffio, dito e strette della bottiglia (fino a +2,5 kPa).
- La scheda ha già il **pull-up sul CSB** (misurati 8,71 kΩ tra CSB e VCC), quindi bastano 4 fili, senza ponticello.
- Montaggio interno: tubo che sporge circa 15 mm dalla faccia interna, scheda verticale legata al tubo con una fascetta del pane (la colla a caldo non attacca al silicone), chip rivolto lontano dal tubo.
- **Due colate di epossidica fatte alle 21:00–21:30 del 16.** Indurimento completo in 2–3 ore a 20 °C (dalle istruzioni). L'epossidica **non aderisce a PE e PP**: la tenuta si basa sul riempimento dei fori. I colletti esterni sono venuti bassi.
- **Manca:** prova con l'ESP32 a colla indurita, prova di inclinazione a 45°, controllo che il tubo esterno non si sia strozzato (è indurito un po' piegato vicino al tappo), taglio dei trefoli della calza che sporgono dalla guaina vicino al tappo.

**1.2 · Palombari: ferma.** I contagocce di vetro non passavano dal collo; le **pipette Pasteur da 3 ml arrivano lunedì 19** (in ritardo). Filo di rame da 0,8 mm (0,45 g ogni 10 cm), circa 50 cm di zavorra per pipetta, perché il polietilene galleggia da solo. Passi 0–2 della guida fatti (acqua, bilancino verificato a ±0,02 g).

**Materiale:** multimetro e condensatori da 1000 µF disponibili. Raccordi a T non comprati: nella 1.4 il piano è collegare le bottiglie **in serie** (siringa → bottiglia da 0,5 L con 2 fori nel tappo → bottiglia da 1,5 L).

## Banco elettronico, da sapere
- **Colori del cavo del sensore:** rosso = VCC (3,3 V), bianco = GND, giallo = SCL (GPIO 22), verde = SDA (GPIO 21). La calza è raccolta in una codina isolata lato breadboard, da collegare a GND nella 1.5.
- **ESP32** (versione da 30 pin, file distanti 10 fori): sulla **prima breadboard**, nella zona dalla colonna ~29 in poi, con i pin nelle righe b e j. Si usa la riga **a**, dal lato del 3V3.
- **Fori rovinati** della prima breadboard (riga a, colonne **1, 2, 5, 6, 7, 8, 11, 14, 15**): li hanno allargati le punte stagnate dei fili, e i pin sottili non fanno più contatto. La **seconda breadboard** è nuova e così dura che i pin entrano solo forzando. Regola: nella breadboard vanno solo pin rigidi della misura giusta, quindi nella 1.5 vanno saldati dei **pin a pettine** sulle punte del cavo del sensore.
- Il sensore di riferimento delle prove del 15 è da parte con l'etichetta "da verificare"; quello vecchio del tappo con "guasto".

## Proposta di calendario da confermare (le pipette arrivano lunedì)
| Giorno | Attività |
|---|---|
| **Sab 17** | chiusura della **1.3** (30 min); **1.4** senza palombaro: tappo della 0,5 L con 2 fori, colata, tubi, volumi, verifica che la siringa alzi e abbassi la pressione (3–4 h); inizio della **1.7** (servo e siringa sulla tavoletta) mentre la colla indurisce |
| **Dom 18** | **1.5** elettronica minima (pin a pettine, servo con alimentatore separato, condensatore, programmi di prova) (3–4 h); **1.6** prova di tenuta a +2 kPa per 10 minuti, con la registrazione in Python (1,5–2 h) |
| **Lun 19** | lezione 8:30–11:00; arrivano le pipette: **1.2** parte 1, poi chiusura della **1.4** con il palombaro |
| **Mar 20** | **1.2** parte 2 (taratura fine) |
| **Mer 21 – Gio 22** | **1.7** meccanica; giovedì 22 si decide sul piano B (rischio R3) |
| **Ven 23** | margine |
| **Sab 24 – Dom 25** | **1.8** e milestone **M1** |

Le date nel piano e nel bollettino **non sono ancora aggiornate**: aggiornale dopo che avrò confermato il calendario.

## Questioni aperte
1. **La pagina del bollettino** (`landing/progresso.html`, i suoi script `landing/progresso-*.js`, `landing/progresso.css` e la cartella `tests/`) **non è mai stata aggiunta a git**: decidere se committarla. Anche `landing/index.html` ha una modifica non committata che non viene dalla chat precedente.
2. Il firmware di prova contiene ancora la funzione **`letturaPlausibile()` da completare** (TODO): la devo scrivere io, scegliendo i limiti di pressione e temperatura.
3. **Le ore sono il punto debole:** il fattore tra ore effettive e ore previste è salito a circa 2,7 (la 1.3 ha preso quasi 13 h contro 3). Togliendo le ore che non si ripeteranno, la fine prevista è a metà gennaio, oltre la scadenza. Va recuperata velocità.

## Primo passo di oggi
Prima di tutto confermiamo il calendario. Poi guidami nella **chiusura della 1.3**: tappo, ESP32 e prova del sensore a colla indurita.
