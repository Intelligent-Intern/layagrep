// 3. The relevance bar. 51 file cards stand in a row, each as tall as its relevance score.
// A red string is the admission bar: every card clears 0.25, and when it rises to 0.5 the 41
// below it fall flat, leaving 10. (Django task: 51 files at >0.25, 10 at >0.5.)
import React, { useMemo } from "react";
import * as THREE from "three";
import { B } from "../../cues";
import { DJANGO_FILES } from "../../data";
import { EASE, clamp01, lerp, rand, sp } from "../../lib/anim";
import { BrassPost, MAT, StringLine, UprightFolder } from "../props";
import { ring } from "../motion";
import type { Shot } from "../World";

export const BAR_X = 30;
const N = DJANGO_FILES.before;
const SPACING = 0.62;
const H = 3.4; // card height at relevance 1.0
const x0 = BAR_X - ((N - 1) * SPACING) / 2;
const HIGH = new Set([3, 8, 12, 17, 21, 26, 31, 37, 42, 47]); // 10 cards above 0.5
const CARDS = Array.from({ length: N }, (_, i) => ({
  x: x0 + i * SPACING,
  score: HIGH.has(i) ? 0.56 + rand(i, 1) * 0.36 : 0.29 + rand(i, 2) * 0.19,
  high: HIGH.has(i),
}));
const LOW = CARDS.map((c, i) => (c.high ? -1 : i)).filter((i) => i >= 0);
const dropAt = (i: number) => B.drops[0] + (LOW.indexOf(i) / (LOW.length - 1)) * (B.drops[1] - B.drops[0]);

/** Files still admitted at time t (drives the live header count). */
export const keptCount = (t: number) => N - LOW.filter((i) => t >= dropAt(i)).length;

export const barShots: [number, Shot, ((x: number) => number)?][] = [
  [B.rise + 0.25, { pos: [x0 - 3.5, 2.3, 5.4], target: [x0 + 5, 1.3, 0], fov: 36 }],
  [B.snap - 0.05, { pos: [x0 - 2.2, 2.0, 4.4], target: [x0 + 6, 1.5, 0.3], fov: 34 }, (x) => x],
  [B.drops[1] - 0.2, { pos: [BAR_X + 2, 3.2, 7.5], target: [BAR_X + 9, 1.1, 0], fov: 36 }],
  [B.exit - 0.1, { pos: [x0 - 5, 8.5, 8.5], target: [BAR_X + 1, 0.6, 0], fov: 40 }],
];

export const Bar: React.FC<{ t: number }> = ({ t }) => {
  const tabRed = useMemo(() => new THREE.MeshStandardMaterial({ color: "#EF5638", roughness: 0.5, emissive: "#ef5638", emissiveIntensity: 0.0 }), []);
  if (t < B.rise - 0.6 || t > B.exit + 0.8) return null;
  const lift = EASE.inOut(clamp01((t - B.lift[0]) / (B.lift[1] - B.lift[0])));
  const bar = lerp(0.25, 0.5, lift) * H;
  const posts = sp(t, B.posts, { damping: 11, stiffness: 200 });
  const kept = clamp01((t - B.keep) / 0.2);
  tabRed.emissiveIntensity = kept * (0.6 + 0.4 * Math.exp(-(t - B.keep) / 0.2));
  return (
    <group>
      {CARDS.map((c, i) => {
        const riseAt = B.rise + i * B.riseStep;
        if (t < riseAt) return null;
        const up = sp(t, riseAt, { damping: 10, stiffness: 240, mass: 0.6 });
        let fold = 1 - up;
        if (!c.high) {
          const d = dropAt(i);
          if (t >= d) fold = EASE.in(clamp01((t - d) / 0.28));
        }
        const hop = c.high && t >= B.keep ? Math.max(0, Math.sin(clamp01((t - B.keep - (i % 5) * 0.02) / 0.25) * Math.PI)) * 0.35 : 0;
        return (
          <UprightFolder
            key={i}
            h={c.score * H}
            w={0.5}
            fold={fold}
            position={[c.x, hop, 0]}
            mat={i % 7 === 3 ? MAT.ivory : MAT.manila}
            tabMat={c.high && t >= B.keep ? tabRed : MAT.manilaDeep}
            tabX={(rand(i, 3) - 0.5) * 0.2}
          />
        );
      })}
      {t >= B.posts && (
        <>
          <group scale={[1, posts, 1]}>
            <BrassPost h={H * 0.95} position={[x0 - 0.9, 0, 0.35]} />
            <BrassPost h={H * 0.95} position={[x0 + (N - 1) * SPACING + 0.9, 0, 0.35]} />
          </group>
          {posts > 0.9 && (
            <StringLine
              a={[x0 - 0.9, bar, 0.35]}
              b={[x0 + (N - 1) * SPACING + 0.9, bar, 0.35]}
              sag={0.35 * (1 - lift) + ring(t, B.snap, 34, 0.2) * 0.25}
              r={0.03}
            />
          )}
        </>
      )}
    </group>
  );
};
