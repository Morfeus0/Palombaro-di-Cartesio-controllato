%% Identificazione dei parametri dalle fughe in anello aperto (sottofase 3.4)
% Palombaro di Cartesio controllato — 5 novembre 2026 (anticipata).
% Dati: dati/anello-aperto/2026-11-05_anello-aperto_NN.csv (3.3), 12 fughe valide (la 07 non vale: la pressione
% non è scesa sotto la soglia). Modello linearizzato (relazione/04-modello.md):
%
%     h'' = -a (p - p0 - rho g h) - beta h'        a = b_p/m_eff [m/s²/Pa],  beta = c/m_eff [1/s]
%
% Durante una fuga il programma della 3.3 tiene la pressione costante (p_i); la soluzione esatta è
%     h(t) = (p_i - p0)/(rho g) + A_i e^(lambda t) + B_i e^(-(lambda + beta) t)
% con lambda e -(lambda+beta) radici di s² + beta s - a rho g. La costante NON è libera: è la quota di equilibrio per
% la pressione misurata, con rho g confermato dalla 3.2 e p0 (equilibrio a quota 0) unico per tutte le prove.
% Fissati lambda e beta, le A_i, B_i e p0 vengono da un solo sistema lineare (minimi quadrati); lambda e beta si
% cercano su una griglia, con beta ≥ 0 (attrito che dissipa).
%
% Storia del metodo (5 novembre): 1) simulare il sistema instabile con la pressione misurata e confrontarlo con la
% quota divergeva per pochi pascal d'errore sull'equilibrio; 2) le esponenziali con una costante libera per ogni prova
% si adattano bene (R² 0,99) ma lambda e beta non si separano (valle lunga del costo, attrito negativo).
% Uso:  matlab -batch "run('analisi/identificazione.m')"     (solo MATLAB di base)

clear; clc;
cartella = fileparts(mfilename('fullpath'));
if isempty(cartella), cartella = fullfile(pwd, 'analisi'); end
radice = fileparts(cartella);
rhog = 997.6*9.806;                 % Pa/m
RITARDO_TELECAMERA = 0.140;         % s, dalla scena all'arrivo sul Mac (156 ms misurati meno ~16 ms di schermo)
QUOTA_PARTENZA = 0.005;             % m: il tratto parte quando P1 si è già mosso di 5 mm (niente adesione al fondo)
QUOTA_MAX = 0.165;  QUOTA_MIN = 0.010;   % sul fondo P1 si legge fino a 0,6 cm

%% 1. Lettura delle prove: il tratto della fuga, una riga per fotogramma
file = dir(fullfile(radice, 'dati', 'anello-aperto', '*_anello-aperto_*.csv'));
prove = struct([]);
for f = file'
    testo = fileread(fullfile(f.folder, f.name));
    parametri = regexp(testo, '# parametri: ([^\n]*)', 'tokens', 'once');
    numero = str2double(regexp(f.name, '_(\d+)\.csv$', 'tokens', 'once'));
    if numero == 7, continue; end
    T = readtable(fullfile(f.folder, f.name), 'CommentStyle', '#', 'FileType', 'text');
    t_scena = T.t_mac - T.eta_quota_ms/1000 - RITARDO_TELECAMERA;   % istante vero della quota
    [t_scena, primo] = unique(round(t_scena, 3));                   % una riga per fotogramma
    h = T.quota_dmm(primo)/1e4;  p = T.p_pa(primo);
    su = contains(parametri{1}, ' su');
    h0 = median(h(1:min(100, end)));
    if su
        i1 = find(h > h0 + QUOTA_PARTENZA, 1);  i2 = find(h > QUOTA_MAX, 1);
    else
        i1 = find(h < h0 - QUOTA_PARTENZA, 1);  i2 = find(h < QUOTA_MIN, 1);
    end
    if isempty(i2), i2 = numel(h); end
    k = numel(prove) + 1;
    prove(k).numero = numero; prove(k).su = su;
    prove(k).t = t_scena(i1:i2) - t_scena(i1);
    prove(k).h = h(i1:i2);
    prove(k).p = mean(p(i1:i2));  prove(k).p_std = std(p(i1:i2));
end
fprintf('%d prove valide; deviazione della pressione durante le fughe: %.0f–%.0f Pa\n', ...
        numel(prove), min([prove.p_std]), max([prove.p_std]));

%% 2. Stima: griglia su lambda e beta, poi rifinitura (beta ≥ 0)
lam_g = linspace(0.03, 1.2, 235);  bet_g = linspace(0, 4, 201);
[L, Bt] = meshgrid(lam_g, bet_g);
J = arrayfun(@(l, b) adatta(prove, l, b, rhog), L, Bt);
[~, imin] = min(J(:));
x = fminsearch(@(x) adatta(prove, x(1), x(2)^2, rhog), [L(imin), sqrt(Bt(imin))], optimset('TolX', 1e-6));
lambda = x(1); beta = x(2)^2;
[Jmin, hm, R2, p0] = adatta(prove, lambda, beta, rhog);
a = lambda*(lambda + beta)/rhog;              % prodotto delle radici: lambda (lambda + beta) = a rho g

%% 3. Risultati
fprintf('\n prova  verso  R²\n');
for i = 1:numel(prove)
    fprintf('  %2d    %-4s  %.4f\n', prove(i).numero, ternario(prove(i).su, 'su', 'giù'), R2(i));
end
fprintf('\nlambda = %.3f rad/s, beta = %.3f 1/s, p0 = %.3f kPa (soglia misurata alle 17:52: 101,640)\n', ...
        lambda, beta, p0/1000);
fprintf('a = %.3e m/s²/Pa, k/m_eff = a rho g = %.3f 1/s² (modello della 3.1: 0,418)\n', a, a*rhog);
fprintf('confronto: polo del modello della 3.1 0,346 rad/s; proposta 0,33 rad/s\n');
fprintf('R² minimo %.4f, medio %.4f (Fatto quando della 3.4: R² ≥ 0,9)\n', min(R2), mean(R2));
dentro = J <= 1.2*Jmin;
fprintf('coppie compatibili con i dati (costo entro +20 %%): lambda %.2f–%.2f rad/s, beta %.2f–%.2f 1/s\n', ...
        min(L(dentro)), max(L(dentro)), min(Bt(dentro)), max(Bt(dentro)));
% Le sole salite (tutte alla stessa pressione) non separano p0 da lambda: si usano le 12 prove insieme.
% beta non è determinato da queste fughe (valle piatta lungo beta): si combina lambda con k/m_eff del modello (3.1)
k_su_m_teorico = 0.418;                                  % 1/s², analisi/modello.m
beta_comb = (k_su_m_teorico - lambda^2)/lambda;
fprintf('con k/m_eff del modello (%.3f): beta = %.3f 1/s, c = beta * m_eff = %.4f N·s/m (stima della 3.1: 0,004)\n', ...
        k_su_m_teorico, beta_comb, beta_comb*4.635e-3);

%% 4. Figure
f = figure('Visible', 'off', 'Position', [50 50 1200 800]);
theme(f, 'light');
tl = tiledlayout(f, 3, 4, 'TileSpacing', 'compact');
for i = 1:numel(prove)
    nexttile(tl);
    plot(prove(i).t, 100*prove(i).h, 'b.', 'MarkerSize', 4); hold on;
    plot(prove(i).t, 100*hm{i}, 'r-', 'LineWidth', 1.2);
    title(sprintf('prova %d, %s, R² %.3f', prove(i).numero, ternario(prove(i).su, 'su', 'giù'), R2(i)));
    xlabel('s'); ylabel('cm'); grid on;
end
title(tl, sprintf('Fughe: misurate (blu) e modello (rosso), \\lambda = %.3f rad/s, \\beta = %.2f 1/s, p_0 = %.2f kPa', ...
      lambda, beta, p0/1000));
exportgraphics(f, fullfile(cartella, 'figure', 'identificazione.png'), 'Resolution', 130);

f2 = figure('Visible', 'off', 'Position', [100 100 560 420]);
theme(f2, 'light');
contour(L, Bt, log10(J), 30); hold on; plot(lambda, beta, 'r*', 'MarkerSize', 12);
contour(L, Bt, double(dentro), [0.5 0.5], 'k', 'LineWidth', 1.5);
xlabel('\lambda [rad/s]'); ylabel('\beta [1/s]');
title('Costo (log_{10}); in nero la zona entro +20 % del minimo');
exportgraphics(f2, fullfile(cartella, 'figure', 'identificazione_costo.png'), 'Resolution', 130);

save(fullfile(cartella, 'identificazione.mat'), 'a', 'beta', 'lambda', 'p0', 'R2', 'beta_comb');
fprintf('Salvati: analisi/identificazione.mat, analisi/figure/identificazione.png, identificazione_costo.png\n');

%% Funzioni locali
function [J, hm, R2, p0] = adatta(prove, lambda, beta, rhog)
    % Un solo sistema lineare: per ogni prova A_i, B_i; in comune q = p0/(rho g).
    % Modello: h = p_i/(rho g) - q + A_i e^(lambda t) + B_i e^(-(lambda+beta) t)
    n = numel(prove);  righe = arrayfun(@(p) numel(p.t), prove);  N = sum(righe);
    X = zeros(N, 2*n + 1);  y = zeros(N, 1);  peso = zeros(N, 1);  r = 0;
    for i = 1:n
        idx = r + (1:righe(i));  t = prove(i).t;
        X(idx, 2*i-1) = exp(lambda*t);  X(idx, 2*i) = exp(-(lambda + beta)*t);  X(idx, end) = -1;
        y(idx) = prove(i).h - prove(i).p/rhog;
        peso(idx) = 1/sqrt(sum((prove(i).h - mean(prove(i).h)).^2));   % ogni prova pesa uguale
        r = r + righe(i);
    end
    coef = (X .* peso) \ (y .* peso);
    res = (X*coef - y);
    J = sum((res .* peso).^2);                                     % somma di (1 − R²) delle prove
    p0 = coef(end)*rhog;
    hm = cell(1, n);  R2 = zeros(1, n);  r = 0;
    for i = 1:n
        idx = r + (1:righe(i));
        hm{i} = X(idx, :)*coef + prove(i).p/rhog;
        R2(i) = 1 - sum((hm{i} - prove(i).h).^2) / sum((prove(i).h - mean(prove(i).h)).^2);
        r = r + righe(i);
    end
end

function s = ternario(c, a, b)
    if c, s = a; else, s = b; end
end
