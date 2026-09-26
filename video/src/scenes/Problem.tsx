import React from "react";
import { P } from "../cues";
import {
  C,
  EASE,
  clamp01,
  easeOutBack,
  lerp,
  map,
  pulse,
  rand,
  ramp,
  shake,
  sp,
} from "../lib/anim";
import { At, FileIcon, MaskWord, MONO, SERIF, abs } from "../lib/ui";

const COLS = 13,
  ROWS = 5,
  GX = 118,
  GY = 122;
const CX = 960,
  CY = 400;
const cells = Array.from({ length: COLS * ROWS }, (_, i) => {
  const c = i % COLS,
    r = Math.floor(i / COLS);
  const x = CX + (c - (COLS - 1) / 2) * GX + (r % 2 ? GX * 0.25 : -GX * 0.25);
  const y = CY + (r - (ROWS - 1) / 2) * GY;
  return { x, y, d: Math.hypot(x - CX, (y - CY) * 1.4) };
});
// The agent's aimless path: jump across the grid, never finding the file.
const visitCells = P.visits.map((_, i) => Math.floor(rand(i, 42) * cells.length));

export const Problem: React.FC<{ t: number }> = ({ t }) => {
  // Searchlight position: snappy overshoot hop to each visited file just before its beat.
  let vi = -1;
  for (let i = 0; i < P.visits.length; i++) if (t >= P.visits[i] - 0.1) vi = i;
  const hop = (i: number) => {
    const c = cells[visitCells[i]];
    return { x: c.x, y: c.y };
  };
  let lx = -200,
    ly = 700;
  if (vi >= 0) {
    const from = vi === 0 ? { x: -150, y: 820 } : hop(vi - 1);
    const to = hop(vi);
    const dur = vi === 0 ? 0.3 : Math.min(0.1, (P.visits[vi] - P.visits[vi - 1]) * 0.8);
    const k = clamp01((t - (P.visits[vi] - 0.1)) / dur);
    const e = easeOutBack(k, 1.4);
    lx = lerp(from.x, to.x, e);
    ly = lerp(from.y, to.y, e) - Math.sin(Math.PI * k) * 40;
  }
  const lensIn = sp(t, 0.7);

  // Tokens climb with every visit; each visit kicks the counter.
  const visitsDone = P.visits.filter((v) => t >= v).length;
  const lastV = P.visits[visitsDone - 1] ?? 0;
  const partial = visitsDone ? ramp(t, lastV, lastV + 0.2) : 0;
  const tokens = Math.round(
    2400 * Math.pow(Math.max(0, visitsDone - 1 + partial), 1.55) +
      (visitsDone ? 1800 * partial : 0),
  );
  const kickCounter = pulse(t, P.visits, 0.08);

  // Implode: everything accelerates into the center dot.
  const imp = ramp(t, P.implode, 4.0, EASE.in);
  const accel = map(t, [3.0, 3.75], [0, 1]);
  const sh = shake(
    t,
    P.visits.map((v, i) => [v, i > 7 ? 7 : 2] as [number, number]),
    "p",
  );
  const camS = 1 + accel * 0.07 + imp * 0.2;

  return (
    <div style={{ ...abs, width: 1920, height: 1080, background: C.ivory, overflow: "hidden" }}>
      <div
        style={{
          ...abs,
          width: 1920,
          height: 1080,
          transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r + accel * -1.2}deg) scale(${camS})`,
          transformOrigin: "960px 460px",
        }}
      >
        {cells.map((c, i) => {
          const at = c.d * 0.00055;
          const s = sp(t, at, { damping: 10, stiffness: 260, mass: 0.5 });
          const visitIdx = visitCells.lastIndexOf(i);
          const visitedAt = visitIdx >= 0 && t >= P.visits[visitIdx] ? P.visits[visitIdx] : -1;
          const hot = visitedAt >= 0 ? Math.exp(-(t - visitedAt) / 0.14) : 0;
          const dead = visitedAt >= 0 ? clamp01((t - visitedAt) / 0.25) : 0;
          const bob = Math.sin(t * 3 + i) * 3;
          const px = lerp(c.x, 960, imp),
            py = lerp(c.y + bob, 540, imp);
          return (
            <At
              key={i}
              x={px}
              y={py}
              s={s * (1 + hot * 0.35) * (1 - imp)}
              r={(1 - s) * (rand(i) - 0.5) * 60 + imp * (rand(i, 2) - 0.5) * 360 + hot * 8}
              o={1 - dead * 0.55}
            >
              <FileIcon
                w={50}
                fill={hot > 0.05 ? `rgba(239,86,56,${hot})` : C.paper}
                stroke={dead > 0 && hot < 0.5 ? C.grey : C.ink}
                lit={hot}
                open={dead}
              />
            </At>
          );
        })}
        {P.visits.map((v, i) => {
          const k = (t - v) / 0.6;
          if (k < 0 || k > 1) return null;
          const c = cells[visitCells[i]];
          return (
            <At
              key={`tok${i}`}
              x={c.x + 36}
              y={c.y - 30 - EASE.out(k) * 40}
              s={sp(t, v, { damping: 9, stiffness: 320 }) * (1 - imp)}
              o={1 - Math.pow(k, 3)}
              z={5}
            >
              <div
                style={{
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 22,
                  color: C.ivory,
                  background: C.red,
                  padding: "3px 9px",
                  borderRadius: 8,
                  whiteSpace: "nowrap",
                }}
              >
                +{(1.2 + rand(i, 7) * 3.8).toFixed(1)}k tok
              </div>
            </At>
          );
        })}
        {/* Searchlight lens */}
        <At
          x={lerp(lx, 960, imp)}
          y={lerp(ly, 540, imp)}
          s={lensIn * (1 + pulse(t, P.visits, 0.06) * 0.18) * (1 - imp)}
          r={-20}
        >
          <svg width={170} height={170} viewBox="0 0 170 170" style={{ overflow: "visible" }}>
            <circle
              cx={70}
              cy={70}
              r={52}
              fill="rgba(239,86,56,0.12)"
              stroke={C.red}
              strokeWidth={9}
            />
            <line
              x1={108}
              y1={108}
              x2={150}
              y2={150}
              stroke={C.red}
              strokeWidth={16}
              strokeLinecap="round"
            />
          </svg>
        </At>
      </div>

      {/* Token meter */}
      <div
        style={{
          ...abs,
          transform: `translate(${1410 + imp * 200}px, 820px)`,
          opacity: sp(t, 0.9) * (1 - imp),
          fontFamily: MONO,
          color: C.ink,
        }}
      >
        <div style={{ fontSize: 20, letterSpacing: 4, color: C.grey }}>AGENT CONTEXT SPENT</div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            letterSpacing: -3,
            transform: `scale(${1 + kickCounter * 0.08})`,
            transformOrigin: "left center",
            color: kickCounter > 0.5 ? C.red : C.ink,
          }}
        >
          {tokens.toLocaleString("en-US")}
          <span style={{ fontSize: 30, color: C.grey, marginLeft: 12, letterSpacing: 0 }}>tok</span>
        </div>
        <div
          style={{ height: 8, width: 380, background: C.line, borderRadius: 4, overflow: "hidden" }}
        >
          <div style={{ height: 8, width: 380 * clamp01(tokens / 170000), background: C.red }} />
        </div>
      </div>

      {/* Kinetic caption */}
      <div
        style={{
          ...abs,
          transform: `translate(${110 - imp * 300}px, ${716}px) scale(${1 - imp * 0.3})`,
          fontFamily: SERIF,
          fontWeight: 800,
          fontSize: 108,
          lineHeight: 1.02,
          letterSpacing: -3.5,
          color: C.ink,
          opacity: 1 - imp,
        }}
      >
        <div>
          {P.words.slice(0, 4).map(([at, w]) => (
            <MaskWord
              key={w}
              t={t}
              at={at}
              style={w === "tokens" ? { color: C.red, fontStyle: "italic" } : undefined}
            >
              {w}
            </MaskWord>
          ))}
        </div>
        <div style={{ fontWeight: 400, fontSize: 84, letterSpacing: -2 }}>
          {P.words.slice(4).map(([at, w]) => (
            <MaskWord key={w} t={t} at={at}>
              {w}
            </MaskWord>
          ))}
        </div>
      </div>

      {/* Core dot forms as everything collapses */}
      {t > P.implode && (
        <At x={960} y={540} s={map(t, [P.implode, 3.93, 4.0], [0, 1.25, 0.8])}>
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: C.red }} />
        </At>
      )}
    </div>
  );
};
