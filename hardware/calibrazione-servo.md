# Meccanica servo–siringa e calibrazione (sottofase 1.7)

> Iniziato il 18 ottobre 2026. Le misure segnate ⚠️ non tornano e vanno rifatte.

## Misure (18 ottobre)

| Grandezza | Valore | Note |
|---|---|---|
| Corsa della gomma dello stantuffo da 0 a 10 ml | 67 mm | ⚠️ non torna con la misura dell'asta |
| Asta dello stantuffo che sporge dalla siringa | 24 mm a 0 ml, 70 mm a 10 ml (cioè 46 mm) | ⚠️ gomma e asta si muovono insieme: una delle due misure è sbagliata. **Rifare** misurando con il righello la distanza tra le tacche 0 e 10 ml stampate sulla siringa |
| Diametro esterno della siringa | "6,5 cm" | ⚠️ impossibile per una siringa da 10 ml (circa 1,5–1,7 cm): rifare |
| Asse della siringa appoggiata sul tavolo | circa 1 cm dal tavolo (misurato al tubicino centrale) | — |
| Servo MG996R, corpo senza alette | 40 × 19 mm | distanza tra i due fori della stessa aletta: 10 mm; manca la distanza tra le alette lungo il corpo |
| Altezza dell'alberino dal tavolo, servo sul fianco | circa 28 mm | — |
| Squadrette disponibili | stella a 6 bracci, disco, doppio braccio, croce (`IMG_1836`) | — |
| Squadretta a doppio braccio | lunga 37 mm; foro centrale da 3,5 mm | forellini a 6, 9, 12, 15 mm dal **bordo** del foro centrale, quindi a **7,75 / 10,75 / 13,75 / 16,75 mm dall'asse** |
| Asticelle a Z QUARKZMAN | 1,5 × 300 mm, piega a Z a un'estremità sola | `IMG_1837`–`IMG_1840` |
| Tavoletta | 298,5 × 159 × 27 mm | — |

## Prima analisi: la corsa non basta

Il servo, la squadretta e l'asticella formano un manovellismo. Con il braccio di raggio r e una rotazione θ centrata sui 90° (braccio perpendicolare alla siringa, il tratto più lineare), lo stantuffo si sposta di circa **2·r·sin(θ/2)**.

| Raggio | Corsa a 180° (2r) | Corsa a ±60° (1,73r) |
|---|---|---|
| 16,75 mm (foro più lontano) | 33,5 mm | 29 mm |

Con 6,7 mm/ml (se vale la misura della gomma) 33,5 mm sono **5,0 ml**; con 4,6 mm/ml (se vale quella dell'asta) sono **7,3 ml**. In tutti e due i casi siamo sotto gli **8 ml** del "Fatto quando" della 1.7.

**Il problema più importante è la pressione:**
- Guadagno misurato il 18 ottobre (1.4): **circa 0,10 kPa per ml** (volume d'aria efficace circa 990 ml: camera 200 ml + bottiglia piccola 550 ml + tubi, più le pareti che cedono).
- Per tenere il palombaro a quote diverse la pressione dell'aria deve cambiare di **ρ·g·Δh**: per tutta la colonna d'acqua (circa 25 cm) servono circa **2,5 kPa**, per una fascia di 10 cm circa 1 kPa.
- Con 5–7 ml la siringa dà solo **0,5–0,7 kPa**, cioè una fascia di quota di 5–7 cm.

## Opzioni da decidere (prossima sessione)

1. **Braccio più lungo:** una prolunga rigida avvitata alla squadretta (listello di legno, lamierino, o la squadretta a croce con un'asta) per arrivare a r ≈ 30 mm: corsa circa 52–60 mm, quindi 8–10 ml. Contro: meno forza sullo stantuffo e meno precisione per grado (circa 0,5 mm per grado).
2. **Meno aria:** togliere o ridurre la bottiglia da 0,5 L. Con la sola camera d'aria (200 ml + tubi) il guadagno sale di circa 3–4 volte, e 5 ml darebbero circa 2 kPa. Il foglio A4 prevedeva un volume extra di circa 300 ml, non 550. Contro: ogni grado del servo vale più pascal (meno risoluzione) e il sistema diventa più rapido.
3. **Le due insieme**, dosate: ad esempio braccio da circa 25 mm e un volume extra più piccolo.

Prima di scegliere: rifare le misure ⚠️ e ricontrollare il calcolo del foglio A4 (proposta) sulla pressione necessaria.

## Analisi del 18 ottobre, sera (proposta, da confermare con le misure)

**1. Le pareti cedono: circa 210 ml "in più", quasi tutti nella bottiglia da 1,5 L.** Le due prove con la siringa danno lo stesso risultato. Il volume efficace si ricava da Boyle come V_eff = p₀·10 ml / Δp + 10 ml:

| Prova | Volume d'aria vero | Δp a regime | V_eff | In più |
|---|---|---|---|---|
| 17 ott, 1,5 L vuota + tubo B | circa 1550 ml | 0,58 kPa | 1755 ml | **circa 205 ml** |
| 18 ott, circuito completo | 765 ml | 1,02 kPa | 1000 ml | **circa 235 ml** |

La parte che cede è quindi soprattutto la 1,5 L (circa 2 ml di rigonfiamento per kPa). Togliere aria dalla 0,5 L aiuta, ma meno di quanto stimato prima ("3–4 volte"): il guadagno passa da 0,10 a circa **0,21–0,24 kPa/ml**, non oltre. La discesa lenta dopo ogni spinta (dal picco al valore di regime, −10…−13 %) è lo stesso cedimento, che arriva con un ritardo: servirà nel modello dell'anello di pressione (fase 3).

**2. Quanta pressione serve davvero.** Il palombaro sta in equilibrio dove p_aria + ρ·g·z è costante, quindi spostare l'equilibrio di Δz richiede ρ·g·Δz = **0,98 kPa ogni 10 cm**. Con l'acqua fino alla spalla (circa 22 cm) e un palombaro lungo circa 3,5 cm, la fascia utile è di circa 15 cm, cioè 1,5 kPa, più circa 0,5 kPa di margine per il controllo e la taratura: **minimo 2,0 kPa, comodo 2,5 kPa**. Il foglio A4 era coerente (simulazione `landing/sim.js`: 310 ml d'aria in tutto, 10 ml danno circa 3,3 kPa), ma non contava né la bottiglia extra da 550 ml né le pareti che cedono.

**3. Conseguenza:** il braccio più lungo da solo non basta (anche 10 ml pieni danno solo circa 1 kPa). Servono **meno aria e tutta la corsa**:

| Configurazione | Guadagno | 9 ml (siringa da 10) | 18 ml (siringa da 20) |
|---|---|---|---|
| Oggi (0,5 L vuota) | 0,10 kPa/ml | 0,9 kPa | 1,9 kPa |
| 0,5 L con 500 ml d'acqua (restano circa 50 ml d'aria) | circa 0,21 kPa/ml | **1,9 kPa** (al limite) | **3,8 kPa** (comodo) |

**4. Geometria proposta:** due squadrette a doppio braccio sovrapposte (quella del servo di scorta fa da prolunga), foro di lavoro a **r = 35,25 mm**. Biella (asticella) di circa **110 mm** tra i due perni: carico critico a punta circa 41 N, angolo massimo dell'asticella circa 19°.

| Rotazione del braccio | Corsa | ml (10 ml, circa 6,2 mm/ml) | ml (20 ml, circa 3,3 mm/ml) |
|---|---|---|---|
| ±45° | 50 mm | 8,0 | 15 |
| ±56° | 58 mm | 9,4 | 18 |
| ±60° | 61 mm | 9,8 | 18,5 |

Al centro della corsa: 0,62 mm per grado. Con la zona morta del servo (circa 0,5°) è circa 0,05 ml (10 ml) o 0,1 ml (20 ml), cioè **10–20 Pa per passo**, come stimato nella proposta (circa 17 Pa).

**5. Prova del guadagno con la 0,5 L quasi piena (18 ott, 21:50–21:57).** Nella 0,5 L ci sono 500 ml d'acqua, quindi restano circa 50 ml d'aria. Circuito chiuso con la siringa a mano a 10 ml, poi spinta a passi di 2 ml e ritorno, 30 s per passo. Registro: `dati/2026-10-18/2026-10-18_seriale-sera.log`.

| Siringa | Andata (kPa, a regime) | Ritorno (kPa) |
|---|---|---|
| 10 ml (chiusura) | 101,558 | 101,578 |
| 8 ml | 101,951 | 101,953 |
| 6 ml | 102,355 | 102,353 |
| 4 ml | 102,784 | 102,720 |
| 2 ml | 103,171 | 103,155 |
| 0 ml | 103,580 | — |

- **10 ml danno +2,02 kPa: guadagno 0,20 kPa/ml** (0,197 all'inizio, 0,205 alla fine: è la curva di Boyle). Era previsto circa 0,21.
- Volume efficace 103,58 · 10 / 2,02 ≈ **512 ml**, contro circa 276 ml d'aria vera: le pareti valgono ancora circa **235 ml**, quindi il cedimento è confermato e viene quasi tutto dalla 1,5 L.
- Il calo lento dopo ogni passo ora è piccolo (al massimo −25 Pa).
- Andata e ritorno coincidono entro circa 60 Pa: è l'errore nel portare la gomma sulle tacche a mano (circa 0,3 ml). Alla fine resta +20 Pa, compatibile con l'aria scaldata di 0,1 °C: **nessuna perdita**.
- **Con la siringa da 20 ml** (decisa la sera del 18, da comprare lunedì 19): 18 ml di corsa danno circa **3,6 kPa**, contro i 2,0–2,5 necessari. Il margine si potrà spendere rimettendo un po' d'aria nella 0,5 L, per avere meno pascal per passo del servo. Ad esempio, per arrivare a circa 3 kPa con 18 ml si tolgono circa 90 g d'acqua.

**6. Prolunga incollata (18 ott, 21:15–21:40; foto `IMG_1843`–`IMG_1845`).** Due squadrette a doppio braccio incollate con l'epossidica, con 3 perni di filo di rame nei fori che combaciano. Dalle foto i due mozzi sono a circa 24 mm, cioè il foro più esterno di una squadretta sta sul primo foro dell'altra (4 fori combaciano, 3 hanno il perno). I fori del braccio libero sono quindi a circa **32, 35, 38 e 41 mm** dal mozzo che va sul servo; si lavora con quello a 35 mm (o 32: con la siringa da 20 ml bastano tutti e due). **Da verificare con il righello** prima del montaggio.
- I perni sporgono di circa 6 mm da un lato solo: quel lato va **verso l'esterno**. Sul servo si monta quindi la squadretta che ha il mozzo scanalato dal lato in cui i perni sono a filo. Dopo l'indurimento, i perni si accorciano a circa 2 mm con il tronchesino, tenendo ferma l'unione.
- Mozzo scanalato e fori del braccio libero sono rimasti puliti.

**7. Siringa da 20 ml (19 ott).** Due siringhe **PIC Solution** da 20 ml.

| Grandezza | Valore |
|---|---|
| Tacche 0 → 20 ml | **70 mm**, cioè **3,5 mm/ml** (area 2,86 cm², diametro interno circa 19,1 mm) |
| Bordo anteriore della gomma | a 15 mm (0 ml) e a 85 mm (20 ml) dal riferimento: torna con le tacche |
| Diametro esterno | circa 20 mm |
| Alette | 38 × **12 mm**, spessore circa 1–2 mm (21 ott) |
| Disco di spinta | 28 mm |
| Asta | a croce, nervature che sporgono 7 mm dall'asse, spesse circa 1 mm |
| Cilindro (dalla faccia posteriore delle alette alla punta del cono) | **103 mm** (21 ott) |
| Nel circuito (0,5 L con 500 ml d'acqua) | 20 ml spinti danno **+4,0 kPa** (17:55–17:57), cioè 0,20 kPa/ml |

Con il foro a 35,25 mm: ±56° fanno 58 mm, cioè **circa 16,7 ml e circa 3,3 kPa**. Al centro della corsa 0,62 mm per grado, cioè 0,18 ml e circa 35 Pa per grado.

**8. Misure e geometria del montaggio (21 ottobre).** Misure: prolunga e servo con il righello, la siringa era già misurata (sezione 7).

| Grandezza | Valore |
|---|---|
| Fori del braccio libero della prolunga, dal centro del mozzo che va sul servo | **32, 35, 38, 41 mm** (come stimato dalle foto): si usa quello a **35 mm** |
| Asticella da 1,5 mm nel foro a 35 mm | entra senza forzare e non balla |
| Servo sdraiato su un fianco largo: centro dell'alberino | **9 mm** sopra la tavoletta |
| Nervatura dell'asta dello stantuffo | circa 1 mm |

- **Prolunga finita:** perni di rame accorciati a circa 2 mm; braccio libero della squadretta che va sul servo tagliato a circa 6,5 mm dal mozzo (con l'alberino a 9 mm, quel braccio da 18,5 mm avrebbe urtato la tavoletta con il braccio lungo verticale).
- **Montaggio scelto:** servo sdraiato su un fianco largo all'estremità sinistra, alberino a 25 mm dal bordo sinistro che punta verso il bordo lontano, corpo verso destra; braccio lungo verticale al centro della corsa, che ruota di ±60° in un piano verticale parallelo alla siringa. Siringa con l'asse a 100 mm dal bordo vicino, su due distanziali da circa 11 mm (asse a circa 21 mm), **alette verticali**: con le alette orizzontali la flangia sporgerebbe solo 6 mm dall'asse, meno del raggio del cilindro, e non ci sarebbe niente da bloccare. L'aletta in basso scende fino a circa 2 mm dalla tavoletta e fa da fermo: davanti il distanziale, dietro una vite che sporge al massimo 5 mm (il disco di spinta scende fino a circa 7 mm).
- **Collegamento allo stantuffo:** asticella di 110 mm tra i perni, Z nel foro a 35 mm, L (gamba di 7 mm) in un foro da 1,5 mm nella nervatura verticale superiore dell'asta, 4 mm sopra l'asse e 3 mm davanti al disco; il foro si fa con lo spezzone d'asticella scaldato, così viene della misura del filo. Il disco di spinta va intaccato dall'alto (circa 4 × 12 mm) per far passare l'asticella.
- **Manovellismo** (r = 35 mm, asticella 110 mm, perno sullo stantuffo circa 15 mm sopra l'alberino):

| | Valore |
|---|---|
| Corsa a ±60° | 60,6 mm = **17,3 ml ≈ 3,5 kPa** |
| Dal braccio verticale | +32 mm verso la siringa, −28 mm verso il servo |
| Stantuffo con il braccio verticale | **circa 11 ml** (corsa da 1,3 a 18,7 ml) |
| mm per grado | 0,61 al centro, circa 0,3 agli estremi: la tabella comando → kPa non sarà lineare |
| Angolo massimo dell'asticella | circa 12° |

- **Firmware del banco** (`firmware/src/prova_banco.cpp`): servo limitato a `ANGOLO_CENTRO ± 60` (30–150 finché c0 non è misurato), sempre un grado ogni 15 ms anche con i comandi singoli, `s` = 150 → 30 → 90.
- **Stato a fine giornata:** linee a matita tracciate (asse della siringa a 100 mm, alberino a 25 mm); servo posizionato e contorno tracciato (Blocco 4, passi 1–2), non ancora fissato. Asticella tagliata in serata.

**9. Montaggio e calibrazione (23 ottobre).** Registro: `dati/2026-10-23/2026-10-23_seriale.log.gz`.

- **Montaggio:** servo sdraiato su un fianco largo, alberino verso il bordo lontano a circa 36 mm dal bordo sinistro (la linea a 25 mm è finita sul bordo del corpo: va bene così), 5 viti come pioli più colla a caldo; leggermente ruotato (9,1 e 9,4 cm dal bordo vicino ai due estremi). Prolunga sui dentini con il braccio verticale e la vite centrale. Asticella rifatta con un filo nuovo, più dritta (la prima era incurvata). Siringa n. 2 con foro da 1,5 mm nella lamella superiore dello stantuffo (4 mm sopra l'asse, 4 mm davanti al disco) e tacca nel disco; M6 (asta scoperta a 0 ml, dalle alette al disco) = **15 mm**. Siringa su due distanziali di cartone ondulato con le fascette sotto; le fascette da sole non la tenevano (a ogni spinta scivolava di parecchio): bloccata con **viti e nastro isolante** attorno all'aletta in basso.
- **c0 = 86** (braccio verticale); aumentando il comando il braccio va verso la siringa e la pressione sale. Firmware: `ANGOLO_CENTRO = 86`, limiti 26–146.
- **Comando → ml (tubo staccato, letto a occhio):** 86 ≈ 11, 96 ≈ 9,5, 106 ≈ 7, 116 ≈ 6, 126 ≈ 4,5, 136 ≈ 3 ml, entro ±0,5 ml dal modello della sezione 8.
- **Isteresi:** a 86 si legge 11 ml arrivando da 36 e 10 ml arrivando da 136, sempre uguale; la siringa non si muove. È una **zona morta di circa 10°** a ogni inversione (da 36 a 46, dopo aver tirato, la pressione sale solo di 0,03 kPa invece di circa 0,2): gioco dei fori e degli ingranaggi, attrito di primo distacco della gomma, asticella che si accorcia.
- **Prima calibrazione (22:48–22:55, chiusura a 86, 101,29 kPa):** da 86 a 36 −1,05 kPa; gioco tra andata e ritorno 150–200 Pa.
- **Estremo 26 da evitare:** il 23 alle 23:02:52, tirando fino a 26 con il circuito in depressione (−2,2 kPa), la pressione è risalita di colpo di 0,24 kPa e la siringa si è spostata. Proposta (da decidere): limite minimo a 36.
- **Calibrazione con la bottiglia nuova (23:22–23:27, chiusura a 36, 101,31 kPa):**

| Comando | 36 | 46 | 56 | 66 | 76 | 86 | 96 | 106 | 116 | 126 | 136 | 146 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Spingendo [kPa] | 0 | +0,03 | +0,20 | +0,42 | +0,64 | +0,92 | +1,16 | +1,37 | +1,69 | +1,91 | +2,17 | +2,37 |
| Tirando [kPa] | −0,14 | +0,03 | +0,22 | +0,43 | +0,66 | +0,95 | +1,19 | +1,46 | +1,75 | +1,97 | +2,21 | |

  Gioco tra andata e ritorno 15–90 Pa nella parte centrale. Guadagno circa 0,15 kPa/ml (0,20 il 19: più aria nel circuito con la bottiglia nuova).
- **Ripetibilità (23:29–23:34, 5 cicli 36 ↔ 146, 30 s per estremo):** escursione 2,421 / 2,412 / 2,411 / 2,412 / 2,403 kPa, cioè **±9 Pa**. Gli estremi scendono insieme di circa 17–20 Pa a ciclo: è il circuito (perdita lenta e cedimento delle pareti), non il servo.
- **+50 ml d'acqua nella bottiglia grande** (23:4x) per ridurre l'aria: escursione **2,66 / 2,64 / 2,64 kPa** su 3 cicli (23:55–23:59), cioè **±11 Pa**. **Il «Fatto quando» della 1.7 è raggiunto** (≥ 2,5 kPa, ripetibile entro ±25 Pa).
- **Tenuta da ricontrollare:** fermo a 146 (+2,6 kPa) il calo tra 10 e 40 s è stato 0,044 kPa alle 23:24, 0,074 alle 23:52 e 0,103 alle 23:56 (con la temperatura in salita di 0,2 °C, che dovrebbe far salire la pressione). Il limite della prova rapida è 0,05: va fatta la prova di 10 minuti della 1.6.

## Da fare nella 1.7 (dal piano)

- [x] Scelta della geometria (sopra): siringa da 20 ml, meno aria, foro a circa 35 mm. Prolunga incollata il 18 ottobre.
- [x] Siringhe da 20 ml (lun 19) e loro misure (19 e 21 ott).
- [x] Montaggio di servo e siringa sulla tavoletta (21 e 23 ott, sezioni 8 e 9).
- [x] Collegamento braccetto–stantuffo (asticella a Z e L, 23 ott).
- [x] Misura della corsa utile (36–146: 2,64 kPa).
- [x] Tabella di calibrazione comando → kPa (sezione 9).
- [x] Zona morta e gioco (circa 10° a ogni inversione; 15–200 Pa).
- **Fatto quando:** escursione di pressione ≥ 2,5 kPa, ripetibile entro ±25 Pa su 5 andate e ritorni (cambiato il 18 ottobre, prima era ≥ 8 ml entro ±0,1 ml). **Giovedì 22 ottobre si decide sul piano B** (passo-passo + barra filettata) se la ripetibilità non basta (rischio R3).
