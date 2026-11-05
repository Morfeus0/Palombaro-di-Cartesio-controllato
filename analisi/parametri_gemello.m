%% Parametri del gemello digitale (sottofase 3.5): li legge analisi/palombaro.slx all'apertura (PreLoadFcn)
% Fonti: analisi/modello.m (3.1), analisi/parametri.md (3.2), analisi/identificazione.m (3.4), diario del 5 novembre.
% Unità: m, s, Pa, ml, gradi. Pressioni assolute.

rho_g   = 997.6*9.806;      % Pa/m
g_      = 9.806;            % m/s²
H_bolla = 0.20;             % m, profondità della bolla con P1 sul fondo
H_cima  = 0.185;            % m, quota massima (P1 a galla, 5 nov.)
Vb_     = 2.1e-6;           % m³, bolla all'equilibrio
Vs_     = 1.0e-6;           % m³, materiali
m_      = 997.6*(Vs_ + Vb_);% kg
meff_   = m_*1.5;           % kg, con la massa aggiunta (k/m_eff = 0,418 1/s²)
c_      = 0.0044;           % N·s/m, dall'identificazione combinata con il modello (3.4)
p0_     = 101544;           % Pa, equilibrio a quota 0 identificato (3.4)
pb_     = p0_ + rho_g*H_bolla;   % Pa, pressione nella bolla all'equilibrio

% Circuito pneumatico
p_atm   = 101640;           % Pa, stanza
Veff    = 640;              % ml, aria efficace con le pareti (3.2: K_v = 157 Pa/ml)
tau_perdita = 90*60;        % s
Ks      = 0.16;             % ml/°
u_chiusura = 36;            % °, angolo a cui si è chiuso il circuito (alla pressione della stanza)

% Servo MG996R con braccio e siringa
vel_servo = 200;            % °/s, come la rampa del firmware 0.2 negli stati automatici (20 decimi ogni 10 ms)
gioco_servo = 10;           % °, zona morta a ogni inversione (23 ott.)
passo_servo = 1;            % °, risoluzione del comando di oggi

% Sensori
T_pressione = 0.01;  rumore_p = 2.5;  quant_p = 1;          % s, Pa, Pa
T_camera = 1/60;     ritardo_camera = 0.156;  rumore_h = 0.32e-3;  quant_h = 1e-5;   % s, s, m, m
rumore_on = 1;              % 0 per le verifiche senza rumore

% Ingressi e condizioni iniziali (le cambiano gli script di prova)
modo_pressione = 0;         % 1: la pressione viene da p_in (prove della 3.3); 0: dal servo (u_in)
h0_ = 0;  v0_ = 0;          % m, m/s
t_in = [0; 1];  p_in = [p_atm; p_atm];  u_in = [u_chiusura; u_chiusura];
Tfine = 20;                 % s, durata della simulazione

% Disturbo e controllori (4.1). I guadagni definitivi li sceglie analisi/progetto_controllori.m.
d_in = [0; 0];              % ml tolti stringendo la bottiglia (disturbo)
modo_controllo = 0;         % 1: il servo lo comandano i controllori; 0: u_in
modo_esterno = 1;           % 1: PID sulla quota; 0: On-Off con isteresi
href_in = [0.10; 0.10];     % m, quota voluta
p0_ff = p0_;                % Pa, equilibrio a quota 0 stimato dalla CALIBRAZIONE (qui: quello vero)
Kp_h = 470*100;  Ki_h = 0;  Kd_h = 290*100;  N_h = 10;  Ts_h = 0.03;   % Pa/m, Pa/(m·s), Pa·s/m, 1/s, s
dp_max = 2000;              % Pa, correzione massima dell'anello esterno
isteresi = 0.005;  dp_onoff = 300;                                      % m, Pa
Kp_p = 0.02;  Ki_p = 0.4;  Ts_p = 0.01;  u0_ctrl = u_chiusura;          % °/Pa, °/(Pa·s), s, °
