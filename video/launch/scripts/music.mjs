// Renders the soundtrack (music + sound design) to public/music.wav from src/cues.ts.
import { writeFileSync } from "node:fs";
import { BEAT, BAR, DURATION, PRE, CHORDS, KICKS, CLAPS, SFX, SCENE } from "../src/cues.ts";

const SR = 48000;
const N = Math.round(SR * DURATION);
const TAU = Math.PI * 2;

// ---------- rng ----------
let seed = 1337;
const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
const noise = () => rnd() * 2 - 1;

// ---------- buses ----------
const bus = () => ({ L: new Float32Array(N), R: new Float32Array(N) });
const drums = bus(),
  music = bus(),
  fx = bus();
const revSend = bus(),
  dlySend = bus();

const midi = (m) => 440 * Math.pow(2, (m - 69) / 12);
const clampI = (i) => i >= 0 && i < N;

function put(b, i, x, pan = 0, rev = 0, dly = 0) {
  if (!clampI(i)) return;
  const l = Math.cos(((pan + 1) * Math.PI) / 4),
    r = Math.sin(((pan + 1) * Math.PI) / 4);
  b.L[i] += x * l;
  b.R[i] += x * r;
  if (rev) {
    revSend.L[i] += x * l * rev;
    revSend.R[i] += x * r * rev;
  }
  if (dly) {
    dlySend.L[i] += x * l * dly;
    dlySend.R[i] += x * r * dly;
  }
}

// ---------- DSP primitives ----------
// Cytomic TPT state-variable filter, stable under per-sample cutoff modulation.
function svf() {
  let ic1 = 0,
    ic2 = 0;
  return (x, fc, q = 0.7) => {
    fc = Math.min(Math.max(fc, 20), SR * 0.45);
    const g = Math.tan((Math.PI * fc) / SR),
      k = 1 / q;
    const a1 = 1 / (1 + g * (g + k)),
      a2 = g * a1,
      a3 = g * a2;
    const v3 = x - ic2,
      v1 = a1 * ic1 + a2 * v3,
      v2 = ic2 + a2 * ic1 + a3 * v3;
    ic1 = 2 * v1 - ic1;
    ic2 = 2 * v2 - ic2;
    return { lp: v2, bp: v1, hp: x - k * v1 - v2 };
  };
}
const blep = (t, dt) => {
  if (t < dt) {
    t /= dt;
    return t + t - t * t - 1;
  }
  if (t > 1 - dt) {
    t = (t - 1) / dt;
    return t * t + t + t + 1;
  }
  return 0;
};
function saw() {
  let ph = rnd();
  return (f) => {
    const dt = f / SR;
    ph += dt;
    if (ph >= 1) ph -= 1;
    return 2 * ph - 1 - blep(ph, dt);
  };
}

// ---------- automation ----------
const smooth = (x) => x * x * (3 - 2 * x);
const lerp = (a, b, t) => a + (b - a) * Math.min(1, Math.max(0, t));
// Sidechain: everything melodic breathes with the kick.
const duck = new Float32Array(N).fill(1);
for (const k of KICKS) {
  const s = Math.round(k * SR),
    len = Math.round(0.24 * SR);
  for (let i = 0; i < len && clampI(s + i); i++) {
    const g = 1 - 0.78 * Math.pow(1 - i / len, 2);
    duck[s + i] = Math.min(duck[s + i], g);
  }
}
// Filter energy per section (0 = muffled, 1 = open).
function energy(t) {
  if (t < 4) return lerp(0.12, 0.7, t / 4);
  if (t < 20) return 1;
  if (t < 22) return lerp(0.25, 0.9, (t - 20) / 2);
  if (t < 26) return 1;
  return lerp(0.9, 0.35, (t - 26) / 4);
}
const inKickRegion = (t) => (t >= 4 && t < 19.75) || (t >= 22 && t < 27);

// ---------- chords ----------
const VOICING = {
  Am: { pad: [57, 60, 64, 69, 72], bass: 33 },
  F: { pad: [53, 57, 60, 65, 69], bass: 29 },
  C: { pad: [55, 60, 64, 67, 72], bass: 36 },
  G: { pad: [55, 59, 62, 67, 71], bass: 31 },
};
const chordAt = (t) => VOICING[CHORDS[Math.min(CHORDS.length - 1, Math.floor(t / BAR))]];

// ---------- instruments ----------
function kick(t0, v = 1) {
  const s = Math.round(t0 * SR),
    len = Math.round(0.55 * SR);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const f = 44 + 150 * Math.exp(-t / 0.028) + 40 * Math.exp(-t / 0.12);
    ph += (TAU * f) / SR;
    const amp = t < 0.01 ? 1 : Math.exp(-(t - 0.01) / 0.26);
    let x = Math.sin(ph) * amp + noise() * Math.exp(-t / 0.002) * 0.35;
    x = Math.tanh(x * 1.8) * 0.9;
    put(drums, s + i, x * v);
  }
}
function clap(t0, v = 1, pan = 0) {
  const s = Math.round(t0 * SR),
    len = Math.round(0.35 * SR),
    f = svf();
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    let env = Math.exp(-t / 0.1) * 0.7;
    for (const o of [0, 0.009, 0.018]) if (t >= o) env += Math.exp(-(t - o) / 0.005);
    const x = f(noise(), 1400, 1.1).bp * env;
    put(drums, s + i, x * v * 1.3, pan, 0.35);
  }
}
function hat(t0, v = 1, open = false) {
  const s = Math.round(t0 * SR),
    len = Math.round((open ? 0.4 : 0.07) * SR),
    f = svf();
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const x = f(noise(), 8500, 0.8).hp * Math.exp(-t / (open ? 0.12 : 0.022));
    put(drums, s + i, x * v, 0.25, 0.08);
  }
}
function pad(t0, dur, notes, level) {
  const s = Math.round(t0 * SR),
    len = Math.round((dur + 0.7) * SR);
  const voices = [];
  notes.forEach((m, ni) => {
    for (const c of [-14, -6, 0, 7, 15])
      voices.push({
        o: saw(),
        f: midi(m) * Math.pow(2, c / 1200),
        pan: ((ni * 5 + c) % 9) / 9 - 0.45,
      });
  });
  const fl = svf(),
    fr = svf();
  for (let i = 0; i < len; i++) {
    const idx = s + i;
    if (!clampI(idx)) continue;
    const t = i / SR,
      gt = t0 + t;
    const env = Math.min(1, t / 0.25) * (t > dur ? Math.exp(-(t - dur) / 0.25) : 1);
    let l = 0,
      r = 0;
    for (const vc of voices) {
      const x = vc.o(vc.f);
      l += x * (0.5 - vc.pan);
      r += x * (0.5 + vc.pan);
    }
    const cut = 400 + 3200 * energy(gt) + 500 * Math.sin(gt * 1.3);
    const d = (duck[idx] * env * level) / voices.length;
    music.L[idx] += fl(l, cut, 0.8).lp * d;
    music.R[idx] += fr(r, cut, 0.8).lp * d;
    revSend.L[idx] += l * d * 0.12 * 0.3;
    revSend.R[idx] += r * d * 0.12 * 0.3;
  }
}
function bass(t0, dur, m, level, accent = 1) {
  const s = Math.round(t0 * SR),
    len = Math.round((dur + 0.02) * SR);
  const o1 = saw(),
    o2 = saw(),
    f = svf();
  let sub = 0;
  const hz = midi(m + 12);
  for (let i = 0; i < len; i++) {
    const idx = s + i;
    if (!clampI(idx)) continue;
    const t = i / SR;
    sub += (TAU * hz * 0.5) / SR;
    const raw = o1(hz) * 0.6 + o2(hz * 1.006) * 0.6;
    const cut = 140 + (900 * accent + 600 * energy(t0)) * Math.exp(-t / 0.07);
    const env =
      Math.min(1, t / 0.004) * (t > dur - 0.02 ? Math.max(0, (dur + 0.02 - t) / 0.04) : 1);
    const x = (f(raw, cut, 1.4).lp + Math.sin(sub) * 0.7) * env * level * duck[idx];
    put(music, idx, Math.tanh(x * 1.5) * 0.8, 0);
  }
}
function pluck(t0, m, level, pan = 0) {
  const s = Math.round(t0 * SR),
    len = Math.round(0.45 * SR);
  const a = saw(),
    f = svf(),
    hz = midi(m),
    e = energy(t0);
  for (let i = 0; i < len; i++) {
    const idx = s + i;
    if (!clampI(idx)) continue;
    const t = i / SR;
    const raw = a(hz);
    const cut = 300 + (1200 + 5200 * e) * Math.exp(-t / 0.05);
    const x =
      f(raw * 0.9 + noise() * 0.02, cut, 2.2).lp *
      Math.exp(-t / 0.16) *
      level *
      (0.55 + 0.45 * duck[idx]);
    put(music, idx, x, pan, 0.25, 0.45);
  }
}

// ---------- sound design ----------
function impact(t0, v) {
  const s = Math.round(t0 * SR),
    len = Math.round(2.4 * SR),
    f = svf(),
    g = svf();
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    ph += (TAU * (32 + 70 * Math.exp(-t / 0.08))) / SR;
    const boom = Math.sin(ph) * Math.exp(-t / 0.75) * 0.9;
    const body = f(noise(), 180 + 2600 * Math.exp(-t / 0.08), 0.7).lp * Math.exp(-t / 0.35) * 0.8;
    const air = g(noise(), 6000, 0.7).hp * Math.exp(-t / 0.9) * 0.18;
    const x = Math.tanh((boom + body) * 1.4) + air;
    put(fx, s + i, x * v * 0.9, 0, 0.35);
  }
}
function riser(t0, d, v) {
  const s = Math.round(t0 * SR),
    len = Math.round(d * SR),
    f = svf(),
    f2 = svf();
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const x01 = i / len;
    const center = 250 * Math.pow(40, x01);
    ph += (TAU * (180 * Math.pow(6, x01))) / SR;
    const n = f(noise(), center, 3).bp * 1.6 + f2(noise(), center * 1.5, 1.2).bp * 0.6;
    const x = (n + Math.sin(ph) * 0.12) * Math.pow(x01, 2.2) * v;
    put(fx, s + i, x, Math.sin(x01 * 9) * 0.5, 0.4);
  }
}
function suck(t0, d, v) {
  const s = Math.round(t0 * SR),
    len = Math.round(d * SR),
    f = svf();
  for (let i = 0; i < len; i++) {
    const x01 = i / len;
    const x = f(noise(), 300 + 7000 * x01 * x01, 2).bp * Math.pow(x01, 3) * v * 1.4;
    put(fx, s + i, x, (1 - x01) * 0.6 * Math.sin(x01 * 20), 0.2);
  }
}
function whoosh(t0, d, v) {
  const s = Math.round(t0 * SR),
    len = Math.round(d * SR),
    f = svf();
  for (let i = 0; i < len; i++) {
    const x01 = i / len;
    const center = 400 + 3500 * Math.sin(Math.PI * x01);
    const env = Math.pow(Math.sin(Math.PI * Math.pow(x01, 0.7)), 2);
    put(fx, s + i, f(noise(), center, 1.6).bp * env * v * 1.6, lerp(-0.8, 0.8, x01), 0.25);
  }
}
function tone(t0, hz, dec, v, pan = 0, harm = 0.3, rev = 0.2, bend = 0) {
  const s = Math.round(t0 * SR),
    len = Math.round(dec * 6 * SR);
  let ph = 0;
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    ph += (TAU * hz * (1 + bend * Math.exp(-t / 0.015))) / SR;
    const x =
      (Math.sin(ph) + Math.sin(ph * 2) * harm) * Math.exp(-t / dec) * Math.min(1, t / 0.001);
    put(fx, s + i, x * v, pan, rev, rev * 0.5);
  }
}
function click(t0, hz, dec, v, pan = 0) {
  const s = Math.round(t0 * SR),
    len = Math.round(dec * 6 * SR),
    f = svf();
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    put(fx, s + i, f(noise(), hz, 2.5).bp * Math.exp(-t / dec) * v * 2, pan, 0.05);
  }
}
function ding(t0, p, v) {
  const s = Math.round(t0 * SR),
    len = Math.round(2.5 * SR),
    base = 880 * p;
  const partials = [
    [1, 1, 0.9],
    [2.76, 0.45, 0.45],
    [5.4, 0.25, 0.22],
    [8.93, 0.12, 0.12],
  ];
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    let x = 0;
    for (const [r, a, dcy] of partials) x += Math.sin(TAU * base * r * t) * a * Math.exp(-t / dcy);
    put(fx, s + i, x * v * 0.5 * Math.min(1, t / 0.002), 0, 0.45, 0.3);
  }
}
function crack(t0, v) {
  const s = Math.round(t0 * SR),
    len = Math.round(0.6 * SR),
    f = svf();
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const grains = rnd() < 0.02 * Math.exp(-t / 0.15) ? 1 : 0;
    put(
      fx,
      s + i,
      (f(noise(), 2500, 1).bp * Math.exp(-t / 0.05) + grains * noise()) * v,
      noise() * 0.5,
      0.3,
    );
  }
}

// ---------- sequence the music ----------
const chordStarts = CHORDS.map((_, i) => i * BAR);
chordStarts.forEach((t, i) => {
  const c = VOICING[CHORDS[i]];
  const lvl = t < 4 ? 0.55 : t >= 20 && t < 22 ? 0.75 : t >= 26 ? 0.7 : 0.5;
  const dur = i === CHORDS.length - 1 ? DURATION - t : BAR;
  pad(t, dur, c.pad, lvl * 0.9);
});
for (const t of KICKS) kick(t, 0.95);
for (const t of CLAPS) clap(t, 0.5);
// Hats: offbeat 8ths in groove, 16th ghosts in high-energy sections, open hats on the "and" of 4.
for (let t = 2; t < DURATION - 3; t += BEAT / 4) {
  const q = Math.round((t % BEAT) / (BEAT / 4));
  if (!inKickRegion(t) && !(t >= 2 && t < 4)) continue;
  if (t >= 2 && t < 4) {
    if (q === 2) hat(t, 0.25 * ((t - 2) / 2));
    continue;
  }
  const hi = (t >= 14 && t < 19.75) || t >= 22;
  if (q === 2) hat(t, 0.38, Math.abs((t % BAR) - 3.5 * BEAT) < 1e-3);
  else if (hi && q !== 0) hat(t, 0.13);
}
// Snare roll builds into drops.
for (const [a, b] of [
  [3, 4],
  [21, 22],
]) {
  for (let t = a; t < b; t += b - t > 0.5 ? BEAT / 2 : BEAT / 4)
    clap(t, 0.12 + 0.35 * ((t - a) / (b - a)), 0);
}
// Bass: pumping 8ths under the groove, long notes in intro/breakdown/outro.
for (let t = 0; t < DURATION; t += BEAT / 2) {
  const c = chordAt(t);
  if (inKickRegion(t)) {
    const on = Math.abs((t % BEAT) - BEAT / 2) < 1e-3;
    const oct = t >= 22 && Math.abs((t % BAR) - 3.5 * BEAT) < 1e-3 ? 12 : 0;
    bass(t, BEAT / 2 - 0.02, c.bass + oct, on ? 0.55 : 0.32, on ? 1 : 0.4);
  } else if (Math.abs(t % BAR) < 1e-3 && t >= 20 && t < 22) {
    bass(t, BAR - 0.05, c.bass, 0.45, 0.2);
  } else if (Math.abs(t % BAR) < 1e-3 && t >= 27) {
    bass(t, Math.min(BAR, DURATION - t) - 0.05, c.bass, 0.4, 0.2);
  }
}
// Arp: 16ths across the chord, climbing an octave in high-energy sections.
const ARP = [0, 2, 1, 3, 2, 4, 3, 1];
for (let t = 0, i = 0; t < DURATION - 1.5; t += BEAT / 2, i++) {
  if (t >= 19.75 && t < 20.5) continue;
  const c = chordAt(t).pad;
  const up = (t >= 14 && t < 20) || (t >= 22 && t < 26) ? 12 : 0;
  const lvl = t < 4 ? 0.1 + 0.12 * (t / 4) : t >= 20 && t < 22 ? 0.12 : 0.2;
  pluck(t, c[ARP[i % ARP.length]] + up, lvl, i % 2 ? 0.35 : -0.35);
}

// ---------- sound design cue sheet ----------
for (const c of SFX) {
  const v = c.v ?? 0.5,
    p = c.p ?? 1;
  switch (c.type) {
    case "impact":
      impact(c.t, v);
      if (c.t > 0) hat(c.t, v * 0.6, true);
      break;
    case "riser":
      riser(c.t, c.d, v);
      break;
    case "suck":
      suck(c.t, c.d, v);
      break;
    case "whoosh":
      whoosh(c.t, c.d, v);
      break;
    case "pop":
      tone(c.t, 520 * p, 0.03, v, noise() * 0.4, 0.2, 0.15, 0.6);
      break;
    case "tick":
      click(c.t, 3200, 0.006, v * 0.9);
      tone(c.t, 1800, 0.012, v * 0.3);
      break;
    case "blip":
      tone(c.t, 990 * p, 0.035, v, noise() * 0.5, 0.35, 0.2);
      break;
    case "key":
      click(c.t, 2400 + rnd() * 1800, 0.004, v, noise() * 0.3);
      break;
    case "stamp":
      tone(c.t, 150, 0.06, v, 0, 0.6, 0.1, 1.5);
      click(c.t, 1800, 0.01, v * 0.6);
      break;
    case "accept":
      tone(c.t, 1318.5 * p, 0.05, v * 0.6, 0.2, 0.25, 0.25);
      tone(c.t + 0.06, 1760 * p, 0.08, v * 0.5, 0.2, 0.25, 0.3);
      break;
    case "reject":
      tone(c.t, 196, 0.05, v * 0.9, -0.2, 0.7, 0.05, 0.8);
      click(c.t, 900, 0.01, v * 0.4);
      break;
    case "tok":
      tone(c.t, 700 * p, 0.03, v * 0.7, 0, 0.5, 0.12, 0.3);
      click(c.t, 1600, 0.008, v * 0.5);
      break;
    case "chatter":
      tone(c.t, 2200 * p, 0.012, v, noise() * 0.8, 0.1, 0.15);
      break;
    case "count":
      tone(c.t, 1400 * p, 0.01, v, 0, 0.1, 0.1);
      break;
    case "ding":
      ding(c.t, p, v);
      break;
    case "crack":
      crack(c.t, v);
      break;
    default:
      throw new Error("unknown sfx " + c.type);
  }
}

// ---------- effects: ping-pong delay + freeverb ----------
{
  const d = Math.round(BEAT * 0.75 * SR);
  const L = dlySend.L,
    R = dlySend.R;
  const lp = svf(),
    rp = svf();
  for (let i = d; i < N; i++) {
    L[i] += lp(R[i - d], 3500).lp * 0.42;
    R[i] += rp(L[i - d], 3500).lp * 0.42;
  }
  for (let i = 0; i < N; i++) {
    music.L[i] += L[i] * 0.35;
    music.R[i] += R[i] * 0.35;
    revSend.L[i] += L[i] * 0.1;
    revSend.R[i] += R[i] * 0.1;
  }
}
function freeverb(input, spread) {
  const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((n) =>
    Math.round(((n + spread) * SR) / 44100),
  );
  const aps = [556, 441, 341, 225].map((n) => Math.round(((n + spread) * SR) / 44100));
  const out = new Float32Array(N);
  const cb = combs.map((n) => ({ buf: new Float32Array(n), i: 0, st: 0 }));
  const ab = aps.map((n) => ({ buf: new Float32Array(n), i: 0 }));
  const fb = 0.86,
    damp = 0.3;
  for (let s = 0; s < N; s++) {
    const x = input[s] * 0.015;
    let y = 0;
    for (const c of cb) {
      const o = c.buf[c.i];
      c.st = o * (1 - damp) + c.st * damp;
      c.buf[c.i] = x + c.st * fb;
      if (++c.i >= c.buf.length) c.i = 0;
      y += o;
    }
    for (const a of ab) {
      const o = a.buf[a.i];
      a.buf[a.i] = y + o * 0.5;
      y = o - y;
      if (++a.i >= a.buf.length) a.i = 0;
    }
    out[s] = y;
  }
  return out;
}
const revL = freeverb(revSend.L, 0),
  revR = freeverb(revSend.R, 23);

// ---------- master ----------
const outL = new Float32Array(N),
  outR = new Float32Array(N);
const hpL = svf(),
  hpR = svf();
for (let i = 0; i < N; i++) {
  const t = i / SR;
  let l = drums.L[i] * 0.9 + music.L[i] * 0.85 + fx.L[i] * 0.8 + revL[i] * 1.1;
  let r = drums.R[i] * 0.9 + music.R[i] * 0.85 + fx.R[i] * 0.8 + revR[i] * 1.1;
  l = hpL(l, 28).hp;
  r = hpR(r, 28).hp;
  const fade = t > DURATION - 0.6 ? smooth((DURATION - t) / 0.6) : 1;
  const fadeIn = Math.min(1, t / 0.005);
  outL[i] = l * fade * fadeIn;
  outR[i] = r * fade * fadeIn;
}
// Bus glue: normalize to the 99.5th percentile, soft-knee limit above 0.7, then peak-normalize.
{
  const mags = new Float32Array(N);
  for (let i = 0; i < N; i++) mags[i] = Math.max(Math.abs(outL[i]), Math.abs(outR[i]));
  const sorted = Float32Array.from(mags).sort();
  const g = 0.8 / sorted[Math.floor(N * 0.995)];
  const knee = 0.7;
  const lim = (x) => {
    const a = Math.abs(x);
    return a <= knee ? x : Math.sign(x) * (knee + (1 - knee) * Math.tanh((a - knee) / (1 - knee)));
  };
  let mx = 0;
  for (let i = 0; i < N; i++) {
    outL[i] = lim(outL[i] * g);
    outR[i] = lim(outR[i] * g);
    mx = Math.max(mx, Math.abs(outL[i]), Math.abs(outR[i]));
  }
  for (let i = 0; i < N; i++) {
    outL[i] *= 0.89 / mx;
    outR[i] *= 0.89 / mx;
  }
}

// ---------- write wav ----------
function writeWav(name, L, R, gain = 1) {
  const n = L.length,
    data = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * gain)) * 32767), i * 4);
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * gain)) * 32767), i * 4 + 2);
  }
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write("WAVE", 8);
  h.write("fmt ", 12);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 4, 28);
  h.writeUInt16LE(4, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(data.length, 40);
  writeFileSync(new URL(`../public/${name}`, import.meta.url), Buffer.concat([h, data]));
}
writeWav("music.wav", outL, outR);

// ---------- pre-roll: poster hold → rising whoosh that lands on the cold-open impact ----------
{
  const n = Math.round(PRE * SR),
    L = new Float32Array(n),
    R = new Float32Array(n);
  const f1 = svf(),
    f2 = svf();
  const start = Math.round(0.24 * SR);
  for (let i = start; i < n; i++) {
    const x01 = (i - start) / (n - start);
    const center = 400 * Math.pow(18, x01);
    const env = Math.pow(x01, 2.4);
    const a = f1(noise(), center, 2.2).bp * env * 1.1,
      b = f2(noise(), center * 1.3, 2.2).bp * env * 1.1;
    L[i] = a;
    R[i] = b;
  }
  writeWav("pre.wav", L, R, 0.9);
}
console.log(
  "wrote public/music.wav + pre.wav",
  DURATION + "s",
  "scenes",
  Object.values(SCENE).join(","),
);
