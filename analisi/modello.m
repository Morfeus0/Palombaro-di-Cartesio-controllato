%% Modello fisico del palombaro e linearizzazione (sottofase 3.1)
% Palombaro di Cartesio controllato — 5 novembre 2026.
% Le formule sono ricavate a mano in relazione/04-modello.md; qui si calcolano con i numeri del banco
% e si controllano (derivate numeriche del modello non lineare, poli della G(s), condizioni di Routh).
%
% Convenzioni: h = quota di P1 sopra la posizione sul fondo [m], verso l'alto; p = pressione ASSOLUTA
% dell'aria nella bottiglia [Pa]; u = angolo del servo [°] (u più grande = stantuffo spinto = più pressione).
% Uso:  matlab -batch "run('analisi/modello.m')"     (servono Control System Toolbox; niente simbolico)

clear; clc;
cartella = fileparts(mfilename('fullpath'));
if isempty(cartella), cartella = fullfile(pwd, 'analisi'); end
figure_dir = fullfile(cartella, 'figure');
if ~exist(figure_dir, 'dir'), mkdir(figure_dir); end

%% 1. Parametri (fonte di ciascuno nel commento; quelli segnati «stima» li ricava la 3.4)
P.rho   = 997.6;        % kg/m³, acqua a 22,7 °C
P.g     = 9.806;        % m/s²
P.H     = 0.20;         % m, profondità della bolla con P1 sul fondo (acqua ~22 cm, bolla ~2 cm sotto la cima di P1) — stima
P.Vb    = 2.1e-6;       % m³, bolla all'equilibrio (taratura 19 ott. e proposta: ~2,1 ml) — stima
P.Vs    = 1.0e-6;       % m³, volume dei materiali (pipetta, rame 0,26 ml, nastro) — stima
P.ca    = 0.5;          % massa aggiunta dell'acqua trascinata, frazione della massa — stima (0,2…1)
P.c     = 4e-3;         % N·s/m, attrito lineare per piccole velocità — stima (proposta)
P.pdet  = 101640;       % Pa, soglia di distacco dal fondo misurata il 5 nov. alle 17:52 (= equilibrio a h = 0)
P.Kv    = 157;          % Pa/ml, pressione per ml di siringa: +2,77 kPa con ~17,6 ml (36°→146°, 5 nov.)
P.Ks    = 0.160;        % ml/°, volume della siringa per grado di servo (tabella comando→ml, 23 ott.)
P.tau   = 90*60;        % s, costante di tempo della perdita d'aria del circuito (~40 Pa/min a +3,6 kPa, R2)
P.Td    = 0.156;        % s, ritardo della telecamera (2.3)
P.m     = P.rho*(P.Vs + P.Vb);   % kg: all'equilibrio peso = spinta (P1 tarato), quindi la massa segue dai volumi
P.meff  = P.m*(1 + P.ca);

% Pressione nella bolla all'equilibrio: costante a ogni quota (è il volume Vb a dover restare quello giusto)
P.pb    = P.pdet + P.rho*P.g*P.H;
fprintf('massa di P1 %.2f g, pressione nella bolla all''equilibrio %.2f kPa\n', P.m*1e3, P.pb/1e3);

%% 2. Modello non lineare
% Bolla isoterma (Boyle): Vb(h,p) = pb*Vb / (p + rho g (H - h))
% m_eff h'' = rho g (Vs + Vb(h,p)) - m g - c h'          (verso l'alto positivo)
Vbolla = @(h, p) P.pb*P.Vb ./ (p + P.rho*P.g*(P.H - h));
Forza  = @(h, p) P.rho*P.g*(P.Vs + Vbolla(h, p)) - P.m*P.g;

%% 3. Equilibrio: p_eq(h) = pb - rho g (H - h)  →  retta di pendenza rho*g
peq = @(h) P.pb - P.rho*P.g*(P.H - h);
pendenza_teorica = P.rho*P.g/100/1000;                 % kPa/cm
fprintf('pendenza della pressione di equilibrio: %.4f kPa/cm (misurata nella 3.2: 0,098 ± 0,010)\n', pendenza_teorica);
assert(abs(Forza(0.10, peq(0.10))) < 1e-12, 'equilibrio sbagliato');

%% 4. Linearizzazione intorno a (h*, p_eq(h*)): coefficienti a mano e controllo numerico
k  = (P.rho*P.g)^2 * P.Vb / P.pb;      % N/m   ∂F/∂h: salendo la bolla si gonfia (spinta che destabilizza)
bp = P.rho*P.g * P.Vb / P.pb;          % N/Pa  −∂F/∂p: più pressione, bolla più piccola, P1 più pesante
hs = 0.10; dh = 1e-5; dp = 1;
k_num  = (Forza(hs+dh, peq(hs)) - Forza(hs-dh, peq(hs))) / (2*dh);
bp_num = -(Forza(hs, peq(hs)+dp) - Forza(hs, peq(hs)-dp)) / (2*dp);
fprintf('k  = %.4e N/m   (numerico %.4e)\n', k, k_num);
fprintf('bp = %.4e N/Pa  = %.4f g di spinta per kPa (numerico %.4e)\n', bp, bp*1000/P.g*1000, bp_num);
assert(abs(k - k_num)/k < 1e-3 && abs(bp - bp_num)/bp < 1e-3, 'linearizzazione sbagliata');
% Il rapporto k/bp vale rho*g: la stessa pendenza della retta di equilibrio
fprintf('k/bp = %.1f Pa/m = rho*g\n', k/bp);

%% 5. Funzioni di trasferimento
s = tf('s');
G_hp = -bp / (P.meff*s^2 + P.c*s - k);            % quota [m] / pressione [Pa]
G_pv = P.Kv * P.tau*s / (P.tau*s + 1);            % pressione [Pa] / volume della siringa [ml] (con la perdita)
G_vu = P.Ks;                                      % ml / ° (servo ideale: velocità e gioco a parte)
G_hu = minreal(G_hp * G_pv * G_vu);               % quota [m] / angolo del servo [°]
G_hu.InputName = 'u [°]'; G_hu.OutputName = 'h [m]';

lambda = (-P.c + sqrt(P.c^2 + 4*P.meff*k)) / (2*P.meff);   % polo instabile, formula esplicita
fprintf('\npolo instabile: %.3f rad/s (senza attrito %.3f; stima della proposta 0,33)\n', lambda, sqrt(k/P.meff));
fprintf('tempo di raddoppio dell''errore: %.1f s\n', log(2)/lambda);
poli = pole(G_hp);
assert(abs(max(real(poli)) - lambda) < 1e-9, 'polo instabile sbagliato');
disp('Poli di G_hp (quota/pressione):'); disp(poli.');
disp('Poli di G_hu (quota/angolo del servo):'); disp(pole(G_hu).');

% Sensibilità del polo ai parametri incerti
fprintf('\nPolo instabile [rad/s] al variare di massa aggiunta e attrito:\n      c=0     c=0,002  c=0,004  c=0,008\n');
for ca = [0.2 0.5 1.0]
    me = P.m*(1 + ca);
    l = arrayfun(@(c) (-c + sqrt(c^2 + 4*me*k))/(2*me), [0 0.002 0.004 0.008]);
    fprintf('ca=%.1f  %s\n', ca, sprintf('%7.3f  ', l));
end

%% 6. Controllore PD sulla quota (anello interno della pressione ideale): Routh
% Δp = -(Kp*e + Kd*e'), e = h - h_rif  →  meff s² + (c + bp Kd) s + (bp Kp - k) = 0
Kp_min = k/bp;                                         % Pa/m: deve battere la pendenza rho*g
fprintf('\nRouth senza ritardo: Kp > rho*g = %.1f Pa/m = %.1f Pa/cm, Kd > %.1f Pa·s/m (cioè Kd ≥ 0)\n', ...
        Kp_min, Kp_min/100, -P.c/bp);

% Con il ritardo della telecamera (Padé del 1° ordine): a3 s³ + a2 s² + a1 s + a0
coeff = @(Kp, Kd) [P.meff*P.Td/2, ...
                   P.meff + P.c*P.Td/2 - bp*Kd*P.Td/2, ...
                   P.c - k*P.Td/2 + bp*Kd - bp*Kp*P.Td/2, ...
                   bp*Kp - k];
stabile = @(a) all(a > 0) && a(3)*a(2) > a(4)*a(1);
Kd_max = 2*P.meff/(bp*P.Td) + P.c/bp;                       % da a2 > 0
% con Kd = 0: a1 = al - be*Kp, a0 = ga*Kp - k; la condizione a2*a1 > a3*a0 è più severa di a1 > 0
a2_0 = P.meff + P.c*P.Td/2; a3 = P.meff*P.Td/2; al = P.c - k*P.Td/2; be = bp*P.Td/2; ga = bp;
Kp_max0 = (a2_0*al + a3*k) / (a2_0*be + a3*ga);
fprintf('Routh con il ritardo: Kd < %.0f Pa·s/cm; con Kd = 0, Kp < %.0f Pa/cm\n', Kd_max/100, Kp_max0/100);
Kd_griglia = linspace(0, 1.2*Kd_max, 301);     % Pa·s/m
Kp_griglia = linspace(0, 6e5, 301);            % Pa/m
regione = false(numel(Kd_griglia), numel(Kp_griglia));
for i = 1:numel(Kd_griglia)
    for j = 1:numel(Kp_griglia)
        regione(i, j) = stabile(coeff(Kp_griglia(j), Kd_griglia(i)));
    end
end
% controllo di Routh con i poli veri dell'anello chiuso (ritardo con Padé del 1° ordine)
Kp_prova = 4.7e4; Kd_prova = 2.9e4;            % i guadagni della simulazione: 470 Pa/cm, 290 Pa/(cm/s)
anello = feedback(pade(exp(-P.Td*s), 1) * G_hp * (Kp_prova + Kd_prova*s), 1, +1);
fprintf('Guadagni della simulazione (Kp 470 Pa/cm, Kd 290 Pa·s/cm): Routh %s, poli reali max %.3f\n', ...
        string(stabile(coeff(Kp_prova, Kd_prova))), max(real(pole(anello))));
assert(stabile(coeff(Kp_prova, Kd_prova)) == (max(real(pole(anello))) < 0), 'Routh e poli non concordano');

f = figure('Visible', 'off', 'Position', [100 100 640 480]);
theme(f, 'light');
contourf(Kp_griglia/100, Kd_griglia/100, double(regione), [0.5 0.5], 'LineColor', 'k');
colormap([0.92 0.92 0.92; 0.55 0.78 0.55]); hold on;
xline(Kp_min/100, '--r', 'K_p = \rhog', 'LabelVerticalAlignment', 'bottom');
plot(Kp_prova/100, Kd_prova/100, 'ko', 'MarkerFaceColor', 'y');
xlabel('K_p [Pa/cm]'); ylabel('K_d [Pa·s/cm]');
title(sprintf('PD sulla quota: zona stabile (verde) con %d ms di ritardo', round(P.Td*1000)));
exportgraphics(f, fullfile(figure_dir, 'regione_pd.png'), 'Resolution', 150);

%% 7. Fuga in anello aperto: un esempio da confrontare con la 3.3
t = (0:0.01:15)';
gradino = -120;                                  % Pa sotto la soglia, come le prove 1–6 del 5 novembre
[t_nl, x_nl] = ode45(@(t, x) [x(2); (Forza(x(1), P.pdet + gradino) - P.c*x(2))/P.meff], t, [0; 0]);
h_lin = step(G_hp*gradino, t);
f2 = figure('Visible', 'off', 'Position', [100 100 640 400]);
theme(f2, 'light');
plot(t_nl, 100*x_nl(:, 1), 'b', t, 100*h_lin, '--r'); grid on; ylim([0 20]);
xlabel('tempo [s]'); ylabel('quota [cm]'); legend('non lineare', 'linearizzato', 'Location', 'northwest');
title('Fuga dal fondo con 0,12 kPa sotto la soglia (modello, parametri stimati)');
exportgraphics(f2, fullfile(figure_dir, 'fuga_modello.png'), 'Resolution', 150);
i15 = find(x_nl(:, 1) > 0.15, 1);
if ~isempty(i15), fprintf('\nmodello: P1 arriva a 15 cm dopo %.1f s (misurato il 5 nov.: 10–12 s)\n', t_nl(i15)); end

save(fullfile(cartella, 'modello.mat'), 'P', 'k', 'bp', 'lambda', 'G_hp', 'G_pv', 'G_hu');
fprintf('Salvati: analisi/modello.mat, analisi/figure/regione_pd.png, analisi/figure/fuga_modello.png\n');
