# Supporto servo–siringa: revisione 03 pronta per la stampa

**19 novembre 2026 · base inviata al professore.** I file inviati sono in [`da-stampare 2/`](<da-stampare 2/LEGGIMI-STAMPA.txt>) (stessi STL dello zip `palombaro-da-stampare.zip`, controllati byte per byte il 19 novembre). Nuovi pezzi della trasmissione in preparazione: sezione [Trasmissione T01](#trasmissione-t01-braccio-biella-e-pinza-19-novembre) in fondo.

**13 novembre 2026 · REVISIONE 03 con tutte le misure del servo confermate.** Resta solo l'anteprima nello slicer, a cura di chi stampa. Le bozze 01 e 02 restano nelle loro cartelle con i rispettivi sorgenti. La 03 conserva l’allineamento al centro della 02 (servo arretrato di 19 mm, asticella parallela allo scorrimento a 86°) e corregge i difetti emersi dalla verifica ingegneristica.

## Come guardarla, senza conoscere un programma CAD

1. Apri la cartella `bozza-03` e fai doppio clic su **`APRI-IL-CAD.html`**. Se si apre un editor, dal Finder scegli tasto destro → Apri con → Safari oppure Chrome.
2. **Clicca e trascina** nel modello per ruotarlo. Usa la rotella, oppure lo scorrimento del trackpad, per avvicinarti e allontanarti.
3. Premi **Dall’alto** per capire la disposizione di servo, asticella e siringa; **Vista iniziale** ripristina l’inquadratura.
4. Togli **Mostra servo e siringa** per vedere soltanto i pezzi stampati. Attiva **Separa i pezzi stampati** per riconoscere i componenti smontabili; è una vista esplosa illustrativa, non una simulazione del movimento.
5. Clicca un pezzo oppure sceglilo nel menu **Scopri un componente** per leggerne la funzione.

Il file HTML contiene il modello e il visualizzatore: non carica librerie da internet e non richiede installazioni. È una vista esplorabile, non un editor delle quote. Se il browser non riesce ad avviare la grafica 3D, apri **`anteprima-assieme.png`** e **`anteprima-supporti.png`**, immagini dello stesso modello. Il visualizzatore è stato controllato nel codice e nel bundle; la prova interattiva nel browser dell’agente non è stata eseguibile, perché quella superficie non consente URL `file:`.

## Cosa è cambiato rispetto alle bozze 01 e 02

| Difetto trovato | Correzione nella 03 |
|---|---|
| Il servo non scendeva nella sede: il passacavo, che sporge oltre 5 mm dal corpo, non passava né nella luce di 0,5 mm (bozza 01) né nella gola profonda 2,2 mm (prima versione della 03) | **Fessura passante larga 5 mm** al centro di ogni pilastrino, aperta in alto: il passacavo scende con il servo e il cavo esce di lato senza essere infilato. Corretto il 18 novembre dopo la controanalisi |
| Dadi del servo: prima con 2,5 mm di plastica sopra, poi con un canale che sfondava di 0,7 mm nella sede del servo, senza battuta | **Niente dadi nei pilastrini**: fori ciechi da 2,6 mm in cui la M3×16 si filetta da sola per 13 mm. A 3,75 mm dalla scatola un dado M3 non ci sta senza sfondare. Corretto il 18 novembre |
| Servo appoggiato sul fondo e insieme sulle alette: con alette più alte dei 26 mm nominali le viti le avrebbero piegate | Servo appeso alle alette, sede a 30,5 mm e fondo incassato di 2 mm: va bene per alette fra 28 e 32 mm dal fondo (Gabriele ne ha misurati 30 il 13 novembre) |
| Fermo della flangia: lamina da 5 mm alta 47 mm, cedevole (circa 0,24 mm ogni 10 N) | Testata piena spessa 16 mm, circa 35 volte più rigida |
| Cave dei dadi larghe 6,8 mm: il dado M3 girava a vuoto | Cave da 5,8 mm nei dodici punti con dado; esagoni incassati sotto la giunzione |
| Viti di quattro lunghezze diverse, e nessuna lunghezza valida per la giunzione | **Sedici M3×16 tutte uguali** (piastra di giunzione da 8,5 mm, ponticelli con orecchie basse) |
| Asola per lo stelo larga 18 mm su una misura ipotizzata | Asola da 20 mm: passa qualunque stelo che entri nel cilindro |
| Fori per il legno contro pilastrini e piastra; pilastrino sporgente dalla base; spigoli vivi | Fori spostati e verificati con l’ingombro di testa e cacciavite; base allungata; spigoli raggiati R6 |
| Corsa sbilanciata nella 02: 9,6 mm di margine a 0 ml, 4 mm a 20 ml | Flangia spostata di 2,8 mm: 6,8 mm di margine per parte, corsa nominale 1,94–18,06 ml, circa 10,2 ml al centro |
| Base più lunga del necessario | Base montata **283 × 86 mm**; la punta della siringa sporge 8 mm oltre il bordo |

## Cosa contiene

| Pezzo stampato | Funzione | Ingombro orientato per la stampa, mm |
|---|---|---:|
| Base servo | Pilastrini divisi da una fessura per il cavo, fori autofilettanti, guance agli angoli | 141,5 × 86 × 38,5 |
| Base siringa | Due selle a V e testata per la flangia | 149,5 × 86 × 73 |
| Piastra di giunzione | Collega i due moduli con quattro M3×16 | 40 × 60 × 8,5 |
| Ponticello sella 1 e 2 | Premono il cilindro nella V | 15 × 48 × 14 ciascuno |
| Fermo flangia | Stringe la flangia contro la testata | 30,5 × 56 × 5 |

Ogni pezzo, singolarmente, sta nel cerchio Ø200 mm: raggio massimo 84,1 mm, contro i 95 mm ammessi. Nessun pezzo richiede supporti di stampa. Ponticelli e fermo sono esportati coricati sul profilo, così gli strati lavorano nel piano in cui il pezzo flette. Volume pieno complessivo circa 355 cm³; il peso reale dipende da pareti e riempimento scelti nello slicer.

Servo, siringa, braccio, asticella e viteria compaiono nella vista 3D come riferimenti e **non sono inclusi negli STL**.

## Viteria e ordine di montaggio

Servono **16 viti M3×16, 12 dadi M3** e 16 rondelle M3: si usano al montaggio, non durante la stampa. Le quattro viti del servo non hanno dado: si filettano da sole nei fori dei pilastrini. Viti a testa cilindrica o bombata (non svasata), dadi esagonali normali alti 2,4 mm (non autobloccanti: sono più alti e non entrano nelle cave), rondelle piane Ø7 mm.

1. Infilare i quattro dadi negli esagoni sotto le due basi, accostare i moduli sulle linguette e avvitare la piastra di giunzione.
2. Fissare la base alla tavoletta con le otto viti da legno.
3. Calare il servo dall'alto, ben verticale (non entra inclinato), con il cavo nella fessura del pilastrino. Avvitare le quattro viti nei fori: la prima volta oppongono resistenza perché tagliano il filetto nella plastica. Avvitare piano e fermarsi appena la testa appoggia.
4. Infilare i dadi nelle cave laterali di testata e selle. Ruotare lo stantuffo nel cilindro finché la nervatura con il foro dell'asticella è orizzontale e rivolta verso il servo: l'asticella ora lavora in orizzontale e il suo gancio entra dall'alto. Appoggiare la siringa nelle V con la flangia contro la testata, montare il fermo e i due ponticelli.

Serrare i ponticelli solo finché il cilindro non si muove: stringendo troppo lo stantuffo si indurisce. Le viti del servo tengono nella plastica: non smontarle e rimontarle più volte del necessario, perché ogni volta il filetto si consuma un po'.

## Simulazione del movimento

In `bozza-03/APRI-IL-CAD.html`, riquadro **Guarda come si muove**: «Avvia il movimento» fa oscillare il servo fra 36° e 146°, il cursore porta a un comando preciso. Due disposizioni a confronto:

- **In linea (da stampare):** servo arretrato, asticella parallela allo scorrimento a metà corsa; inclinazione fra 0° e 9,2° lungo la corsa.
- **Disassata (come bozza 01):** stesso progetto con il servo non arretrato, solo per confronto; inclinazione fra 0,8° e 9,9°, massima proprio a metà corsa.

La linea arancione è l'arco descritto dal foro del braccio, la verde la retta su cui scorre il perno dello stantuffo; le grigie sono l'asticella in cinque posizioni. I valori di volume e inclinazione sono nominali, calcolati dal modello.

## Impostazioni di stampa proposte e materiale

PLA, ugello 0,4 mm, strato 0,2 mm, **3 pareti, 5 strati pieni sopra e sotto, riempimento 20 %**, nessun supporto, brim di 5 mm sulle due basi, scala 100 % in millimetri, orientamento come negli STL. Le due basi vanno su piatti separati.

Stima del PLA, calcolata da volume e superficie di ogni pezzo con densità 1,24 g/cm³ (non è il risultato di uno slicer):

| Pezzo | 2 pareti, 15 % | **3 pareti, 20 %** | 4 pareti, 30 % |
|---|---:|---:|---:|
| Base servo | 55 g | **72 g** | 92 g |
| Base siringa | 89 g | **117 g** | 150 g |
| Piastra di giunzione | 10 g | **13 g** | 17 g |
| Due ponticelli | 6 g | **10 g** | 12 g |
| Fermo flangia | 5 g | **6 g** | 8 g |
| **Totale** | 165 g | **218 g** | 278 g |

Con brim e spurghi conviene contare **circa 235 g**; lo slicer del professore darà il valore esatto.

## Controlli automatici eseguiti a ogni esportazione

L’esportazione si interrompe, senza scrivere file, se uno di questi controlli fallisce. Esito attuale in `bozza-03/verifica.json`.

- Mesh chiuse, a guscio unico, anche dopo la conversione in STL.
- 66 coppie di solidi senza interferenze: pezzi stampati fra loro, contro servo, cavo e siringa, contro le sedici viti con i dadi, il volume spazzato da corpo e passacavo del servo calato dall'alto con le misure massime, e ingombro di testa e cacciavite sopra ogni vite da legno. Una prova di controllo sposta apposta la viteria di 1,2 mm e pretende che l’errore venga rilevato.
- Collisioni di braccio, asticella e stantuffo contro supporti e viteria a ogni grado fra 36° e 146°.
- La M3×16 deve prendere tutto il dado e non urtare né sporgere in ciascuno dei quattro giunti; fra le lunghezze commerciali risulta valida per tutti solo la 16.
- Tenuta agli errori di misura, nella tabella seguente.

## Quanto errore di misura sopporta il progetto

| Quota | Valore usato | Campo in cui il progetto funziona senza modifiche |
|---|---:|---|
| Lunghezza della scatola del servo | 40 mm | 39,5–41 mm |
| Larghezza della scatola del servo | 20 mm | 19–20,6 mm |
| Altezza dal fondo alla faccia inferiore delle alette | 30 mm, misurata | 28–32 mm |
| Interasse lungo dei fori delle alette | 47,5 mm, misurato | 47–48 mm (recupero nel foro dell'aletta) |
| Interasse corto dei fori delle alette | 9,5 mm, fra i 9 misurati e i 10 nominali | 9–10 mm |
| Passacavo | uscita a 8 mm dal fondo | largo fino a 4,6 mm, sporgenza qualsiasi |
| Diametro del cilindro della siringa | 21 mm | 20,3–21,7 mm |
| Larghezza della flangia | 37,5 mm | 36,5–39 mm |
| Spessore della flangia | 2 mm | 1,5–2,5 mm |
| Catena braccio–asticella–stantuffo | 35, 110, 16, 3 mm | errori sommati fino a ±1, ±1,5, ±1, ±1,5 mm, più 0,75 mm sull’asse del servo e 0,5 mm di montaggio: lo stantuffo resta a 0,6 mm dal fondo corsa |

Fuori da questi campi si corregge una quota in `modello.cjs` e si rigenera: non serve ridisegnare.

## Misure ancora da confermare prima della stampa

Elenco con i riferimenti fisici in [requisiti-e-misure.md](requisiti-e-misure.md), sezione «Misure di conferma per la bozza 03». Nessuna: le quattro misure sul servo sono state prese il 13 novembre e sono nel modello. Alette a 30 mm dal fondo, cavo a 8 mm, interasse lungo dei fori 47,5 mm, braccio fra 8 e 14 mm sopra la scatola. Le viti le compra Gabriele.

## Limiti

Il braccio ha una sporgenza: la sua faccia interna è a 8 mm dalla scatola e quella esterna arriva a 14 mm. Il modello mette il piano dell'asticella a 12,5 mm e l'asse della siringa a 10,5 mm sopra la scatola, a metà di quel campo; i ganci dell'asticella assorbono la differenza. I fori delle alette risultano a 3,75 mm dalla scatola: fra foro e sede resta una parete di 1 mm, che non porta carico. Le resistenze sono stime a mano con PLA a 2500 MPa e forza massima di 30 N, non prove. Gli STL non sono stati aperti in uno slicer: pareti, riempimento e brim vanno scelti con il professore. La pagina 3D e l'animazione sono state provate in un browser il 13 novembre, in entrambe le disposizioni. La base tiene fermi servo e siringa: il gioco di 22° misurato al banco dipende anche dalla prolunga del braccio e dai ganci, che restano interventi separati. Nessuna nuova prova al banco e nessuna modifica alla dichiarazione di M4.

## File e rigenerazione

- `modello.cjs`: CAD parametrico modificabile; quote all’inizio, in `q`.
- `bozza-03/APRI-IL-CAD.html`: assieme navigabile, con geometrie incorporate. Usare il tasto Dall’alto per l’allineamento.
- `bozza-03/BOZZA-*.stl`: sei singoli pezzi, in millimetri, già orientati per lo studio della stampa. Il formato STL non registra l’unità: nello slicer usare mm e scala 100%.
- `bozza-03/verifica.json`: quote effettivamente usate e controlli automatici; `scena.json`: geometrie dell’assieme.
- `controlli.cjs`: viteria nei fori, accessi delle viti da legno, lunghezze delle viti e tenuta agli errori di misura.
- `mesh.cjs`: triangolazione e controlli di solidità; `esporta.cjs`: esportazione; `visore.js` e `crea-visore.cjs`: visualizzatore autonomo; `anteprima.py`: immagini statiche.

Con Node.js e npm, da questa cartella:

```sh
npm ci
npm run build
npm run viewer
```

Per rigenerare anche le immagini, dal progetto con l’ambiente Python già presente:

```sh
MPLCONFIGDIR=/private/tmp/palombaro-matplotlib .venv/bin/python hardware/cad-base/anteprima.py
```

Le dipendenze sono bloccate nel lockfile. Motore geometrico [JSCAD](https://github.com/jscad/OpenJSCAD.org), visualizzazione con [Three.js e OrbitControls](https://threejs.org/docs/pages/OrbitControls). La triangolazione evita lo snap prematuro di JSCAD 2.13 che rompeva alcuni spigoli obliqui; ogni STL viene verificato anche dopo la conversione delle coordinate in float32. L’esportatore verifica anche, ogni grado, braccio/biella/stantuffo contro i supporti e biella contro braccio/stantuffo, con tolleranza volumetrica 0,01 mm³. Sono controlli sul modello semplificato; non sostituiscono verifica degli accoppiamenti reali, preparazione nello slicer o collaudo meccanico.

## Trasmissione T01: braccio, biella e pinza (19 novembre)

La base tiene fermi corpo del servo e siringa, ma il gioco di 22° misurato il 10 novembre dipende anche dalla prolunga (due squadrette incollate con l'epossidica, che cede) e dal filo piegato a Z e a L nella nervatura dello stantuffo. La T01 sostituisce queste due parti con tre pezzi stampati, **senza cambiare la base già inviata**: la biella ha la lunghezza che riproduce la stessa corsa della revisione 03 (differenza massima 0,13 ml su tutta la corsa).

| Pezzo | Cosa fa | Ingombro di stampa, mm |
|---|---|---:|
| Braccio | Si avvita dall'alto su una squadretta a doppio braccio **originale e nuova** (sacchetto del servo di riserva), che entra in una tasca sagomata: non può ruotare rispetto al braccio. Foro del perno a 35 mm dall'asse. La dentatura sull'alberino resta quella originale | 62 × 16 × 7 |
| Biella | Barra rigida, 90,15 mm fra i perni (era l'asticella di filo da 110 mm) | 100 × 14 × 5 |
| Pinza dello stantuffo | Abbraccia il disco Ø28 sulle due facce; due viti di registro spingono il disco contro il labbro anteriore e tolgono il gioco nei due versi. Perno sull'asse dello stantuffo, dietro il disco | 27 × 34 × 41 |

**Perché non si stampa la dentatura:** i dentini dell'alberino sono di qualche decimo di millimetro; in PLA, con la tolleranza di 1 mm suggerita dal professore, si spanerebbero subito.

**Controlli eseguiti** (`node esporta-trasmissione.cjs`, esito in `trasmissione-T01/verifica.json`): mesh chiuse; ogni pezzo entro il piatto Ø200; nessuna interferenza a ogni grado fra 36° e 146° fra braccio, biella, pinza, perni, viti di registro, squadretta e stantuffo, e contro i sei pezzi della base, la sua viteria, il servo e il cilindro (9102 coppie); prova di controllo: spostando la pinza di 1 mm verso il disco l'errore viene rilevato. Margini di fine corsa 6,75 mm per parte, obliquità della biella fra −8,6° e +2,5° (nella 03: 0–9,2°). Stime a mano: braccio 7 MPa a 30 N, carico critico della biella circa 316 N.

**Ipotesi ancora da confermare (misure del 19 novembre):** larghezza della squadretta al mozzo (A, 9,5 mm) e in punta (B, 5,5 mm), spessore (C, 2,5 mm), quota sotto la squadretta (D, 8 mm sopra la scatola), viti nei forellini (E), spessore del disco (F, 3 mm: la fessura ne accetta fino a 4,2). Si correggono in `trasmissione.cjs` (oggetto `t`) e si rigenera con `npm run build:trasmissione`.

**Viteria della trasmissione** (in aggiunta a quella della base):

| Dove | Pezzi |
|---|---|
| Perni (punta del braccio e pinza) | 2 viti M3×20 a testa cilindrica, 2 dadi M3 normali, 2 dadi M3 **autobloccanti**, 4 rondelle M3 |
| Viti di registro della pinza | 2 viti M3×16 con 2 dadi M3 come controdadi |
| Chiusura della pinza sotto il disco | 1 vite M3×16, 1 dado M3, 1 rondella |
| Braccio sulla squadretta | 3 viti autofilettanti per plastica circa 2,2 × 9,5 mm (o quelle del sacchetto del servo, se entrano nei forellini) |

**Montaggio dei perni:** la vite entra da sotto nel pezzo fisso (braccio o orecchia della pinza) e si serra con il dado normale; poi rondella, biella, rondella e autobloccante, stretto solo finché la biella non ha più gioco in altezza ma gira libera. La biella gira sul gambo della vite: nessun incollaggio.

**Montaggio della pinza:** ruotare lo stantuffo in modo che la tacca del disco (siringa n. 2) sia in alto; infilare la pinza dal basso sul disco, chiudere con il bullone inferiore, avvitare le due viti di registro finché toccano il disco, poi un quarto di giro, e bloccarle con i controdadi.

Anteprime: `trasmissione-T01/anteprima-trasmissione*.png` (`npm run preview:trasmissione`).
