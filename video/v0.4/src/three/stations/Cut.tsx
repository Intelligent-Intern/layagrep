// 6. Source first. A jg printout lies across a paper guillotine whose blade is the calling
// tool's output limit. In the old order the source sat at the end and fell in the bin; rewind,
// move source ahead of the declaration locations, cut again: the source survives.
import React from "react";
import { X } from "../../cues";
import { EASE, clamp01, lerp } from "../../lib/anim";
import { Guillotine, Sheet, Wastebasket } from "../props";
import { arc } from "../motion";
import { stripTex } from "../tex";
import type { Shot } from "../World";

export const CUT_X = 120;
const BLADE = CUT_X - 0.15;
const SW = 1.9,
  SD = 2.5,
  GAP = 0.05;
const slotX = (i: number) => BLADE - 3.5 * (SW + GAP) - SW / 2 + i * (SW + GAP) + 0.95;
const BIN: [number, number, number] = [BLADE + 5.6, 0, 2.2];
const Y = 0.33;

// Old order ends in source; new order puts source third and fourth.
const KINDS = ["head", "list", "locations", "locations", "source", "source"] as const;
const OLD_SLOT = [0, 1, 2, 3, 4, 5];
const NEW_SLOT = [0, 1, 4, 5, 2, 3];

export const cutShots: [number, Shot, ((x: number) => number)?][] = [
  [X.enter + 0.25, { pos: [CUT_X - 5.5, 7.5, 9.5], target: [CUT_X - 2.5, 0.3, 0], fov: 38 }],
  [X.cut1 - 0.2, { pos: [CUT_X - 2.6, 4.6, 7.4], target: [CUT_X + 0.6, 0.7, 0], fov: 36 }],
  [X.cut2 + 0.35, { pos: [CUT_X - 3.2, 4.8, 7.8], target: [CUT_X - 0.2, 0.7, 0], fov: 36 }, (x) => x],
  [X.exit - 0.1, { pos: [CUT_X - 4, 16, 13], target: [CUT_X - 3, 0, 0], fov: 40 }],
];

/** Blade angle (radians up) around a chop at `at`: raised, slams shut, lifts again. */
const blade = (t: number, at: number) => {
  if (t < at - 0.45) return 1.05;
  if (t < at - 0.14) return lerp(1.05, 1.2, EASE.out(clamp01((t - at + 0.45) / 0.3)));
  if (t < at) return lerp(1.2, 0, EASE.in(clamp01((t - at + 0.14) / 0.14)));
  if (t < at + 0.25) return 0;
  return lerp(0, 1.05, EASE.inOut(clamp01((t - at - 0.25) / 0.35)));
};

/** Section past the blade tumbling into the bin; `k` 0..1. */
const tumble = (k: number, from: [number, number, number], i: number): { p: [number, number, number]; r: [number, number, number] } => {
  const p = arc(k, 0, 1, from, [BIN[0] + (i % 2 ? 0.3 : -0.3), 1.3, BIN[2]], 3.2, (x) => x);
  return { p, r: [k * 1.2 * (i % 2 ? 1 : -1), k * 0.8, -k * 1.9] };
};

export const Cut: React.FC<{ t: number }> = ({ t }) => {
  if (t < X.enter - 0.6 || t > X.exit + 0.8) return null;
  const angle = t < (X.cut1 + X.cut2) / 2 ? blade(t, X.cut1) : blade(t, X.cut2);
  // Rewind plays the first cut backwards.
  const rw = clamp01((t - X.rewind[0]) / (X.rewind[1] - X.rewind[0]));
  const fall1 = t < X.rewind[0] ? clamp01((t - X.cut1) / 0.5) : 1 - EASE.inOut(rw);
  const shuffle = EASE.inOut(clamp01((t - X.shuffle[0]) / (X.shuffle[1] - X.shuffle[0])));
  const fall2 = clamp01((t - X.cut2) / 0.5);
  const pack = EASE.inOut(clamp01((t - X.pack[0]) / (X.pack[1] - X.pack[0])));
  const newOrder = t >= X.shuffle[0];
  return (
    <group>
      <Guillotine angle={t < X.rewind[1] && t >= X.rewind[0] ? lerp(0, 1.05, rw) : angle} position={[BLADE, 0, 0]} />
      <Wastebasket position={BIN} />
      {KINDS.map((kind, i) => {
        const enter = EASE.out(clamp01((t - X.enter - i * 0.05) / 0.45));
        const from = slotX(OLD_SLOT[i]),
          to = slotX(NEW_SLOT[i]);
        let x = lerp(from - 12, from, enter),
          y = Y + Math.sin(Math.PI * enter) * 0.3,
          z = 0;
        let r: [number, number, number] = [0, 0, 0];
        if (shuffle > 0) {
          // Source arcs up and over the locations while they slide back.
          const lift = kind === "source" ? 1.6 : 0.25;
          x = lerp(from, to, shuffle);
          y = Y + Math.sin(Math.PI * shuffle) * lift;
          z = Math.sin(Math.PI * shuffle) * (kind === "source" ? -0.6 : 0.4);
        }
        const slot = newOrder ? NEW_SLOT[i] : OLD_SLOT[i];
        const pastBlade = slot >= 4;
        const fall = newOrder ? fall2 : fall1;
        if (pastBlade && fall > 0) {
          const tb = tumble(fall, [x, y, z], i);
          [x, y, z] = tb.p;
          r = tb.r;
        }
        // After the second cut the survivors slide back into a neat packet.
        if (!pastBlade && pack > 0) x -= pack * 1.2;
        const label = i === 0 ? (newOrder ? "jg v0.4" : "jg v0.3") : "";
        return <Sheet key={i} tex={stripTex(kind, label)} w={SW} h={SD} curl={0} position={[x, y, z]} rotation={r} />;
      })}
    </group>
  );
};
