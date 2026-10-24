# 2. Il banco sperimentale

> **Bozza** (T4, prodotta con la sottofase 1.8, 24 ottobre 2026). Da rifinire in F6: figure, schema a blocchi disegnato, riferimenti incrociati. I numeri vengono da `diario.md`, `hardware/calibrazione-servo.md`, `hardware/taratura-palombaro.md` e `hardware/collegamenti.md`; i registri sono in `dati/`.

## 2.1 Panoramica

Il banco realizza un **diavoletto di Cartesio controllato**: un palombaro (una pipetta di plastica parzialmente piena d'acqua, con una bolla d'aria) galleggia in una bottiglia chiusa. Variando la pressione dell'aria nella bottiglia, la bolla si comprime o si espande, la spinta di Archimede cambia e il palombaro scende o sale. La pressione si regola con una siringa, il cui stantuffo è mosso da un servomotore comandato da un microcontrollore.

La catena è:

```
 PC (registro, dashboard) ⇄ seriale USB ⇄ ESP32 ── PWM ──> servo ── braccio + asticella ──> stantuffo della siringa
                                            ⇡ I²C                                              │ tubo A
                                         BMP280 nel tappo <── aria ── bottiglia principale <── bottiglia da 0,5 L <─┘
                                                                     (palombaro P1)          (tubo B)
```

Le grandezze misurate sono la pressione e la temperatura dell'aria sopra l'acqua (sensore BMP280 nel tappo, 50 letture al secondo). La quota del palombaro sarà misurata da una telecamera nella fase 2.

## 2.2 Parte pneumatica

- **Bottiglia principale:** PET da 1,5 L, acqua fino all'inizio della spalla. Dal 23 ottobre è una bottiglia nuova, con 50 ml d'acqua in più rispetto alla prima configurazione, per ridurre l'aria nel circuito.
- **Bottiglia da 0,5 L** in serie (tubo A dalla siringa, tubo B verso il tappo principale), con 500 ml d'acqua: ne restano circa 50 ml d'aria. Nel progetto iniziale doveva aggiungere aria (per avere più risoluzione); le misure hanno mostrato che di aria ce n'era già troppa.
- **Tubi** per acquario, 4 mm interni (A 50 cm, B 65 cm), incollati nei tappi con epossidica.
- **Siringa:** PIC Solution da 20 ml, 3,5 mm di corsa per ml.
- **Il tappo con il sensore:** forato per il tubo e per i 4 fili, sigillato con due colate di epossidica (1.3).

**Guadagno pressione/volume.** La legge di Boyle prevede, per circa 276 ml d'aria, circa 0,37 kPa per ml. Le misure danno meno: 0,10 kPa/ml con la prima configurazione (18 ottobre), 0,20 kPa/ml togliendo aria dalla bottiglia piccola, circa 0,15 kPa/ml con la bottiglia nuova (23 ottobre). La differenza viene dalle **pareti delle bottiglie che cedono** sotto pressione: equivalgono a circa 210–235 ml d'aria in più, quasi tutti nella bottiglia da 1,5 L, e si vedono anche come un lento calo (−10…−13 %) dopo ogni spinta, il cedimento viscoelastico. Questo effetto andrà nel modello (fase 3).

**Tenuta.** Con la bottiglia a circa +1,8 kPa, dopo 10 minuti restava il 93 % della sovrapressione (18 ottobre, τ di molte ore); il 24 ottobre, dopo molte aperture del tappo, il 79 % (τ ≈ 43 min). Il requisito è τ ≥ 30 minuti. Una perdita lenta fa sì che il circuito "dimentichi" la pressione di chiusura nel giro di ore: il punto di lavoro va ritrovato a ogni sessione.

## 2.3 Il palombaro

- **Costruzione:** pipetta da 3 ml accorciata a circa 6 cm (tettarella e un tratto di gambo), con circa 55 cm di filo di rame da 0,8 mm avvolto come zavorra e un marcatore rosso in cima per la telecamera. Si tara nella bottiglia d'uso; la correzione fine si fa con il rame (2 mm ≈ 0,009 g).
- **Sensibilità:** con una bolla di circa 2 ml, 1 kPa di pressione cambia la spinta di circa 0,02 g, meno di una goccia d'acqua: la taratura con le gocce non converge.
- **Tensione superficiale:** quando la punta sporge dall'acqua, il menisco trattiene il palombaro con una forza fino a circa 3 mN (0,3 g), più di quanto la siringa possa togliere. Rimedi: marcatore senza pieghe e qualche goccia di **soluzione** di detersivo (una goccia in un cucchiaino d'acqua) sul pelo dell'acqua e sulla punta. Troppo detersivo fa schiuma; l'acqua aggiunta senza detersivo lo diluisce e il menisco torna.
- **Soglie** (23 ottobre, bottiglia nuova, servo): va a fondo a circa **+2,2 kPa**, risale dal fondo a circa **+0,4 kPa**. La differenza (circa 1,8 kPa) corrisponde quasi tutta alla colonna d'acqua sopra il fondo (circa 22 cm, cioè 2,2 kPa): sul fondo la bolla è più compressa.
- **Deriva del punto di equilibrio:** la pressione atmosferica (±1 kPa in pochi giorni), la temperatura dell'acqua (circa 0,5 kPa per °C, tra gas e vapore) e l'aria della bolla che si scioglie nell'acqua spostano l'equilibrio di 1–2 kPa da un giorno all'altro. Il 21 ottobre il palombaro era troppo leggero, il 23 troppo pesante.

## 2.4 L'attuatore: servo, braccio e siringa

- **Servo** MG996R sdraiato su un fianco, fissato con 5 viti usate come pioli più colla a caldo; alberino a 9 mm dalla tavoletta.
- **Braccio:** due squadrette a doppio braccio incollate (prolunga), foro di lavoro a **35 mm** dall'asse.
- **Asticella** d'acciaio da 1,5 mm, 110 mm tra i perni: Z nel foro del braccio, L in un foro da 1,5 mm nella nervatura dello stantuffo (fatto con il filo stesso scaldato, per avere un foro senza gioco).
- **Siringa** su due distanziali, bloccata con viti attorno all'aletta: le sole fascette non bastavano, il cilindro scivolava.
- **Manovellismo:** con ±60° attorno al braccio verticale la corsa è di circa 60 mm (17 ml), non lineare: circa 0,6 mm per grado al centro e 0,3 mm per grado agli estremi.
- **Comando:** c0 = 86 (braccio verticale); comandi tra **36 e 146**. Il limite inferiore è stato portato da 26 a 36 dopo che, tirando fino a 26 con il circuito in depressione, la siringa si è spostata.

**Calibrazione** (23 ottobre, circuito chiuso a 36): da 36 a 146 la pressione sale di 2,37 kPa, poi **2,64 kPa** con l'acqua aggiunta. **Ripetibilità** sugli estremi: ±9 Pa su 5 cicli, ±11 Pa su 3 cicli, escursione 2,62–2,67 kPa su 10 cicli (24 ottobre).

**Zona morta.** A ogni inversione il servo gira circa 10° prima che lo stantuffo si muova (circa 1 ml): sono il gioco dei fori e degli ingranaggi, l'attrito di primo distacco della gomma e l'asticella che si accorcia sotto carico. Vale 15–200 Pa tra andata e ritorno. È ripetibile, quindi si potrà compensare nel programma (compensazione del gioco); è una non linearità di cui tenere conto nel progetto del controllo (cicli limite).

## 2.5 Elettronica

- **ESP32** DevKit sulla breadboard, alimentato dall'USB del PC.
- **BMP280** nel tappo, I²C a 3,3 V (SDA 21, SCL 22), cavo a 4 fili con pin rigidi saldati e ancorato al tavolo.
- **Servo** alimentato a parte (alimentatore 5 V 3 A con condensatore da 1000 µF), massa comune con l'ESP32 sulla striscia della breadboard; segnale su GPIO 18. Nessun brownout con il servo in movimento.
- **Firmware di banco** (`firmware/src/prova_banco.cpp`): pressione e temperatura a 50 Hz, servo comandato dalla seriale un grado ogni 15 ms entro i limiti; controllo ogni secondo che il sensore risponda (se no, lo segnala e riprova), motivo dell'ultimo riavvio all'avvio.

## 2.6 Software sul PC

- **Registratore** (`pc/registra_seriale.py`): scrive la seriale su file con l'orario al millisecondo, riapre la porta se l'USB viene staccato, e inoltra all'ESP32 i comandi scritti in un file. È l'unico programma che usa la porta seriale.
- **Dashboard** (`pc/dashboard/`, bozza del 24 ottobre, solo su localhost): segue il registro (Server-Sent Events) e mostra pressione, sovrapressione, temperatura, angolo del servo, grafici ed eventi; comanda il servo con un cursore verticale (in alto tira e il palombaro sale, in basso spinge). Il verso è pensato per il comando della quota che verrà.

## 2.7 Sicurezza e affidabilità

- **Acqua ed elettronica (R8):** nell'aria satura della bottiglia la schedina del sensore si è bagnata di condensa (21 ottobre): il chip rispondeva all'accensione e spariva appena misurava. Rimedi: asciugatura, smalto protettivo (da fare), mai stringere la bottiglia con l'acqua al collo, tappo del sensore fuori dalla bottiglia quando il banco è fermo.
- **Contatti:** il sensore si è perso tre volte per un contatto (jumper della massa allentato, pin mossi avvitando il tappo). Rimedi: continuità misurata con il multimetro, tappo avvitato tenendo fermo il cavo e girando la bottiglia, e la segnalazione automatica nel firmware e nella dashboard.
- **Pressioni:** stringendo la bottiglia con il tubo collegato si superano +25 kPa, fuori dalla scala del sensore (110 kPa assoluti): non si fa.
- **Servo:** limiti di corsa nel firmware e nella dashboard, movimento graduale, servo riportato al centro prima di spegnere.

## 2.8 Lezioni dalla costruzione

- Misurare prima di provare: quando una prova fallisce due volte si cerca la causa con una misura (multimetro, registro, conto), non con un altro tentativo.
- Le grandezze "di contorno" (cedimento delle pareti, tensione superficiale, meteo, temperatura) valgono quanto quelle di progetto: il margine della siringa era piccolo e ognuna bastava a farlo saltare.
- Il punto di lavoro non è una costante del banco: il controllore dovrà ritrovarlo a ogni avvio (stato CALIBRAZIONE) e il palombaro non dovrà mai riemergere (il menisco è un'isteresi).
