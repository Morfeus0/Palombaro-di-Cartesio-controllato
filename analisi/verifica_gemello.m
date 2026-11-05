%% Verifica del gemello digitale contro i dati (sottofase 3.5)
% Palombaro di Cartesio controllato — 5 novembre 2026 (anticipata).
% 1) Palombaro: le 12 fughe della 3.3 rifatte nel gemello con la pressione MISURATA di ogni prova, partendo dalla
%    quota e dalla velocità misurate; si confronta la quota simulata con quella della telecamera.
% 2) Servo e aria: i comandi del servo della prova 4 della 2.7 (M2, 5 novembre) dati al gemello; si confronta la
%    pressione simulata con quella del sensore.
% Uso:  matlab -batch "run('analisi/verifica_gemello.m')"   (prima: analisi/crea_gemello.m)

cartella = fileparts(mfilename('fullpath'));
if isempty(cartella), cartella = fullfile(pwd, 'analisi'); end
radice = fileparts(cartella);
addpath(cartella);
run(fullfile(cartella, 'parametri_gemello.m'));
load_system(fullfile(cartella, 'palombaro.slx'));
RITARDO_TELECAMERA = 0.140;
rumore_on = 0;                                 % confronto senza rumore

%% 1. Fughe
file = dir(fullfile(radice, 'dati', 'anello-aperto', '*_anello-aperto_*.csv'));
f = figure('Visible', 'off', 'Position', [50 50 1200 800]);
theme(f, 'light');
tl = tiledlayout(f, 3, 4, 'TileSpacing', 'compact');
R2 = [];
fprintf(' prova  verso  R²\n');
for fi = file'
    numero = str2double(regexp(fi.name, '_(\d+)\.csv$', 'tokens', 'once'));
    if numero == 7, continue; end
    testo = fileread(fullfile(fi.folder, fi.name));
    su = contains(regexp(testo, '# parametri: ([^\n]*)', 'tokens', 'once'), ' su');
    T = readtable(fullfile(fi.folder, fi.name), 'CommentStyle', '#', 'FileType', 'text');
    [ts, primo] = unique(round(T.t_mac - T.eta_quota_ms/1000 - RITARDO_TELECAMERA, 3));
    h = T.quota_dmm(primo)/1e4;
    h_inizio = median(h(1:min(100, end)));
    % Le salite partono da 3 cm sopra il fondo: nei primi 2 cm la quota letta salta (marcatore vicino al fondo e
    % alle costole) e darebbe una velocità iniziale sbagliata, che un sistema instabile amplifica.
    if su, i1 = find(h > h_inizio + 0.030, 1); i2 = find(h > 0.165, 1);
    else,  i1 = find(h < h_inizio - 0.005, 1); i2 = find(h < 0.010, 1); end
    if isempty(i2), i2 = numel(h); end
    t0 = ts(i1);
    sel = ts >= t0 & ts <= t0 + 0.5;  cc = polyfit(ts(sel) - t0, h(sel), 2);   % parabola: h(0) e h'(0)
    [tp, ip] = unique(T.t_mac);
    % ingressi del gemello
    modo_pressione = 1;  h0_ = cc(3);  v0_ = cc(2);
    t_in = tp - t0;  p_in = T.p_pa(ip);  keep = t_in >= 0;  t_in = t_in(keep);  p_in = p_in(keep);
    u_in = u_chiusura*ones(size(t_in));
    href_in = 0.10*ones(size(t_in));  d_in = zeros(size(t_in));  modo_controllo = 0;
    Tfine = ts(i2) - t0;
    out = sim('palombaro');
    hs = interp1(out.h_vera.Time, out.h_vera.Data(:), ts(i1:i2) - t0);
    hm = h(i1:i2);
    R2(end+1) = 1 - sum((hs - hm).^2) / sum((hm - mean(hm)).^2); %#ok<SAGROW>
    fprintf('  %2d    %-4s  %.3f\n', numero, ternario(su, 'su', 'giù'), R2(end));
    nexttile(tl);
    plot(ts(i1:i2) - t0, 100*hm, 'b.', 'MarkerSize', 4); hold on;
    plot(out.h_vera.Time, 100*out.h_vera.Data(:), 'r-', 'LineWidth', 1.2);
    title(sprintf('prova %d, %s, R² %.3f', numero, ternario(su, 'su', 'giù'), R2(end)));
    xlabel('s'); ylabel('cm'); grid on; ylim([0 20]);
end
title(tl, 'Gemello digitale (rosso) con la pressione misurata, contro le fughe vere (blu)');
exportgraphics(f, fullfile(cartella, 'figure', 'gemello_fughe.png'), 'Resolution', 130);
fprintf('fughe: R² minimo %.3f, medio %.3f\n', min(R2), mean(R2));

%% 2. Servo e aria: comandi della prova 4 della 2.7
nome = fullfile(radice, 'dati', '2026-11-05', '2026-11-05_prova_04.csv.gz');
gunzip(nome, tempdir);
T = readtable(fullfile(tempdir, '2026-11-05_prova_04.csv'), 'CommentStyle', '#', 'FileType', 'text');
[tp, ip] = unique(T.t_mac);
modo_pressione = 0;  h0_ = 0;  v0_ = 0;
t_in = tp - tp(1);  u_in = T.u_decimi(ip)/10;  p_in = T.p_pa(ip);
href_in = 0.10*ones(size(t_in));  d_in = zeros(size(t_in));  modo_controllo = 0;
% Il circuito era chiuso a 36° dalle 16:08; all'inizio della prova (16:53) il servo era a 146° e la pressione
% misurata è quella di partenza: si sceglie l'aria iniziale del gemello perché la pressione iniziale torni.
p_inizio = p_in(1);  dV = Ks*(u_in(1) - u_chiusura);
p_atm_orig = p_atm;
p_atm = p_inizio*(Veff - dV)/Veff;            % «aria» iniziale p_atm*Veff = p_inizio*(Veff - dV)
Tfine = t_in(end);
out = sim('palombaro');
ps = interp1(out.p_vera.Time, out.p_vera.Data(:), t_in);
R2p = 1 - sum((ps - p_in).^2) / sum((p_in - mean(p_in)).^2);
fprintf('pressione con i comandi della prova 4: R² %.3f, errore medio %.0f Pa, massimo %.0f Pa\n', ...
        R2p, mean(abs(ps - p_in)), max(abs(ps - p_in)));
p_atm = p_atm_orig;
f2 = figure('Visible', 'off', 'Position', [100 100 900 360]);
theme(f2, 'light');
plot(t_in, p_in/1000, 'b', t_in, ps/1000, 'r'); grid on;
xlabel('s'); ylabel('kPa'); legend('misurata', 'gemello', 'Location', 'best');
title(sprintf('Pressione con i comandi del servo della prova 4 (M2): R² %.3f', R2p));
exportgraphics(f2, fullfile(cartella, 'figure', 'gemello_pressione.png'), 'Resolution', 130);
close_system('palombaro', 0);
fprintf('Salvati: analisi/figure/gemello_fughe.png, analisi/figure/gemello_pressione.png\n');

function s = ternario(c, a, b)
    if c, s = a; else, s = b; end
end
