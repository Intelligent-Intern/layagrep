import React from "react";
import { O } from "../cues";
import { C, EASE, clamp01, kick, pulse, rand, ramp, shake, sp } from "../lib/anim";
import { At, Burst, MONO, MaskWord, SANS, SERIF, Shockwave, abs } from "../lib/ui";
import { Wordmark } from "./Reveal";

// Faint cover-style discovery tree behind the lockup, with a red path tracing through it.
const NODES = Array.from({ length: 26 }, (_, i) => ({
  x: 180 + rand(i, 11) * 1560,
  y: 120 + rand(i, 12) * 840,
}));
const EDGES = NODES.map((_, i) => [i, Math.floor(rand(i, 13) * NODES.length)]).filter(
  ([a, b]) => a !== b,
);
const PATH = [0, 5, 9, 14, 20];

export const Outro: React.FC<{ t: number }> = ({ t }) => {
  const kp = kick(t, 0.1);
  const sh = shake(t, [[O.hit, 12]], "o");
  const drift = ramp(t, O.hit, 30, (x) => x);
  const typed = Math.floor(O.install.length * clamp01((t - O.pill) / (O.pillEnd - O.pill)));
  const pillIn = sp(t, O.pill - 0.15, { damping: 12, stiffness: 200 });
  const ding = pulse(t, [O.ding], 0.25);
  return (
    <div style={{ ...abs, width: 1920, height: 1080, background: C.ivory, overflow: "hidden" }}>
      <svg
        style={{
          ...abs,
          transform: `scale(${1.05 + drift * 0.05})`,
          transformOrigin: "960px 540px",
        }}
        width={1920}
        height={1080}
      >
        {EDGES.map(([a, b], i) => {
          const k = ramp(t, O.hit + i * 0.03, O.hit + 0.6 + i * 0.03);
          const A = NODES[a],
            Bn = NODES[b];
          return (
            <path
              key={i}
              d={`M${A.x} ${A.y} V${(A.y + Bn.y) / 2} H${Bn.x} V${Bn.y}`}
              pathLength={1}
              fill="none"
              stroke={C.line}
              strokeWidth={2}
              strokeDasharray="1 1"
              strokeDashoffset={1 - k}
            />
          );
        })}
        {PATH.slice(1).map((b, i) => {
          const A = NODES[PATH[i]],
            Bn = NODES[b];
          const k = ramp(t, O.tagline + i * 0.25, O.tagline + 0.3 + i * 0.25);
          return (
            <path
              key={i}
              d={`M${A.x} ${A.y} V${(A.y + Bn.y) / 2} H${Bn.x} V${Bn.y}`}
              pathLength={1}
              fill="none"
              stroke={C.red}
              strokeWidth={3}
              strokeDasharray="1 1"
              strokeDashoffset={1 - k}
              opacity={0.35}
            />
          );
        })}
        {NODES.map((n, i) => (
          <rect
            key={i}
            x={n.x - 9}
            y={n.y - 11}
            width={18}
            height={22}
            rx={3}
            fill={
              PATH.includes(i) && t > O.tagline + PATH.indexOf(i) * 0.25
                ? "rgba(239,86,56,0.4)"
                : C.line
            }
            transform={`rotate(0 ${n.x} ${n.y})`}
            opacity={sp(t, O.hit + i * 0.02)}
          />
        ))}
      </svg>
      {/* soft ivory halo so the lockup reads over the tree */}
      <div
        style={{
          ...abs,
          width: 1920,
          height: 1080,
          background: `radial-gradient(760px 420px at 960px 520px, ${C.ivory} 55%, rgba(244,239,228,0))`,
        }}
      />

      <div
        style={{
          ...abs,
          width: 1920,
          height: 1080,
          transformOrigin: "960px 540px",
          transform: `translate(${sh.x}px, ${sh.y}px) scale(${1 + kp * 0.006 + drift * 0.03})`,
        }}
      >
        <Shockwave t={t} at={O.hit} x={960} y={420} max={1100} width={30} />
        <Burst t={t} at={O.hit} x={960} y={420} n={18} r0={260} r1={560} width={7} />
        <At x={960} y={400}>
          <Wordmark t={t} at={O.hit} size={250} dotAt={O.hit + 0.35} mode="pop" ringAt={O.ding} />
        </At>
        <div
          style={{
            ...abs,
            width: 1920,
            top: 570,
            textAlign: "center",
            fontFamily: SERIF,
            fontWeight: 600,
            fontSize: 60,
            letterSpacing: -1.5,
            color: C.ink,
          }}
        >
          {["Find", "the", "context."].map((w, i) => (
            <MaskWord key={w} t={t} at={O.tagline + i * 0.08}>
              {w}
            </MaskWord>
          ))}
          {["Start", "coding."].map((w, i) => (
            <MaskWord
              key={w}
              t={t}
              at={O.tagline + 0.3 + i * 0.08}
              style={{ fontStyle: "italic", color: C.red }}
            >
              {w}
            </MaskWord>
          ))}
        </div>
        <At x={960} y={742} s={pillIn * (1 + ding * 0.03)}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "20px 34px",
              borderRadius: 18,
              background: C.ink,
              fontFamily: MONO,
              fontSize: 34,
              color: C.ivory,
              minWidth: 560,
              boxShadow: "0 24px 50px rgba(18,18,18,0.22)",
            }}
          >
            <span style={{ color: C.red, fontWeight: 700 }}>›</span>
            <span>{O.install.slice(0, typed)}</span>
            <span
              style={{
                width: 14,
                height: 36,
                background: C.red,
                opacity: Math.floor(t * 4) % 2 || t < O.pillEnd ? 1 : 0,
                marginLeft: -12,
              }}
            />
          </div>
        </At>
        <div
          style={{
            ...abs,
            width: 1920,
            top: 832,
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 24,
            letterSpacing: 2,
            color: C.grey,
            opacity: ramp(t, O.url, O.url + 0.3),
            transform: `translateY(${(1 - ramp(t, O.url, O.url + 0.4, EASE.out)) * 16}px)`,
          }}
        >
          github.com/dzhng/jevgrep <span style={{ color: C.line }}>·</span> MIT{" "}
          <span style={{ color: C.line }}>·</span>{" "}
          <span style={{ fontFamily: SANS }}>Node 22+</span>
        </div>
      </div>
    </div>
  );
};
