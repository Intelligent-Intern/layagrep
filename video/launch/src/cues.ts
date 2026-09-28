// Single source of truth for timing. Both the music renderer (scripts/music.mjs)
// and every scene read from here, so every hit on screen lands on a hit in the mix.
// All times are in seconds. 120 BPM: beat = 0.5s, bar = 2s.

export const BPM = 120;
export const BEAT = 60 / BPM;
export const BAR = BEAT * 4;
export const FPS = 60;
export const DURATION = 30;
// Key-art hold before the cold open: feeds (X) thumbnail an early frame, so it must be the poster.
export const PRE = 0.5;
// The reveal-scene moment shown during that hold: logo, tagline, and a completed `jg` run.
export const THUMB_T = 7.8;

export const SCENE = { problem: 0, reveal: 4, engine: 8, jev: 14, bench: 20, outro: 26, end: 30 };

const range = (a: number, b: number, step: number) => {
  const out: number[] = [];
  for (let t = a; t < b - 1e-9; t += step) out.push(Math.round(t * 1000) / 1000);
  return out;
};

// ---------- arrangement ----------
// One chord per bar. Bar 10 holds the dominant through the breakdown into the 22s slam.
export const CHORDS = [
  "Am",
  "F",
  "Am",
  "F",
  "C",
  "G",
  "Am",
  "F",
  "C",
  "G",
  "G",
  "Am",
  "F",
  "C",
  "Am",
] as const;
export const KICKS = [...range(4, 19.75, BEAT), ...range(22, 27, BEAT)];
export const CLAPS = KICKS.filter((t) => Math.abs((t % 1) - 0.5) < 1e-6);

// ---------- scene 1: the problem ----------
export const P = {
  visits: [...range(1.0, 3.0, 0.25), ...range(3.0, 3.75, 0.125)],
  words: [
    [0.5, "Coding"],
    [0.75, "agents"],
    [1.0, "burn"],
    [1.25, "tokens"],
    [2.0, "just"],
    [2.25, "finding"],
    [2.5, "the"],
    [2.75, "right"],
    [3.0, "code."],
  ] as [number, string][],
  implode: 3.75,
};

// ---------- scene 2: reveal ----------
export const R = {
  letters: 4.0,
  letterStep: 0.05,
  dotLand: 4.5,
  subtitle: 5.0,
  subStep: 0.125,
  shift: 6.0,
  typeStart: 6.2,
  typeEnd: 6.95,
  command: 'jg "where is connection pooling configured?"',
  enter: 7.0,
  outStep: 0.1,
  zoom: 7.5,
};

// ---------- scene 3: engine ----------
export const E = {
  root: 8.0,
  dirs: 8.25,
  dirStamps: [8.75, 9.0, 9.25, 9.5],
  prune: 9.75,
  files: 9.875,
  fragLabel: 10.0,
  fileStamps: [10.5, 10.75, 11.0, 11.25],
  declLabel: 11.5,
  blocks: [11.5, 11.625, 11.75, 11.875, 12.0],
  pick: [12.5, 12.75],
  outLabel: 13.0,
  lines: [13.0, 13.125, 13.25, 13.375, 13.5],
  shoot: 13.75,
};

// ---------- scene 4: jev ----------
export const J = {
  slam: 14.0,
  badge: 14.5,
  stream: 15.0,
  streamEnd: 17.5,
  headline: [15.0, 15.25, 15.5, 15.75],
  handoff: 18.0,
  ask: 18.25,
  askArrive: 18.75,
  answer: 19.25,
  answerArrive: 19.75,
};

// ---------- scene 5: benchmark ----------
export const B = {
  wipe: 20.0,
  label: 20.25,
  baseGrow: [20.5, 21.5] as [number, number],
  jgGrow: [21.0, 21.9] as [number, number],
  slam: 22.0,
  words: [23.0, 23.125, 23.25, 23.375, 23.5],
  foot: 24.0,
};

// ---------- scene 6: outro ----------
export const O = {
  hit: 26.0,
  tagline: 26.5,
  pill: 27.0,
  pillEnd: 27.6,
  install: "npm i -g @dzhng/jevgrep",
  url: 28.0,
  ding: 29.0,
};

// ---------- sound design cue sheet ----------
export type Sfx = { t: number; type: string; v?: number; p?: number; d?: number };
export const SFX: Sfx[] = [
  { t: 0, type: "impact", v: 0.55 },
  ...range(0, 0.5, 0.0625).map((t, i) => ({ t, type: "pop", v: 0.25, p: 1 + i * 0.08 })),
  ...P.words.map(([t]) => ({ t, type: "tick", v: 0.35 })),
  ...P.visits.map((t, i) => ({ t: t + 0.02, type: "blip", v: 0.28, p: 0.9 + (i % 4) * 0.12 })),
  { t: 2.0, type: "riser", d: 2.0, v: 0.75 },
  { t: P.implode - 0.25, type: "suck", d: 0.5, v: 0.8 },

  { t: R.letters, type: "impact", v: 1.0 },
  { t: R.dotLand, type: "ding", v: 0.5, p: 2 },
  ...range(R.subtitle, R.subtitle + 7 * R.subStep, R.subStep).map((t) => ({
    t,
    type: "tick",
    v: 0.3,
  })),
  { t: R.shift - 0.1, type: "whoosh", d: 0.45, v: 0.55 },
  ...Array.from({ length: R.command.length }, (_, i) => ({
    t: R.typeStart + (i * (R.typeEnd - R.typeStart)) / R.command.length,
    type: "key",
    v: 0.3 + ((i * 7) % 5) * 0.04,
  })),
  { t: R.enter, type: "stamp", v: 0.7 },
  ...range(R.enter + 0.1, R.enter + 0.6, R.outStep).map((t, i) => ({
    t,
    type: "blip",
    v: 0.22,
    p: 1.4 + i * 0.1,
  })),
  { t: R.zoom, type: "riser", d: 0.5, v: 0.6 },

  { t: E.root, type: "impact", v: 0.8 },
  ...range(E.dirs, E.dirs + 0.25, 0.0625).map((t, i) => ({
    t,
    type: "pop",
    v: 0.35,
    p: 1 + i * 0.12,
  })),
  ...E.dirStamps.map((t, i) => ({ t, type: i % 2 ? "reject" : "accept", v: 0.55 })),
  { t: E.prune - 0.05, type: "whoosh", d: 0.3, v: 0.35 },
  ...range(E.files, E.files + 0.3, 0.0625).map((t, i) => ({
    t,
    type: "pop",
    v: 0.3,
    p: 1.3 + i * 0.1,
  })),
  ...E.fileStamps.map((t, i) => ({ t, type: i === 2 ? "reject" : "accept", v: 0.5 })),
  { t: E.declLabel - 0.1, type: "whoosh", d: 0.3, v: 0.4 },
  ...E.blocks.map((t, i) => ({ t: t + 0.08, type: "tok", v: 0.5, p: 1 + i * 0.07 })),
  ...E.pick.map((t, i) => ({ t, type: "accept", v: 0.55, p: 1 + i * 0.25 })),
  ...E.lines.map((t, i) => ({ t, type: "blip", v: 0.25, p: 1.2 + i * 0.12 })),
  { t: E.shoot, type: "riser", d: 0.25, v: 0.45 },
  { t: E.shoot + 0.05, type: "whoosh", d: 0.3, v: 0.6 },

  { t: J.slam, type: "impact", v: 1.0 },
  { t: J.badge, type: "ding", v: 0.35, p: 1.5 },
  ...range(J.stream, J.streamEnd, 0.0625).map((t, i) => ({
    t,
    type: "chatter",
    v: 0.12 + (i % 4 === 0 ? 0.06 : 0),
    p: [1, 1.5, 1.25, 2, 1.33, 1.75][i % 6],
  })),
  ...J.headline.map((t) => ({ t, type: "tick", v: 0.3 })),
  { t: J.handoff - 0.15, type: "whoosh", d: 0.4, v: 0.5 },
  { t: J.ask, type: "whoosh", d: 0.5, v: 0.3 },
  { t: J.askArrive, type: "accept", v: 0.45 },
  ...range(J.askArrive + 0.0625, J.answer, 0.0625).map((t, i) => ({
    t,
    type: "chatter",
    v: 0.14,
    p: 1 + (i % 3) * 0.5,
  })),
  { t: J.answer, type: "whoosh", d: 0.5, v: 0.3 },
  { t: J.answerArrive, type: "ding", v: 0.45, p: 1.5 },

  { t: B.wipe, type: "impact", v: 0.45 },
  { t: B.wipe - 0.2, type: "whoosh", d: 0.5, v: 0.6 },
  ...range(B.baseGrow[0], B.baseGrow[1], 0.0625).map((t, i) => ({
    t,
    type: "count",
    v: 0.15,
    p: 1 + i * 0.04,
  })),
  ...range(B.jgGrow[0], B.jgGrow[1], 0.0625).map((t, i) => ({
    t,
    type: "count",
    v: 0.15,
    p: 1.2 + i * 0.04,
  })),
  { t: 21.0, type: "riser", d: 1.0, v: 0.9 },
  { t: B.slam, type: "impact", v: 1.1 },
  { t: B.slam + 0.12, type: "crack", v: 0.7 },
  ...B.words.map((t) => ({ t, type: "tick", v: 0.3 })),

  { t: O.hit, type: "impact", v: 0.9 },
  { t: O.hit - 0.3, type: "whoosh", d: 0.5, v: 0.5 },
  ...Array.from({ length: O.install.length }, (_, i) => ({
    t: O.pill + (i * (O.pillEnd - O.pill)) / O.install.length,
    type: "key",
    v: 0.28,
  })),
  { t: O.url, type: "tick", v: 0.3 },
  { t: O.ding, type: "ding", v: 0.6, p: 1 },
];
