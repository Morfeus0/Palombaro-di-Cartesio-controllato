/* Palombaro di Cartesio – modello fisico, sensori, controllori e supervisore.
   Unità SI salvo diversa indicazione: siringa in ml, pressioni relative (gauge) in Pa.
   Lo stato interno è mutabile per efficienza (passo fisico da 1 ms); verso l'esterno
   escono solo snapshot congelati. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PalombaroSim = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const PHYS = Object.freeze({
    rho: 1000,
    g: 9.81,
    pAtm: 101325,
    waterHeight: 0.28,       // m, colonna d'acqua
    diverLength: 0.035,      // m
    solidVolume: 1.0e-6,     // m³, vetro + zavorra
    bubbleVolumeAtm: 2.1e-6, // m³, bolla a pressione atmosferica
    mass: 3.042e-3,          // kg: neutro a z = 14 cm con circa 1,5 kPa in testa
    addedMassFactor: 1.6,    // massa aggiunta dell'acqua trascinata
    linearDrag: 0.004,       // N·s/m
    quadDrag: 0.025,         // N·s²/m²
    airVolumeMax: 310,       // ml d'aria con lo stantuffo tutto fuori (camera + bottiglia extra)
    syringeMax: 10,          // ml
    microForce: 2.5e-6,      // N, microcorrenti che rompono l'equilibrio
  });

  const HW = Object.freeze({
    servoRate: 25,       // ml/s
    servoStep: 0.05,     // ml, ~200 passi utili
    cameraRate: 30,      // Hz
    cameraDelay: 0.066,  // s, due fotogrammi
    cameraNoise: 0.0003, // m
    pressureRate: 100,   // Hz
    pressureNoise: 3,    // Pa
    pressureLimit: 3500, // Pa, soglia di sicurezza
  });

  const DEFAULT_GAINS = Object.freeze({ kp: 470, ki: 100, kd: 290 }); // Pa/cm, Pa/(cm·s), Pa/(cm/s)
  const INNER = Object.freeze({ kp: 0.002, ki: 0.03 });               // ml/Pa, ml/(Pa·s)
  const ONOFF = Object.freeze({ hysteresis: 0.004, swing: 1.0 });      // m, ml
  const ALPHA_BETA = Object.freeze({ alpha: 0.35, beta: 0.05 });
  const SETPOINT = Object.freeze({ min: 0.03, max: 0.24, start: 0.12 });
  const SAFE_ERROR = Object.freeze({ distance: 0.06, seconds: 5 });
  const CALIBRATION_TIME = 1.2; // s
  const BAND = 0.01;            // m, fascia del gioco
  const PHYS_DT = 0.001;        // s
  const START = Object.freeze({ z: 0.14, syringe: 5 });

  const neutralBubble = PHYS.mass / PHYS.rho - PHYS.solidVolume;
  const P_NEUTRAL_SURFACE = PHYS.bubbleVolumeAtm * PHYS.pAtm / neutralBubble - PHYS.pAtm;

  function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }

  function gaussian() {
    let u = 0;
    while (u === 0) u = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random());
  }

  function neutralPressureAt(z) { return P_NEUTRAL_SURFACE - PHYS.rho * PHYS.g * z; }

  function bubbleVolume(z, ph) {
    return PHYS.bubbleVolumeAtm * PHYS.pAtm / (PHYS.pAtm + ph + PHYS.rho * PHYS.g * Math.max(0, z));
  }

  function netForceDown(z, ph) {
    const buoyancy = PHYS.rho * PHYS.g * (PHYS.solidVolume + bubbleVolume(z, ph));
    return PHYS.mass * PHYS.g - buoyancy;
  }

  function gaugeFromAir(airContent, airVolume) { return airContent / airVolume - PHYS.pAtm; }

  function syringeForPressure(airContent, ph) {
    return PHYS.airVolumeMax - airContent / (PHYS.pAtm + ph);
  }

  /** Polo instabile del modello linearizzato a quota z (rad/s). */
  function unstablePole(z) {
    const ph = neutralPressureAt(z);
    const pAbs = PHYS.pAtm + ph + PHYS.rho * PHYS.g * z;
    const k = Math.pow(PHYS.rho * PHYS.g, 2) * bubbleVolume(z, ph) / pAbs;
    const m = PHYS.mass * PHYS.addedMassFactor;
    const c = PHYS.linearDrag;
    return (-c + Math.sqrt(c * c + 4 * m * k)) / (2 * m);
  }

  const NOMINAL_AIR = (PHYS.pAtm + neutralPressureAt(START.z)) * (PHYS.airVolumeMax - START.syringe);
  const NOMINAL_P_RANGE = Object.freeze({
    min: gaugeFromAir(NOMINAL_AIR, PHYS.airVolumeMax),
    max: gaugeFromAir(NOMINAL_AIR, PHYS.airVolumeMax - PHYS.syringeMax),
  });

  function feedforwardSyringe(zref) {
    return clamp(syringeForPressure(NOMINAL_AIR, neutralPressureAt(zref)), 0, PHYS.syringeMax);
  }

  function createSimulation() {
    const s = {};
    const settings = {
      mode: 'cascade',      // manual | onoff | pid | cascade
      gains: { ...DEFAULT_GAINS },
      leakTau: 1800,        // s, costante di tempo della perdita d'aria
      noise: true,
      quantization: true,
      profile: 'fisso',     // fisso | gradini | onda
    };

    function resetController() {
      s.ctrl = {
        iTerm: 0, zHat: s.zMeas, vHat: 0, pRef: neutralPressureAt(s.zref),
        ePrevInner: 0, onoff: 'sink', terms: { ff: 0, p: 0, i: 0, d: 0, out: 0 },
        hasEstimate: false,
      };
    }

    function reset() {
      Object.assign(s, {
        t: 0, z: START.z, v: 0, syringe: START.syringe, syringeCmd: START.syringe,
        air: NOMINAL_AIR, squeezeMl: 0, squeezeStart: -10, microF: 0,
        target: SETPOINT.start, zref: SETPOINT.start, profileStart: 0,
        zMeas: START.z, pMeas: neutralPressureAt(START.z),
        camQueue: [], nextCam: 0, nextPress: 0,
        manualSyringe: START.syringe,
        fsm: settings.mode === 'manual' ? 'MANUALE' : 'CALIBRAZIONE', fsmSince: 0,
        safeReason: '', farSince: null, inBandSince: null,
        errLog: [],
      });
      resetController();
    }

    function airVolume() { return PHYS.airVolumeMax - s.syringe - s.squeezeMl; }
    function gauge() { return gaugeFromAir(s.air, airVolume()); }

    function enterState(name, reason) {
      s.fsm = name;
      s.fsmSince = s.t;
      s.farSince = null;
      if (name === 'SAFE') s.safeReason = reason || '';
      if (name === 'CALIBRAZIONE') resetController();
    }

    function updateSetpoint() {
      const age = s.t - s.profileStart;
      let z = s.target;
      if (settings.profile === 'gradini') {
        const high = Math.floor(age / 12) % 2 === 1;
        z = s.target + (high ? 0.05 : 0);
      } else if (settings.profile === 'onda') {
        z = s.target + 0.04 * Math.sin(2 * Math.PI * age / 16);
      }
      s.zref = clamp(z, SETPOINT.min, SETPOINT.max);
    }

    function stepPhysics(dt) {
      const age = s.t - s.squeezeStart;
      s.squeezeMl = age >= 0 && age < 1.2 ? 2 * Math.sin(Math.PI * age / 1.2) : 0;
      s.microF += (-s.microF * 0.5 + PHYS.microForce * gaussian() * 3) * dt;

      const ph = gauge();
      const drag = PHYS.linearDrag * s.v + PHYS.quadDrag * s.v * Math.abs(s.v);
      const force = netForceDown(s.z, ph) + s.microF - drag;
      s.v += force / (PHYS.mass * PHYS.addedMassFactor) * dt;
      s.z += s.v * dt;

      const zMax = PHYS.waterHeight - PHYS.diverLength;
      if (s.z <= 0) { s.z = 0; if (s.v < 0) s.v = 0; }
      if (s.z >= zMax) { s.z = zMax; if (s.v > 0) s.v = 0; }

      if (Number.isFinite(settings.leakTau)) s.air -= ph * airVolume() / settings.leakTau * dt;

      const goal = settings.quantization
        ? Math.round(s.syringeCmd / HW.servoStep) * HW.servoStep
        : s.syringeCmd;
      const maxMove = HW.servoRate * dt;
      s.syringe = clamp(s.syringe + clamp(goal - s.syringe, -maxMove, maxMove), 0, PHYS.syringeMax);
    }

    function noisy(value, sigma) { return settings.noise ? value + sigma * gaussian() : value; }

    function sampleSensors() {
      let freshCamera = false;
      if (s.t >= s.nextPress) {
        s.nextPress += 1 / HW.pressureRate;
        s.pMeas = noisy(gauge(), HW.pressureNoise);
        runInnerLoop(1 / HW.pressureRate);
      }
      if (s.t >= s.nextCam) {
        s.nextCam += 1 / HW.cameraRate;
        s.camQueue.push({ at: s.t + HW.cameraDelay, z: noisy(s.z, HW.cameraNoise) });
      }
      while (s.camQueue.length && s.camQueue[0].at <= s.t) {
        s.zMeas = s.camQueue.shift().z;
        freshCamera = true;
      }
      if (freshCamera) onCameraFrame(1 / HW.cameraRate);
    }

    /* Filtro α-β: stima quota e velocità dalla telecamera rumorosa. */
    function updateEstimate(dt) {
      const c = s.ctrl;
      if (!c.hasEstimate) { c.zHat = s.zMeas; c.vHat = 0; c.hasEstimate = true; return; }
      const zPred = c.zHat + c.vHat * dt;
      const r = s.zMeas - zPred;
      c.zHat = zPred + ALPHA_BETA.alpha * r;
      c.vHat += ALPHA_BETA.beta * r / dt;
    }

    function onCameraFrame(dt) {
      updateEstimate(dt);
      logError();
      if (s.fsm === 'MANUALE') { s.syringeCmd = s.manualSyringe; return; }
      if (s.fsm === 'SAFE') { s.syringeCmd = 0; return; }
      if (s.fsm === 'CALIBRAZIONE') { s.syringeCmd = feedforwardSyringe(s.zref); return; }
      if (settings.mode === 'onoff') runOnOff();
      else runOuterPid(dt);
    }

    function runOnOff() {
      const c = s.ctrl;
      if (c.zHat > s.zref + ONOFF.hysteresis) c.onoff = 'rise';
      else if (c.zHat < s.zref - ONOFF.hysteresis) c.onoff = 'sink';
      const ff = feedforwardSyringe(s.zref);
      const delta = c.onoff === 'sink' ? ONOFF.swing : -ONOFF.swing;
      s.syringeCmd = clamp(ff + delta, 0, PHYS.syringeMax);
      c.terms = { ff: 0, p: 0, i: 0, d: 0, out: 0 };
    }

    /* PID digitale sulla quota: uscita in Pa (riferimento di pressione).
       Derivata sulla misura stimata, anti-windup per integrazione condizionata. */
    function runOuterPid(dt) {
      const c = s.ctrl;
      const g = settings.gains;
      const eCm = (s.zref - c.zHat) * 100;
      const ff = neutralPressureAt(s.zref);
      const p = g.kp * eCm;
      const d = -g.kd * c.vHat * 100;
      const lo = settings.mode === 'pid' ? NOMINAL_P_RANGE.min : -500;
      const hi = settings.mode === 'pid' ? NOMINAL_P_RANGE.max : HW.pressureLimit - 300;
      const raw = ff + p + c.iTerm + d;
      const out = clamp(raw, lo, hi);
      const saturatedSameWay = raw !== out && Math.sign(raw - out) === Math.sign(eCm);
      if (!saturatedSameWay) c.iTerm += g.ki * eCm * dt;
      c.pRef = out;
      c.terms = { ff, p, i: c.iTerm, d, out };
      if (settings.mode === 'pid') s.syringeCmd = clamp(syringeForPressure(NOMINAL_AIR, out), 0, PHYS.syringeMax);
    }

    /* Anello interno (solo cascata): PI in forma di velocità sulla pressione misurata. */
    function runInnerLoop(dt) {
      if (settings.mode !== 'cascade' || (s.fsm !== 'HOLD' && s.fsm !== 'TRACKING')) return;
      const c = s.ctrl;
      const e = c.pRef - s.pMeas;
      const next = s.syringeCmd + INNER.kp * (e - c.ePrevInner) + INNER.ki * e * dt;
      s.syringeCmd = clamp(next, 0, PHYS.syringeMax);
      c.ePrevInner = e;
    }

    function logError() {
      const e = s.zref - s.z;
      s.errLog.push(e * e);
      if (s.errLog.length > HW.cameraRate * 10) s.errLog.shift();
      if (Math.abs(e) <= BAND) { if (s.inBandSince === null) s.inBandSince = s.t; }
      else s.inBandSince = null;
    }

    function supervise() {
      const auto = s.fsm === 'HOLD' || s.fsm === 'TRACKING';
      if (s.fsm === 'CALIBRAZIONE' && s.t - s.fsmSince >= CALIBRATION_TIME) {
        enterState(settings.profile === 'fisso' ? 'HOLD' : 'TRACKING');
        return;
      }
      if (!auto) return;
      if (s.pMeas > HW.pressureLimit) { enterState('SAFE', 'pressione oltre il limite di sicurezza'); return; }
      if (Math.abs(s.zref - s.z) > SAFE_ERROR.distance) {
        if (s.farSince === null) s.farSince = s.t;
        if (s.t - s.farSince > SAFE_ERROR.seconds) enterState('SAFE', 'palombaro lontano dal bersaglio per più di 5 s');
      } else {
        s.farSince = null;
      }
    }

    function step(dt) {
      const steps = Math.max(1, Math.round(Math.min(dt, 0.1) / PHYS_DT));
      for (let k = 0; k < steps; k++) {
        s.t += PHYS_DT;
        updateSetpoint();
        stepPhysics(PHYS_DT);
        sampleSensors();
        supervise();
      }
    }

    function snapshot() {
      const ph = gauge();
      const rms = s.errLog.length ? Math.sqrt(s.errLog.reduce((a, b) => a + b, 0) / s.errLog.length) : 0;
      return Object.freeze({
        t: s.t, z: s.z, v: s.v, zMeas: s.zMeas, zHat: s.ctrl.zHat, vHat: s.ctrl.vHat,
        zref: s.zref, target: s.target, syringe: s.syringe, syringeCmd: s.syringeCmd,
        pressure: ph, pMeas: s.pMeas, pRef: s.ctrl.pRef, squeezeMl: s.squeezeMl,
        bubbleRatio: bubbleVolume(s.z, ph) / neutralBubble,
        mode: settings.mode, fsm: s.fsm, safeReason: s.safeReason, profile: settings.profile,
        terms: Object.freeze({ ...s.ctrl.terms }), onoff: s.ctrl.onoff,
        gains: Object.freeze({ ...settings.gains }), leakTau: settings.leakTau,
        noise: settings.noise, quantization: settings.quantization,
        rms, inBandFor: s.inBandSince === null ? 0 : s.t - s.inBandSince,
        feedforwardPressure: neutralPressureAt(s.zref),
      });
    }

    function setMode(mode) {
      if (!['manual', 'onoff', 'pid', 'cascade'].includes(mode)) return;
      const wasManual = settings.mode === 'manual';
      settings.mode = mode;
      if (mode === 'manual') {
        s.manualSyringe = Math.round(s.syringe / HW.servoStep) * HW.servoStep;
        enterState('MANUALE');
      } else if (wasManual || s.fsm !== 'SAFE') {
        enterState('CALIBRAZIONE');
      }
    }

    function setTarget(z) {
      s.target = clamp(z, SETPOINT.min, SETPOINT.max);
      s.profileStart = s.t;
      updateSetpoint();
    }

    function setProfile(profile) {
      if (!['fisso', 'gradini', 'onda'].includes(profile)) return;
      settings.profile = profile;
      s.profileStart = s.t;
      if (s.fsm === 'HOLD' || s.fsm === 'TRACKING') {
        s.fsm = profile === 'fisso' ? 'HOLD' : 'TRACKING';
        s.fsmSince = s.t;
      }
    }

    reset();

    return Object.freeze({
      step, snapshot, setMode, setTarget, setProfile, reset,
      setManualSyringe(ml) { s.manualSyringe = clamp(ml, 0, PHYS.syringeMax); },
      setGains(g) { settings.gains = { ...settings.gains, ...g }; },
      resetGains() { settings.gains = { ...DEFAULT_GAINS }; },
      setLeak(tau) { settings.leakTau = tau > 0 ? tau : Infinity; },
      setNoise(on) { settings.noise = Boolean(on); },
      setQuantization(on) { settings.quantization = Boolean(on); },
      poke(direction) { s.v += (direction >= 0 ? 1 : -1) * 0.06; },
      squeeze() { s.squeezeStart = s.t; },
      emergency() { if (s.fsm !== 'MANUALE') enterState('SAFE', 'arresto di emergenza'); },
      resume() { if (s.fsm === 'SAFE') enterState('CALIBRAZIONE'); },
    });
  }

  return Object.freeze({
    PHYS, HW, DEFAULT_GAINS, SETPOINT, BAND,
    createSimulation, unstablePole, neutralPressureAt,
  });
});
