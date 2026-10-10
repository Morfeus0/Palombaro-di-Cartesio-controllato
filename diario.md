# Diario di laboratorio: Palombaro di Cartesio

> Una voce per ogni sessione di lavoro (attività T1 del piano operativo).
> Modello: data · sottofase · ore → Fatto · Problemi · Decisioni (e perché) · Foto/file · Prossimo passo.

## 2026-10-10 · sottofase 1.1 · ore: da compilare

**Fatto:**
- Creata la struttura del progetto e inizializzato git (primo commit `chore: struttura iniziale del progetto Palombaro di Cartesio`).
- Aggiunti `.gitignore` e questo diario.
- Creato l'ambiente virtuale Python (`.venv`) con OpenCV, pyserial, numpy, matplotlib; versioni congelate in `pc/requirements.txt`.
- Creato `pc/test_camera.py` per provare l'iPhone come webcam.
- Creato il progetto PlatformIO di prova in `firmware/` (ESP32 Dev Module, framework Arduino).

**Ancora da fare per chiudere la 1.1:**
- Installare MATLAB + Simulink + Control System Toolbox (licenza Sapienza) e verificare `tf(1,[1 1])` e `simulink`.
- Provare `pc/test_camera.py` con l'iPhone (Continuity Camera) e annotare qui indice della telecamera e fps.
- Creare il repository privato su GitHub e fare il primo push (T2).

**Problemi:**

**Decisioni (e perché):**
- Video (`media/*.mp4`, `*.mov`) fuori da git perché pesanti; i CSV di `dati/` restano versionati per poter riprodurre i risultati.
- `Materiale teorico/` fuori da git: PDF pesanti e libri che non devono finire su un repository remoto.

**Foto/file:**

**Prossimo passo:** chiudere le tre voci sopra, poi sottofase 1.2 (costruire e tarare il palombaro).
