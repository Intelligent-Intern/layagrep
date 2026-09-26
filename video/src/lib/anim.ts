import { Easing, interpolate, spring } from "remotion";
import { noise2D } from "@remotion/noise";
import { FPS, KICKS } from "../cues";

export const C = {
  ivory: "#F4EFE4",
  paper: "#EBE4D5",
  ink: "#121212",
  night: "#0D0D0E",
  soot: "#1C1C1E",
  red: "#EF5638",
  redDeep: "#C73A20",
  blue: "#9DBCE0",
  blueDeep: "#5E86B8",
  grey: "#8F897E",
  line: "#D9D1C0",
  green: "#2FA36B",
};

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const fr = (s: number) => Math.round(s * FPS);

export const EASE = {
  out: Easing.bezier(0.16, 1, 0.3, 1), // expo-ish out: fast start, long settle
  inOut: Easing.bezier(0.83, 0, 0.17, 1),
  in: Easing.bezier(0.7, 0, 0.84, 0),
  snap: Easing.bezier(0.5, 0, 0, 1.25),
};

/** 0→1 between two times (seconds) with an easing curve. */
export const ramp = (t: number, a: number, b: number, ease: (x: number) => number = EASE.out) =>
  ease(clamp01((t - a) / (b - a)));

/** Spring that starts at time `at` (seconds). */
export const sp = (
  t: number,
  at: number,
  config: Partial<{ damping: number; stiffness: number; mass: number }> = {},
) =>
  spring({
    frame: (t - at) * FPS,
    fps: FPS,
    config: { damping: 13, stiffness: 190, mass: 0.7, ...config },
  });

export const map = (v: number, i: number[], o: number[]) =>
  interpolate(v, i, o, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Sum of decaying envelopes from each event time — the visual equivalent of a transient. */
export const pulse = (t: number, times: number[], decay = 0.12) => {
  let v = 0;
  for (const ti of times) if (t >= ti && t - ti < decay * 8) v += Math.exp(-(t - ti) / decay);
  return Math.min(1, v);
};
export const kick = (t: number, decay = 0.1) => pulse(t, KICKS, decay);

/** Damped wobble after an event: 1 at hit, oscillates to 0. Good for squash & stretch. */
export const wobble = (t: number, at: number, freq = 18, decay = 0.12) =>
  t < at ? 0 : Math.exp(-(t - at) / decay) * Math.cos((t - at) * freq);

/** Camera shake from impacts. */
export const shake = (t: number, hits: [number, number][], seed = "s") => {
  let a = 0;
  for (const [at, amp] of hits) if (t >= at) a += amp * Math.exp(-(t - at) / 0.12);
  return {
    x: noise2D(seed + "x", t * 28, 0) * a,
    y: noise2D(seed + "y", t * 28, 0) * a,
    r: noise2D(seed + "r", t * 20, 0) * a * 0.05,
  };
};

/** Deterministic hash-random in [0,1). */
export const rand = (i: number, salt = 0) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const easeOutBack = (x: number, s = 1.7) =>
  1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
