# Prompt per la nuova chat (domenica 18 ottobre 2026, seconda parte)

> Copia tutto il testo sotto la riga e incollalo come primo messaggio della nuova chat.

---

Ciao. Riprendo il progetto **Palombaro di Cartesio controllato** da un'altra chat (ho finito i crediti a metà giornata). Prima di tutto leggi questi file, per avere il quadro completo:

- `Piano operativo/piano-operativo-palombaro.md`: il piano, con le sottofasi e i criteri "Fatto quando";
- `diario.md`: in particolare le voci del **17 e del 18 ottobre**;
- `hardware/calibrazione-servo.md`: le misure per la 1.7 e il **problema di progetto da risolvere** (corsa e pressione);
- `hardware/collegamenti.md`: come è cablato il banco elettronico;
- `firmware/src/prova_banco.cpp` e `firmware/platformio.ini`: il programma caricato sull'ESP32;
- `landing/progresso-dati.js`: i dati del bollettino di avanzamento.

## Come voglio lavorare
- **Risparmiamo messaggi:** ogni tuo messaggio deve contenere tutte le informazioni e tutti i passaggi dettagliati, così posso fare più cose di fila e scriverti solo alla fine. Non vuol dire essere sommari: **sono un principiante** e devi guidarmi tu, spiegando ogni passaggio (cosa fare, dove, come controllare).
- **Foto** (file `.HEIC` nella cartella Download): convertile (`sips`) e guarda i dettagli importanti, ma con parsimonia: meglio un provino unico che tante immagini.
- **ESP32 collegato al Mac:** sei tu a caricare i programmi (`pio run -e <ambiente> -t upload --upload-port /dev/cu.usbserial-0001` dalla cartella `firmware`; ambienti: `esp32dev` = prova del tappo, `banco` = BMP280 a 50 Hz + servo) e a leggere la seriale con il Python di PlatformIO (`~/.platformio/penv/bin/python`, pyserial, porta aperta con DTR e RTS a False). Le registrazioni lunghe lanciale **staccate dalla sessione** (`nohup ... & disown`): il 18 una registrazione in background si è fermata da sola dopo 18 minuti.
- **Verifiche di contatto, tensione o continuità:** sempre con il **multimetro**, niente prove indirette.
- **A fine giornata:** diario (orari e divisione del tempo per attività), bollettino `landing/progresso-dati.js` (anche `storico`), piano, poi commit e push.

## Dove siamo (pausa delle 17:05 del 18 ottobre)
Lavoro di oggi finora: 15:20–17:05 (1 h 45). Oggi ho previsto 5 ore in tutto: restano circa 3 h 15.

- **1.3 chiusa** (17 ott). **1.5 chiusa** e **1.6 chiusa** (18 ott), in anticipo sul calendario.
- **1.4:** circuito montato (siringa → tubo A 50 cm → bottiglia 0,5 L, fissata con lo scotch perché cade → tubo B 65 cm → bottiglia 1,5 L con acqua fino alla spalla, segnata con nastro rosso, e tappo con il sensore). Volumi: camera d'aria 200 ml, bottiglia piccola 550 ml, tubi circa 15 ml. **10 ml di siringa danno +1,02 kPa** (guadagno circa 0,10 kPa/ml; volume efficace circa 990 ml perché pareti e tubo cedono). Manca solo la prova con il palombaro (lunedì).
- **1.6:** tenuta a +1,78 kPa, dopo 10 minuti resta il 93 % (richiesto ≥ 70 %), τ di molte ore.
- **1.5:** servo MG996R su GPIO 18 con alimentatore 5 V separato e condensatore da 1000 µF 25 V nei morsetti; masse comuni sulla striscia blu "−" della breadboard. 50 letture al secondo, nessun riavvio né brownout. Ora il servo è fermo a 90°, senza squadretta.
- **1.7: appena cominciata.** Misure in `hardware/calibrazione-servo.md`. Due misure della siringa vanno rifatte (corsa 67 mm della gomma contro 46 mm dell'asta per 10 ml; diametro esterno annotato "6,5 cm", impossibile).
- **Problema di progetto da decidere subito:** con il foro più lontano della squadretta (16,75 mm dall'asse) la corsa massima è circa 33 mm, cioè 5–7 ml, sotto gli 8 ml del piano. Con il guadagno misurato questo vale solo 0,5–0,7 kPa, mentre muovere il palombaro su tutta la colonna d'acqua (circa 25 cm) richiede circa ρ·g·0,25 m ≈ 2,5 kPa. Opzioni: braccio più lungo (prolunga sulla squadretta), meno aria (togliere o ridurre la bottiglia da 0,5 L; il foglio A4 prevedeva circa 300 ml extra), o tutte e due. Prima di scegliere, ricontrolla il calcolo della proposta (`Proposta progetto/`) e la simulazione `landing/sim.js`.

## Calendario confermato
| Giorno | Attività |
|---|---|
| Dom 18 (resto) | rifare le misure della siringa, decidere la geometria, montare servo e siringa sulla tavoletta (1.7) |
| Lun 19 | lezione 8:30–11:00; arrivano le pipette: 1.2 parte 1, poi chiusura della 1.4 con il palombaro |
| Mar 20 | 1.2 parte 2 (taratura fine) |
| Mer 21 – Gio 22 | 1.7 meccanica e calibrazione; **giovedì 22 decisione sul piano B** (rischio R3) |
| Ven 23 | margine |
| Sab 24 – Dom 25 | 1.8 e milestone M1 |

## Questioni aperte
- `letturaPlausibile()` in `firmware/src/main.cpp` è ancora un TODO che devo scrivere io: il guasto del 17 ottobre (pin sfilato: 2382 letture identiche, salto di 15 kPa e di 3 °C in un decimo di secondo, errori di timeout I²C) è l'esempio di cosa deve riconoscere.
- Bollettino: oggi è segnato come provvisorio; da confermare a fine giornata con le ore della seconda parte.

## Primo passo
Guidami a rifare le due misure della siringa, poi proponimi la soluzione al problema di corsa e pressione, con i conti, e il montaggio sulla tavoletta.
