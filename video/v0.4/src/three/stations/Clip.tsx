// 5. Clip the declaration, keep its context: scissors cut the method out of a long file; its
// class header and adjacent comment are clipped back on, and a red string follows a local call
// to the helper it uses. Then test cards: only bodies that explain the behaviour turn face up;
// the rest stay face down as location-only reading leads.
import React from "react";
import { K } from "../../cues";
import { EASE, clamp01, lerp, rand, sp } from "../../lib/anim";
import { FlipCard, MAT, Paperclip, Pin, Scissors, Sheet, StringLine } from "../props";
import { arc, slam } from "../motion";
import { backTex, labelTex, pageTex } from "../tex";
import type { Shot } from "../World";
import { MONO } from "../../lib/ui";

export const CLIP_X = 90;
const W = 3.2;
// Long file = top | method | bottom, flush so it reads as one sheet until cut.
const TOP = { z: -3.35, h: 3.3 };
const METHOD = { z: -0.5, h: 2.4 };
const BOTTOM = { z: 2.35, h: 3.3 };
const CUTS = [METHOD.z - METHOD.h / 2, METHOD.z + METHOD.h / 2];
const TESTS = ["test_reuse@12", "test_timeout@48", "test_close@77", "test_idle@103", "test_size@131", "test_env@160"];
const FACE_UP = [1, 3];

export const clipShots: [number, Shot, ((x: number) => number)?][] = [
  [K.enter + 0.25, { pos: [CLIP_X - 0.5, 12.5, 7.5], target: [CLIP_X, 0, -0.6], fov: 40 }],
  [K.drop, { pos: [CLIP_X + 0.3, 10.5, 6.2], target: [CLIP_X + 0.3, 0, -0.7], fov: 38 }, (x) => x],
  [K.tests - 0.15, { pos: [CLIP_X + 2.4, 10.8, 6.8], target: [CLIP_X + 2.4, 0, -1.0], fov: 38 }],
  [K.tests + 0.35, { pos: [CLIP_X + 0.8, 9.0, 11.2], target: [CLIP_X + 0.8, 0, 4.2], fov: 38 }],
  [K.exit - 0.1, { pos: [CLIP_X + 1.2, 8.4, 10.6], target: [CLIP_X + 1.0, 0, 4.4], fov: 37 }],
];

const Cut: React.FC<{ t: number; z: number; a: number; b: number }> = ({ t, z, a, b }) => {
  const k = clamp01((t - a) / (b - a));
  if (t < a - 0.15 || t > b + 0.2) return null;
  const x = lerp(CLIP_X - W / 2 - 1.2, CLIP_X + W / 2 + 0.6, EASE.inOut(k));
  const chomp = 0.5 + 0.5 * Math.cos((t - a) * Math.PI * 2 * 8);
  return (
    <>
      <Scissors open={chomp} position={[x, 0.25, z]} rotation={[0, 0, 0.12]} scale={1.35} />
      {k > 0 && (
        <mesh position={[lerp(CLIP_X - W / 2, x, 0.5), 0.028, z]} material={MAT.black}>
          <boxGeometry args={[Math.max(0.01, x - (CLIP_X - W / 2)), 0.004, 0.025]} />
        </mesh>
      )}
    </>
  );
};

export const Clip: React.FC<{ t: number }> = ({ t }) => {
  if (t < K.enter - 0.6 || t > K.exit + 0.8) return null;
  const enter = clamp01((t - K.enter) / 0.45);
  const off = EASE.in(clamp01((t - K.drop) / 0.5));
  const base = (dz: number): [number, number, number] => [lerp(CLIP_X - 10, CLIP_X, EASE.out(enter)), 0.02 + Math.sin(Math.PI * enter) * 0.6, dz];
  const hdr = slam(t, K.header, 5, 0.2);
  const cmt = slam(t, K.comment, 5, 0.2);
  const calleeP = arc(t, K.callee, 0.3, [CLIP_X + 9, 0.02, -3], [CLIP_X + 4.6, 0.02, -0.9], 0.8);
  const draw = clamp01((t - K.string) / 0.3);
  return (
    <group>
      {/* the long file */}
      {off < 1 && (
        <>
          <Sheet
            spec={{ seed: 51, title: "db/pool.py", lines: 11 }}
            w={W}
            h={TOP.h}
            curl={0.0}
            position={[base(TOP.z)[0] - off * 2, base(TOP.z)[1] + Math.sin(Math.PI * off) * 1.4, TOP.z - off * 7]}
            rotation={[0, off * 0.8, 0]}
          />
          <Sheet
            spec={{ seed: 52, lines: 11 }}
            w={W}
            h={BOTTOM.h}
            curl={0.0}
            position={[base(BOTTOM.z)[0] + off * 2, base(BOTTOM.z)[1] + Math.sin(Math.PI * off) * 1.4, BOTTOM.z + off * 7]}
            rotation={[0, -off * 0.7, 0]}
          />
        </>
      )}
      <Sheet spec={{ seed: 53, lines: 8, hi: [2, 3, 4], paper: "#F7F2E6" }} w={W} h={METHOD.h} curl={0.0} position={base(METHOD.z)} />
      <Cut t={t} z={CUTS[0]} a={K.cut[0]} b={(K.cut[0] + K.cut[1]) / 2} />
      <Cut t={t} z={CUTS[1]} a={(K.cut[0] + K.cut[1]) / 2 + 0.03} b={K.cut[1]} />
      {/* class header and adjacent comment clipped back on */}
      {t >= K.header - 0.25 && (
        <Sheet tex={labelTex("class Pool:", { font: `700 72px ${MONO}` })} w={W} h={0.5} position={[CLIP_X, 0.02 + hdr, CUTS[0] - 0.95]} curl={0} />
      )}
      {t >= K.comment - 0.25 && (
        <Sheet
          tex={labelTex("# reuse idle connections first", { color: "#8A5A2B", font: `500 56px ${MONO}` })}
          w={W}
          h={0.5}
          position={[CLIP_X, 0.025 + cmt, CUTS[0] - 0.36]}
          curl={0}
        />
      )}
      {t >= K.header && <Paperclip position={[CLIP_X - 1.1, 0.06 + slam(t, K.header + 0.12, 2, 0.12), CUTS[0] - 0.9]} rotation={[0, 0.05, 0]} scale={1.5} />}
      {/* local call → the helper it uses */}
      {t >= K.string - 0.1 && (
        <>
          <Pin position={[CLIP_X + 0.7, 0.03, METHOD.z - 0.1]} />
          <StringLine a={[CLIP_X + 0.7, 0.16, METHOD.z - 0.1]} b={[CLIP_X + 3.3, 0.16, -0.9]} sag={-0.5 * (1 - draw)} draw={draw} />
        </>
      )}
      {t >= K.callee - 0.05 && (
        <group position={calleeP}>
          <Sheet spec={{ seed: 61, title: "def _checkout(self):", lines: 6, hi: [1] }} w={2.8} h={2.0} curl={0.02} />
          {t >= K.callee + 0.3 && <Paperclip position={[-0.9, 0.05 + slam(t, K.callee + 0.4, 2, 0.12), -0.95]} scale={1.3} />}
        </group>
      )}
      {/* tests: face down unless the body explains the behaviour */}
      {TESTS.map((name, i) => {
        const at = K.tests + i * 0.0625;
        if (t < at - 0.25) return null;
        const y = slam(t, at, 4, 0.22);
        const fi = FACE_UP.indexOf(i);
        const flip = fi >= 0 ? 1 - EASE.inOut(clamp01((t - K.flips[fi]) / 0.35)) : 1;
        return (
          <FlipCard
            key={i}
            front={pageTex({ seed: 70 + i, title: name.split("@")[0], lines: 10, hi: [3, 4], kind: "test" })}
            back={backTex(name)}
            flip={flip}
            w={1.75}
            h={2.4}
            position={[CLIP_X - 4.6 + i * 2.05, 0.02 + y, 4.3 + (rand(i, 3) - 0.5) * 0.2]}
            rotation={[0, (rand(i, 4) - 0.5) * 0.08, 0]}
          />
        );
      })}
    </group>
  );
};

export { sp };
