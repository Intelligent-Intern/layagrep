// 7. Same intelligence: two rows of the same ten case files, agent alone vs agent + jg. The same
// eight are stamped SOLVED in both rows, in lockstep. Then each row prints its Sol-cost receipt,
// its length proportional to the bill, and a giant stamp lands the saving.
// 8. Outro: the case folder lands on top, install command punched onto the cover.
import React from "react";
import { O, P, SCENE } from "../../cues";
import { TASKS, TOTAL } from "../../data";
import { EASE, clamp01 } from "../../lib/anim";
import { CaseFolder, InkStamp, Printer, Receipt, RubberStamp, Sheet } from "../props";
import { slam, strike } from "../motion";
import { labelTex, manilaTex, receiptTex, REDDEEP } from "../tex";
import { FolderFront } from "./Opening";
import type { Shot } from "../World";
import { MONO } from "../../lib/ui";

export const PAY_X = 150;
const ROWS = [
  { z: -2.7, label: "agent alone", cost: (k: (typeof TASKS)[number]) => k.base, total: TOTAL.base },
  { z: 2.7, label: "agent + jg", cost: (k: (typeof TASKS)[number]) => k.jg, total: TOTAL.jg },
];
const fx = (i: number) => PAY_X - 10.4 + i * 2.3;
const PRINTER_X = [PAY_X + 13.6, PAY_X + 17.4];
const PRINTER_Z = 4.6;
const SOLVED_ORDER = TASKS.map((k, i) => (k.solved ? i : -1)).filter((i) => i >= 0);
const BIG = { x: PAY_X + 15.5, z: -5.4 };

export const payoffShots: [number, Shot, ((x: number) => number)?][] = [
  [P.drop + 0.1, { pos: [PAY_X - 3, 20, 11], target: [PAY_X - 3, 0, 0], fov: 46 }],
  [P.solved[0] - 0.05, { pos: [PAY_X - 8.5, 11, 9.5], target: [PAY_X - 7.5, 0, 0], fov: 42 }],
  [P.solved[7] + 0.2, { pos: [PAY_X + 5.5, 11, 9.5], target: [PAY_X + 6, 0, 0], fov: 42 }, (x) => x],
  [P.print[1] - 0.05, { pos: [PAY_X + 15.5, 10.5, 9.5], target: [PAY_X + 15.5, 0, 0.6], fov: 40 }],
  [P.slam + 0.3, { pos: [PAY_X + 15.5, 14, 8.5], target: [PAY_X + 15.5, 0, -1.2], fov: 44 }],
  [SCENE.outro - 0.05, { pos: [PAY_X + 15.2, 13.2, 8.0], target: [PAY_X + 15.3, 0, -1.2], fov: 44 }, (x) => x],
  [SCENE.outro + 0.35, { pos: [PAY_X, 16.5, 1.6], target: [PAY_X, 0, 0.2], fov: 40 }],
  [SCENE.end, { pos: [PAY_X, 14.2, 1.4], target: [PAY_X, 0, 0.2], fov: 40 }, (x) => x],
];

export const Payoff: React.FC<{ t: number }> = ({ t }) => {
  if (t < P.drop - 0.6) return null;
  const printK = EASE.inOut(clamp01((t - P.print[0]) / (P.print[1] - P.print[0])));
  const bigY = strike(t, P.slam, 12, 0.18, 0.08, 0.6);
  const outroY = slam(t, O.hit, 14, 0.26);
  return (
    <group>
      {ROWS.map((row, r) => (
        <React.Fragment key={r}>
          <Sheet tex={labelTex(row.label, { font: `700 84px ${MONO}` })} w={3.6} h={0.56} position={[fx(0) - 3.4, 0.02, row.z]} curl={0} />
          {TASKS.map((task, i) => {
            const y = slam(t, P.drop + i * 0.02 + r * 0.04, 6, 0.24);
            const k = SOLVED_ORDER.indexOf(i);
            const at = k >= 0 ? P.solved[k] : Infinity;
            const sy = strike(t, at, 7, 0.14, 0.06, 0.35);
            return (
              <React.Fragment key={i}>
                <CaseFolder w={2.0} d={1.45} position={[fx(i), y, row.z]} rotation={[0, (((i * 7 + r * 3) % 5) - 2) * 0.02, 0]}>
                  {t >= at && <InkStamp label="SOLVED" color={REDDEEP} w={1.7} position={[0, 0.02, 0.05]} rz={0.12 - (i % 3) * 0.05} />}
                </CaseFolder>
                {sy !== null && <RubberStamp position={[fx(i), 0.1 + sy, row.z + 0.05]} rotation={[0, 0.12, 0]} scale={0.85} />}
              </React.Fragment>
            );
          })}
          <Printer position={[PRINTER_X[r], 0, PRINTER_Z]} rotation={[0, Math.PI, 0]} />
          <Sheet tex={labelTex(row.label, { font: `700 84px ${MONO}` })} w={2.9} h={0.45} position={[PRINTER_X[r] + 0.15, 0.02, PRINTER_Z + 1.9]} curl={0} />
          <Receipt
            tex={receiptTex(
              row.label,
              row.label,
              TASKS.map((k) => [k.id.replace(/-\d+$/, ""), `$${row.cost(k).toFixed(2)}`] as [string, string]),
              `$${row.total.toFixed(2)}`,
            )}
            length={row.total * 1.05}
            width={1.75}
            p={printK}
            position={[PRINTER_X[r], 0.02, PRINTER_Z - 0.05]}
            rotation={[0, Math.PI, 0]}
          />
        </React.Fragment>
      ))}
      {t >= P.slam && <InkStamp label={`${TOTAL.rounded} LESS COST`} color="#D8432A" mark="none" w={7.6} position={[BIG.x, 0.03, BIG.z]} rz={0.05} opacity={0.97} />}
      {bigY !== null && <RubberStamp w={2.9} d={0.8} position={[BIG.x, 0.05 + bigY, BIG.z]} rotation={[0, 0.06, 0]} scale={2.9} />}
      {t >= O.hit - 0.3 && (
        <CaseFolder front={manilaTex("title")} position={[PAY_X, 0.45 + outroY, 0]}>
          <FolderFront t={t} outro />
        </CaseFolder>
      )}
    </group>
  );
};
