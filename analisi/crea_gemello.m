%% Crea il gemello digitale analisi/palombaro.slx (sottofase 3.5)
% Palombaro di Cartesio controllato — 5 novembre 2026 (anticipata). Il modello si costruisce da questo script, così
% è ripetibile e si legge com'è fatto. Parametri: analisi/parametri_gemello.m (caricati all'apertura del modello).
%
%   u_in ─> [servo: passi da 1°, velocità massima, gioco] ─> [siringa e aria: Boyle con pareti, perdita] ─┐
%   p_in ───────────────────────────────────────────────────────────────────────────────────────── Switch ┴─> p
%   p ─> [palombaro: Archimede + Boyle + attrito, fermi al fondo e in superficie] ─> h
%   p ─> [sensore di pressione: rumore, 1 Pa, 100 Hz] ─> p_mis      h ─> [telecamera: 156 ms, rumore, 60 Hz] ─> h_mis
%
% Uso:  matlab -batch "run('analisi/crea_gemello.m')"

cartella = fileparts(mfilename('fullpath'));
if isempty(cartella), cartella = fullfile(pwd, 'analisi'); end
addpath(cartella);
run(fullfile(cartella, 'parametri_gemello.m'));
mdl = 'palombaro';
if bdIsLoaded(mdl), close_system(mdl, 0); end
if exist(fullfile(cartella, [mdl '.slx']), 'file'), delete(fullfile(cartella, [mdl '.slx'])); end
new_system(mdl);
set_param(mdl, 'Solver', 'ode45', 'MaxStep', '0.005', 'StopTime', 'Tfine', 'SolverMode', 'SingleTasking', ...
    'PreLoadFcn', 'addpath(fileparts(which(''palombaro''))); run(''parametri_gemello.m'');');

blocco = @(lib, nome, pos, varargin) add_block(lib, [mdl '/' nome], 'Position', pos, varargin{:});
filo = @(da, a) add_line(mdl, da, a, 'autorouting', 'smart');

%% Ingressi
blocco('simulink/Sources/From Workspace', 'u_in', [20 40 90 70], 'VariableName', '[t_in, u_in]', 'Interpolate', 'off', 'OutputAfterFinalValue', 'Holding final value');
blocco('simulink/Sources/From Workspace', 'p_in', [20 200 90 230], 'VariableName', '[t_in, p_in]', 'OutputAfterFinalValue', 'Holding final value');
blocco('simulink/Sources/Constant', 'modo_pressione', [20 150 90 170], 'Value', 'modo_pressione');
blocco('simulink/Sources/From Workspace', 'd_in', [20 280 90 310], 'VariableName', '[t_in, d_in]', ...
    'OutputAfterFinalValue', 'Holding final value');   % disturbo: ml tolti stringendo la bottiglia
blocco('simulink/Sources/Constant', 'modo_controllo', [20 90 90 110], 'Value', 'modo_controllo');
blocco('simulink/Signal Routing/Switch', 'sorgente del comando', [100 20 120 90], ...
    'Criteria', 'u2 > Threshold', 'Threshold', '0.5');

%% Servo: comando in passi interi, velocità massima, gioco nella leva
blocco('simulink/Discontinuities/Quantizer', 'passi da 1°', [130 40 180 70], 'QuantizationInterval', 'passo_servo');
blocco('simulink/Discontinuities/Rate Limiter', 'velocità del servo', [210 40 260 70], ...
    'RisingSlewLimit', 'vel_servo', 'FallingSlewLimit', '-vel_servo', 'InitialCondition', 'u_chiusura');
blocco('simulink/Discontinuities/Backlash', 'gioco', [290 40 340 70], ...
    'BacklashWidth', 'gioco_servo', 'InitialOutput', 'u_chiusura');
blocco('simulink/User-Defined Functions/Fcn', 'ml spinti', [370 40 450 70], 'Expr', 'Ks*(u(1) - u_chiusura)');
filo('u_in/1', 'sorgente del comando/3'); filo('modo_controllo/1', 'sorgente del comando/2');
filo('sorgente del comando/1', 'passi da 1°/1'); filo('passi da 1°/1', 'velocità del servo/1');
filo('velocità del servo/1', 'gioco/1'); filo('gioco/1', 'ml spinti/1');

%% Siringa e aria: quantità d'aria (Pa·ml) che cala con la perdita; p = aria / (V_eff − ml spinti)
blocco('simulink/Continuous/Integrator', 'aria [Pa·ml]', [490 100 530 130], 'InitialCondition', 'p_atm*Veff');
blocco('simulink/Signal Routing/Mux', 'mux aria', [570 50 575 120], 'Inputs', '2');
blocco('simulink/User-Defined Functions/Fcn', 'Boyle', [610 70 690 100], 'Expr', 'u(1)/(Veff - u(2))');
blocco('simulink/User-Defined Functions/Fcn', 'perdita', [610 140 690 170], 'Expr', '-(u(1) - p_atm)*Veff/tau_perdita');
blocco('simulink/Math Operations/Sum', 'ml totali', [480 40 500 60], 'Inputs', '++');
filo('ml spinti/1', 'ml totali/1'); filo('d_in/1', 'ml totali/2');
filo('aria [Pa·ml]/1', 'mux aria/1'); filo('ml totali/1', 'mux aria/2');
filo('mux aria/1', 'Boyle/1'); filo('Boyle/1', 'perdita/1'); filo('perdita/1', 'aria [Pa·ml]/1');

%% Scelta della pressione: misurata (prove) o dal servo
blocco('simulink/Signal Routing/Switch', 'sorgente della pressione', [730 120 780 200], ...
    'Criteria', 'u2 > Threshold', 'Threshold', '0.5');
filo('p_in/1', 'sorgente della pressione/1'); filo('modo_pressione/1', 'sorgente della pressione/2');
filo('Boyle/1', 'sorgente della pressione/3');

%% Palombaro: Archimede con la bolla di Boyle e Pascal, attrito, fermi al fondo (0) e in superficie
blocco('simulink/Signal Routing/Mux', 'mux palombaro', [830 230 835 310], 'Inputs', '3');
blocco('simulink/User-Defined Functions/Fcn', 'accelerazione', [870 255 990 285], 'Expr', ...
    '(rho_g*(Vs_ + pb_*Vb_/(u(3) + rho_g*(H_bolla - u(1)))) - m_*g_ - c_*u(2))/meff_');
blocco(sprintf('simulink/Continuous/Integrator,\nSecond-Order\nLimited'), 'quota', [1030 250 1090 290], ...
    'ICX', 'h0_', 'ICDXDT', 'v0_', 'UpperLimitX', 'H_cima', 'LowerLimitX', '0');
filo('quota/1', 'mux palombaro/1'); filo('quota/2', 'mux palombaro/2');
filo('sorgente della pressione/1', 'mux palombaro/3');
filo('mux palombaro/1', 'accelerazione/1'); filo('accelerazione/1', 'quota/1');

%% Sensore di pressione: rumore, quantizzazione di 1 Pa, 100 letture al secondo
blocco('simulink/Sources/Random Number', 'rumore p', [830 380 870 410], 'Variance', '(rumore_on*rumore_p)^2', ...
    'SampleTime', 'T_pressione', 'Seed', '11');
blocco('simulink/Math Operations/Sum', 'somma p', [900 340 920 360], 'Inputs', '++');
blocco('simulink/Discontinuities/Quantizer', 'quant p', [950 335 1000 365], 'QuantizationInterval', 'quant_p');
blocco('simulink/Discrete/Zero-Order Hold', 'campiona p', [1030 335 1080 365], 'SampleTime', 'T_pressione');
filo('sorgente della pressione/1', 'somma p/1'); filo('rumore p/1', 'somma p/2');
filo('somma p/1', 'quant p/1'); filo('quant p/1', 'campiona p/1');

%% Telecamera: ritardo, rumore, quantizzazione, 60 immagini al secondo
blocco('simulink/Continuous/Transport Delay', 'ritardo telecamera', [1130 180 1190 210], ...
    'DelayTime', 'ritardo_camera', 'InitialOutput', 'h0_');
blocco('simulink/Sources/Random Number', 'rumore h', [1130 230 1170 260], 'Variance', '(rumore_on*rumore_h)^2', ...
    'SampleTime', 'T_camera', 'Seed', '23');
blocco('simulink/Math Operations/Sum', 'somma h', [1220 190 1240 210], 'Inputs', '++');
blocco('simulink/Discontinuities/Quantizer', 'quant h', [1270 185 1320 215], 'QuantizationInterval', 'quant_h');
blocco('simulink/Discrete/Zero-Order Hold', 'campiona h', [1350 185 1400 215], 'SampleTime', 'T_camera');
filo('quota/1', 'ritardo telecamera/1'); filo('ritardo telecamera/1', 'somma h/1'); filo('rumore h/1', 'somma h/2');
filo('somma h/1', 'quant h/1'); filo('quant h/1', 'campiona h/1');

%% Controllori (4.1): esterno sulla quota (PID o On-Off) che sceglie la pressione, interno PI sulla pressione
% Pressione voluta = equilibrio stimato alla quota voluta (p0_ff + rho g h_rif) + correzione sull'errore di quota.
blocco('simulink/Sources/From Workspace', 'h_rif', [20 480 90 510], 'VariableName', '[t_in, href_in]', ...
    'OutputAfterFinalValue', 'Holding final value');
blocco('simulink/Math Operations/Sum', 'errore quota', [1450 470 1470 490], 'Inputs', '+-');   % h_mis - h_rif
blocco('simulink/Discrete/Discrete PID Controller', 'PID quota', [1500 450 1580 510], ...
    'Controller', 'PID', 'P', 'Kp_h', 'I', 'Ki_h', 'D', 'Kd_h', 'N', 'N_h', 'SampleTime', 'Ts_h', ...
    'LimitOutput', 'on', 'UpperSaturationLimit', 'dp_max', 'LowerSaturationLimit', '-dp_max', ...
    'AntiWindupMode', 'clamping');
blocco('simulink/Discontinuities/Relay', 'On-Off', [1500 530 1580 560], 'OnSwitchValue', 'isteresi', ...
    'OffSwitchValue', '-isteresi', 'OnOutputValue', 'dp_onoff', 'OffOutputValue', '-dp_onoff');
blocco('simulink/Sources/Constant', 'modo_esterno', [1500 580 1560 600], 'Value', 'modo_esterno');
blocco('simulink/Signal Routing/Switch', 'tipo di controllo', [1610 470 1640 560], 'Criteria', 'u2 > Threshold', ...
    'Threshold', '0.5');
blocco('simulink/User-Defined Functions/Fcn', 'equilibrio stimato', [1500 620 1600 650], 'Expr', 'p0_ff + rho_g*u(1)');
blocco('simulink/Math Operations/Sum', 'pressione voluta', [1670 500 1690 520], 'Inputs', '++');
blocco('simulink/Math Operations/Sum', 'errore pressione', [1720 500 1740 520], 'Inputs', '+-');
blocco('simulink/Discrete/Discrete PID Controller', 'PI pressione', [1770 480 1850 540], ...
    'Controller', 'PI', 'P', 'Kp_p', 'I', 'Ki_p', 'SampleTime', 'Ts_p', 'InitialConditionForIntegrator', 'u0_ctrl', ...
    'LimitOutput', 'on', 'UpperSaturationLimit', '146', 'LowerSaturationLimit', '36', 'AntiWindupMode', 'clamping');
filo('campiona h/1', 'errore quota/1'); filo('h_rif/1', 'errore quota/2');
filo('errore quota/1', 'PID quota/1'); filo('errore quota/1', 'On-Off/1');
filo('PID quota/1', 'tipo di controllo/1'); filo('modo_esterno/1', 'tipo di controllo/2'); filo('On-Off/1', 'tipo di controllo/3');
filo('h_rif/1', 'equilibrio stimato/1');
filo('equilibrio stimato/1', 'pressione voluta/1'); filo('tipo di controllo/1', 'pressione voluta/2');
filo('pressione voluta/1', 'errore pressione/1'); filo('campiona p/1', 'errore pressione/2');
filo('errore pressione/1', 'PI pressione/1');
% il comando calcolato si applica al ciclo dopo, come sull'ESP32 (e niente anello algebrico)
blocco('simulink/Discrete/Unit Delay', 'ciclo dopo', [1870 495 1900 525], 'SampleTime', 'Ts_p', 'InitialCondition', 'u0_ctrl');
filo('PI pressione/1', 'ciclo dopo/1'); filo('ciclo dopo/1', 'sorgente del comando/1');

%% Uscite verso il workspace
uscite = {'h_vera', 'quota/1'; 'p_vera', 'sorgente della pressione/1'; 'h_mis', 'campiona h/1'; 'p_mis', 'campiona p/1';
          'p_voluta', 'pressione voluta/1'; 'u_cmd', 'sorgente del comando/1'; 'h_rif_out', 'h_rif/1'};
for i = 1:size(uscite, 1)
    blocco('simulink/Sinks/To Workspace', uscite{i, 1}, [1450 60+80*i 1520 90+80*i], ...
        'VariableName', uscite{i, 1}, 'SaveFormat', 'Timeseries');
    filo(uscite{i, 2}, [uscite{i, 1} '/1']);
end

%% Raggruppa in sottosistemi leggibili
gruppi = {'Servo', {'passi da 1°', 'velocità del servo', 'gioco', 'ml spinti'};
          'Siringa e aria', {'ml totali', 'aria [Pa·ml]', 'mux aria', 'Boyle', 'perdita'};
          'Controllore quota', {'errore quota', 'PID quota', 'On-Off', 'modo_esterno', 'tipo di controllo', ...
                                'equilibrio stimato', 'pressione voluta'};
          'Controllore pressione', {'errore pressione', 'PI pressione', 'ciclo dopo'};
          'Palombaro', {'mux palombaro', 'accelerazione', 'quota'};
          'Sensore di pressione', {'rumore p', 'somma p', 'quant p', 'campiona p'};
          'Telecamera', {'ritardo telecamera', 'rumore h', 'somma h', 'quant h', 'campiona h'}};
for i = 1:size(gruppi, 1)
    try
        h = cellfun(@(n) get_param([mdl '/' n], 'Handle'), gruppi{i, 2});
        Simulink.BlockDiagram.createSubsystem(h);
        nuovo = get_param(get_param(h(1), 'Parent'), 'Name');
        set_param([mdl '/' nuovo], 'Name', gruppi{i, 1});
    catch errore
        fprintf('sottosistema «%s» non creato (%s): blocchi lasciati in piano\n', gruppi{i, 1}, errore.message);
    end
end

save_system(mdl, fullfile(cartella, [mdl '.slx']));
fprintf('Creato %s\n', fullfile(cartella, [mdl '.slx']));

% Prova veloce: 5 s con il servo fermo a 36° (circuito alla pressione della stanza, P1 sul fondo)
Tfine = 5;
out = sim(mdl);
fprintf('prova di 5 s: quota finale %.2f cm, pressione finale %.0f Pa\n', ...
        100*out.h_vera.Data(end), out.p_vera.Data(end));
close_system(mdl, 0);
