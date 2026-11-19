%% Sottofase 5.4 in simulazione: profili di riferimento (gradini e onda) e inseguimento nel gemello
% Cascata PI (pressione) + PID (quota) con i guadagni del progetto, nel gemello non lineare con le condizioni del
% banco del 10 novembre (circuito chiuso a 116°, P1 pesante), ripetuta con il gioco misurato (22°) e con un gioco
% ridotto (5°) come quello atteso dopo la trasmissione stampata (4.7). PI della pressione di progetto (0,02/0,4).
% Profili: scala di gradini 4 → 7 → 10 → 7 cm ogni 20 s; onda 7 ± 3 cm con periodo 40 s e 20 s.
% Errore di inseguimento: RMS e massimo di h − h_rif dopo il primo periodo (l'avvio non conta).
% Le prove escono come CSV del ponte in analisi/gemello-f4/tracking/ (stesso formato del banco).
% Uso:  /Applications/MATLAB_R2026b.app/bin/matlab -batch "run('analisi/tracking_5_4.m')" < /dev/null > file

cartella = fileparts(mfilename('fullpath'));
if isempty(cartella), cartella = fullfile(pwd, 'analisi'); end
addpath(cartella);
run(fullfile(cartella, 'parametri_gemello.m'));
load_system(fullfile(cartella, 'palombaro.slx'));
g = load(fullfile(cartella, 'controllori.mat'));
uscita = fullfile(cartella, 'gemello-f4', 'tracking');
if ~exist(uscita, 'dir'), mkdir(uscita); end

u_chiusura = 116;  u0_ctrl = 90;
p_atm = p0_ + 1500;
rumore_on = 1;  modo_controllo = 1;  modo_pressione = 0;  h0_ = 0;  v0_ = 0;  N_h = g.N_h;
modo_esterno = 1;  Kp_h = g.Kp_h;  Kd_h = g.Kd_h;  Ki_h = g.Ki_h;  isteresi = 0.005;  dp_onoff = 700;
p0_ff = p0_;  Kp_p = 0.02;  Ki_p = 0.4;
cm = 0.01;

profili = {
  'gradini',  80, @(t) cm*(4 + 3*(t >= 20) + 3*(t >= 40) - 3*(t >= 60)), 20
  'onda-40s', 120, @(t) cm*(7 + 3*sin(2*pi*t/40)), 40
  'onda-20s', 100, @(t) cm*(7 + 3*sin(2*pi*t/20)), 20
};
giochi = [22 5];

fprintf('profilo | gioco | RMS [mm] | errore massimo [mm]\n');
for j = 1:numel(giochi)
    gioco_servo = giochi(j);
    for i = 1:size(profili, 1)
        [nome, Tfine, h_rif, inizio] = profili{i, :};
        t_in = (0:0.01:Tfine)';  href_in = h_rif(t_in);
        d_in = zeros(size(t_in));  u_in = u0_ctrl*ones(size(t_in));  p_in = p_atm*ones(size(t_in));
        out = sim('palombaro');
        t = (0:0.01:Tfine - 0.01)';
        prima = @(s) interp1(s.Time, s.Data(:), t, 'previous', 'extrap');
        e = prima(out.h_mis) - prima(out.h_rif_out);
        sel = t >= inizio;
        fprintf('%s | %d | %.1f | %.1f\n', nome, gioco_servo, 1000*sqrt(mean(e(sel).^2)), 1000*max(abs(e(sel))));
        scrivi_csv(fullfile(uscita, sprintf('gemello_%s_gioco-%02d.csv', nome, gioco_servo)), out, nome, Tfine, ...
                   ritardo_camera, gioco_servo);
    end
end
close_system('palombaro', 0);

function scrivi_csv(percorso, out, nome, Tfine, ritardo, gioco)
    t = (0:0.01:Tfine - 0.01)';
    prima = @(s) interp1(s.Time, s.Data(:), t, 'previous', 'extrap');
    p = round(prima(out.p_mis));  u = round(10*prima(out.u_cmd));  pr = round(prima(out.p_voluta));
    h = round(1e4*max(prima(out.h_mis), 0));  hr = round(1e4*prima(out.h_rif_out));
    f = fopen(percorso, 'w');
    fprintf(f, '# esperimento: gemello 5.4 %s (condizioni del banco del 10 novembre, PI di progetto)\n', nome);
    fprintf(f, '# parametri: gioco %d gradi, chiusura a 116, p0 1,5 kPa sotto la stanza, durata=%d\n', gioco, Tfine);
    fprintf(f, 't_mac,seq,t_esp_ms,p_pa,u_decimi,stato,quota_dmm,eta_quota_ms,vista,p_rif_pa,quota_rif_dmm\n');
    for k = 1:numel(t)
        fprintf(f, '%.3f,%d,%d,%d,%d,T,%d,%d,0,%d,%d\n', 1000 + t(k), k, round(1000*t(k)), p(k), u(k), ...
                h(k), round(1000*ritardo), pr(k), hr(k));
    end
    fclose(f);
    gzip(percorso);  delete(percorso);
end
