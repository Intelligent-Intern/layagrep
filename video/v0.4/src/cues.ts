// Single source of truth for timing. Both the music renderer (scripts/music.mjs)
// and every scene read from here, so every hit on screen lands on a hit in the mix.
// All times are in seconds. 120 BPM: beat = 0.5s, bar = 2s.

export const BPM = 120;
export const BEAT = 60 / BPM;
export const BAR = BEAT * 4;
export const FPS = 60;
export const DURATION = 40;
// Key-art hold before the cold open: feeds (X) thumbnail an early frame.
export const PRE = 0.3;
// The title-scene moment shown during that hold: name, tagline, and a finished `jg` run.
export const THUMB_T = 7.45;

export const SCENE = {
  archive: 0,
  title: 4,
  bar: 8,
  scope: 13,
  clip: 19,
  cut: 25,
  payoff: 30,
  outro: 36,
  end: 40,
};

const range = (a: number, b: number, step: number) => {
  const out: number[] = [];
  for (let t = a; t < b - 1e-9; t += step) out.push(Math.round(t * 1000) / 1000);
  return out;
};

// ---------- arrangement ----------
// One chord per bar. Bar 14 holds the dominant through the breakdown into the 30s drop.
export const CHORDS = [
  "Dm", "Bb", "F", "C",
  "Dm", "Bb", "F", "C",
  "Gm", "Bb", "F", "C",
  "Dm", "Bb", "A",
  "Dm", "Bb", "F",
  "C", "Dm",
] as const;
// Kick regions: groove through the mechanism, silence for the breakdown, full drop for the payoff.
export const KICK_REGIONS: [number, number][] = [
  [4, 28],
  [30, 37],
];
export const KICKS = KICK_REGIONS.flatMap(([a, b]) => range(a, b, BEAT));
export const CLAPS = KICKS.filter((t) => Math.abs((t % 1) - 0.5) < 1e-6);
// Snare rolls that lead into section changes.
export const ROLLS: [number, number][] = [
  [3, 4],
  [12.5, 13],
  [18.5, 19],
  [24.5, 25],
  [29, 30],
];

// ---------- 1. the archive: an agent digging on its own ----------
export const A = {
  header: 0.25,
  // Pages flick out of drawers, accelerating into the implode.
  flicks: [...range(0.75, 2.0, 0.25), ...range(2.0, 3.0, 0.125), ...range(3.0, 3.625, 0.0625)],
  implode: 3.625,
};

// ---------- 2. title: the case file ----------
export const T = {
  slam: 4.0,
  stamp: 4.5, // wordmark stamp lifts, ink dot lands
  version: 4.75, // second strike: v0.4
  tape1: [5.0, 5.75] as [number, number],
  tape1Text: "SAME INTELLIGENCE.",
  tape2: [6.0, 6.75] as [number, number],
  tape2Text: "30% LESS COST.",
  card: 7.0, // index card with a finished jg run clips on
  open: 7.625, // cover swings toward camera → inside is the next shot
  command: 'jg "where is pooling configured?"',
};

// ---------- 3. the bar: admit only relevance > 0.5 ----------
export const B = {
  rise: 8.0, // 51 folders pop up, left to right
  riseStep: 0.012,
  posts: 9.0, // limbo bar posts pop up at 0.25
  lift: [9.5, 10.0] as [number, number], // bar climbs to 0.5
  snap: 10.0,
  drops: [10.25, 11.75] as [number, number], // 41 short folders fold flat
  keep: 12.0,
  exit: 12.75,
};

// ---------- 4. two questions: relevant? in scope? ----------
export const S = {
  enter: 13.0,
  // [relevant stamp, scope stamp, scope ok]
  pages: [
    [13.5, 14.0, true],
    [14.5, 15.0, true], // the buggy current implementation still counts
    [15.5, 16.0, false], // a look-alike API: relevant topic, out of scope
  ] as [number, number, boolean][],
  string: 16.75, // follow the concrete reference from the first page
  recover: 17.25,
  recoverStamp: 17.5,
  exit: 18.5,
};

// ---------- 5. clip the method, keep its context ----------
export const K = {
  enter: 19.0,
  cut: [19.5, 20.5] as [number, number],
  drop: 20.5,
  header: 21.0,
  comment: 21.5,
  string: 22.0,
  callee: 22.5,
  tests: 23.0,
  flips: [23.5, 24.0],
  exit: 24.5,
};

// ---------- 6. source first: it survives the cut ----------
export const X = {
  enter: 25.0,
  cut1: 26.0,
  rewind: [26.5, 27.0] as [number, number],
  shuffle: [27.0, 27.75] as [number, number],
  cut2: 28.0,
  pack: [28.5, 29.5] as [number, number],
  exit: 29.75,
};

// ---------- 7. payoff: same 8 solved, lower bill ----------
export const P = {
  drop: 30.0,
  solved: range(30.5, 32.5, 0.25), // eight paired SOLVED stamps
  print: [32.5, 33.75] as [number, number],
  slam: 34.0,
  foot: 34.5,
};

// ---------- 8. outro ----------
export const O = {
  hit: 36.0,
  tape: [36.75, 37.5] as [number, number],
  install: "npm i -g @dzhng/jevgrep",
  skill: 37.75,
  ding: 38.5,
};

// ---------- sound design cue sheet ----------
export type Sfx = { t: number; type: string; v?: number; p?: number; d?: number };
const keys = (text: string, [a, b]: [number, number], v = 0.3): Sfx[] =>
  Array.from(text, (ch, i) => ({
    t: a + (i * (b - a)) / text.length,
    type: ch === " " ? "tick" : "punch",
    v: v + ((i * 7) % 5) * 0.03,
  }));

export const SFX: Sfx[] = [
  // archive
  { t: 0, type: "impact", v: 0.4 },
  { t: A.header, type: "tick", v: 0.3 },
  ...A.flicks.map((t, i) => ({ t, type: "flick", v: 0.35, p: 0.9 + (i % 5) * 0.08 })),
  ...A.flicks.map((t, i) => ({ t: t + 0.03, type: "coin", v: 0.2, p: 1 + (i % 3) * 0.12 })),
  { t: 2.0, type: "riser", d: 1.625, v: 0.75 },
  { t: A.implode - 0.35, type: "suck", d: 0.4, v: 0.8 },

  // title
  { t: T.slam, type: "impact", v: 1.0 },
  { t: T.slam, type: "slap", v: 0.8 },
  { t: T.stamp - 0.08, type: "whoosh", d: 0.25, v: 0.3 },
  { t: T.stamp, type: "ding", v: 0.45, p: 2 },
  { t: T.version, type: "stamp", v: 0.9 },
  ...keys(T.tape1Text, T.tape1),
  ...keys(T.tape2Text, T.tape2),
  { t: T.card, type: "clip", v: 0.6 },
  { t: T.open - 0.15, type: "whoosh", d: 0.5, v: 0.7 },

  // bar
  { t: B.rise, type: "impact", v: 0.7 },
  ...range(B.rise, B.rise + 51 * B.riseStep, 0.0625).map((t, i) => ({
    t,
    type: "pop",
    v: 0.28,
    p: 0.9 + i * 0.06,
  })),
  { t: B.posts, type: "clip", v: 0.5 },
  { t: B.lift[0], type: "riser", d: 0.5, v: 0.6 },
  { t: B.snap, type: "twang", v: 0.8 },
  { t: B.snap, type: "impact", v: 0.6 },
  ...range(B.drops[0], B.drops[1], 0.0625).map((t, i) => ({
    t,
    type: "fold",
    v: 0.3,
    p: 1.3 - i * 0.012,
  })),
  { t: B.keep, type: "accept", v: 0.55 },
  { t: B.exit - 0.1, type: "whoosh", d: 0.45, v: 0.6 },

  // scope
  { t: S.enter, type: "slide", d: 0.4, v: 0.4 },
  ...S.pages.flatMap(([r, s, ok]) => [
    { t: r, type: "stamp", v: 0.8 },
    { t: s, type: ok ? "stamp" : "reject", v: 0.8 },
  ]),
  { t: S.string, type: "zip", d: 0.4, v: 0.5 },
  { t: S.recover, type: "slide", d: 0.3, v: 0.4 },
  { t: S.recoverStamp, type: "stamp", v: 0.8 },
  { t: S.exit - 0.1, type: "whoosh", d: 0.45, v: 0.6 },

  // clip
  { t: K.enter, type: "slide", d: 0.4, v: 0.4 },
  ...range(K.cut[0], K.cut[1], 0.0625).map((t) => ({ t, type: "snip", v: 0.35 })),
  { t: K.drop, type: "whoosh", d: 0.35, v: 0.4 },
  { t: K.header, type: "clip", v: 0.6 },
  { t: K.comment, type: "clip", v: 0.5 },
  { t: K.string, type: "zip", d: 0.35, v: 0.5 },
  { t: K.callee, type: "clip", v: 0.6 },
  { t: K.tests, type: "slide", d: 0.3, v: 0.35 },
  ...range(K.tests, K.tests + 0.375, 0.0625).map((t) => ({ t, type: "tick", v: 0.3 })),
  ...K.flips.map((t, i) => ({ t, type: "flip", v: 0.6, p: 1 + i * 0.2 })),
  { t: K.exit - 0.1, type: "whoosh", d: 0.45, v: 0.6 },

  // cut
  { t: X.enter, type: "slide", d: 0.35, v: 0.4 },
  { t: X.cut1, type: "chop", v: 1.0 },
  { t: X.cut1 + 0.1, type: "fall", d: 0.5, v: 0.5 },
  { t: X.rewind[0], type: "rewind", d: 0.5, v: 0.6 },
  ...range(X.shuffle[0], X.shuffle[1], 0.125).map((t, i) => ({
    t,
    type: "flick",
    v: 0.35,
    p: 1 + i * 0.1,
  })),
  { t: X.cut2, type: "chop", v: 1.0 },
  { t: X.cut2 + 0.1, type: "fall", d: 0.5, v: 0.5 },
  { t: X.cut2 + 0.25, type: "accept", v: 0.5 },
  { t: 28.0, type: "riser", d: 2.0, v: 0.95 },
  { t: X.pack[0], type: "slide", d: 0.5, v: 0.3 },

  // payoff
  { t: P.drop, type: "impact", v: 1.1 },
  { t: P.drop, type: "slap", v: 0.7 },
  ...P.solved.map((t, i) => ({ t, type: "stamp2", v: 0.75, p: 1 + i * 0.04 })),
  ...range(P.print[0], P.print[1], 0.0625).map((t, i) => ({
    t,
    type: "print",
    v: 0.28,
    p: 1 + (i % 2) * 0.1,
  })),
  { t: P.print[1] - 0.05, type: "tear", v: 0.6 },
  { t: 33.0, type: "riser", d: 1.0, v: 0.7 },
  { t: P.slam, type: "impact", v: 1.15 },
  { t: P.slam + 0.1, type: "crack", v: 0.6 },
  { t: P.foot, type: "tick", v: 0.3 },

  // outro
  { t: O.hit - 0.3, type: "whoosh", d: 0.5, v: 0.5 },
  { t: O.hit, type: "impact", v: 0.85 },
  ...keys(O.install, O.tape, 0.26),
  { t: O.skill, type: "clip", v: 0.45 },
  { t: O.ding, type: "ding", v: 0.6, p: 1 },
];
