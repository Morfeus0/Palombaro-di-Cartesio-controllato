# Postazione di ripresa (sottofase 2.1)

> Piano del 24 ottobre 2026, da svolgere lunedì 26 – martedì 27. Si compila durante la 2.1: le caselle `___`
> sono le misure da scrivere. Obiettivo (dal piano): **un'inquadratura fissa, ripetibile e senza riflessi**.
> Fatto quando: **il palombaro è nitido e senza riflessi in ogni punto della colonna d'acqua.**
>
> **CORREZIONE (24 ottobre, sera):** la vaschetta non si usa più (decisione di Gabriele: i lavori che potevano
> versare acqua sono finiti) e le bottiglie stanno direttamente sul tavolo. Spariscono le misure del bordo e del fondo
> della vaschetta e il contenitore basso: tutte le altezze partono dal tavolo, che è anche il fondo della bottiglia.

## Cosa sappiamo già (24 ottobre, da video e prove)

- **La vaschetta era alta circa 9–10 cm** (fotogrammi dei video di M1) e avrebbe nascosto P1 sul fondo, con il marcatore
  a circa 5,5 cm: per questo le bottiglie ora stanno sul tavolo.
- Sulla bottiglia grande ci sono **l'etichetta Levissima** (in basso, proprio nella colonna d'acqua) e il **nastro rosso**
  del livello (stesso colore del marcatore). Davanti alla bottiglia passano **i tubi** e c'è **la bottiglia piccola**;
  Dietro: il mobile bianco con le maniglie e, più a sinistra,
  una zona scura.
- **Telecamera dell'iPhone** (sonda `pc/sonda_telecamera.swift`): formati 640 × 480, 1280 × 720, 1920 × 1080 e
  1920 × 1440, ciascuno a 30 o 60 fps. **Esposizione, fuoco e bilanciamento non risultano bloccabili dal Mac**
  (**confermato** il 24 ottobre sera da Terminal.app, con il permesso concesso). Per decisione di Gabriele l'attività del
  piano diventa «scena costante (luce artificiale, tende chiuse, TV spenta, effetti video spenti) e controllo F4».
  Il formato attivo all'avvio è 640 × 480: il programma deve chiedere esplicitamente 1920 × 1080.
- Nel Mac le telecamere sono: FaceTime, iPhone, «Panoramica Scrivania» dell'iPhone. L'indice di OpenCV non coincide
  con l'ordine di ffmpeg (nella 1.1 l'iPhone era l'indice 0): si sceglie la telecamera guardando l'immagine.

## Perché le misure e i conti vengono prima

**La telecamera va tenuta orizzontale e perpendicolare alla bottiglia**, all'altezza del centro della corsa di P1.
Se la si inclina per guardare dall'alto, gli spostamenti di P1 avanti e indietro nella bottiglia
(fino a ±3,5 cm) diventano spostamenti in verticale nell'immagine: con 10° d'inclinazione sono già ±4,5 mm di errore.

**Distanza:** più la telecamera è lontana, meno pesa la prospettiva. P1 che si sposta di ±3,5 cm in profondità
(circa ±2,7 cm «apparenti», per la rifrazione dell'acqua) cambia la sua distanza dalla lente, e quindi la scala:
l'errore è nullo al centro dell'immagine e massimo agli estremi della corsa (±8 cm dal centro).
Con il formato 1920 × 1080 l'altezza inquadrata è circa 0,8 × D (campo verticale stimato 44°, da misurare in F2b).

| D (lente → asse della bottiglia) | Errore massimo agli estremi | Errore tipico (P1 vicino all'asse) | Altezza inquadrata | mm per pixel |
|---|---|---|---|---|
| 50 cm | ≈ 4,3 mm | ≈ 1,1 mm | ≈ 40 cm | ≈ 0,37 |
| 60 cm | ≈ 3,6 mm | ≈ 0,9 mm | ≈ 49 cm | ≈ 0,45 |
| **70 cm** | **≈ 3,1 mm** | **≈ 0,8 mm** | **≈ 57 cm** | **≈ 0,53** |
| 80 cm | ≈ 2,7 mm | ≈ 0,7 mm | ≈ 65 cm | ≈ 0,60 |
| 100 cm | ≈ 2,2 mm | ≈ 0,5 mm | ≈ 81 cm | ≈ 0,75 |

**Scelta:** la distanza più grande tra 70 e 80 cm che lo spazio consente; mai sotto i 50 cm. Il marcatore (circa 13 mm)
resta largo 20–25 pixel: il suo centro si trova con precisione migliore del pixel.

## Materiale

- metro da sarta e una **striscia di cartone rigido** di 4 × 32 cm (dal cartone di una scatola): insieme fanno il
  «righello» (passo C6), perché un righello da 30 cm non c'è;
  multimetro (avvio del banco);
- pennarello nero indelebile (o nastro isolante **nero**), nastro di carta, forbici, carta da cucina;
- **foglio bianco opaco** A3 (o due A4 uniti) e un cartone rigido almeno 30 × 35 cm, due pesi per tenerlo in piedi;
- un oggetto pesante con una faccia piatta e verticale per l'asta del righello (una scatola piena, un barattolo squadrato, un mattone);
- per l'iPhone: un treppiede da telefono, se c'è; altrimenti una pila di libri, un libro grosso o una scatola con una faccia
  verticale, due elastici;
- una lampada da scrivania (luce bianca), carta da forno (per diffondere la luce, se serve);
- caricatore dell'iPhone.

## Blocco 0 · Programmi (Claude, prima di lunedì)

- `pc/telecamera.py`: unico programma che apre la telecamera (come il registratore per la seriale). Chiede
  1920 × 1080 a 30 fps e controlla che arrivino davvero; scrive in `dati/<giorno>/telecamera/` l'anteprima (5 volte
  al secondo), le misure della postazione, il riferimento e i video di prova con l'orario di ogni fotogramma
  (serviranno per la latenza nella 2.3 e per sincronizzarli con il registro della seriale).
- **Dashboard, pannello «Telecamera»:** l'immagine dal vivo con le guide (linea verticale e orizzontale di centro,
  rettangolo della colonna da trascinare), il «fantasma» dell'immagine di riferimento, la maschera del rosso; le misure
  (fps, risoluzione, luminosità dello sfondo e sua deriva, percentuale di riflessi nella colonna, nitidezza, zone rosse)
  e l'elenco dei controlli con ✓ o ✗; i pulsanti «Salva riferimento» e «Registra 2 minuti». Comunica con
  `telecamera.py` attraverso i file, come per il servo.
- **Perché nella dashboard:** è la base dell'interfaccia finale. Lo stesso pannello nella 2.2 mostrerà il riquadro del
  riconoscimento e la quota in cm, e alla fine il cursore della quota diventerà una linea orizzontale da trascinare
  sull'immagine, all'altezza a cui deve stare P1.
- Test delle funzioni di misura. **Contributo di Gabriele:** la funzione che dà il verdetto dei controlli (soglie).

## Blocco A · Preparare la bottiglia (banco spento, tappo normale) · circa 20 min

Si fa con il **tappo normale**, prima di montare il tappo del sensore: la bottiglia non ha tubi né cavi e si può
toccare senza rischi per il sensore.

1. **Etichetta Levissima.** Svita il tappo normale (così, se stringi la bottiglia, non sale la pressione). Tieni la
   bottiglia dal fondo, trova il lembo incollato dell'etichetta e tiralo piano, tutto attorno. Se resta una striscia di
   colla, tamponala con un pezzo di nastro di carta finché si stacca; niente solventi. *Perché:* l'etichetta copre
   proprio la parte bassa della colonna, dove P1 sta sul fondo. Rimetti il tappo normale.
2. **Segno del livello.** Stacca il nastro rosso della spalla. Con il pennarello nero fai una riga orizzontale lunga
   2 cm, esattamente sul pelo dell'acqua, sul **fianco** della bottiglia (non sul davanti). *Perché:* il programma cercherà
   il rosso; qualunque altro rosso nell'inquadratura è un falso palombaro.
3. Guarda la bottiglia controluce: se ha una giunzione verticale dello stampo (una riga sottile), ricordati da che parte
   è: la metterai sul retro.

## Blocco B · Misure · fatte il 24 ottobre, sera

| Misura | Valore | Conseguenza |
|---|---|---|
| B1 lunghezza di P1 | 7,3–7,5 cm | z_min ≈ 7 cm: il centro del marcatore con P1 sul fondo |
| B2 acqua, dal tavolo al pelo | 25 cm | z_max = 23 cm: P1 resta almeno 2 cm sotto il pelo (menisco) |
| B3 circonferenze (dall'alto in basso) | 28 / 25 / 28,4 cm | diametri 8,9 / 8,0 / 9,0 cm: al centro c'è la strozzatura della presa |

- **Altezza della lente dal tavolo: h_lente = (7 + 23) / 2 = 15 cm.** La corsa del marcatore è 7–23 cm, cioè ±8 cm
  attorno alla lente: la tabella degli errori qui sopra vale così com'è.
- **Il tavolo è un quadrato di 60 × 60 cm e si può spostare** (B4–B6 non servono più): la disposizione la fissa il
  blocco C. Sulla **diagonale** (85 cm) la distanza viene **D ≈ 50 cm**, il minimo accettabile: errore tipico circa 1 mm,
  massimo circa 4,5 mm solo con P1 agli estremi della corsa e contro la parete della bottiglia; 0,38 mm per pixel.
- **L'altezza si vede tutta:** a 50 cm la telecamera inquadra circa 41 cm in altezza (da circa −5 a +36 cm attorno ai
  15 cm della lente), contro i 30 cm che servono (tavolo, colonna, righello).
- **La strozzatura** a metà altezza è proprio davanti alla lente: lì la parete curva di più e può deformare P1.
  Si controlla in F6.

## Blocco C · Disposizione sulla diagonale del tavolo, sfondo · circa 30 min

**Perché la diagonale:** è la linea più lunga del tavolo (85 cm contro 60). Bottiglia in un angolo, iPhone in quello
opposto: D ≈ 50 cm, senza spostare il banco su un altro tavolo (con il circuito chiuso, i tubi e il cavo del sensore,
ogni trasloco è un rischio).

**C0 · Dove mettere il tavolo nella stanza.** Chiamo **A** l'angolo della bottiglia, **C** quello dell'iPhone, **B** e
**D** gli altri due (B a destra e D a sinistra, guardando da C verso A).
- A verso un **muro o il mobile bianco**: la telecamera guarda lì, e dietro il cartone deve esserci una superficie
  ferma e uniforme, non la stanza in cui ci si muove.
- **La finestra di lato**, mai dietro l'iPhone (si rifletterebbe al centro della bottiglia) e mai dietro la bottiglia
  (controluce).
- Vicino a una presa (alimentatore del servo, caricatore) e fuori dal passaggio: una spinta al tavolo sposta tutto.

```
        A ┌──────────────────────────────────┐ B
          │╲  p   ╱                          │   p  bottiglia piccola (dietro il cartone)
          │  ╲  ╱  cartone                   │   ╱  cartone con il foglio bianco
          │   ╱╲                             │   G  bottiglia grande
          │  ╱   ╲ G ▌righello      tavoletta│
          │        ╲              servo e    │   ▌  righello
          │          ╲            siringa,   │
          │            ╲          breadboard │
          │  Mac         ╲        alimentat. │
          │                ╲                 │
          │                  ╲               │
          │  lampada           ╲             │
          │  (di lato)           ╲           │
          │                       [iPhone]   │
          │                            ╲     │
        D └──────────────────────────────────┘ C
                      schema, non in scala
```

1. **C1 · La diagonale.** Tendi il metro dall'angolo A all'angolo C e metti un puntino di nastro di carta sul tavolo,
   sotto il metro, a **6, 12, 21,5 e 72 cm da A**. Sono i punti della bottiglia piccola, del cartone, dell'asse di G e
   della lente.
2. **C2 · I due segni del cartone.** Sui due bordi che formano l'angolo A, metti un segno a **17 cm dall'angolo**. La
   linea che unisce i due segni passa per il puntino dei 12 cm ed è perpendicolare alla diagonale: lì va il piede del
   cartone. *Perché:* il cartone deve stare di fronte alla telecamera, non di sbieco.
3. **C3 · Bottiglia grande (G).** Tenendola dal fondo, mettila con il centro del fondo sul puntino dei **21,5 cm**. Tra la
   sua parte posteriore e il cartone restano circa 5 cm. Quattro pezzetti di nastro di carta attorno al fondo (davanti,
   dietro, a destra, a sinistra, a contatto con la bottiglia): così la ritrovi al suo posto.
4. **C4 · Bottiglia piccola.** Nell'angolo A, sul puntino dei **6 cm**, cioè **dietro il cartone**: la telecamera non
   la vede, e i tubi le arrivano da dietro. Controlla che il tubo B arrivi al tappo di G e il tubo A alla siringa
   **senza tirare** (sono lunghi 65 e 50 cm).
5. **C5 · Sfondo.** *(24 ottobre, decisione di Gabriele: per ora va bene il cartone marrone così com'è, anche se i due
   pezzi non sono alla stessa altezza; il foglio bianco si aggiunge solo se la maschera del rosso, F5, vede il cartone o se
   il riconoscimento della 2.2 non distingue P1. La TV dietro va spenta durante le prove.)* Foglio bianco opaco sul cartone (nastro solo sul retro, nessuna piega), cartone di almeno
   30 cm di larghezza e 35 di altezza, in piedi con il piede sulla linea dei due segni. Può sporgere di qualche centimetro
   oltre i bordi del tavolo. Tienilo dritto con un peso dietro (nell'angolo A, accanto alla bottiglia piccola, senza
   appoggiarlo a lei). *Perché:* la bottiglia piena fa da lente e ingrandisce tutto quello che c'è dietro; il foglio deve
   arrivare almeno a 30 cm d'altezza (5 cm sopra il pelo dell'acqua).
6. **C6 · Righello: il metro da sarta su un'asta di cartone** (24 ottobre: non c'è un righello da 30 cm). **Non sulla
   bottiglia:** lì il metro starebbe davanti all'asse (scala sbagliata di circa il 7 %) oppure di taglio sul fianco,
   seguirebbe la strozzatura e le costole invece della verticale, e girerebbe con la bottiglia ogni volta che si avvita il
   tappo del sensore.
   - Taglia dal cartone di una scatola una striscia **4 × 32 cm**, con i bordi dritti (righello di fortuna: il bordo di un
     libro). Se si piega, incollane due uguali una sull'altra.
   - Stendi il metro sulla striscia, dritto e **senza tirarlo** (è elastico), e fissalo con nastro di carta ogni 8–10 cm,
     lasciando scoperte le cifre. Il verso non conta (24 ottobre: lo 0 sta in alto, così le cifre si leggono dritte):
     basta annotare la **lettura del metro all'altezza del tavolo**, L_tavolo, e l'altezza è L_tavolo − lettura. Usa il lato del metro senza
     rosso; se ha cifre o tacche rosse nella parte che si vede (0–30 cm), ripassale con il pennarello nero.
   - Metti l'asta in piedi sul tavolo, a contatto con un **fianco** di G (a destra o a sinistra, visto da C), con il metro verso l'iPhone,
     cioè perpendicolare alla diagonale, e fissala con il nastro all'oggetto pesante messo dietro, tra G e il cartone.
     *Perché:* così il metro sta alla stessa profondità dell'asse della bottiglia e ha la stessa scala di P1.
7. **C7 · Righello verticale** (al posto del filo a piombo, tolto il 24 ottobre: decisione di Gabriele). Apri l'app
   **Misure → Livella**, tieni l'iPhone in verticale e appoggia il suo **dorso piatto sulla faccia del metro** (quella che
   guarda la telecamera), con il lato lungo parallelo al metro e il rialzo delle fotocamere fuori dall'asta: deve segnare
   **0°**. *CORREZIONE (24 ottobre):* prima diceva «bordo dell'iPhone contro il bordo dell'asta», che misura l'inclinazione
   avanti–indietro, quella che conta poco. Se segna 1° o più, infila un pezzetto di carta piegata sotto il lato del
   supporto verso cui pende la cima dell'asta e ricontrolla. *Perché:* il righello diventa la verticale vera dell'immagine, il riferimento per controllare
   che la telecamera non sia ruotata (passo F2).
8. **C8 · Banco.** Tavoletta con servo e siringa, breadboard e alimentatore lungo il bordo **B–C** (a destra); il Mac
   lungo il bordo **A–D** o **D–C** (a sinistra), con lo schermo che non guarda la bottiglia. Sulla diagonale tra l'iPhone e
   G non deve esserci niente; lo spazio libero è una striscia larga circa 15 cm attorno alla diagonale.
9. **C9 · Cavi e tubi.** Il cavo del sensore e il tubo B partono dal tappo di G **verso il cartone** e scendono dietro
   di lui; il cavo prosegue lungo il bordo verso la breadboard, con l'ancoraggio di nastro a circa 10 cm. Nessun filo
   davanti alla colonna.

## Blocco D · iPhone: supporto, posizione, impostazioni · circa 25 min

1. **Sull'iPhone:** Impostazioni → Generali → AirPlay e Continuità → **Fotocamera Continuity attiva**. Attiva
   **Non disturbare** (una chiamata interrompe il video). Attacca il **caricatore** (lo streaming scarica la batteria e
   scalda il telefono: con il telefono caldo calano gli fps); il cavo non deve passare davanti alla bottiglia.
2. **Supporto, nell'angolo C.** Con un treppiedino da telefono (anche quello di un bastone per selfie): è la scelta più
   comoda qui, perché le gambe stanno nell'angolo e il telefono guarda lungo la diagonale. Senza treppiede: una pila di
   libri allineata ai bordi nell'angolo C fa da piattaforma (circa 10 cm, da correggere al passo 3); sopra, una scatoletta
   rigida (del tè, del dentifricio) in piedi, **ruotata** in modo che una faccia larga sia perpendicolare alla diagonale e
   guardi G; l'iPhone in **orizzontale**, con il **modulo delle fotocamere in alto**, lo schermo contro quella faccia e
   il dorso verso la bottiglia, tenuto da due elastici. L'obiettivo in uso sta sulla diagonale, sopra il puntino dei
   72 cm. Gli elastici non devono coprire obiettivi, flash, tasti laterali e tasto Azione.
3. **Altezza:** misura dal tavolo al centro dell'obiettivo in uso (passo 8 per capire quale): deve essere **15 ± 0,5 cm**.
   Correggi aggiungendo o togliendo libri o fogli di cartone sotto il supporto.
4. **Distanza e direzione:** D dalla lente all'asse di G, misurata con il metro teso all'altezza della lente:
   **50 ± 1 cm** (la superficie di G sta a 4,5 cm dall'asse, quindi lente–superficie ≈ 46 cm). La lente guarda lungo la
   diagonale, perpendicolare al cartone.
5. **Livella:** prima di agganciare il telefono, apri l'app **Misure → Livella** con l'iPhone appoggiato nel supporto
   come per la ripresa: deve segnare **0° ± 1°**. *Perché:* la telecamera deve essere orizzontale (vedi sopra).
   Poi segna con il nastro di carta il contorno del supporto sul tavolo.
6. **Sul Mac** (Terminal.app): `swift pc/sonda_telecamera.swift` e annota le risposte sui blocchi (da Terminal.app
   sono quelle vere). Poi avvia `pc/telecamera.py` (comando pronto quando c'è il programma).
7. **Effetti video del Mac:** con la telecamera in uso, Centro di controllo → **Effetti video**: spegni **Inquadratura
   automatica** (Center Stage), **Ritratto**, **Luce da studio**, **Reazioni**, sfondo. *Perché:* l'inquadratura
   automatica sposta e ingrandisce l'immagine da sola e cambierebbe a caso la conversione da pixel a cm; gli altri
   effetti modificano colori e bordi.
8. **Quale obiettivo:** copri con un dito, uno alla volta, i tre obiettivi: quello che oscura l'immagine nella
   dashboard è quello in uso. Il suo centro è il punto da cui si misurano altezza e distanza.
9. Blocca l'iPhone (schermo spento): la Fotocamera Continuity funziona così.

## Blocco E · Luce · circa 15 min

1. **Stessa luce di giorno e di sera:** tende o tapparella abbassate, lampadario acceso. Le sessioni sono quasi tutte di
   sera; così la postazione è uguale in ogni sessione. Non potendo bloccare l'esposizione, è la scena che deve restare
   costante.
2. **Lampada da scrivania** (luce bianca, niente LED colorati) di lato, circa a 45° tra la telecamera e la bottiglia,
   a 40–60 cm, **puntata sul foglio bianco o sul muro** (luce riflessa, morbida). Se fa macchie, mettici davanti un foglio
   di carta da forno, lontano dalla lampadina.
3. **Niente luci dietro la telecamera** (finestra, lampada, schermo del Mac acceso proprio dietro l'iPhone): sulla bottiglia
   si vedrebbero riflesse proprio al centro.
4. **Caccia ai riflessi:** nella dashboard guarda la percentuale di riflessi e l'immagine. Ogni striscia bianca sulla
   bottiglia è il riflesso di una luce o di un oggetto chiaro: copri con la mano le luci una alla volta; quella che fa
   sparire la striscia va spostata più di lato (la striscia si sposta verso il bordo della bottiglia, fuori dalla zona
   dove passa P1).

## Blocco F · Controlli con il banco acceso · circa 35 min

**Avvio del banco** (come il 24): ESP32 al Mac e registrazione avviata da Claude; multimetro: pin bianco ↔ GND dell'ESP32
**suona**, morsetto + ↔ 3V3 **non suona**; se P1 è a galla con la punta asciutta, 3–4 gocce di soluzione sul pelo
dell'acqua **prima** di chiudere; tappo del sensore con il **tubo A sfilato**, tenendo fermi tappo e cavo e girando la
bottiglia (tenuta dal fondo); alimentatore del servo; dalla dashboard servo a **36**, poi tubo A infilato (circuito chiuso
alla pressione della stanza); 146 per mandare P1 a fondo. Controlla che la bottiglia sia ancora nel suo contorno.

| | Controllo | Come | Superato se |
|---|---|---|---|
| F1 | Risoluzione e fps | pannello Telecamera | 1920 × 1080 e almeno 29 fps |
| F2 | Allineamento | bordo del righello contro la guida verticale; guida orizzontale contro il righello; G contro la guida verticale | il bordo del righello si scosta dalla guida al massimo 5 pixel in 20 cm (rotazione sotto 1°); la guida orizzontale incrocia il righello a 15 ± 0,5 cm; l'asse di G entro 50 pixel dal centro |
| F2b | Campo inquadrato | leggi sul righello la tacca più alta e quella più bassa visibili; pixel tra le tacche 0 e 20 | annoti mm per pixel e il campo verticale vero |
| F3 | Nitidezza | le tacche più fitte del metro da sarta | distinguibili da 0 a 25 cm |
| F4 | Stabilità dell'esposizione | 5 minuti senza muoversi davanti alla scena | la luminosità dello sfondo cambia meno del 3 % |
| F5 | Solo un rosso | maschera del rosso, P1 sul fondo e poi a mezz'acqua | una sola zona rossa **dentro la colonna**: il marcatore (24 ottobre: il rosso fuori dalla colonna non conta, perché P1 si cerca solo lì; soglia della tinta portata a 6 perché il rame di P1 non risulti rosso) |
| F6 | Tutta la colonna (il «Fatto quando») | «Registra 2 minuti» e, dalla dashboard, P1 dal fondo fino a 2 cm sotto il pelo dell'acqua e di nuovo giù, piano (passi di 2°). **Non farlo mai riemergere.** | P1 nitido e intero in ogni posizione; nessun riflesso, tubo, filo o costola della bottiglia sopra il marcatore |
| F7 | P1 fermo | P1 sul fondo, 30 s di video | serve alla 2.3 (rumore della misura) |
| F8 | Riferimento | «Salva riferimento» | immagine e impostazioni salvate |
| F9 | Ripetibilità | togli l'iPhone dal supporto, scatta le foto della postazione (una da dietro la telecamera, una di lato), rimetti l'iPhone e attiva il fantasma del riferimento | le tacche 0 e 20 del righello si scostano al massimo 3 pixel dal riferimento |
| F10 | Tenuta del collegamento | fps nei 10 minuti dei controlli | nessuna interruzione oltre 0,5 s (primo segnale per il rischio R5) |

**A fine sessione:** servo al centro, alimentatore staccato, tappo normale sulla bottiglia e tappo del sensore all'asciutto,
iPhone tolto dal supporto **senza spostare il supporto**.

## Risultati del blocco F (24 ottobre sera)

| | Esito | Dati |
|---|---|---|
| F1 | ✓ | 1920 × 1080, 58,6 fps in 2 minuti (l'iPhone ne manda 60), intervallo massimo 97 ms |
| F2 | ✓ | rotazione 1,5° (si corregge nella 2.3); guida orizzontale sul metro a circa 16 cm |
| F2b | ✓ | circa 33,5 cm inquadrati in altezza, 0,31 mm per pixel (32 pixel per cm sul metro) |
| F3 | ✓ | cifre e tacche dei millimetri leggibili sul riferimento a piena risoluzione (controllato tra 12 e 21 cm) |
| F4 | in parte | luminosità della colonna ferma a 87 per 2 minuti (deriva 0 %); i 5 minuti sono da rifare |
| F5 | ✓ | una sola zona grande nella colonna (il marcatore, circa 2700 px); una zona di circa 50 px in cima è il filo rosso del cavo del sensore: la colonna va disegnata dal pelo dell'acqua in giù |
| F6 | da fare | interrotto dall'incidente delle 23:00 e dal servo che si solleva |
| F7 | ✓ | P1 fermo sul fondo: centro del marcatore con deviazione 0,28 px (circa 0,09 mm), escursione 2 px, in 1172 campioni |
| F8 | ✓ | riferimento delle 22:52:13 (`pc/config/postazione_riferimento.jpg`) |
| F9 | da fare | |
| F10 | in parte | nessun buco in 2 minuti; una disconnessione alle 23:16 dopo la caduta (ora il programma si ricollega da solo) |

## Valori misurati

| Misura | Valore |
|---|---|
| B1 lunghezza di P1 | 7,3–7,5 cm |
| B2 acqua (dal tavolo al pelo) | 25 cm |
| B3 diametri (dall'alto in basso) | 8,9 / 8,0 / 9,0 cm (circonferenze 28 / 25 / 28,4) |
| z_min / z_max / h_lente | 7 / 23 / 15 cm |
| D (lente → asse) | ___ cm (previsto 50; l'inquadratura di 33,5 cm fa pensare a meno, o a un campo più stretto del previsto) |
| L_tavolo (lettura del metro all'altezza del tavolo) | ___ cm |
| Obiettivo in uso | ___ |
| Blocchi da Terminal.app (esposizione, fuoco, bilanciamento) | no / no / no (24 ottobre, permesso concesso) |
| Risoluzione e fps reali | 1920 × 1080, 59–60 fps (24 ottobre: l'iPhone manda 60 fotogrammi veri anche chiedendone 30) |
| Campo verticale, mm per pixel | circa 33,5 cm, 0,31 mm/px |
| Luminosità della colonna, deriva | 87 / 0 % in 2 minuti (5 minuti da rifare) |
| Ripetibilità (scostamento tacche 0 e 20) | ___ / ___ px |
| Rotazione dell'immagine (bordo del metro contro la verticale) | 1,5° (24 ottobre, misurata dall'anteprima; vale circa 0,9 mm al massimo con P1 spostato di lato di 3,5 cm: si corregge nel programma con la calibrazione della 2.3, non serve rifare il supporto) |
