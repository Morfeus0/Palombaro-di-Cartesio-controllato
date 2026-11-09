%% Prove della fase 4 nel gemello, salvate come i CSV del ponte (9 novembre, lontano dal banco)
% Le stesse prove della scaletta del 10 novembre, fatte nel gemello non lineare (rumore, ritardo e 60 Hz della
% telecamera, servo a passi da 1° con gioco, perdita d'aria). Ogni prova diventa un CSV con le colonne di
% pc/bridge.py, così pc/analisi_f4.py la giudica come una prova vera e nella 4.6 si confrontano file uguali.
%   4.4  gradini di pressione con l'anello esterno spento (K,Z,0,0,0,10): p_voluta = p0 + rho g h_rif,
%        P1 resta sul fondo; poi 60 s fermi per vedere il servo compensare la perdita
%   4.3  On-Off ±5 mm e ±10 mm, ±700 Pa, quota voluta 5 cm partendo dal fondo. Non 10 cm: dal fondo P1 si
%        stacca solo sotto p0, e a 10 cm l'equilibrio è p0 + 978 Pa, più dei 700 Pa che l'On-Off toglie
%        (prima prova del 9 novembre: P1 fermo sul fondo per 90 s)
%   4.5  solo P, PD e PID: 5 cm, a 30 s gradino a 10 cm, poi 90 s fermi (M4)
% Uso:  matlab -batch "run('analisi/esporta_gemello_f4.m')"
% Uscita: analisi/gemello-f4/gemello_<prova>.csv.gz; poi  .venv/bin/python pc/analisi_f4.py <file> --prova 4.x
% Esito del 9 novembre (pc/analisi_f4.py): gradini di ±391 Pa assestati in 0,22–0,28 s; On-Off ±5 mm a 5 cm:
% ±2,2 cm, 6,1 s (±10 mm: ±3,0 cm, 7,9 s); PD e PID: gradino 5 → 10 cm in 3,3 e 2,9 s, M4 superata (RMS 0,9 e
% 1,4 mm); solo P: sovraelongazione 53 %, oscillazione di ±2,5 mm con periodo 4,8 s.

cartella = fileparts(mfilename('fullpath'));
if isempty(cartella), cartella = fullfile(pwd, 'analisi'); end
addpath(cartella);
run(fullfile(cartella, 'parametri_gemello.m'));
load_system(fullfile(cartella, 'palombaro.slx'));     % subito: all'apertura rimette i parametri predefiniti
g = load(fullfile(cartella, 'controllori.mat'));
uscita = fullfile(cartella, 'gemello-f4');
if ~exist(uscita, 'dir'), mkdir(uscita); end

% come il 5 novembre: circuito chiuso a 66°, stanza 101,64 kPa, controllori al posto di u_in
u_chiusura = 66;  u0_ctrl = 66;  p_atm = 101640;  rumore_on = 1;  modo_controllo = 1;  modo_pressione = 0;
h0_ = 0;  v0_ = 0;  p0_ff = p0_;  Kp_p = g.Kp_p;  Ki_p = g.Ki_p;  N_h = g.N_h;  dp_onoff = 700;

% nome, durata [s], quota voluta (funzione del tempo, m), esterno (1 PID, 0 On-Off), Kp, Kd, Ki, isteresi
cm = 0.01;
prove = {
  '4-4_gradini-pressione', 90, @(t) cm*(1 + 4*(t >= 10 & t < 20) + 4*(t >= 30)), 1, 1, 0, 0, 0.005
  '4-3_onoff-5mm',         90, @(t) 5*cm + 0*t,                                   0, 1, 0, 0, 0.005
  '4-3_onoff-10mm',        90, @(t) 5*cm + 0*t,                                   0, 1, 0, 0, 0.010
  '4-5_solo-P',           120, @(t) cm*(5 + 5*(t >= 30)),                          1, g.Kp_h, 0, 0, 0.005
  '4-5_PD',               120, @(t) cm*(5 + 5*(t >= 30)),                          1, g.Kp_h, g.Kd_h, 0, 0.005
  '4-5_PID',              120, @(t) cm*(5 + 5*(t >= 30)),                          1, g.Kp_h, g.Kd_h, g.Ki_h, 0.005
};

for i = 1:size(prove, 1)
    [nome, Tfine, h_rif, modo_esterno, Kp_h, Kd_h, Ki_h, isteresi] = prove{i, :};
    t_in = (0:0.01:Tfine)';  href_in = h_rif(t_in);
    d_in = zeros(size(t_in));  u_in = u_chiusura*ones(size(t_in));  p_in = p_atm*ones(size(t_in));
    out = sim('palombaro');
    scrivi_csv(fullfile(uscita, ['gemello_' nome '.csv']), out, nome, Tfine, ritardo_camera);
    fprintf('%s: fatto\n', nome);
end
close_system('palombaro', 0);
fprintf('Salvati in analisi/gemello-f4/\n');

function scrivi_csv(percorso, out, nome, Tfine, ritardo)
    % una riga ogni 10 ms come le T del firmware; i valori sono gli ultimi disponibili a quell'istante
    t = (0:0.01:Tfine - 0.01)';
    prima = @(s) interp1(s.Time, s.Data(:), t, 'previous', 'extrap');
    p = round(prima(out.p_mis));  u = round(10*prima(out.u_cmd));  pr = round(prima(out.p_voluta));
    h = round(1e4*max(prima(out.h_mis), 0));  hr = round(1e4*prima(out.h_rif_out));
    f = fopen(percorso, 'w');
    fprintf(f, '# esperimento: gemello %s\n# data: %s\n', nome, datestr(now, 'yyyy-mm-dd HH:MM:SS'));
    fprintf(f, '# parametri: gemello non lineare (analisi/esporta_gemello_f4.m), durata=%d\n', Tfine);
    fprintf(f, '# firmware: gemello Simulink, protocollo 1\n');
    fprintf(f, '# quota: decimi di mm sopra P1 fermo sul fondo; età dal fotogramma, ms\n');
    fprintf(f, 't_mac,seq,t_esp_ms,p_pa,u_decimi,stato,quota_dmm,eta_quota_ms,vista,p_rif_pa,quota_rif_dmm\n');
    for k = 1:numel(t)
        fprintf(f, '%.3f,%d,%d,%d,%d,H,%d,%d,0,%d,%d\n', 1000 + t(k), k, round(1000*t(k)), p(k), u(k), ...
                h(k), round(1000*ritardo), pr(k), hr(k));
    end
    fclose(f);
    gzip(percorso);  delete(percorso);                 % come i registri grandi in dati/: .csv.gz
end
