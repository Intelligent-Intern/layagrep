import React from "react";
import { B } from "../cues";
import { C, EASE, clamp01, kick, lerp, map, rand, ramp, shake, sp, wobble } from "../lib/anim";
import { At, Burst, Confetti, MONO, MaskWord, SANS, SERIF, Shockwave, abs } from "../lib/ui";

const BASE = 7.62,
  WITH = 4.52;
const PX = 128; // px per dollar
const X0 = 470;
const ROW1 = 470,
  ROW2 = 640,
  BAR_H = 110;
const SHARDS = 7;

export const Bench: React.FC<{ t: number }> = ({ t }) => {
  const kp = kick(t, 0.1);
  const wipeRed = ramp(t, B.wipe - 0.02, B.wipe + 0.28, EASE.in);
  const wipeIvory = ramp(t, B.wipe + 0.06, B.wipe + 0.4, EASE.out);

  const g1 = ramp(t, B.baseGrow[0], B.baseGrow[1], EASE.inOut);
  const g2 = ramp(t, B.jgGrow[0], B.jgGrow[1], EASE.inOut);
  const v1 = BASE * g1,
    v2 = WITH * g2;
  const build = ramp(t, 21.0, B.slam, (x) => x * x);
  const slam = sp(t, B.slam, { damping: 8, stiffness: 220, mass: 0.8 });
  const sh = shake(
    t,
    [
      [B.slam, 34],
      [B.slam + 0.12, 10],
    ],
    "b",
  );
  const settle = sp(t, B.words[0] - 0.2, { damping: 16, stiffness: 110 });
  const exit = ramp(t, 25.7, 26.0, EASE.in);

  const camS = (1 + build * 0.06 + kp * 0.008) * (1 - settle * 0.04) * (1 + exit * 0.3);
  const crackX = X0 + WITH * PX;

  return (
    <div style={{ ...abs, width: 1920, height: 1080, background: C.night, overflow: "hidden" }}>
      <svg style={abs} width={1920} height={1080}>
        <circle cx={960} cy={540} r={wipeRed * 1200} fill={C.red} />
        <circle cx={960} cy={540} r={wipeIvory * 1200} fill={C.ivory} />
      </svg>
      <div
        style={{
          ...abs,
          width: 1920,
          height: 1080,
          opacity: 1 - exit,
          transformOrigin: "960px 560px",
          transform: `translate(${sh.x + build * Math.sin(t * 90) * 2}px, ${sh.y}px) rotate(${sh.r}deg) scale(${camS})`,
        }}
      >
        {/* header */}
        <div
          style={{
            ...abs,
            left: 110,
            top: 110,
            fontFamily: MONO,
            fontSize: 20,
            letterSpacing: 6,
            color: C.grey,
            opacity: ramp(t, B.label, B.label + 0.2),
          }}
        >
          {"SWE-BENCH · 10-TASK REPEAT · FULL TASK COST".slice(
            0,
            Math.floor(44 * ramp(t, B.label, B.label + 0.35, (x) => x)),
          )}
        </div>
        <div
          style={{
            ...abs,
            left: 110,
            top: 150,
            fontFamily: SERIF,
            fontWeight: 800,
            fontSize: 70,
            letterSpacing: -2.5,
            color: C.ink,
            whiteSpace: "nowrap",
          }}
        >
          <MaskWord t={t} at={B.label + 0.05}>
            Codex,
          </MaskWord>
          <MaskWord t={t} at={B.label + 0.15}>
            prompted
          </MaskWord>
          <MaskWord t={t} at={B.label + 0.25}>
            to
          </MaskWord>
          <MaskWord t={t} at={B.label + 0.3}>
            use
          </MaskWord>
          <MaskWord
            t={t}
            at={B.label + 0.4}
            style={{ color: C.red, fontFamily: MONO, fontWeight: 700, fontSize: 64 }}
          >
            jg
          </MaskWord>
          <MaskWord t={t} at={B.label + 0.5}>
            as
          </MaskWord>
          <MaskWord t={t} at={B.label + 0.55}>
            its
          </MaskWord>
          <MaskWord t={t} at={B.label + 0.65} style={{ fontStyle: "italic" }}>
            researcher.
          </MaskWord>
        </div>

        {/* axis */}
        <div
          style={{
            ...abs,
            left: X0 - 2,
            top: ROW1 - 90,
            width: 3,
            height: 420,
            background: C.ink,
            transform: `scaleY(${ramp(t, B.label, B.label + 0.4)})`,
            transformOrigin: "top",
          }}
        />
        {[0, 2, 4, 6, 8].map((d, i) => (
          <div
            key={d}
            style={{
              ...abs,
              left: X0 + d * PX,
              top: ROW2 + BAR_H + 30,
              fontFamily: MONO,
              fontSize: 18,
              color: C.grey,
              opacity: ramp(t, B.label + 0.1 + i * 0.05, B.label + 0.3 + i * 0.05),
              transform: "translateX(-50%)",
            }}
          >
            ${d}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: -330 - 30,
                width: 1,
                height: 340,
                background: C.line,
                zIndex: -1,
              }}
            />
          </div>
        ))}

        {/* Row 1: baseline */}
        <Label y={ROW1} t={t} at={B.baseGrow[0] - 0.15} title="Codex alone" sub="baseline" />
        <div
          style={{
            ...abs,
            left: X0,
            top: ROW1,
            height: BAR_H,
            width: Math.max(0, t < B.slam ? v1 * PX : WITH * PX),
            background: C.ink,
            borderRadius: "0 10px 10px 0",
          }}
        />
        {/* the surplus — dashed ghost after it snaps off */}
        {t >= B.slam && (
          <div
            style={{
              ...abs,
              left: crackX,
              top: ROW1,
              height: BAR_H,
              width: (BASE - WITH) * PX,
              border: `3px dashed ${C.grey}`,
              borderLeft: "none",
              borderRadius: "0 10px 10px 0",
              boxSizing: "border-box",
              opacity: ramp(t, B.slam + 0.3, B.slam + 0.8) * 0.8,
            }}
          />
        )}
        {t >= B.slam &&
          Array.from({ length: SHARDS }, (_, i) => {
            const dt = t - B.slam;
            const w = ((BASE - WITH) * PX) / SHARDS;
            const vx = 120 + rand(i, 1) * 380,
              vy = -300 - rand(i, 2) * 500;
            const x = crackX + i * w + vx * dt;
            const y = ROW1 + vy * dt + 1800 * dt * dt * 0.5;
            if (y > 1300) return null;
            return (
              <div
                key={i}
                style={{
                  ...abs,
                  left: x,
                  top: y,
                  width: w - 4,
                  height: BAR_H * (0.5 + rand(i, 3) * 0.5),
                  background: C.ink,
                  borderRadius: 6,
                  transform: `rotate(${(rand(i, 4) - 0.5) * 900 * dt}deg)`,
                }}
              />
            );
          })}
        <Price
          x={X0 + (t < B.slam ? v1 : BASE) * PX + 26}
          y={ROW1 + BAR_H / 2}
          v={t < B.slam ? v1 : BASE}
          t={t}
          at={B.baseGrow[0]}
          col={t >= B.slam ? C.grey : C.ink}
          strike={t >= B.slam ? ramp(t, B.slam + 0.1, B.slam + 0.35) : 0}
        />

        {/* Row 2: with jg */}
        <Label
          y={ROW2}
          t={t}
          at={B.jgGrow[0] - 0.15}
          title="Codex + jg"
          sub="Jev research agent"
          red
        />
        <div
          style={{
            ...abs,
            left: X0,
            top: ROW2,
            height: BAR_H,
            width: v2 * PX * (1 + wobble(t, B.jgGrow[1], 22, 0.1) * 0.03),
            background: C.red,
            borderRadius: "0 10px 10px 0",
            transformOrigin: "left",
          }}
        />
        <Price
          x={X0 + v2 * PX + 26}
          y={ROW2 + BAR_H / 2}
          v={v2}
          t={t}
          at={B.jgGrow[0]}
          col={C.red}
        />

        {/* SLAM */}
        <Shockwave t={t} at={B.slam} x={crackX + 200} y={ROW1 + 40} max={1400} width={50} />
        <Shockwave
          t={t}
          at={B.slam + 0.06}
          x={crackX + 200}
          y={ROW1 + 40}
          max={900}
          width={12}
          color={C.ink}
        />
        <Burst
          t={t}
          at={B.slam}
          x={crackX + 260}
          y={ROW1 + 40}
          n={24}
          r0={180}
          r1={620}
          width={10}
        />
        {t >= B.slam - 0.01 && (
          <At
            x={lerp(crackX + 330, crackX + ((BASE - WITH) * PX) / 2, settle)}
            y={lerp(ROW1 + 30, ROW1 + BAR_H / 2, settle)}
            s={
              map(slam, [0, 1], [4, 1]) *
              lerp(1, 0.46, settle) *
              (1 + wobble(t, B.slam + 0.08, 20, 0.1) * 0.08)
            }
            r={lerp(-8, -4, settle)}
            o={clamp01(slam * 4)}
          >
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 900,
                fontSize: 300,
                letterSpacing: -14,
                color: C.red,
                lineHeight: 1,
                textShadow: `8px 10px 0 ${C.ink}`,
              }}
            >
              −40%
            </div>
          </At>
        )}
        <Confetti t={t} at={B.slam + 0.02} x={crackX + 300} y={ROW1 + 40} n={46} seed={3} />

        {/* caption */}
        <div
          style={{
            ...abs,
            left: X0,
            top: 836,
            width: 1300,
            textAlign: "left",
            fontFamily: SERIF,
            fontWeight: 800,
            fontSize: 62,
            letterSpacing: -2,
            color: C.ink,
          }}
        >
          {["cheaper", "Codex", "runs", "on", "SWE-bench."].map((w, i) => (
            <MaskWord
              key={w}
              t={t}
              at={B.words[i]}
              style={i === 0 ? { fontStyle: "italic", color: C.red } : undefined}
            >
              {w}
            </MaskWord>
          ))}
        </div>

        {/* disclosure */}
        <div
          style={{
            ...abs,
            left: 110,
            top: 948,
            width: 1700,
            fontFamily: SANS,
            fontSize: 21,
            lineHeight: 1.5,
            color: "#6F6A61",
            opacity: ramp(t, B.foot, B.foot + 0.4),
            transform: `translateY(${(1 - ramp(t, B.foot, B.foot + 0.5)) * 20}px)`,
          }}
        >
          $7.62 → $4.52 full Codex task cost across 10 tasks, failures included; Jev cost excluded.
          Solves: 7/10 with jg vs 8/10 baseline.
          <br />
          Single repeat on a tuned Python subset — a cost reduction with a quality tradeoff, not a
          guarantee.
        </div>
      </div>
    </div>
  );
};

const Label: React.FC<{
  y: number;
  t: number;
  at: number;
  title: string;
  sub: string;
  red?: boolean;
}> = ({ y, t, at, title, sub, red }) => {
  const s = sp(t, at, { damping: 15, stiffness: 200 });
  return (
    <div
      style={{
        ...abs,
        left: 110,
        top: y + 14,
        width: 330,
        opacity: s,
        transform: `translateX(${(1 - s) * -40}px)`,
      }}
    >
      <div
        style={{
          fontFamily: SERIF,
          fontWeight: 800,
          fontSize: 44,
          letterSpacing: -1.2,
          color: red ? C.red : C.ink,
        }}
      >
        {title}
      </div>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 17,
          letterSpacing: 2,
          color: C.grey,
          textTransform: "uppercase",
        }}
      >
        {sub}
      </div>
    </div>
  );
};

const Price: React.FC<{
  x: number;
  y: number;
  v: number;
  t: number;
  at: number;
  col: string;
  strike?: number;
}> = ({ x, y, v, t, at, col, strike = 0 }) => {
  if (t < at) return null;
  return (
    <div
      style={{
        ...abs,
        left: x,
        top: y,
        transform: "translateY(-50%)",
        fontFamily: SERIF,
        fontWeight: 900,
        fontSize: 76,
        letterSpacing: -2,
        color: col,
        whiteSpace: "nowrap",
      }}
    >
      ${v.toFixed(2)}
      {strike > 0 && (
        <div
          style={{
            position: "absolute",
            left: -6,
            top: "54%",
            height: 7,
            width: `${strike * 106}%`,
            background: C.ink,
            transform: "rotate(-6deg)",
          }}
        />
      )}
    </div>
  );
};
