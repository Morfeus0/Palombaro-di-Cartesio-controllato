%% Progetto dei controllori in simulazione (sottofase 4.1)
% Palombaro di Cartesio controllato — 5 novembre 2026 (anticipata, lontano dal banco).
% Architettura (docs/protocollo.md): cascata. Anello interno PI sulla pressione (100 Hz, ESP32) che muove il servo;
% anello esterno sulla quota (30 Hz, telecamera) che sceglie la pressione:
%     p_voluta = p0_ff + rho g h_rif  +  C(s) (h_mis − h_rif)
% Il primo termine è l'equilibrio alla quota voluta (retta della 3.2, p0 dalla CALIBRAZIONE); C è On-Off, P, PD o PID.
% Criteri del foglio A4: errore RMS < 5 mm su 3 riferimenti; gradino di 5 cm con assestamento < 10 s e
% sovraelongazione < 20 %; disturbo riassorbito in < 10 s.
% Uso:  matlab -batch "run('analisi/progetto_controllori.m')"   (prima: analisi/crea_gemello.m)

cartella = fileparts(mfilename('fullpath'));
if isempty(cartella), cartella = fullfile(pwd, 'analisi'); end
addpath(cartella);
run(fullfile(cartella, 'parametri_gemello.m'));
% il modello si apre SUBITO: all'apertura riesegue parametri_gemello.m e rimetterebbe i valori predefiniti
load_system(fullfile(cartella, 'palombaro.slx'));
s = tf('s');

%% 1. Modelli lineari (parametri del gemello: polo instabile come quello identificato nella 3.4)
k  = rho_g^2*Vb_/pb_;  bp = rho_g*Vb_/pb_;
G_hp = -bp/(meff_*s^2 + c_*s - k);                         % quota [m] / pressione [Pa]
lambda = max(real(pole(G_hp)));
K_pu = Ks*p_atm/Veff;                                      % Pa/° (Boyle con il volume efficace)
fprintf('polo instabile del gemello %.3f rad/s (identificato 0,326); guadagno servo→pressione %.1f Pa/°\n', ...
        lambda, K_pu);
% Anello interno: servo come primo ordine (velocità massima) + due cicli di ritardo (lettura e applicazione)
tau_servo = 0.05;
G_pu = K_pu/(tau_servo*s + 1) * exp(-2*Ts_p*s);
C_p = Kp_p + Ki_p/s;
T_in = feedback(C_p*G_pu, 1);
S_in = stepinfo(pade(T_in, 3));
[~, Pm_in] = margin(C_p*G_pu);
fprintf('anello interno PI (Kp %.3f °/Pa, Ki %.2f °/(Pa·s)): margine di fase %.0f°, assestamento %.2f s, sovraelong. %.0f %%\n', ...
        Kp_p, Ki_p, Pm_in, S_in.SettlingTime, S_in.Overshoot);

%% 2. Anello esterno: griglia su Kp e Kd del PD (filtro N), margini con il ritardo della telecamera
Td = ritardo_camera + Ts_h/2;                              % ritardo + mezzo periodo di campionamento
T_in_appr = 1/(0.08*s + 1);                                % anello interno chiuso, approssimato
Kp_g = (150:25:1500)*100;  Kd_g = (50:25:1200)*100;        % Pa/m, Pa·s/m
PM = nan(numel(Kd_g), numel(Kp_g));  OS = PM;  TS = PM;
for i = 1:numel(Kd_g)
    for j = 1:numel(Kp_g)
        C = Kp_g(j) + Kd_g(i)*s/(1 + s/N_h);
        L = -G_hp*C*T_in_appr;  L.InputDelay = Td;
        [~, pm] = margin(L);
        cl = feedback(pade(L, 3), 1);
        if ~isstable(cl), continue; end
        info = stepinfo(cl, 'SettlingTimeThreshold', 0.05);
        PM(i, j) = pm;  OS(i, j) = info.Overshoot;  TS(i, j) = info.SettlingTime;
    end
end
% Scelta: tra i guadagni che rispettano i criteri A4 con almeno 45° di margine di fase, l'assestamento più breve
% (la prima versione prendeva il margine massimo: PD lento, 9,8 s, al limite dei 10 s)
ok = OS < 20 & TS < 10 & PM >= 45;
TSok = TS;  TSok(~ok) = Inf;
[~, imin] = min(TSok(:));  [ib, jb] = ind2sub(size(PM), imin);
Kp_h = Kp_g(jb);  Kd_h = Kd_g(ib);
fprintf('\nPD scelto: Kp %.0f Pa/cm, Kd %.0f Pa·s/cm (N = %d): margine di fase %.0f°, sovraelong. %.0f %%, assestamento %.1f s\n', ...
        Kp_h/100, Kd_h/100, N_h, PM(ib, jb), OS(ib, jb), TS(ib, jb));
C_pd = Kp_h + Kd_h*s/(1 + s/N_h);
L_pd = -G_hp*C_pd*T_in_appr;  L_pd.InputDelay = Td;
[Gm, Pm, Wgm, Wpm] = margin(L_pd);
fprintf('margini del PD: guadagno %.1f dB a %.2f rad/s, fase %.0f° a %.2f rad/s; margine di ritardo %.0f ms\n', ...
        20*log10(Gm), Wgm, Pm, Wpm, Pm*pi/180/Wpm*1000);
% PID: integrale lento per correggere un equilibrio stimato male (p0_ff sbagliato) e la deriva di P1
Ki_h = Kp_h/40;                                            % tempo integrale 40 s (con 15 s: sovraelong. 20 %, 21 s)
C_pid = C_pd + Ki_h/s;
L_pid = -G_hp*C_pid*T_in_appr;  L_pid.InputDelay = Td;
[~, Pm_pid] = margin(L_pid);
fprintf('PID: Ki %.1f Pa/(cm·s) (Ti = 40 s), margine di fase %.0f°\n', Ki_h/100, Pm_pid);

% Discretizzazione (Tustin) ai periodi veri
Cd_pid = c2d(C_pid, Ts_h, 'tustin');   Cd_pi = c2d(C_p, Ts_p, 'tustin');
fprintf('\nPID quota discreto (Tustin, %.1f ms):\n', Ts_h*1000); disp(Cd_pid);
fprintf('PI pressione discreto (Tustin, %.0f ms):\n', Ts_p*1000); disp(Cd_pi);

% Figure: zona dei guadagni, luogo delle radici, Bode
f = figure('Visible', 'off', 'Position', [50 50 1300 420]);  theme(f, 'light');
tl = tiledlayout(f, 1, 3, 'TileSpacing', 'compact');
nexttile(tl); contourf(Kp_g/100, Kd_g/100, PM, 0:5:60); colorbar; hold on;
contour(Kp_g/100, Kd_g/100, double(ok), [0.5 0.5], 'k', 'LineWidth', 1.5);
plot(Kp_h/100, Kd_h/100, 'rp', 'MarkerSize', 14, 'MarkerFaceColor', 'r');
xlabel('K_p [Pa/cm]'); ylabel('K_d [Pa·s/cm]'); title('Margine di fase [°]; in nero i criteri A4');
nexttile(tl); rlocus(-G_hp*(1 + (Kd_h/Kp_h)*s/(1 + s/N_h))*T_in_appr*pade(exp(-Td*s), 2)/100);
title('Luogo delle radici del PD (al variare di K_p)'); xlim([-15 5]); ylim([-10 10]);
nexttile(tl); margin(L_pd); title(sprintf('Bode del PD: PM %.0f°', Pm));
exportgraphics(f, fullfile(cartella, 'figure', 'progetto_pd.png'), 'Resolution', 130);

%% 3. Prova nel gemello non lineare: stesso scenario per ogni controllore
u_chiusura = 66;  u0_ctrl = 66;                            % circuito chiuso a 66° come il 5 novembre
p_atm = 101640;  rumore_on = 1;  modo_controllo = 1;  h0_ = 0;  v0_ = 0;
t_in = (0:0.01:120)';
href_in = 0.05*(t_in < 30) + 0.10*(t_in >= 30 & t_in < 60) + 0.15*(t_in >= 60);
d_in = 2*(t_in >= 95);                                     % stretta alla bottiglia: 2 ml tolti dal secondo 95
u_in = u_chiusura*ones(size(t_in));  p_in = p_atm*ones(size(t_in));  Tfine = 120;
dp_onoff = 700;                                            % Pa: deve superare rho g × 5 cm (490 Pa), o P1 resta sul fondo
% nome, esterno (1 PID, 0 On-Off), Kp, Kd, Ki, isteresi, errore su p0 della calibrazione [Pa]
casi = {'On-Off ±5 mm', 0, 0, 0, 0, 0.005, 0;  'On-Off ±10 mm', 0, 0, 0, 0, 0.010, 0;
        'solo P', 1, Kp_h, 0, 0, 0, 0;  'PD', 1, Kp_h, Kd_h, 0, 0, 0;  'PID', 1, Kp_h, Kd_h, Ki_h, 0, 0;
        'PD, p0 sbagliato di 150 Pa', 1, Kp_h, Kd_h, 0, 0, 150;
        'PID, p0 sbagliato di 150 Pa', 1, Kp_h, Kd_h, Ki_h, 0, 150};
guadagni = [Kp_h, Kd_h, Ki_h];
risultati = table();
f2 = figure('Visible', 'off', 'Position', [50 50 1200 1250]);  theme(f2, 'light');
tl2 = tiledlayout(f2, size(casi, 1), 1, 'TileSpacing', 'compact');
for i = 1:size(casi, 1)
    [nome, modo_esterno, Kp_h, Kd_h, Ki_h, ist, errore_p0] = casi{i, :};
    Kp_h = max(Kp_h, 1);  p0_ff = p0_ + errore_p0;
    if ist > 0, isteresi = ist; end
    out = sim('palombaro');
    t = out.h_vera.Time;  h = out.h_vera.Data(:);  hr = interp1(t_in, href_in, t, 'previous');
    e = h - hr;
    rms_ = @(a, b) sqrt(mean(e(t >= a & t < b).^2));
    rms3 = max([rms_(20, 30), rms_(50, 60), rms_(80, 95)]);
    sel = t >= 30 & t < 60;  ts_ = t(sel) - 30;  hs = h(sel);
    os = max(0, (max(hs) - 0.10)/0.05*100);
    t_ass = ultimo_fuori(ts_, hs, 0.10);
    sel = t >= 95;
    t_dist = ultimo_fuori(t(sel) - 95, h(sel), 0.15);
    risultati = [risultati; table(string(nome), 1000*rms3, os, t_ass, t_dist, ...
        'VariableNames', {'controllo', 'RMS_mm', 'sovraelong_pct', 'assestamento_s', 'disturbo_s'})]; %#ok<AGROW>
    nexttile(tl2); plot(t, 100*h, 'b', t, 100*hr, 'k--'); ylim([0 20]); grid on;
    title(sprintf('%s: RMS %.1f mm, sovraelong. %.0f %%, assestamento %.1f s, disturbo %.1f s', ...
          nome, 1000*rms3, os, t_ass, t_dist));
    ylabel('cm');
end
Kp_h = guadagni(1);  Kd_h = guadagni(2);  Ki_h = guadagni(3);
xlabel(tl2, 's'); title(tl2, 'Gemello non lineare: 5 → 10 → 15 cm, stretta di 2 ml a 95 s (rumore, ritardo, gioco)');
exportgraphics(f2, fullfile(cartella, 'figure', 'controllori_gemello.png'), 'Resolution', 120);
close_system('palombaro', 0);
disp(risultati);
fprintf('Criteri A4: RMS < 5 mm, sovraelong. < 20 %%, assestamento < 10 s, disturbo < 10 s\n');
save(fullfile(cartella, 'controllori.mat'), 'Kp_h', 'Kd_h', 'Ki_h', 'N_h', 'Ts_h', 'Kp_p', 'Ki_p', 'Ts_p', ...
     'Cd_pid', 'Cd_pi', 'risultati');
fprintf('Salvati: analisi/controllori.mat, analisi/figure/progetto_pd.png, analisi/figure/controllori_gemello.png\n');

function t_ass = ultimo_fuori(t, h, rif)
    % istante dopo il quale la quota resta entro ±5 mm dal riferimento (Inf se non ci resta mai fino alla fine)
    fuori = find(abs(h - rif) > 0.005, 1, 'last');
    if isempty(fuori), t_ass = 0; elseif fuori >= numel(t) - 1, t_ass = Inf; else, t_ass = t(fuori + 1); end
end
