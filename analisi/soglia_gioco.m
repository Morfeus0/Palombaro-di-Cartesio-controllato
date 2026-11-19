%% Sottofase 4.7: quanto gioco del servo si può tollerare? (preparazione del 19 novembre)
% Stessa prova di pressione della 4.4 nel gemello non lineare (gradini di ±391 Pa con P1 fermo sul fondo),
% ripetuta con il gioco servo-stantuffo da 0 a 22° e con i due PI: progetto (0,02 °/Pa, 0,4 °/(Pa·s)) e
% tarato al banco il 10 novembre (0,02, 0,1). Le altre condizioni sono quelle del banco del 10 novembre
% (circuito chiuso a 116°, P1 pesante), come in confronto_f4.m.
% Le prove escono come CSV del ponte in analisi/gemello-f4/soglia-gioco/; pc/soglia_gioco.py le giudica con
% gli stessi criteri della 4.4 al banco (pc/analisi_f4.py) e ricava il gioco massimo ammesso.
% Uso:  matlab -batch "run('analisi/soglia_gioco.m')" < /dev/null > file   (mai in una pipe)

cartella = fileparts(mfilename('fullpath'));
if isempty(cartella), cartella = fullfile(pwd, 'analisi'); end
addpath(cartella);
run(fullfile(cartella, 'parametri_gemello.m'));
load_system(fullfile(cartella, 'palombaro.slx'));
g = load(fullfile(cartella, 'controllori.mat'));
uscita = fullfile(cartella, 'gemello-f4', 'soglia-gioco');
if ~exist(uscita, 'dir'), mkdir(uscita); end

u_chiusura = 116;  u0_ctrl = 90;
p_atm = p0_ + 1500;
rumore_on = 1;  modo_controllo = 1;  modo_pressione = 0;  h0_ = 0;  v0_ = 0;  N_h = g.N_h;
cm = 0.01;
gradini = @(t) cm*(1 + 4*(t >= 8 & t < 16) + 4*(t >= 24 & t < 32) + 4*(t >= 40));
Tfine = 60;  modo_esterno = 1;  Kp_h = 1;  Kd_h = 0;  Ki_h = 0;  isteresi = 0.005;  dp_onoff = 700;
p0_ff = p0_ + 500;  Kp_p = 0.02;

giochi = [0 2 4 6 8 10 12 14 16 18 22];
taratura = {'progetto', 0.4; 'tarato', 0.1};
for j = 1:size(taratura, 1)
    Ki_p = taratura{j, 2};
    for gioco_servo = giochi
        t_in = (0:0.01:Tfine)';  href_in = gradini(t_in);
        d_in = zeros(size(t_in));  u_in = u0_ctrl*ones(size(t_in));  p_in = p_atm*ones(size(t_in));
        out = sim('palombaro');
        nome = sprintf('pi-%s_gioco-%02d', taratura{j, 1}, gioco_servo);
        scrivi_csv(fullfile(uscita, ['gemello_' nome '.csv']), out, nome, Tfine, ritardo_camera, gioco_servo);
        fprintf('%s: fatto\n', nome);
    end
end
close_system('palombaro', 0);
fprintf('Salvati in analisi/gemello-f4/soglia-gioco/\n');

function scrivi_csv(percorso, out, nome, Tfine, ritardo, gioco)
    t = (0:0.01:Tfine - 0.01)';
    prima = @(s) interp1(s.Time, s.Data(:), t, 'previous', 'extrap');
    p = round(prima(out.p_mis));  u = round(10*prima(out.u_cmd));  pr = round(prima(out.p_voluta));
    h = round(1e4*max(prima(out.h_mis), 0));  hr = round(1e4*prima(out.h_rif_out));
    f = fopen(percorso, 'w');
    fprintf(f, '# esperimento: gemello %s (condizioni del banco del 10 novembre)\n', nome);
    fprintf(f, '# parametri: gioco %d gradi, chiusura a 116, p0 1,5 kPa sotto la stanza, durata=%d\n', gioco, Tfine);
    fprintf(f, 't_mac,seq,t_esp_ms,p_pa,u_decimi,stato,quota_dmm,eta_quota_ms,vista,p_rif_pa,quota_rif_dmm\n');
    for k = 1:numel(t)
        fprintf(f, '%.3f,%d,%d,%d,%d,H,%d,%d,0,%d,%d\n', 1000 + t(k), k, round(1000*t(k)), p(k), u(k), ...
                h(k), round(1000*ritardo), pr(k), hr(k));
    end
    fclose(f);
    gzip(percorso);  delete(percorso);
end
