# 4. Modello e linearizzazione

> **Bozza** (sottofase 3.1, 5 novembre 2026, anticipata). I numeri si calcolano con `analisi/modello.m`
> (MATLAB, Control System Toolbox), che controlla anche le formule ricavate qui a mano. I parametri segnati «stima» li
> ricaverà dai dati la sottofase 3.4; la retta di equilibrio è già confermata dalle misure della 3.2
> (`analisi/parametri.md`). Da completare con l'identificazione (3.4) e il confronto con il gemello digitale (3.5).

## 4.1 Grandezze e ipotesi

| Simbolo | Significato | Unità |
|---|---|---|
| h | quota del palombaro sopra la sua posizione sul fondo, positiva verso l'alto | m |
| p | pressione **assoluta** dell'aria nella bottiglia (misurata dal BMP280) | Pa |
| H | profondità della bolla quando P1 è sul fondo | m |
| V_b, V_s | volume della bolla all'equilibrio; volume dei materiali di P1 (plastica, rame, nastro) | m³ |
| m, m_eff | massa di P1 con l'acqua che contiene; massa efficace con l'acqua trascinata, m(1 + c_a) | kg |
| c | coefficiente di attrito viscoso per piccole velocità | N·s/m |
| V_sir, u | volume spinto dalla siringa; angolo del servo | ml; ° |

Ipotesi: acqua incomprimibile e alla stessa temperatura dell'aria; bolla **isoterma** (le variazioni di pressione sono
lente rispetto agli scambi di calore con l'acqua); P1 si muove solo in verticale; tensione superficiale trascurata
lontano dalla superficie; il moto di P1 non cambia la pressione nella bottiglia (la bolla è 2 ml contro circa 650 ml
d'aria).

## 4.2 Equazioni del palombaro

**Pascal.** La bolla sente la pressione dell'aria più quella dell'acqua che ha sopra:

    p_bolla = p + ρ g (H − h)

**Boyle.** La quantità d'aria nella bolla è fissa (nel tempo di una prova): il prodotto pressione × volume è costante.
Chiamando p_b* e V_b la pressione e il volume all'equilibrio,

    V(h, p) = p_b* V_b / (p + ρ g (H − h))

**Archimede e Newton**, verso l'alto positivo, con l'acqua trascinata come massa aggiunta e un attrito viscoso:

    m_eff ḧ = ρ g (V_s + V(h, p)) − m g − c ḣ

## 4.3 Parte pneumatica

Spingendo la siringa di V_sir l'aria della bottiglia si comprime; le pareti della bottiglia di plastica cedono e si
comportano come circa 210–235 ml d'aria in più (capitolo 2). Linearizzando Boyle con questo volume efficace V_eff:

    Δp = (p / V_eff) ΔV_sir = K_v ΔV_sir,    K_v ≈ 157 Pa/ml   (5 novembre: +2,77 kPa con circa 17,6 ml)

Il circuito perde un po' d'aria verso la stanza (rischio R2): con una perdita proporzionale alla sovrapressione la
pressione torna verso quella della stanza con costante di tempo τ (circa 90 minuti). Il servo sposta circa
K_s = 0,16 ml per grado. Quindi

    G_pv(s) = Δp / ΔV_sir = K_v · τ s / (τ s + 1),        G_vu = K_s

Per i tempi del controllo (secondi) il fattore τs/(τs + 1) vale praticamente 1: la perdita è un disturbo lento, che
corregge il termine integrale dell'anello di pressione. Restano fuori dal modello lineare il gioco del servo (circa 10°
a ogni inversione) e il cedimento lento delle pareti (−10…−13 % in qualche secondo dopo ogni spinta, e il rientro in
depressione visto il 5 novembre): entrano nel gemello digitale (3.5).

## 4.4 Equilibrio

P1 è fermo quando la spinta pareggia il peso, cioè quando la bolla ha esattamente il volume V_b = m/ρ − V_s. Per
Boyle questo succede a una sola pressione della bolla, p_b*, **qualunque sia la quota**. Dalla relazione di Pascal:

    p_eq(h) = p_b* − ρ g (H − h)            →      dp_eq/dh = ρ g = 9,78 kPa/m = 0,0978 kPa/cm

**La pressione di equilibrio è una retta della quota, con pendenza ρg, che non dipende dal palombaro.** Il palombaro
decide solo l'altezza della retta (p_b*, che cambia di giorno in giorno con l'aria disciolta e la temperatura).
**Verifica sperimentale (3.2):** 7 punti di equilibrio danno **0,098 ± 0,010 kPa/cm**.

## 4.5 Linearizzazione e funzione di trasferimento

Intorno a un punto di equilibrio (h*, p_eq(h*)), con δh e δp piccoli:

    ∂F/∂h = ρ g · p_b* V_b · ρ g / p_b*²  = (ρ g)² V_b / p_b*  ≡ k     > 0
    ∂F/∂p = − ρ g V_b / p_b*                                   ≡ − b_p

    m_eff δḧ + c δḣ − k δh = − b_p δp

Il segno di k è il cuore del problema: se P1 sale di poco, ha meno acqua sopra, la bolla si gonfia, la spinta cresce e
P1 sale ancora. È una molla «al contrario». Il rapporto k/b_p vale proprio ρg: lo stesso numero della retta di
equilibrio. La funzione di trasferimento dalla pressione alla quota è

    G_hp(s) = δH(s) / δP(s) = − b_p / (m_eff s² + c s − k)

con poli reali di segno opposto. **Il polo instabile** è

    λ = ( −c + √(c² + 4 m_eff k) ) / (2 m_eff)          (senza attrito: λ = √(k / m_eff))

e dalla catena servo → siringa → pressione → quota

    G_hu(s) = δH / δU = − b_p K_v K_s · τ s / ( (τ s + 1)(m_eff s² + c s − k) )

a cui la telecamera aggiunge il ritardo e^(−s T_d), T_d = 156 ms.

### Valori con i parametri di oggi

| Parametro | Valore | Fonte |
|---|---|---|
| ρ, g | 997,6 kg/m³ (22,7 °C), 9,806 m/s² | — |
| H | 0,20 m | stima (acqua circa 22 cm) |
| V_b, V_s | 2,1 ml, 1,0 ml | stima (taratura del 19 ottobre, proposta) |
| m = ρ(V_s + V_b) | 3,09 g | equilibrio |
| c_a, c | 0,5; 0,004 N·s/m | stima, da identificare (3.4) |
| p_b* = p_det + ρgH | 103,60 kPa | soglia di distacco misurata il 5 novembre, 101,64 kPa |
| K_v, K_s, τ, T_d | 157 Pa/ml, 0,16 ml/°, 90 min, 0,156 s | misure di 1.7, 2.3 e del 5 novembre |

| Risultato | Valore |
|---|---|
| k | 1,94·10⁻³ N/m |
| b_p | 1,98·10⁻⁷ N/Pa, cioè **0,020 g di spinta per kPa** (la taratura del 19 ottobre stimava «circa 0,02 g per kPa») |
| poli di G_hp | **+0,346** e −1,208 rad/s |
| tempo di raddoppio di un errore | ln 2 / λ = **2,0 s** |

La proposta stimava +0,33 rad/s. Il polo dipende dai due parametri più incerti; MATLAB dà:

| λ [rad/s] | c = 0 | c = 0,002 | c = 0,004 | c = 0,008 |
|---|---|---|---|---|
| c_a = 0,2 | 0,723 | 0,502 | 0,363 | 0,220 |
| c_a = 0,5 | 0,647 | 0,466 | 0,346 | 0,216 |
| c_a = 1,0 | 0,560 | 0,421 | 0,323 | 0,209 |

L'attrito pesa più della massa aggiunta: per questo la 3.4 deve ricavarlo dalle fughe misurate.

**Primo confronto con i dati (3.3).** Con 0,12 kPa sotto la soglia il modello non lineare porta P1 dal fondo a 15 cm in
**8,2 s**; nelle fughe del 5 novembre ci vogliono circa 9–10 s dal gradino. Stesso ordine di grandezza, con P1 reale
un po' più lento: attrito o massa aggiunta più grandi delle stime, oppure l'adesione al fondo nei primi istanti.
Nella stessa simulazione il modello linearizzato segue quello non lineare entro pochi millimetri su tutta la colonna
(`analisi/figure/fuga_modello.png`): la bolla cambia volume solo del 2 % tra fondo e superficie, quindi **un modello
lineare unico vale a ogni quota**, e un solo controllore lineare può bastare per tutta la bottiglia.

## 4.6 Controllore PD sulla quota: criterio di Routh

Con l'anello interno della pressione ideale (la pressione segue il riferimento), un PD sulla quota comanda
δp = −(K_p e + K_d ė), con e = h − h_rif. L'equazione caratteristica è

    m_eff s² + (c + b_p K_d) s + (b_p K_p − k) = 0

Per un polinomio di secondo grado Routh chiede solo coefficienti positivi:

    K_p > k / b_p = ρ g = 97,8 Pa/cm,          K_d > −c / b_p   (cioè qualunque K_d ≥ 0)

**Il guadagno proporzionale deve superare la pendenza della retta di equilibrio:** per ogni centimetro di errore il
controllore deve cambiare la pressione di più di quanto la bolla «guadagni» salendo di un centimetro.

**Con il ritardo della telecamera** (Padé del primo ordine, e^(−sT) ≈ (1 − sT/2)/(1 + sT/2)) il polinomio diventa di
terzo grado, a₃s³ + a₂s² + a₁s + a₀, con

    a₃ = m_eff T/2
    a₂ = m_eff + c T/2 − b_p K_d T/2
    a₁ = c − k T/2 + b_p K_d − b_p K_p T/2
    a₀ = b_p K_p − k

e Routh chiede tutti i coefficienti positivi e a₂ a₁ > a₃ a₀. Ne vengono anche dei **limiti superiori**: il ritardo
non permette un derivativo qualsiasi (a₂ > 0: **K_d < 3201 Pa·s/cm**) né, con poco derivativo, un proporzionale
qualsiasi (con K_d = 0 la condizione a₂a₁ > a₃a₀ dà **K_p < circa 1330 Pa/cm**; più derivativo allarga il limite). La figura `analisi/figure/regione_pd.png` mostra la zona
stabile; i guadagni della simulazione della proposta (K_p = 470 Pa/cm, K_d = 290 Pa·s/cm) ci stanno dentro con
margine, e i poli dell'anello chiuso calcolati da MATLAB confermano Routh (parte reale massima −1,10 rad/s).

**Cosa resta fuori dal criterio** e andrà nel gemello digitale: la saturazione della siringa (±2–4 kPa), il gioco del
servo, il passo di 1° (circa 26 Pa), il rumore della quota e il campionamento a 30 Hz dell'anello esterno.

## 4.7 Identificazione dalle fughe misurate (sottofase 3.4)

**Dati:** 12 fughe in anello aperto del 5 novembre (`dati/anello-aperto/`), comandate dal programma della 3.3: 8 verso
l'alto partendo da P1 fermo sul fondo (pressione 0,12 o 0,26 kPa sotto la soglia), 4 verso il basso partendo dalla
superficie. Durante ogni fuga la pressione è tenuta costante dal programma; la quota è riportata all'istante vero della
scena togliendo l'età del dato e il ritardo della telecamera.

**Metodo** (`analisi/identificazione.m`). Con la pressione costante la soluzione del modello linearizzato è esatta:

    h(t) = (p_i − p₀)/(ρ g) + A_i e^(λt) + B_i e^(−(λ+β)t)

dove λ e −(λ + β) sono le radici di s² + βs − k/m_eff (β = c/m_eff). La costante non è libera: è la quota di
equilibrio per la pressione misurata p_i, con ρg confermato dalla 3.2 e p₀ unico per tutte le prove. Fissati λ e β,
le A_i, B_i e p₀ vengono da un solo sistema lineare; λ e β si cercano su una griglia (β ≥ 0) e si rifiniscono.
Due tentativi scartati, utili per la relazione: simulare il sistema instabile con la pressione misurata divergeva per
pochi pascal di errore sull'equilibrio; lasciare libera la costante di ogni prova faceva adattare bene le curve ma con
un attrito negativo, cioè senza significato fisico.

**Risultati.**

| Grandezza | Identificata | Modello (4.5) | Proposta |
|---|---|---|---|
| polo instabile λ | **0,326 rad/s** (compatibile con i dati: 0,29–0,36) | 0,346 | 0,33 |
| equilibrio a quota 0, p₀ | 101,54 kPa | soglia misurata 101,64 | — |
| R² delle 12 fughe | **0,981–0,999** (media 0,993) | — | — |

Il **«Fatto quando» della 3.4 (R² ≥ 0,9)** è superato in tutte le prove (`analisi/figure/identificazione.png`).

**Cosa le fughe non dicono.** Il costo ha una valle piatta lungo β (da 0 a 1,8 1/s): le fughe fissano con precisione
la rapidità con cui P1 scappa (λ), ma non quanto di essa venga dalla «molla al contrario» k/m_eff e quanto
dall'attrito. Combinando λ con k/m_eff del modello (0,418 1/s²) si ottiene β ≈ 0,96 1/s, cioè **c ≈ 0,0044 N·s/m**, la
stessa stima usata nel modello. Per il controllo il numero che conta è λ, che i dati confermano. Per separare massa
aggiunta e attrito servirebbero prove diverse (per esempio oscillazioni in anello chiuso, nella fase 4).

## 4.8 Gemello digitale in Simulink (sottofase 3.5)

Il modello `analisi/palombaro.slx` si costruisce con `analisi/crea_gemello.m` (parametri in
`analisi/parametri_gemello.m`) ed è diviso in cinque sottosistemi:

| Sottosistema | Cosa contiene |
|---|---|
| Servo | comando in passi da 1°, velocità massima 300 °/s, gioco di 10° a ogni inversione, 0,16 ml/° |
| Siringa e aria | quantità d'aria del circuito (Pa·ml) con la perdita verso la stanza (τ = 90 min); p = aria/(V_eff − ml spinti), V_eff = 640 ml |
| Palombaro | il modello non lineare della sezione 4.2 (Archimede, Boyle, Pascal, attrito), con fermi al fondo e in superficie; p₀ e attrito dalla 3.4 |
| Sensore di pressione | rumore 2,5 Pa, risoluzione 1 Pa, 100 letture al secondo |
| Telecamera | ritardo 156 ms, rumore 0,32 mm, 60 immagini al secondo |

Un interruttore sceglie se la pressione viene dal servo (per provare i controllori) o da un segnale dato (per
confrontarsi con le prove registrate).

**Verifica** (`analisi/verifica_gemello.m`, figure `gemello_fughe.png` e `gemello_pressione.png`):

- **Fughe della 3.3**, rifatte nel gemello con la pressione misurata e partendo da quota e velocità misurate: le
  discese hanno R² tra 0,83 e 0,94, le salite tra 0,89 e 0,99 tranne due (0,61 e 0,33). Nelle salite il confronto
  parte da 3 cm sopra il fondo, perché nei primi 2 cm la quota letta fa degli scalini (marcatore vicino al fondo e alle
  costole) e falsa la velocità iniziale; un sistema instabile simulato senza retroazione amplifica ogni errore iniziale
  di circa 5 volte in 5 secondi, e le due prove peggiori sono quelle in cui la velocità iniziale è stimata peggio.
- **Servo e aria:** con i comandi del servo della prova 4 della 2.7 (2 minuti, P1 comandato a mano) la pressione del
  gemello segue quella misurata con **R² 0,89** (errore medio 0,23 kPa). In depressione la pressione vera scende fino a
  circa 0,4 kPa più di quella simulata: le pareti della bottiglia che rientrano non sono nel modello (capitolo 2).
  Per il controllo la conseguenza è che il guadagno della siringa cambia con il verso e la storia della pressione:
  l'anello interno della pressione con il termine integrale (fase 4) serve proprio a non dipenderne.

**Cosa manca al gemello** (da aggiungere se i controllori della fase 4 lo richiedono): il cedimento lento delle pareti,
il menisco in superficie, l'adesione al fondo, gli scalini della quota vicino al fondo, le pause dei fotogrammi.
