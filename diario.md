# Diario di laboratorio: Palombaro di Cartesio

> Una voce per ogni sessione di lavoro (attività T1 del piano operativo).
> Modello: data · sottofase · ore → Fatto · Problemi · Decisioni (e perché) · Foto/file · Prossimo passo.

## 2026-10-10 · sottofase 1.1 · ore: da compilare

**Fatto:**
- Creata la struttura del progetto e inizializzato git (primo commit `chore: struttura iniziale del progetto Palombaro di Cartesio`).
- Aggiunti `.gitignore` e questo diario.
- Creato l'ambiente virtuale Python (`.venv`) con OpenCV, pyserial, numpy, matplotlib; versioni congelate in `pc/requirements.txt`.
- Creato `pc/test_camera.py` per provare l'iPhone come webcam.
- Creato il progetto PlatformIO di prova in `firmware/` (ESP32 Dev Module, framework Arduino); compila (RAM 6,6 %, Flash 20,4 %).
- Creato il repository privato su GitHub e fatto il primo push (T2).
- Provato l'iPhone come webcam con `pc/test_camera.py`: funziona. Indice telecamera **0**, collegamento **Wi-Fi** (stessa rete del Mac) con Bluetooth attivo, senza cavo. Il contatore mostra la media dall'avvio, quindi sale piano: da 24,4 a 28,5 fps nei primi secondi, in avvicinamento ai 30 fps nominali (soglia del piano: 25 fps).

- Installato MATLAB R2026b (licenza accademica) con Simulink e Control System Toolbox. Verificato: `tf(1,[1 1])` stampa `1/(s+1)` (funzione di trasferimento a tempo continuo) e `simulink` apre la Start Page.

**Sottofase 1.1 chiusa:** OpenCV mostra il video dell'iPhone, PlatformIO compila, MATLAB apre Simulink.

**Problemi:**
- Il contatore fps di `pc/test_camera.py` è la media dall'avvio, non il valore istantaneo: sale lentamente verso i 30 fps. Per la misura vera (2.2) servirà una media mobile.

**Decisioni (e perché):**
- Video (`media/*.mp4`, `*.mov`) fuori da git perché pesanti; i CSV di `dati/` restano versionati per poter riprodurre i risultati.
- `Materiale teorico/` fuori da git: PDF pesanti e libri che non devono finire su un repository remoto.

**Foto/file:**

**Prossimo passo:** sottofase 1.2 (costruire e tarare il palombaro).
