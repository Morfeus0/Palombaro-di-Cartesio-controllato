/* Viste: bottiglia SVG, schema a blocchi, macchina a stati e narrazione in parole semplici. */
(function (root) {
  'use strict';

  const BOTTLE = Object.freeze({
    waterTop: 150, waterBottom: 490, waterHeight: 0.28,
    plungerStart: 78, plungerPerMl: 6.4, barrelEnd: 150,
    bubbleBase: 20, bubbleGain: 12,
  });
  const BAR_SCALE = 1200;    // Pa a metà barra
  const DELTA_NOTABLE = 40;  // Pa: sotto questa correzione la narrazione parla di equilibrio
  const STATES = ['MANUALE', 'CALIBRAZIONE', 'HOLD', 'TRACKING', 'SAFE'];

  const FSM_NOTES = Object.freeze({
    MANUALE: 'Controllo disattivato: comanda chi muove la siringa.',
    CALIBRAZIONE: 'Siringa nella posizione di equilibrio prevista dal modello, poi si chiude l\'anello.',
    HOLD: 'Mantiene la quota scelta. Passa a SAFE se l\'errore supera 6 cm per più di 5 s.',
    TRACKING: 'Insegue un riferimento che cambia nel tempo (gradini o onda).',
    SAFE: '',
  });

  const BLOCK_TITLES = Object.freeze({
    manual: ['Spento', 'Non usato'],
    onoff: ['On-Off ±1 ml', 'Non usato'],
    pid: ['PID digitale', 'Modello p → ml'],
    cascade: ['PID digitale', 'PI pressione'],
  });

  const $ = id => document.getElementById(id);

  function fmt(x, digits) {
    return x.toLocaleString('it-IT', { minimumFractionDigits: digits, maximumFractionDigits: digits });
  }
  function signed(x, digits) { return (x >= 0 ? '+' : '−') + fmt(Math.abs(x), digits); }

  function depthToY(z) {
    return BOTTLE.waterTop + z / BOTTLE.waterHeight * (BOTTLE.waterBottom - BOTTLE.waterTop);
  }
  function yToDepth(y) {
    return (y - BOTTLE.waterTop) / (BOTTLE.waterBottom - BOTTLE.waterTop) * BOTTLE.waterHeight;
  }

  function renderBottle(snap, opts) {
    $('diver').setAttribute('transform', `translate(250 ${depthToY(snap.z).toFixed(2)})`);
    const h = Math.min(30, Math.max(6, BOTTLE.bubbleBase * (1 + (snap.bubbleRatio - 1) * BOTTLE.bubbleGain)));
    $('diver-bubble').setAttribute('height', h.toFixed(2));
    $('diver-water').setAttribute('y', (2 + h).toFixed(2));
    $('diver-water').setAttribute('height', Math.max(0, 32 - h).toFixed(2));

    const yRef = depthToY(snap.zref);
    $('target-line').setAttribute('y1', yRef.toFixed(2));
    $('target-line').setAttribute('y2', yRef.toFixed(2));
    $('target-tag').setAttribute('transform', `translate(306 ${yRef.toFixed(2)})`);
    $('target-tag-text').textContent = `${fmt(snap.zref * 100, 1)} cm`;
    const band = $('target-band');
    band.setAttribute('y', depthToY(snap.zref - 0.01).toFixed(2));
    band.setAttribute('height', (depthToY(snap.zref + 0.01) - depthToY(snap.zref - 0.01)).toFixed(2));
    band.classList.toggle('is-on', opts.showBand);

    $('track-box').setAttribute('transform', `translate(250 ${depthToY(snap.zHat).toFixed(2)})`);

    const head = BOTTLE.plungerStart + snap.syringe * BOTTLE.plungerPerMl;
    $('plunger').setAttribute('transform', `translate(${(snap.syringe * BOTTLE.plungerPerMl).toFixed(2)} 0)`);
    $('syringe-air').setAttribute('x', (head + 3).toFixed(2));
    $('syringe-air').setAttribute('width', Math.max(0, BOTTLE.barrelEnd - head - 3).toFixed(2));
    $('servo-horn').setAttribute('transform', `rotate(${(-40 + snap.syringe * 8).toFixed(1)} 30 108)`);
    $('bottle-p').textContent = `p ${signed(snap.pressure / 1000, 2)} kPa`;
    $('bottle').setAttribute('aria-valuenow', (snap.zref * 100).toFixed(1));
    $('bottle').setAttribute('aria-valuetext', `bersaglio a ${fmt(snap.zref * 100, 1)} cm di profondità`);
  }

  function describePosition(snap) {
    const eCm = (snap.zref - snap.z) * 100;
    if (Math.abs(eCm) < 0.3) return 'è sul bersaglio';
    return `è ${fmt(Math.abs(eCm), 1)} cm troppo ${eCm > 0 ? 'in alto' : 'in basso'}`;
  }

  function describeMotion(v) {
    const mm = v * 1000;
    if (Math.abs(mm) < 2) return 'quasi fermo';
    return mm > 0 ? 'sta scendendo' : 'sta salendo';
  }

  function narrate(snap) {
    const pos = describePosition(snap);
    const motion = describeMotion(snap.v);
    if (snap.fsm === 'MANUALE') {
      return {
        head: 'Nessun controllore: la siringa resta dove la metti tu.',
        detail: `Il palombaro ${pos} e ${motion}. Lasciato a sé stesso, l'errore cresce da solo: è l'instabilità.`,
      };
    }
    if (snap.fsm === 'SAFE') {
      return {
        head: 'Stato di sicurezza: aria rilasciata, il palombaro torna a galla.',
        detail: `Motivo: ${snap.safeReason}. Premi «Riprendi» per ricalibrare e ripartire.`,
      };
    }
    if (snap.fsm === 'CALIBRAZIONE') {
      return {
        head: 'Calibrazione: la siringa va dove il modello prevede l\'equilibrio.',
        detail: 'Prima di chiudere l\'anello il controllore parte da una stima calcolata, così il transitorio è più breve.',
      };
    }
    if (snap.mode === 'onoff') {
      const sinking = snap.onoff === 'sink';
      return {
        head: `On-Off: siringa ${sinking ? 'spinta (+1 ml), il palombaro scende' : 'tirata (−1 ml), il palombaro sale'}.`,
        detail: `Il palombaro ${pos}. L'On-Off cambia posizione solo quando l'errore supera 4 mm, quindi oscilla sempre attorno al bersaglio.`,
      };
    }
    const delta = snap.terms.out - snap.terms.ff;
    const verb = delta > DELTA_NOTABLE ? `chiede ${fmt(delta, 0)} Pa in più dell'equilibrio, per spingerlo giù`
      : delta < -DELTA_NOTABLE ? `chiede ${fmt(-delta, 0)} Pa in meno dell'equilibrio, per lasciarlo salire`
        : 'resta vicino alla pressione di equilibrio';
    const detail = snap.mode === 'cascade'
      ? `Anello interno: misura ${fmt(snap.pMeas / 1000, 2)} kPa, ne vuole ${fmt(snap.pRef / 1000, 2)} e muove la siringa a ${fmt(snap.syringe, 2)} ml.`
      : `Senza anello interno, la pressione voluta diventa subito una posizione della siringa (${fmt(snap.syringe, 2)} ml) usando il modello.`;
    return { head: `Il palombaro ${pos} e ${motion}: il controllore ${verb}.`, detail };
  }

  function renderNarration(snap) {
    const text = narrate(snap);
    $('narr-head').textContent = text.head;
    $('narr-detail').textContent = text.detail;
  }

  function renderBar(key, value, active) {
    const fill = $(`bar-${key}`);
    const half = Math.min(50, Math.abs(value) / BAR_SCALE * 50);
    fill.style.left = value >= 0 ? '50%' : `${50 - half}%`;
    fill.style.width = `${half}%`;
    fill.classList.toggle('is-pull', value < 0);
    $(`val-${key}`).textContent = active ? `${signed(value, 0)} Pa` : '—';
  }

  function renderTerms(snap) {
    const active = (snap.mode === 'pid' || snap.mode === 'cascade') && (snap.fsm === 'HOLD' || snap.fsm === 'TRACKING');
    const t = active ? snap.terms : { p: 0, i: 0, d: 0, ff: 0 };
    renderBar('p', t.p, active);
    renderBar('i', t.i, active);
    renderBar('d', t.d, active);
    $('val-ff').textContent = active ? `${fmt(t.ff, 0)} Pa` : '—';
    $('terms').classList.toggle('is-idle', !active);
  }

  function renderDiagram(snap) {
    const [outer, inner] = BLOCK_TITLES[snap.mode];
    $('bd-outer-title').textContent = outer;
    $('bd-inner-title').textContent = inner;
    const auto = snap.fsm === 'HOLD' || snap.fsm === 'TRACKING';
    $('bd-outer').classList.toggle('is-off', snap.mode === 'manual' || !auto);
    $('bd-inner').classList.toggle('is-off', snap.mode !== 'cascade' || !auto);
    $('bd-fb-inner').classList.toggle('is-off', snap.mode !== 'cascade');
    $('bd-fb-outer').classList.toggle('is-off', snap.mode === 'manual');
    $('bd-zref').textContent = `${fmt(snap.zref * 100, 1)} cm`;
    $('bd-err').textContent = `${signed((snap.zref - snap.zHat) * 100, 2)} cm`;
    $('bd-pref').textContent = auto && snap.mode !== 'onoff' ? `${fmt(snap.pRef / 1000, 2)} kPa` : '—';
    $('bd-u').textContent = `${fmt(snap.syringeCmd, 2)} ml`;
    $('bd-p').textContent = `${fmt(snap.pressure / 1000, 2)} kPa`;
    $('bd-z').textContent = `${fmt(snap.z * 100, 1)} cm`;
    $('bd-pmeas').textContent = `${fmt(snap.pMeas / 1000, 2)} kPa`;
    $('bd-zmeas').textContent = `${fmt(snap.zHat * 100, 2)} cm`;
  }

  function renderFsm(snap) {
    STATES.forEach(name => $(`st-${name}`).classList.toggle('is-active', snap.fsm === name));
    $('fsm-note').textContent = snap.fsm === 'SAFE' ? `Motivo: ${snap.safeReason}.` : FSM_NOTES[snap.fsm];
  }

  root.PalombaroViews = Object.freeze({
    fmt, signed, yToDepth, depthToY,
    renderBottle, renderNarration, renderTerms, renderDiagram, renderFsm,
  });
})(window);
