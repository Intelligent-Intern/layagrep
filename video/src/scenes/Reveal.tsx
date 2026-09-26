import React from "react";
import { R } from "../cues";
import { C, EASE, clamp01, kick, lerp, map, pulse, ramp, shake, sp, wobble } from "../lib/anim";
import { At, Burst, MONO, MaskWord, SANS, SERIF, Shockwave, abs } from "../lib/ui";

const LETTERS = ["ȷ", "e", "v", "g", "r", "e", "p"];
const SUB = ["Find", "code", "by", "asking", "what", "it", "does."];
const OUT = [
  { txt: "● summary   3 files · 2 leads · 4 excerpts · complete", col: C.red },
  { txt: "  src/db/connection.py       impl   L50–71   source", col: "#E9E3D6" },
  { txt: "  src/db/pool.py             impl   L12–48   lead", col: "#E9E3D6" },
  { txt: "  tests/test_connection.py   test   L5–31    source", col: "#E9E3D6" },
  { txt: "  ── 50 │ def create_engine(url, pool_size=10):", col: C.blue },
];

export const Wordmark: React.FC<{
  t: number;
  at: number;
  size: number;
  dotAt: number;
  mode?: "drop" | "pop";
  ringAt?: number;
  color?: string;
}> = ({ t, at, size, dotAt, mode = "drop", ringAt, color = C.ink }) => {
  return (
    <div
      style={{
        position: "relative",
        fontFamily: SERIF,
        fontWeight: 900,
        fontSize: size,
        letterSpacing: -size * 0.035,
        color,
        lineHeight: 1,
        display: "flex",
      }}
    >
      {LETTERS.map((l, i) => {
        const la = mode === "drop" ? at + i * R.letterStep : at + Math.abs(i - 3) * 0.045;
        const s = sp(
          t,
          la,
          mode === "drop"
            ? { damping: 14, stiffness: 260, mass: 0.6 }
            : { damping: 9, stiffness: 240, mass: 0.6 },
        );
        const land = la + 0.12;
        const w = wobble(t, land, 30, 0.08);
        const y = mode === "drop" ? (1 - s) * -520 : 0;
        const sc = mode === "drop" ? 1 : s;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              transformOrigin: "50% 100%",
              opacity: clamp01(s * 4),
              transform: `translateY(${y}px) scale(${sc * (1 + w * 0.12)}, ${sc * (1 - w * 0.18)}) rotate(${(1 - s) * (i % 2 ? 14 : -14)}deg)`,
            }}
          >
            {l}
          </span>
        );
      })}
      {/* The tittle of the j is the red dot from the cold open. */}
      <JDot t={t} at={dotAt} size={size} ringAt={ringAt} />
    </div>
  );
};

const JDot: React.FC<{ t: number; at: number; size: number; ringAt?: number }> = ({
  t,
  at,
  size,
  ringAt,
}) => {
  const d = size * 0.21;
  const land = { x: size * 0.24, y: size * 0.2 };
  const k = ramp(t, at - 0.35, at, (x) => x);
  if (t < at - 0.35) return null;
  // Parabolic hop from the word's center up and onto the j.
  const sx = size * 1.7,
    sy = size * 0.45;
  const x = lerp(sx, land.x, EASE.out(k));
  const y = lerp(sy, land.y, k) - Math.sin(Math.PI * k) * size * 0.55;
  const w = wobble(t, at, 26, 0.09);
  const rk = ringAt !== undefined ? (t - ringAt) / 0.9 : -1;
  const ring = ringAt !== undefined ? pulse(t, [ringAt], 0.12) : 0;
  return (
    <>
      {rk > 0 && rk < 1 && (
        <div
          style={{
            position: "absolute",
            left: x - d * 3,
            top: y - d * 3,
            width: d * 6,
            height: d * 6,
            borderRadius: "50%",
            border: `${4 * (1 - rk)}px solid ${C.red}`,
            transform: `scale(${0.2 + EASE.out(rk) * 0.8})`,
            opacity: 1 - rk,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: x - d / 2,
          top: y - d / 2,
          width: d,
          height: d,
          borderRadius: "50%",
          background: C.red,
          transform: `scale(${(1 + w * 0.3) * (1 + ring * 0.35)}, ${(1 - w * 0.35) * (1 + ring * 0.35)})`,
          transformOrigin: "50% 100%",
        }}
      />
    </>
  );
};

export const Reveal: React.FC<{ t: number }> = ({ t }) => {
  const shift = sp(t, R.shift, { damping: 16, stiffness: 120, mass: 0.9 });
  const termIn = sp(t, R.shift + 0.05, { damping: 14, stiffness: 120, mass: 0.9 });
  const typed = Math.floor(
    R.command.length * clamp01((t - R.typeStart) / (R.typeEnd - R.typeStart)),
  );
  const enterP = pulse(t, [R.enter], 0.08);
  const zoom = ramp(t, R.zoom, 8.0, EASE.in);
  const sh = shake(
    t,
    [
      [R.letters, 16],
      [R.enter, 4],
    ],
    "r",
  );
  const kp = kick(t);
  const cursorOn = Math.floor(t * 4) % 2 === 0 || (t > R.typeStart && t < R.enter);

  // Dot sits at center through the blast, then leaps to become the j's tittle.
  const holdDot = t < R.dotLand - 0.35;

  const logoY = lerp(470, 212, shift);
  const logoS = lerp(1, 0.52, shift);
  const termCenter = { x: 960, y: 690 };

  return (
    <div style={{ ...abs, width: 1920, height: 1080, background: C.ivory, overflow: "hidden" }}>
      <div
        style={{
          ...abs,
          width: 1920,
          height: 1080,
          transformOrigin: `${termCenter.x}px ${termCenter.y + 40}px`,
          transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(${(1 + kp * 0.006) * (1 + zoom * zoom * 26)})`,
        }}
      >
        <Shockwave t={t} at={R.letters} x={960} y={540} max={1300} width={40} />
        <Shockwave
          t={t}
          at={R.letters + 0.08}
          x={960}
          y={540}
          max={900}
          color={C.ink}
          width={10}
          dur={0.6}
        />
        <Burst t={t} at={R.letters} x={960} y={540} n={22} r0={80} r1={700} width={10} />
        {holdDot && (
          <At
            x={960}
            y={540}
            s={map(t, [4, 4.06, 4.2], [0.8, 1.9, 1]) * (1 + wobble(t, 4.06, 30, 0.1) * 0.2)}
          >
            <div style={{ width: 90, height: 90, borderRadius: "50%", background: C.red }} />
          </At>
        )}

        <At x={960} y={logoY} s={logoS}>
          <Wordmark t={t} at={R.letters} size={300} dotAt={R.dotLand} />
        </At>
        <At x={960} y={lerp(700, 372, shift)} s={lerp(1, 0.78, shift)}>
          <div
            style={{
              fontFamily: SANS,
              fontWeight: 500,
              fontSize: 54,
              color: C.ink,
              letterSpacing: -1,
              whiteSpace: "nowrap",
            }}
          >
            {SUB.map((w, i) => (
              <MaskWord
                key={i}
                t={t}
                at={R.subtitle + i * R.subStep}
                style={
                  w === "asking"
                    ? { color: C.red, fontFamily: SERIF, fontStyle: "italic", fontWeight: 800 }
                    : undefined
                }
              >
                {w}
              </MaskWord>
            ))}
          </div>
        </At>

        {/* Terminal */}
        <div
          style={{
            ...abs,
            perspective: 1600,
            transform: `translate(${termCenter.x - 640}px, ${termCenter.y - 190 + (1 - termIn) * 700}px)`,
          }}
        >
          <div
            style={{
              width: 1280,
              height: 400,
              borderRadius: 24,
              background: C.ink,
              boxShadow: `0 ${30 + 10 * enterP}px 80px rgba(18,18,18,0.28)`,
              transform: `rotateX(${(1 - termIn) * 35}deg) scale(${1 + enterP * 0.025})`,
              overflow: "hidden",
              fontFamily: MONO,
            }}
          >
            <div
              style={{
                height: 46,
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "0 20px",
                borderBottom: "1px solid #2A2A2C",
              }}
            >
              {[C.red, "#E8B04B", "#6BB57E"].map((c, i) => (
                <div
                  key={i}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    background: c,
                    transform: `scale(${sp(t, R.shift + 0.2 + i * 0.06)})`,
                  }}
                />
              ))}
              <div style={{ marginLeft: 18, color: "#77736B", fontSize: 18 }}>~/my-repo — zsh</div>
            </div>
            <div
              style={{ padding: "26px 34px", fontSize: 30, color: "#F4EFE4", whiteSpace: "pre" }}
            >
              <span style={{ color: C.red, fontWeight: 700 }}>›&nbsp;</span>
              <Cmd s={R.command.slice(0, typed)} />
              {cursorOn && t < R.enter + 0.1 && (
                <span
                  style={{
                    display: "inline-block",
                    width: 16,
                    height: 34,
                    background: C.red,
                    verticalAlign: "-6px",
                    marginLeft: 2,
                  }}
                />
              )}
              <div style={{ marginTop: 16, fontSize: 23, lineHeight: 1.62 }}>
                {OUT.map((l, i) => {
                  const at = R.enter + 0.1 + i * R.outStep;
                  const s = sp(t, at, { damping: 18, stiffness: 260 });
                  return (
                    <div
                      key={i}
                      style={{
                        color: l.col,
                        opacity: s,
                        transform: `translateX(${(1 - s) * -60}px)`,
                      }}
                    >
                      {l.txt}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Final frames of the dive: ink takes over. */}
      <div
        style={{
          ...abs,
          width: 1920,
          height: 1080,
          background: C.night,
          opacity: ramp(t, 7.82, 8.0, (x) => x),
        }}
      />
    </div>
  );
};

const Cmd: React.FC<{ s: string }> = ({ s }) => {
  const q = s.indexOf('"');
  if (q < 0) return <span style={{ fontWeight: 700 }}>{s}</span>;
  return (
    <>
      <span style={{ fontWeight: 700 }}>{s.slice(0, q)}</span>
      <span style={{ color: C.blue }}>{s.slice(q)}</span>
    </>
  );
};
