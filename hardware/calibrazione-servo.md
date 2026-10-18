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

## Da fare nella 1.7 (dal piano)

- [ ] Scelta della geometria (sopra) e montaggio di servo e siringa sulla tavoletta.
- [ ] Collegamento braccetto–stantuffo il più possibile senza gioco (asticella a Z).
- [ ] Misura della corsa utile.
- [ ] Tabella di calibrazione: comando del servo → ml spostati.
- [ ] Stima della zona morta e del gioco meccanico.
- **Fatto quando:** corsa utile ≥ 8 ml, ripetibile entro ±0,1 ml su 5 andate e ritorni. **Giovedì 22 ottobre si decide sul piano B** (passo-passo + barra filettata) se la ripetibilità non basta (rischio R3).
