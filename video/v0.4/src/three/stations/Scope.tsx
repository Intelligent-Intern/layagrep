// 4. Two separate judgments. Every page is stamped RELEVANT, then judged IN SCOPE: the buggy
// current implementation still counts; a look-alike API from elsewhere is out. Then a concrete
// reference in selected code is followed on a red string, and that definition is pulled in too.
import React from "react";
import { S } from "../../cues";
import { EASE, clamp01, lerp } from "../../lib/anim";
import { Beetle, InkStamp, Pin, RubberStamp, Sheet, StringLine } from "../props";
import { arc, strike } from "../motion";
import { GREY, REDDEEP } from "../tex";
import type { Shot } from "../World";

export const SCOPE_X = 60;
const W = 3.1,
  Hh = 4.2;
const SLOTS = [SCOPE_X - 4, SCOPE_X, SCOPE_X + 4];
const PAGES = [
  { title: "db/pool.py", seed: 11, hi: [6] },
  { title: "db/engine.py", seed: 23, hi: [8] },
  { title: "cache/pool.py", seed: 11, hi: [] as number[] }, // same shape, different API
];
const RECOVER_FROM: [number, number, number] = [SCOPE_X + 9, 0.02, -2.6];

export const scopeShots: [number, Shot, ((x: number) => number)?][] = [
  [S.enter + 0.25, { pos: [SCOPE_X, 11, 9.8], target: [SCOPE_X, 0, 0.5], fov: 40 }],
  [S.pages[0][0] - 0.1, { pos: [SLOTS[0] + 0.6, 7.8, 6.8], target: [SLOTS[0], 0, 0.3], fov: 38 }],
  [S.pages[1][0] - 0.1, { pos: [SLOTS[1] + 0.6, 7.6, 6.6], target: [SLOTS[1], 0, 0.3], fov: 38 }],
  [S.pages[2][0] - 0.1, { pos: [SLOTS[2] + 0.6, 7.2, 6.2], target: [SLOTS[2], 0, 0.3], fov: 38 }],
  [S.pages[2][1] + 0.2, { pos: [SLOTS[2] + 0.4, 6.6, 5.6], target: [SLOTS[2], 0, 0.6], fov: 38 }],
  [S.pages[2][1] + 0.6, { pos: [SLOTS[2] + 1.2, 8.0, 4.5], target: [SLOTS[2] + 1.2, 0, -3.5], fov: 40 }],
  [S.string - 0.1, { pos: [SCOPE_X + 3, 10.5, 9.5], target: [SCOPE_X + 2.6, 0, -0.6], fov: 40 }],
  [S.exit - 0.1, { pos: [SCOPE_X + 2.6, 9.8, 8.6], target: [SCOPE_X + 3, 0, -0.4], fov: 39 }],
];

const Strike: React.FC<{ t: number; at: number; x: number; z: number }> = ({ t, at, x, z }) => {
  const y = strike(t, at, 8);
  if (y === null) return null;
  return <RubberStamp position={[x, 0.03 + y, z]} rotation={[0, 0.1, 0]} scale={1.05} />;
};

export const Scope: React.FC<{ t: number }> = ({ t }) => {
  if (t < S.enter - 0.6 || t > S.exit + 0.8) return null;
  const rejectOut = EASE.in(clamp01((t - (S.pages[2][1] + 0.3)) / 0.45));
  const pull = clamp01((t - S.recover) / 0.25);
  const recovered = arc(t, S.recover, 0.25, RECOVER_FROM, [SLOTS[2], 0.02, 0], 0.6);
  const draw = clamp01((t - S.string) / 0.3);
  return (
    <group>
      {PAGES.map((p, i) => {
        const enter = EASE.out(clamp01((t - S.enter - i * 0.08) / 0.4));
        let x = lerp(SLOTS[i] - 14, SLOTS[i], enter),
          y = 0.02 + Math.sin(Math.PI * enter) * 0.4,
          z = 0,
          ry = (1 - enter) * 0.4;
        if (i === 2 && rejectOut > 0) {
          z = -rejectOut * 9;
          x += rejectOut * 3;
          y += Math.sin(Math.PI * rejectOut) * 1.2;
          ry += rejectOut * 1.2;
        }
        if (i === 2 && rejectOut >= 1) return null;
        const [rAt, sAt, ok] = S.pages[i];
        return (
          <group key={i} position={[x, y, z]} rotation={[0, ry, 0]}>
            <Sheet spec={{ seed: p.seed, title: p.title, hi: p.hi, lines: 12 }} w={W} h={Hh} curl={0.03} />
            {t >= rAt && <InkStamp label="RELEVANT" color={REDDEEP} position={[0.1, 0.03, -0.55]} w={2.9} rz={0.1} />}
            {t >= sAt && (
              <InkStamp
                label={ok ? "IN SCOPE" : "OUT OF SCOPE"}
                color={ok ? REDDEEP : "#6E685E"}
                mark={ok ? "check" : "cross"}
                position={[-0.1, 0.035, 1.05]}
                w={2.9}
                rz={-0.08}
              />
            )}
            {i === 1 && <Beetle t={t} position={[-0.5 + Math.sin(t * 1.3) * 0.5, 0.02, 0.62]} rotation={[0, Math.PI / 2 + Math.cos(t * 1.3) * 0.3, 0]} scale={1.1} />}
          </group>
        );
      })}
      {S.pages.map(([r, s], i) => (
        <React.Fragment key={i}>
          <Strike t={t} at={r} x={SLOTS[i] + 0.1} z={-0.55} />
          <Strike t={t} at={s} x={SLOTS[i] - 0.1} z={1.05} />
        </React.Fragment>
      ))}
      {/* follow the concrete reference: string from the call line to where it is defined */}
      {t >= S.string - 0.2 && (
        <>
          <Pin position={[SLOTS[0] + 0.9, 0.03, 0.38 - 0.02]} />
          <Sheet
            spec={{ seed: 37, title: "db/checkout.py", hi: [2], lines: 12 }}
            w={W}
            h={Hh}
            position={pull > 0 ? recovered : RECOVER_FROM}
            rotation={[0, lerp(-0.35, 0, pull), 0]}
          />
          <StringLine
            a={[SLOTS[0] + 0.9, 0.16, 0.36]}
            b={pull > 0 ? [recovered[0] - 0.9, recovered[1] + 0.14, recovered[2] - 1.2] : [RECOVER_FROM[0] - 0.9, 0.16, RECOVER_FROM[2] - 1.2]}
            sag={-0.4 * (1 - draw)}
            draw={draw}
          />
          {t >= S.recoverStamp && <InkStamp label="REFERENCED" color={REDDEEP} position={[SLOTS[2] + 0.1, 0.05, -0.55]} w={2.5} rz={0.1} />}
          <Strike t={t} at={S.recoverStamp} x={SLOTS[2] + 0.1} z={-0.55} />
        </>
      )}
    </group>
  );
};

export { GREY };
