// 1. Without a map the agent digs through the whole archive, paying for every page.
// 2. jg hands over one case file: wordmark stamped on, claim label-taped, a finished run clipped on.
import React from "react";
import { A, O, SCENE, T } from "../../cues";
import { EASE, clamp01, lerp, rand, sp } from "../../lib/anim";
import { ArchiveBox, CaseFolder, Decal, Paperclip, Printer, Receipt, RubberStamp, Sheet, Tape } from "../props";
import { cardTex, manilaTex, receiptTex, versionTex, wordmarkTex } from "../tex";
import { arc, slam, strike } from "../motion";
import type { Shot } from "../World";

const BOXES = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2 + 0.3;
  const r = 8.2 + rand(i, 1) * 1.2;
  return { x: Math.cos(a) * r, z: Math.sin(a) * r * 0.72, ry: -a + Math.PI / 2 + (rand(i, 2) - 0.5) * 0.3 };
});

export const openingShots: [number, Shot, ((x: number) => number)?][] = [
  [0, { pos: [-10, 14, 13], target: [0, 0, 0], fov: 44 }],
  [A.implode - 0.05, { pos: [3.5, 8.5, 9.5], target: [0, 0.6, 0], fov: 38 }, (x) => x],
  [SCENE.title, { pos: [0, 14.5, 6.6], target: [0, 0, 0.3], fov: 40 }, EASE.inOut],
  [T.card + 0.2, { pos: [0.6, 13.2, 6.2], target: [0.3, 0, 0.3], fov: 40 }],
  [T.open, { pos: [1.0, 11.8, 5.6], target: [0.6, 0, 0.35], fov: 40 }],
];

/** Where each flicked page lands on the pile. */
const land = (i: number): [number, number, number] => [(rand(i, 4) - 0.5) * 2.6, 0.03 + i * 0.014, (rand(i, 5) - 0.5) * 1.8];

const Pages: React.FC<{ t: number }> = ({ t }) => {
  if (t >= SCENE.title) return null;
  const implode = EASE.in(clamp01((t - A.implode) / (SCENE.title - A.implode)));
  return (
    <>
      {A.flicks.map((at, i) => {
        if (t < at) return null;
        const b = BOXES[(i * 3) % 8];
        const dur = 0.42;
        let p = arc(t, at, dur, [b.x, 1.5, b.z], land(i), 3.5 + rand(i, 6) * 2.5, EASE.out);
        const k = EASE.out(clamp01((t - at) / dur));
        let rot: [number, number, number] = [
          lerp((rand(i, 7) - 0.5) * 6, 0, k),
          lerp(rand(i, 8) * 6, (rand(i, 9) - 0.5) * 1.2, k),
          lerp((rand(i, 10) - 0.5) * 6, 0, k),
        ];
        if (implode > 0) {
          // Vortex: the pile spirals up past the lens.
          const a = implode * 5 + i;
          p = [lerp(p[0], Math.cos(a) * 1.5, implode), p[1] + implode * implode * 14, lerp(p[2], Math.sin(a) * 1.5 + 2, implode)];
          rot = [rot[0] + implode * 4 * (rand(i, 11) - 0.5), rot[1] + implode * 6, rot[2] + implode * 3];
        }
        return <Sheet key={i} spec={{ seed: i, hi: i % 4 === 0 ? [3] : [] }} position={p} rotation={rot} curl={0.08} />;
      })}
    </>
  );
};

/** Every landed page adds a billed line to a receipt: the cost is on the desk, not in a caption. */
const PAGE_ROWS = A.flicks.map((_, i) => [`page ${String(i + 1).padStart(2, "0")}`, "billed"] as [string, string]);
const Meter: React.FC<{ t: number }> = ({ t }) => {
  const landed = A.flicks.filter((f) => t >= f + 0.42).length;
  return (
    <>
      <Printer position={[4.4, 0, 2.6]} rotation={[0, Math.PI, 0]} />
      <Receipt
        tex={receiptTex("archive", "agent alone", PAGE_ROWS, "…")}
        length={4.9}
        width={1.75}
        p={Math.max(0.04, landed / A.flicks.length)}
        position={[4.4, 0.02, 2.55]}
        rotation={[0, Math.PI, 0]}
      />
    </>
  );
};

/** Title folder front contents, in cover-local coordinates. `outro` swaps the claim for the install command. */
export const FolderFront: React.FC<{ t: number; outro?: boolean }> = ({ t, outro }) => {
  const n = (span: [number, number], text: string) =>
    t < span[0] ? 0 : Math.min(text.length, Math.floor(((t - span[0]) / (span[1] - span[0])) * text.length) + 1);
  const cardIn = sp(t, T.card, { damping: 14, stiffness: 180 });
  return (
    <>
      {(outro || t >= T.stamp) && <Decal tex={wordmarkTex()} w={8.4} h={2.625} position={[-2.0, 0.021, -1.75]} />}
      {(outro || t >= T.version) && <Decal tex={versionTex("v0.4")} w={3.9} h={1.52} position={[4.35, 0.022, -1.62]} rotation={[-Math.PI / 2, 0, 0.05]} />}
      {!outro && (
        <>
          <Tape text={T.tape1Text} color="#151515" n={n(T.tape1, T.tape1Text)} h={0.56} position={[-5.9, 0.02, 0.55]} rotation={[0, 0.03, 0]} />
          <Tape text={T.tape2Text} color="#B8341C" n={n(T.tape2, T.tape2Text)} h={0.56} position={[-5.6, 0.02, 1.5]} rotation={[0, -0.02, 0]} />
          {t >= T.card && (
            <group position={[3.45, 0.04 + Math.max(0, 1 - cardIn) * 5, 1.2 - (1 - cardIn) * 2]} rotation={[0, 0.04 + (1 - cardIn) * 0.6, 0]}>
              <Sheet tex={cardTex(T.command)} w={5.5} h={3.4} curl={0.02} />
              <Paperclip position={[-1.7, 0.04, -1.7]} rotation={[0, 0.1, 0]} scale={1.3} />
            </group>
          )}
        </>
      )}
      {outro && (
        <>
          <Tape text={O.install} color="#151515" n={n(O.tape, O.install)} h={0.6} position={[-5.7, 0.02, 0.7]} rotation={[0, 0.02, 0]} />
          <Tape text="jg skill" color="#B8341C" n={t >= O.skill ? 8 : 0} h={0.6} position={[-5.5, 0.02, 1.7]} rotation={[0, -0.02, 0]} />
        </>
      )}
    </>
  );
};

export const Opening: React.FC<{ t: number }> = ({ t }) => {
  if (t > SCENE.bar + 0.6) return null;
  const drop = slam(t, T.slam, 5, 0.2);
  const stampY = strike(t, T.stamp, 9, 0.16, 0.08, 0.5);
  const versionY = strike(t, T.version, 7, 0.12, 0.06, 0.35);
  return (
    <>
      {BOXES.map((b, i) => (
        <ArchiveBox key={i} position={[b.x, 0, b.z]} rotation={[0, b.ry, 0]} seed={i} />
      ))}
      <Pages t={t} />
      {t < T.slam && <Meter t={t} />}
      {t >= T.slam - 0.25 && (
        <CaseFolder front={manilaTex("title")} position={[0, drop, 0]}>
          <FolderFront t={t} />
        </CaseFolder>
      )}
      {versionY !== null && <RubberStamp w={2.2} d={0.8} position={[4.35, 0.1 + versionY, -1.62]} rotation={[0, -0.05, 0]} scale={1.7} />}
      {stampY !== null && <RubberStamp w={2.9} d={0.95} position={[-2.0, 0.1 + stampY, -1.75]} rotation={[0, 0.02, 0]} scale={2.95} />}
    </>
  );
};
