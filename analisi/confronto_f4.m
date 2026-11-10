%% Sottofase 4.6: il gemello rifatto con le condizioni misurate al banco il 10 novembre
% Stesse prove del banco, nel gemello non lineare, con quello che il 10 novembre si è misurato:
%   - gioco servo-stantuffo di circa 22° (misurato scendendo da 100°: la pressione non cambia fino a 78°);
%   - P1 pesante: soglia 99,12 kPa con la stanza a 100,64, cioè p0 circa 1,5 kPa sotto la stanza, e circuito chiuso
%     a 116° (si lavora in leggera depressione: a 36° si arriva solo a circa 100 Pa sotto p0);
%   - PI della pressione tarato al banco (0,02 °/Pa, 0,1 °/(Pa·s)) invece del progetto (0,02, 0,4).
% Le prove escono come CSV del ponte in analisi/gemello-f4/banco-10nov/, e pc/analisi_f4.py le giudica come quelle vere.
% Uso:  matlab -batch "run('analisi/confronto_f4.m')" < /dev/null > file   (mai in una pipe)

cartella = fileparts(mfilename('fullpath'));
if isempty(cartella), cartella = fullfile(pwd, 'analisi'); end
addpath(cartella);
run(fullfile(cartella, 'parametri_gemello.m'));
load_system(fullfile(cartella, 'palombaro.slx'));
g = load(fullfile(cartella, 'controllori.mat'));
uscita = fullfile(cartella, 'gemello-f4', 'banco-10nov');
if ~exist(uscita, 'dir'), mkdir(uscita); end

gioco_servo = 22;                         % °, misurato il 10 novembre (era 10° il 23 ottobre)
u_chiusura = 116;  u0_ctrl = 90;          % circuito chiuso a 116°, prove partite con il servo a 90°
p_atm = p0_ + 1500;                       % la stanza 1,5 kPa sopra l'equilibrio di P1 sul fondo
rumore_on = 1;  modo_controllo = 1;  modo_pressione = 0;  h0_ = 0;  v0_ = 0;  N_h = g.N_h;
cm = 0.01;
gradini = @(t) cm*(1 + 4*(t >= 8 & t < 16) + 4*(t >= 24 & t < 32) + 4*(t >= 40));

% nome, durata, quota voluta, esterno (1 PID, 0 On-Off), Kp, Kd, Ki, isteresi, ampiezza On-Off, Ki del PI, p0 stimato
prove = {
  '4-4_pi-progetto', 60, gradini, 1, 1, 0, 0, 0.005, 700, 0.4, p0_ + 500
  '4-4_pi-tarato',   60, gradini, 1, 1, 0, 0, 0.005, 700, 0.1, p0_ + 500
  '4-3_onoff-700',   90, @(t) 5*cm + 0*t, 0, 1, 0, 0, 0.005, 700, 0.1, p0_
  '4-3_onoff-1000',  90, @(t) 5*cm + 0*t, 0, 1, 0, 0, 0.005, 1000, 0.1, p0_
  '4-5_solo-P',     120, @(t) cm*(5 + 5*(t >= 30)), 1, g.Kp_h, 0, 0, 0.005, 700, 0.1, p0_
  '4-5_PD',         120, @(t) cm*(5 + 5*(t >= 30)), 1, g.Kp_h, g.Kd_h, 0, 0.005, 700, 0.1, p0_
  '4-5_PID',        120, @(t) cm*(5 + 5*(t >= 30)), 1, g.Kp_h, g.Kd_h, g.Ki_h, 0.005, 700, 0.1, p0_
};

for i = 1:size(prove, 1)
    [nome, Tfine, h_rif, modo_esterno, Kp_h, Kd_h, Ki_h, isteresi, dp_onoff, Ki_p, p0_ff] = prove{i, :};
    Kp_p = 0.02;
    t_in = (0:0.01:Tfine)';  href_in = h_rif(t_in);
    d_in = zeros(size(t_in));  u_in = u0_ctrl*ones(size(t_in));  p_in = p_atm*ones(size(t_in));
    out = sim('palombaro');
    scrivi_csv(fullfile(uscita, ['gemello_' nome '.csv']), out, nome, Tfine, ritardo_camera);
    fprintf('%s: fatto\n', nome);
end
close_system('palombaro', 0);
fprintf('Salvati in analisi/gemello-f4/banco-10nov/\n');

function scrivi_csv(percorso, out, nome, Tfine, ritardo)
    t = (0:0.01:Tfine - 0.01)';
    prima = @(s) interp1(s.Time, s.Data(:), t, 'previous', 'extrap');
    p = round(prima(out.p_mis));  u = round(10*prima(out.u_cmd));  pr = round(prima(out.p_voluta));
    h = round(1e4*max(prima(out.h_mis), 0));  hr = round(1e4*prima(out.h_rif_out));
    f = fopen(percorso, 'w');
    fprintf(f, '# esperimento: gemello %s (condizioni del banco del 10 novembre)\n', nome);
    fprintf(f, '# parametri: gioco 22 gradi, chiusura a 116, p0 1,5 kPa sotto la stanza, durata=%d\n', Tfine);
    fprintf(f, 't_mac,seq,t_esp_ms,p_pa,u_decimi,stato,quota_dmm,eta_quota_ms,vista,p_rif_pa,quota_rif_dmm\n');
    for k = 1:numel(t)
        fprintf(f, '%.3f,%d,%d,%d,%d,H,%d,%d,0,%d,%d\n', 1000 + t(k), k, round(1000*t(k)), p(k), u(k), ...
                h(k), round(1000*ritardo), pr(k), hr(k));
    end
    fclose(f);
    gzip(percorso);  delete(percorso);
end
