// Shared motion vocabulary for props: stamp strikes, arcs, falls, impacts.
import { EASE, clamp01, lerp } from "../lib/anim";

export type V3 = [number, number, number];

/** Height of a rubber stamp's face above its target: drops fast, dwells, lifts. null when off-screen. */
export function strike(t: number, at: number, top = 7, fall = 0.16, dwell = 0.07, lift = 0.4): number | null {
  if (t < at - fall - 0.25 || t > at + dwell + lift) return null;
  if (t < at - fall) return top;
  if (t < at) return top * EASE.in(clamp01((at - t) / fall)) * 1;
  if (t < at + dwell) return 0;
  return top * EASE.inOut(clamp01((t - at - dwell) / lift));
}

/** Ballistic hop from a to b over [t0, t0 + dur] with apex height h above the higher end. */
export function arc(t: number, t0: number, dur: number, a: V3, b: V3, h: number, ease = EASE.inOut): V3 {
  const k = clamp01((t - t0) / dur);
  const e = ease(k);
  return [lerp(a[0], b[0], e), lerp(a[1], b[1], e) + Math.sin(Math.PI * k) * h, lerp(a[2], b[2], e)];
}

/** Drop from height onto a surface, arriving exactly at `at` (gravity-style ease-in). */
export function slam(t: number, at: number, height: number, dur = 0.25) {
  if (t >= at) return 0;
  return height * EASE.in(clamp01((at - t) / dur));
}

/** Free fall with gravity after `at`: returns distance fallen. */
export const fallen = (t: number, at: number, g = 60) => (t < at ? 0 : 0.5 * g * (t - at) ** 2);

/** Damped oscillation after a hit, 1 → 0. */
export const ring = (t: number, at: number, freq = 30, decay = 0.18) =>
  t < at ? 0 : Math.exp(-(t - at) / decay) * Math.sin((t - at) * freq);

export const within = (t: number, a: number, b: number) => t >= a && t < b;
