# Revisione · video di M4 (10 novembre 2026)

Uscita: `media/2026-11-10_M4_quota-tenuta-entro-1-cm.mp4`, 64 s, 1920 x 1080, 30 fps, 31 MB.

## Scelte
- Un solo racconto, chiesto da Gabriele: il sistema completo per il professore. Nessuna storia alternativa proposta.
- Tre tempi della stessa prova (2026-11-10_4-5-pid-m4_04): calibrato a 5 cm e gradino a 10 cm a tempo reale con il
  suono vero del servo; il minuto a 10 cm a velocità x4, muto, con il contatore «entro ±1 cm da … s».
- Sincronizzazione: video esterno dalle 20:10:42,10 (servo che parte all'ingresso in HOLD); il video del banco rifatto a
  tempo reale dagli orari dei fotogrammi (pause dell'iPhone tenute ferme). Controllata sull'audio renderizzato: primo
  suono a 7,2 s (HOLD), picco a 24,1 s (gradino), fine a 38,5 s (fine del secondo tempo).
- Niente musica (nessuna fonte collegata e video tecnico).

## Misurato e guardato
- `hyperframes check`: nessun errore. Avvisi tenuti di proposito: `nested_media_start_basis_ambiguous` sui video dei
  tempi 2 e 3 (gli inizi sono locali alla scena, come voluto).
- Corretti dopo la prima revisione: titoli dei tempi su due righe sotto i numeri (P0), «cm» a capo nel titolo d'apertura
  (P0), pressione voluta fuori dal grafico all'ingresso in HOLD (P1), riga della fonte troppo breve da leggere (P1),
  valori mancanti sull'asse della pressione (P1).
- Audio misurato con `hyperframes audio`, non ascoltato.

## Più debole
- Il terzo tempo a x4: l'oscillazione di ±4 mm si vede meglio nel grafico che nella bottiglia. Con più tempo: un
  ingrandimento sulla zona di P1 durante il minuto.
