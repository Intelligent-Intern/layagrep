import React from "react";
import { J } from "../cues";
import {
  C,
  EASE,
  clamp01,
  kick,
  lerp,
  map,
  pulse,
  rand,
  ramp,
  shake,
  sp,
  wobble,
} from "../lib/anim";
import {
  At,
  Burst,
  DotGrid,
  FileIcon,
  FolderIcon,
  MONO,
  MaskWord,
  SANS,
  SERIF,
  Shockwave,
  abs,
} from "../lib/ui";

const CHIP = { x: 960, y: 430 };
const SPAWNS = (() => {
  const out: { t: number; y: number; ok: boolean; kind: number; i: number }[] = [];
  let i = 0;
  for (let t = J.stream - 0.4; t < J.streamEnd - 0.4; t += 0.0625) {
    for (let k = 0; k < 3; k++, i++)
      out.push({
        t: t + rand(i, 5) * 0.06,
        y: 120 + rand(i, 1) * 840,
        ok: rand(i, 2) < 0.28,
        kind: Math.floor(rand(i, 3) * 3),
        i,
      });
  }
  return out;
})();
const TRAVEL_IN = 0.42,
  TRAVEL_OUT = 0.6;

export const Chip: React.FC<{ t: number; size: number; spin: number; glow: number }> = ({
  t,
  size,
  spin,
  glow,
}) => (
  <div style={{ position: "relative", width: size, height: size }}>
    {/* orbit rings */}
    <svg
      style={{ position: "absolute", left: -size * 0.45, top: -size * 0.45, overflow: "visible" }}
      width={size * 1.9}
      height={size * 1.9}
      viewBox="0 0 190 190"
    >
      <g transform={`rotate(${spin * 90} 95 95)`}>
        <circle
          cx={95}
          cy={95}
          r={90}
          fill="none"
          stroke={C.red}
          strokeWidth={1.2}
          strokeDasharray="3 7"
          opacity={0.7}
        />
      </g>
      <g transform={`rotate(${-spin * 140} 95 95)`}>
        <circle
          cx={95}
          cy={95}
          r={78}
          fill="none"
          stroke="#F4EFE4"
          strokeWidth={0.8}
          strokeDasharray="40 18 6 18"
          opacity={0.35}
        />
      </g>
    </svg>
    {/* pins */}
    {[0, 1, 2, 3].map((side) =>
      [0.3, 0.5, 0.7].map((p, j) => {
        const horiz = side % 2 === 0;
        const s = {
          width: horiz ? 6 : 18,
          height: horiz ? 18 : 6,
          background: "#5A5650",
          borderRadius: 2,
          position: "absolute" as const,
        };
        const pos =
          side === 0
            ? { left: p * size - 3, top: -16 }
            : side === 2
              ? { left: p * size - 3, top: size - 2 }
              : side === 1
                ? { left: size - 2, top: p * size - 3 }
                : { left: -16, top: p * size - 3 };
        return <div key={`${side}-${j}`} style={{ ...s, ...pos }} />;
      }),
    )}
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: size * 0.2,
        background: `linear-gradient(145deg, #F26A4E, ${C.red} 45%, ${C.redDeep})`,
        boxShadow: `0 0 ${60 + glow * 80}px rgba(239,86,56,${0.35 + glow * 0.4}), inset 0 2px 0 rgba(255,255,255,0.25)`,
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: size * 0.1,
        borderRadius: size * 0.12,
        border: "2px solid rgba(244,239,228,0.35)",
      }}
    />
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: SERIF,
        fontWeight: 900,
        fontSize: size * 0.34,
        color: C.ivory,
        letterSpacing: -2,
      }}
    >
      Jev
    </div>
  </div>
);

export const Jev: React.FC<{ t: number }> = ({ t }) => {
  const kp = kick(t, 0.1);
  const chatter = pulse(
    t,
    SPAWNS.map((s) => s.t + TRAVEL_IN),
    0.05,
  );
  const slam = sp(t, J.slam, { damping: 9, stiffness: 200, mass: 0.7 });
  const sh = shake(
    t,
    [
      [J.slam, 18],
      [J.askArrive, 3],
      [J.answerArrive, 4],
    ],
    "j",
  );
  const toHandoff = sp(t, J.handoff, { damping: 16, stiffness: 120, mass: 0.9 });
  const streamFade = 1 - ramp(t, J.handoff - 0.3, J.handoff, EASE.in);

  const chipX = lerp(CHIP.x, 1340, toHandoff),
    chipY = lerp(CHIP.y, 470, toHandoff);
  const chipSize = lerp(250, 190, toHandoff);
  const judged = SPAWNS.filter((s) => t > s.t + TRAVEL_IN).length;
  const relevant = SPAWNS.filter((s) => s.ok && t > s.t + TRAVEL_IN).length;

  return (
    <div style={{ ...abs, width: 1920, height: 1080, background: C.night, overflow: "hidden" }}>
      <DotGrid color="#F4EFE4" opacity={0.05 + kp * 0.06} offset={-t * 30} />
      <div
        style={{
          ...abs,
          width: 1920,
          height: 1080,
          background: `radial-gradient(700px 520px at ${chipX}px ${chipY}px, rgba(239,86,56,${0.16 + kp * 0.08 + chatter * 0.05}), transparent 70%)`,
        }}
      />

      <div
        style={{
          ...abs,
          width: 1920,
          height: 1080,
          transformOrigin: "960px 540px",
          transform: `translate(${sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(${1 + kp * 0.01})`,
        }}
      >
        {/* the packet from the engine scene arrives and gets absorbed */}
        {t < J.slam + 0.1 && (
          <At
            x={lerp(-300, CHIP.x, ramp(t, J.slam - 0.12, J.slam, EASE.in))}
            y={CHIP.y}
            sx={3}
            sy={0.6}
          >
            <div
              style={{
                padding: "14px 30px",
                borderRadius: 40,
                background: C.red,
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 26,
                color: C.ivory,
              }}
            >
              jg
            </div>
          </At>
        )}

        {/* particle stream */}
        <div style={{ ...abs, opacity: streamFade }}>
          {SPAWNS.map((p) => {
            const a = (t - p.t) / TRAVEL_IN;
            const b = (t - p.t - TRAVEL_IN) / TRAVEL_OUT;
            if (a < 0 || b > 1) return null;
            let x: number,
              y: number,
              s: number,
              o = 1,
              r = 0;
            if (a < 1) {
              const e = EASE.in(a);
              x = lerp(-80, CHIP.x - 60, e);
              y = lerp(p.y, CHIP.y, Math.pow(e, 0.7));
              s = lerp(0.8, 0.3, e);
              r = (1 - e) * (rand(p.i, 8) - 0.5) * 120;
            } else if (p.ok) {
              const e = EASE.out(b);
              x = lerp(CHIP.x + 60, 1700, e);
              y = lerp(CHIP.y, 250 + (p.i % 5) * 18, e) - Math.sin(Math.PI * e) * 80;
              s = lerp(0.3, 0.75, e);
              o = 1 - Math.pow(b, 4);
            } else {
              x = CHIP.x + 60 + b * (380 + rand(p.i, 6) * 300);
              y = CHIP.y + 40 + b * b * 560;
              s = 0.45;
              o = 0.6 * (1 - b);
              r = b * 200 * (rand(p.i) - 0.5);
            }
            const litCol = a >= 1 && p.ok;
            return (
              <At key={p.i} x={x} y={y} s={s} r={r} o={o}>
                {p.kind === 0 ? (
                  <FolderIcon w={54} fill={litCol ? C.red : "#3A3835"} />
                ) : (
                  <FileIcon
                    w={40}
                    fill={litCol ? C.red : "#232325"}
                    stroke={litCol ? C.red : "#5A5650"}
                    lines={litCol ? C.ivory : "#5A5650"}
                    lineCount={p.kind === 1 ? 3 : 4}
                  />
                )}
              </At>
            );
          })}
          {/* sorting bins */}
          <At x={1705} y={420} s={sp(t, J.stream)} o={1}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 18,
                letterSpacing: 3,
                color: C.red,
                textAlign: "center",
                borderTop: `3px solid ${C.red}`,
                paddingTop: 12,
                width: 190,
              }}
            >
              RELEVANT
              <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>{relevant}</div>
            </div>
          </At>
          <At x={1560} y={870} s={sp(t, J.stream + 0.1)} o={0.7}>
            <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: 3, color: "#77736B" }}>
              PRUNED · {judged - relevant}
            </div>
          </At>
        </div>

        <Shockwave t={t} at={J.slam} x={CHIP.x} y={CHIP.y} max={1200} width={36} />
        <Shockwave
          t={t}
          at={J.slam + 0.07}
          x={CHIP.x}
          y={CHIP.y}
          max={760}
          width={8}
          color={C.ivory}
        />
        <Burst t={t} at={J.slam} x={CHIP.x} y={CHIP.y} n={20} r0={150} r1={560} width={8} />

        {/* Jev core */}
        <At
          x={chipX}
          y={chipY}
          s={
            map(slam, [0, 1], [3.2, 1]) *
            (1 + chatter * 0.035 + wobble(t, J.slam + 0.1, 24, 0.1) * 0.06) *
            (1 + pulse(t, [J.askArrive, J.answer], 0.1) * 0.1)
          }
          o={clamp01(slam * 3)}
        >
          <Chip
            t={t}
            size={chipSize}
            spin={t - J.slam + chatter * 0.05}
            glow={chatter + pulse(t, [J.askArrive], 0.2)}
          />
        </At>

        {/* "POWERED BY" + model badges */}
        <div
          style={{
            ...abs,
            width: 1920,
            top: lerp(160, 60, toHandoff),
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 20,
            letterSpacing: 8,
            color: "#8A857B",
            opacity: sp(t, J.slam + 0.1) * streamFade,
          }}
        >
          POWERED BY
        </div>
        <At x={CHIP.x} y={CHIP.y + 215} o={streamFade}>
          <div style={{ display: "flex", gap: 14 }}>
            {["SystemOne models", "typesafe-ai/jev"].map((b, i) => {
              const s = sp(t, J.badge + i * 0.12, { damping: 10, stiffness: 260 });
              return (
                <div
                  key={b}
                  style={{
                    transform: `scale(${s}) translateY(${(1 - s) * 20}px)`,
                    fontFamily: i ? MONO : SANS,
                    fontWeight: 600,
                    fontSize: i ? 20 : 22,
                    padding: "9px 20px",
                    borderRadius: 30,
                    border: `1.5px solid ${i ? "#4A4843" : C.red}`,
                    color: i ? "#A39E93" : C.ivory,
                    background: i ? "transparent" : "rgba(239,86,56,0.16)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {i === 0 && (
                    <span
                      style={{
                        display: "inline-block",
                        width: 9,
                        height: 9,
                        borderRadius: 5,
                        background: C.red,
                        marginRight: 10,
                        verticalAlign: 2,
                        transform: `scale(${1 + kp * 0.6})`,
                      }}
                    />
                  )}
                  {b}
                </div>
              );
            })}
          </div>
        </At>

        {/* throughput meter */}
        <div
          style={{
            ...abs,
            left: 110,
            top: 150,
            fontFamily: MONO,
            opacity: sp(t, J.stream - 0.1) * streamFade,
          }}
        >
          <div style={{ fontSize: 16, letterSpacing: 4, color: "#77736B" }}>
            RELEVANCE JUDGMENTS
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: C.ivory,
              letterSpacing: -2,
              transform: `scale(${1 + chatter * 0.04})`,
              transformOrigin: "left",
            }}
          >
            {(judged * 7).toLocaleString("en-US")}
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
            {Array.from({ length: 24 }, (_, i) => {
              const h = 8 + 34 * Math.abs(Math.sin(t * 9 + i * 0.7)) * (0.4 + chatter * 0.6);
              return (
                <div
                  key={i}
                  style={{ width: 8, height: 44, display: "flex", alignItems: "flex-end" }}
                >
                  <div
                    style={{
                      width: 8,
                      height: h,
                      background: i % 5 === 0 ? C.red : "#4A4843",
                      borderRadius: 2,
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 12, fontSize: 16, color: "#77736B", letterSpacing: 2 }}>
            folders · files · declarations
          </div>
        </div>

        {/* headline */}
        <div style={{ ...abs, width: 1920, top: 790, textAlign: "center", opacity: streamFade }}>
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 800,
              fontSize: 88,
              letterSpacing: -3,
              color: C.ivory,
              lineHeight: 1,
            }}
          >
            {["Fast,", "efficient", "research", "agents."].map((w, i) => (
              <MaskWord
                key={w}
                t={t}
                at={J.headline[i]}
                style={i >= 2 ? { color: C.red, fontStyle: "italic" } : undefined}
              >
                {w}
              </MaskWord>
            ))}
          </div>
          <div
            style={{
              marginTop: 20,
              fontFamily: SANS,
              fontSize: 26,
              color: "#A39E93",
              opacity: ramp(t, 16.2, 16.6),
            }}
          >
            Small models judge relevance — your frontier agent spends its budget on the code.
          </div>
        </div>

        {/* ---------- handoff: Codex delegates research to jg ---------- */}
        {t > J.handoff - 0.2 && <Handoff t={t} chipX={chipX} chipY={chipY} />}
      </div>
    </div>
  );
};

const CODEX = { x: 580, y: 470 };
const Handoff: React.FC<{ t: number; chipX: number; chipY: number }> = ({ t, chipX, chipY }) => {
  const inK = sp(t, J.handoff, { damping: 12, stiffness: 180 });
  const wire = ramp(t, J.handoff + 0.05, J.ask + 0.1);
  const ask = ramp(t, J.ask, J.askArrive, EASE.inOut);
  const ans = ramp(t, J.answer, J.answerArrive, EASE.inOut);
  const done = sp(t, J.answerArrive, { damping: 8, stiffness: 260 });
  const topArc = (k: number) => ({
    x: lerp(CODEX.x + 170, chipX - 110, k),
    y: lerp(CODEX.y - 40, chipY - 40, k) - Math.sin(Math.PI * k) * 150,
  });
  const botArc = (k: number) => ({
    x: lerp(chipX - 110, CODEX.x + 170, k),
    y: lerp(chipY + 40, CODEX.y + 40, k) + Math.sin(Math.PI * k) * 150,
  });
  const pathTop = Array.from({ length: 41 }, (_, i) => topArc(i / 40));
  const pathBot = Array.from({ length: 41 }, (_, i) => botArc(i / 40));
  const pa = topArc(ask),
    pb = botArc(ans);
  const crunch = t > J.askArrive && t < J.answer;
  return (
    <>
      <div
        style={{
          ...abs,
          width: 1920,
          top: 110,
          textAlign: "center",
          fontFamily: MONO,
          fontSize: 20,
          letterSpacing: 7,
          color: C.red,
          opacity: inK,
        }}
      >
        CODEX + jg · INDEPENDENT RESEARCH AGENT
      </div>
      <svg style={{ ...abs, overflow: "visible" }} width={1920} height={1080}>
        <polyline
          points={pathTop.map((p) => `${p.x},${p.y}`).join(" ")}
          pathLength={1}
          fill="none"
          stroke="#4A4843"
          strokeWidth={3}
          strokeDasharray="1 1"
          strokeDashoffset={1 - wire}
        />
        <polyline
          points={pathBot.map((p) => `${p.x},${p.y}`).join(" ")}
          pathLength={1}
          fill="none"
          stroke="#4A4843"
          strokeWidth={3}
          strokeDasharray="1 1"
          strokeDashoffset={1 - wire}
        />
        <polyline
          points={pathTop
            .slice(0, Math.round(ask * 40) + 1)
            .map((p) => `${p.x},${p.y}`)
            .join(" ")}
          fill="none"
          stroke={C.ivory}
          strokeWidth={3}
          opacity={ask > 0 && ask < 1 ? 1 : 0.5}
        />
        <polyline
          points={pathBot
            .slice(0, Math.round(ans * 40) + 1)
            .map((p) => `${p.x},${p.y}`)
            .join(" ")}
          fill="none"
          stroke={C.red}
          strokeWidth={4}
        />
      </svg>
      {/* Codex node */}
      <At x={CODEX.x} y={CODEX.y} s={inK * (1 + wobble(t, J.answerArrive, 26, 0.1) * 0.06)}>
        <div
          style={{
            width: 330,
            height: 220,
            borderRadius: 26,
            background: "#18181A",
            border: `2px solid ${done > 0.1 ? C.green : "#4A4843"}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            boxShadow: "0 30px 70px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 44, fontWeight: 700, color: C.ivory }}>
            <span style={{ color: C.red }}>&gt;</span>_
          </div>
          <div
            style={{
              fontFamily: SERIF,
              fontWeight: 800,
              fontSize: 48,
              color: C.ivory,
              letterSpacing: -1,
            }}
          >
            Codex
          </div>
          <div style={{ fontFamily: MONO, fontSize: 16, letterSpacing: 3, color: "#77736B" }}>
            CODING AGENT
          </div>
        </div>
        {t > J.answerArrive && (
          <div
            style={{
              position: "absolute",
              right: -26,
              top: -26,
              width: 60,
              height: 60,
              borderRadius: 30,
              background: C.green,
              transform: `scale(${done})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={32} height={32} viewBox="0 0 32 32">
              <path
                d="M7 17 L13 23 L25 10"
                fill="none"
                stroke="white"
                strokeWidth={4.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}
      </At>
      <At x={chipX} y={chipY + 175} o={inK}>
        <div
          style={{
            fontFamily: MONO,
            fontSize: 16,
            letterSpacing: 3,
            color: "#77736B",
            textAlign: "center",
          }}
        >
          RESEARCH AGENT
        </div>
      </At>
      {crunch && (
        <At x={chipX} y={chipY} r={(t - J.askArrive) * 900}>
          <svg width={300} height={300} viewBox="0 0 300 300">
            <circle
              cx={150}
              cy={150}
              r={140}
              fill="none"
              stroke={C.red}
              strokeWidth={4}
              strokeDasharray="60 820"
              strokeLinecap="round"
            />
          </svg>
        </At>
      )}
      {/* question packet */}
      {ask > 0 && ask < 1 && (
        <At x={pa.x} y={pa.y} r={(1 - ask) * -12}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 20,
              padding: "10px 18px",
              borderRadius: "16px 16px 16px 4px",
              background: C.ivory,
              color: C.ink,
              whiteSpace: "nowrap",
              boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
            }}
          >
            where is pooling configured?
          </div>
        </At>
      )}
      {/* source packet */}
      {ans > 0 && ans < 1 && (
        <At x={pb.x} y={pb.y} r={(1 - ans) * 10}>
          <div
            style={{
              width: 170,
              padding: 12,
              borderRadius: 12,
              background: C.red,
              boxShadow: "0 12px 30px rgba(0,0,0,0.4)",
            }}
          >
            {[120, 90, 140, 70].map((w, i) => (
              <div
                key={i}
                style={{
                  height: 6,
                  width: w,
                  marginTop: i ? 8 : 0,
                  borderRadius: 3,
                  background: i === 2 ? C.ivory : "rgba(244,239,228,0.5)",
                }}
              />
            ))}
          </div>
        </At>
      )}
      <Burst
        t={t}
        at={J.answerArrive}
        x={CODEX.x + 150}
        y={CODEX.y + 40}
        n={10}
        r0={40}
        r1={180}
        color={C.green}
        width={5}
      />
      <div
        style={{
          ...abs,
          width: 1920,
          top: 820,
          textAlign: "center",
          fontFamily: SERIF,
          fontWeight: 800,
          fontSize: 64,
          letterSpacing: -2,
          color: C.ivory,
        }}
      >
        <MaskWord t={t} at={J.handoff + 0.15}>
          Codex
        </MaskWord>
        <MaskWord t={t} at={J.handoff + 0.25}>
          delegates
        </MaskWord>
        <MaskWord t={t} at={J.handoff + 0.35}>
          the
        </MaskWord>
        <MaskWord t={t} at={J.handoff + 0.45} style={{ color: C.red, fontStyle: "italic" }}>
          research.
        </MaskWord>
      </div>
      <div
        style={{
          ...abs,
          width: 1920,
          top: 910,
          textAlign: "center",
          fontFamily: SANS,
          fontSize: 26,
          color: "#A39E93",
          opacity: ramp(t, J.answer, J.answer + 0.3),
        }}
      >
        jg hands back verbatim source with line refs — Codex implements and tests.
      </div>
    </>
  );
};
