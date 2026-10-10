/* Collegamento tra simulazione, viste, grafici e controlli della pagina. */
(function () {
  'use strict';

  const Sim = window.PalombaroSim;
  const V = window.PalombaroViews;
  const Charts = window.PalombaroCharts;
  const $ = id => document.getElementById(id);
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const GAME_GOAL = 10;          // s nella fascia
  const BEST_KEY = 'palombaro-best';
  const LEAK_STEPS = [Infinity, 1800, 600, 240, 90];
  const LEAK_LABELS = ['nessuna', 'minima (τ 30 min)', 'lenta (τ 10 min)', 'media (τ 4 min)', 'forte (τ 90 s)'];
  const CHART_PERIOD = 0.05;     // s di simulazione tra due campioni
  const TEXT_PERIOD = 0.25;      // s tra due aggiornamenti dei testi
  const KEY_STEP = 0.005;        // m per pressione di freccia

  const STATE_NAMES = Object.freeze({
    MANUALE: 'Manuale', CALIBRAZIONE: 'Calibrazione', HOLD: 'Mantenimento',
    TRACKING: 'Inseguimento', SAFE: 'Sicurezza',
  });

  const CTRL_DESC = Object.freeze({
    manual: 'Sei tu il controllore: la siringa resta dove la lasci. Prova a tenerlo fermo e scoprirai l\'instabilità con i tuoi occhi.',
    onoff: 'Due sole posizioni della siringa, come un termostato. Funziona, ma il palombaro oscilla sempre attorno al bersaglio: è il ciclo limite.',
    pid: 'Un solo anello: dalla quota misurata calcola direttamente dove mettere la siringa, usando il modello per convertire la pressione in millilitri.',
    cascade: 'Due anelli. Quello esterno decide la pressione che serve; quello interno, 100 volte al secondo, muove la siringa per ottenerla. È l\'architettura del progetto.',
  });

  const EXPERIMENTS = Object.freeze({
    instabile: 'Controllo spento e un piccolo colpetto: nel grafico della quota l\'errore cresce sempre più in fretta. È il polo instabile.',
    gradino: 'Il bersaglio si sposta di 5 cm. Nel grafico leggi la sovraelongazione (quanto supera il bersaglio) e il tempo di assestamento.',
    onoff: 'On-Off attivo: la quota disegna un\'oscillazione regolare che non si smorza. Poi passa a «PID in cascata» e confronta.',
    perdita: 'La bottiglia perde aria. Guarda il termine «Passato» crescere e la siringa avanzare piano piano per compensare.',
    schiaccia: 'Una mano schiaccia la bottiglia per un secondo: la pressione sale di colpo e l\'anello interno la riporta a posto.',
  });

  const sim = Sim.createSimulation();
  let lastAutoMode = 'cascade';
  let best = readBest();
  let won = false;
  let dragging = false;
  let chartsVisible = true;
  let lastChartT = -1;
  let lastTextT = -1;
  let lastFrame = null;

  function readBest() {
    try { return Number(localStorage.getItem(BEST_KEY)) || 0; } catch (err) { return 0; }
  }
  function saveBest(value) {
    try { localStorage.setItem(BEST_KEY, String(value)); } catch (err) { /* record solo in memoria */ }
  }

  /* ---------- costruzione degli elementi ripetuti dell'SVG ---------- */
  function svgEl(tag, attrs) {
    const el = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  }

  function buildRuler() {
    const g = $('ruler');
    for (let cm = 0; cm <= 28; cm++) {
      const y = V.depthToY(cm / 100);
      const major = cm % 5 === 0;
      g.appendChild(svgEl('line', { x1: major ? 182 : 187, x2: 192, y1: y, y2: y, class: 'tick' }));
      if (major) {
        const label = svgEl('text', { x: 178, y: y + 3.5, 'text-anchor': 'end', class: 'tick-label' });
        label.textContent = String(cm);
        g.appendChild(label);
      }
    }
  }

  function buildBarrelTicks() {
    const g = $('barrel-ticks');
    for (let ml = 0; ml <= 10; ml++) {
      const x = 78 + ml * 6.4;
      g.appendChild(svgEl('line', { x1: x, x2: x, y1: 64, y2: ml % 5 === 0 ? 71 : 68, class: 'tick' }));
    }
  }

  /* ---------- grafici ---------- */
  const charts = [
    Charts.createStripChart($('chart-z'), {
      window: 30, minSpan: 4, invert: true, format: v => V.fmt(v, 1),
      series: [{ key: 'z', token: '--water' }, { key: 'zref', token: '--ink', width: 1.25, dash: [5, 4] }],
    }),
    Charts.createStripChart($('chart-p'), {
      window: 30, minSpan: 0.6, format: v => V.fmt(v, 2),
      series: [{ key: 'p', token: '--water-deep' }, { key: 'pref', token: '--alert', width: 1.25, dash: [5, 4] }],
    }),
    Charts.createStripChart($('chart-s'), {
      window: 30, minSpan: 1, format: v => V.fmt(v, 1),
      series: [{ key: 's', token: '--ink' }],
    }),
  ];

  function pushCharts(snap) {
    const auto = snap.fsm === 'HOLD' || snap.fsm === 'TRACKING';
    const showRef = auto && (snap.mode === 'pid' || snap.mode === 'cascade');
    charts[0].push(snap.t, { z: snap.z * 100, zref: snap.zref * 100 });
    charts[1].push(snap.t, { p: snap.pressure / 1000, pref: showRef ? snap.pRef / 1000 : NaN });
    charts[2].push(snap.t, { s: snap.syringe });
  }

  function refreshChartColors() { charts.forEach(c => c.refreshColors()); }

  /* ---------- modalità ---------- */
  function setController(mode) {
    sim.setMode(mode);
    if (mode !== 'manual') lastAutoMode = mode;
    syncModeUi(mode);
  }

  function syncModeUi(mode) {
    const manual = mode === 'manual';
    $('panel-auto').hidden = manual;
    $('panel-manual').hidden = !manual;
    document.querySelectorAll('[data-ctrl]').forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.ctrl === mode));
    });
    $('ctrl-desc').textContent = CTRL_DESC[mode];
    if (manual) {
      $('manual-syringe').value = sim.snapshot().syringe.toFixed(2);
      updateManualLabel();
      won = false;
    }
  }

  function syncProfileUi(profile) {
    document.querySelectorAll('[data-profile]').forEach(b => {
      b.setAttribute('aria-pressed', String(b.dataset.profile === profile));
    });
  }

  function updateManualLabel() {
    $('manual-value').textContent = `${V.fmt(Number($('manual-syringe').value), 2)} ml`;
  }

  /* ---------- bottiglia: scelta del bersaglio ---------- */
  function svgPoint(ev) {
    const svg = $('bottle');
    const pt = svg.createSVGPoint();
    pt.x = ev.clientX;
    pt.y = ev.clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  function bindBottle() {
    const svg = $('bottle');
    svg.addEventListener('pointerdown', ev => {
      const p = svgPoint(ev);
      if (p.x < 186 || p.y < 140) return;
      dragging = true;
      svg.setPointerCapture(ev.pointerId);
      sim.setTarget(V.yToDepth(p.y));
    });
    svg.addEventListener('pointermove', ev => {
      if (dragging) sim.setTarget(V.yToDepth(svgPoint(ev).y));
    });
    const stop = () => { dragging = false; };
    svg.addEventListener('pointerup', stop);
    svg.addEventListener('pointercancel', stop);
    svg.addEventListener('keydown', ev => {
      const target = sim.snapshot().target;
      const moves = { ArrowUp: -KEY_STEP, ArrowDown: KEY_STEP, PageUp: -4 * KEY_STEP, PageDown: 4 * KEY_STEP };
      if (ev.key in moves) { ev.preventDefault(); sim.setTarget(target + moves[ev.key]); }
      if (ev.key === 'Home') { ev.preventDefault(); sim.setTarget(Sim.SETPOINT.min); }
      if (ev.key === 'End') { ev.preventDefault(); sim.setTarget(Sim.SETPOINT.max); }
    });
  }

  /* ---------- controlli ---------- */
  function bindGains() {
    const units = { kp: 'Pa/cm', ki: 'Pa/(cm·s)', kd: 'Pa/(cm/s)' };
    const show = () => ['kp', 'ki', 'kd'].forEach(k => {
      $(`${k}-out`).textContent = `${V.fmt(Number($(k).value), 0)} ${units[k]}`;
    });
    ['kp', 'ki', 'kd'].forEach(k => $(k).addEventListener('input', () => {
      sim.setGains({ [k]: Number($(k).value) });
      show();
    }));
    $('btn-gains-reset').addEventListener('click', () => {
      sim.resetGains();
      Object.entries(Sim.DEFAULT_GAINS).forEach(([k, v]) => { $(k).value = String(v); });
      show();
    });
    show();
  }

  function setLeakStep(step) {
    $('leak').value = String(step);
    sim.setLeak(LEAK_STEPS[step]);
    $('leak-out').textContent = LEAK_LABELS[step];
  }

  function runExperiment(name) {
    const snap = sim.snapshot();
    if (name === 'instabile') { setController('manual'); sim.poke(1); }
    if (name === 'gradino') {
      if (snap.mode === 'manual' || snap.mode === 'onoff') setController(lastAutoMode === 'onoff' ? 'cascade' : lastAutoMode);
      sim.setProfile('fisso');
      syncProfileUi('fisso');
      sim.setTarget(snap.target + (snap.target < 0.17 ? 0.05 : -0.05));
    }
    if (name === 'onoff') setController('onoff');
    if (name === 'perdita') setLeakStep(4);
    if (name === 'schiaccia') sim.squeeze();
    $('exp-note').textContent = EXPERIMENTS[name];
  }

  function bindControls() {
    document.querySelectorAll('[data-ctrl]').forEach(b => b.addEventListener('click', () => setController(b.dataset.ctrl)));
    document.querySelectorAll('[data-profile]').forEach(b => b.addEventListener('click', () => {
      sim.setProfile(b.dataset.profile);
      syncProfileUi(b.dataset.profile);
    }));
    document.querySelectorAll('[data-exp]').forEach(b => b.addEventListener('click', () => runExperiment(b.dataset.exp)));
    $('btn-poke').addEventListener('click', () => sim.poke(Math.random() < 0.5 ? -1 : 1));
    $('btn-squeeze').addEventListener('click', () => sim.squeeze());
    $('btn-safe').addEventListener('click', () => {
      if (sim.snapshot().fsm === 'SAFE') sim.resume(); else sim.emergency();
    });
    $('btn-handover').addEventListener('click', () => setController(lastAutoMode));
    $('manual-syringe').addEventListener('input', () => {
      sim.setManualSyringe(Number($('manual-syringe').value));
      updateManualLabel();
    });
    $('leak').addEventListener('input', () => setLeakStep(Number($('leak').value)));
    $('noise').addEventListener('change', () => sim.setNoise($('noise').checked));
    $('quant').addEventListener('change', () => sim.setQuantization($('quant').checked));
    bindGains();
  }

  /* ---------- testi e gioco ---------- */
  function updateReadouts(snap) {
    $('ro-depth').textContent = `${V.fmt(snap.z * 100, 1)} cm`;
    $('ro-target').textContent = `${V.fmt(snap.zref * 100, 1)} cm`;
    $('ro-error').textContent = `${V.fmt(Math.abs(snap.zref - snap.z) * 1000, 1)} mm`;
    $('ro-pressure').textContent = `${V.signed(snap.pressure / 1000, 2)} kPa`;
    $('ro-syringe').textContent = `${V.fmt(snap.syringe, 2)} ml`;
    $('ro-state').textContent = STATE_NAMES[snap.fsm];
    $('ro-rms').textContent = `${V.fmt(snap.rms * 1000, 2)} mm`;
    const safe = snap.fsm === 'SAFE';
    $('btn-safe').textContent = safe ? 'Riprendi' : 'Arresto di emergenza';
    $('btn-safe').classList.toggle('is-resume', safe);
  }

  function updateGame(snap) {
    if (snap.mode !== 'manual') return;
    const inBand = Math.min(snap.inBandFor, GAME_GOAL);
    $('game-bar').style.transform = `scaleX(${(inBand / GAME_GOAL).toFixed(3)})`;
    $('game-time').textContent = `${V.fmt(inBand, 1)} s`;
    if (snap.inBandFor > best) { best = snap.inBandFor; saveBest(best); }
    $('game-best').textContent = best > 0 ? `${V.fmt(Math.min(best, 99), 1)} s` : '—';
    if (snap.inBandFor >= GAME_GOAL) won = true;
    const zMax = Sim.PHYS.waterHeight - Sim.PHYS.diverLength;
    const escaped = snap.z <= 0.001 || snap.z >= zMax - 0.001;
    $('game-msg').textContent = won
      ? 'Ce l\'hai fatta: 10 secondi nella fascia. Ora lascia fare al controllore e confronta la precisione.'
      : snap.inBandFor > 0 ? 'Dentro la fascia: resisti!'
        : escaped ? 'È scappato. Riportalo nella fascia verde con la siringa.'
          : 'Fuori dalla fascia: correggi con la siringa, ma senza esagerare.';
  }

  function updateTexts(snap) {
    updateReadouts(snap);
    updateGame(snap);
    V.renderNarration(snap);
    V.renderDiagram(snap);
    V.renderFsm(snap);
  }

  /* ---------- ciclo principale ---------- */
  function frame(now) {
    const dt = lastFrame === null ? 1 / 60 : Math.min(0.1, (now - lastFrame) / 1000);
    lastFrame = now;
    sim.step(dt);
    const snap = sim.snapshot();
    V.renderBottle(snap, { showBand: snap.mode === 'manual' });
    V.renderTerms(snap);
    if (snap.t - lastChartT >= CHART_PERIOD) { pushCharts(snap); lastChartT = snap.t; }
    if (chartsVisible) charts.forEach(c => c.draw());
    if (snap.t - lastTextT >= TEXT_PERIOD) { updateTexts(snap); lastTextT = snap.t; }
    requestAnimationFrame(frame);
  }

  function watchTheme() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', refreshChartColors);
    new MutationObserver(refreshChartColors).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  function watchChartsVisibility() {
    if (!('IntersectionObserver' in window)) return;
    new IntersectionObserver(entries => {
      chartsVisible = entries.some(e => e.isIntersecting);
    }).observe($('charts'));
  }

  function init() {
    buildRuler();
    buildBarrelTicks();
    bindBottle();
    bindControls();
    setLeakStep(1);
    syncModeUi('cascade');
    syncProfileUi('fisso');
    $('pole-value').textContent = V.fmt(Sim.unstablePole(0.14), 2);
    watchTheme();
    watchChartsVisibility();
    const snap = sim.snapshot();
    V.renderBottle(snap, { showBand: false });
    updateTexts(snap);
    requestAnimationFrame(frame);
  }

  init();
})();
