import React from "react";
import { C, EASE, clamp01, lerp } from "../lib/anim";
import { MONO, SANS, SERIF, abs } from "../lib/ui";
import { Engine } from "./Engine";
import { Chip } from "./Jev";
import { Wordmark } from "./Reveal";

// Static key art: the file-classification graph from the engine scene, with Jev as the
// research agent driving it and the benchmark result. It opens the video (feeds thumbnail
// an early frame) and doubles as a README image. Ivory, so the cut into the cold open is seamless.
const TREE_T = 11.4; // every verdict stamped, before the declaration stage starts
const CARD = { x: 950, y: 90, w: 880, h: 870 };
const TS = 0.8,
  TX = -440,
  TY = 205; // engine layer → card-local placement
const ROOT = { x: 740 * TS + TX, y: 540 * TS + TY }; // wire lands on the root's fan-out hub
const CHIP = { x: 150, y: 160, size: 112 };

const BASE = 7.62,
  WITH = 4.52,
  PX = 72;

/** exit: 0 = fully composed, 1 = gone (pieces fly off, staggered). */
export const Poster: React.FC<{ exit?: number }> = ({ exit = 0 }) => {
  const part = (delay: number) => EASE.in(clamp01((exit - delay) / (1 - delay)));
  const out = (delay: number, dx: number, dy = 0): React.CSSProperties => {
    const k = part(delay);
    return {
      transform: `translate(${dx * k}px, ${dy * k}px) scale(${1 - k * 0.25})`,
      opacity: 1 - k,
    };
  };
  return (
    <div style={{ ...abs, width: 1920, height: 1080, background: C.ivory, overflow: "hidden" }}>
      {/* graph card */}
      <div
        style={{
          ...abs,
          width: 1920,
          height: 1080,
          transformOrigin: `${CARD.x + CARD.w / 2}px 540px`,
          ...out(0, 500, -40),
          rotate: `${part(0) * 6}deg`,
        }}
      >
        <div
          style={{
            ...abs,
            left: CARD.x,
            top: CARD.y,
            width: CARD.w,
            height: CARD.h,
            borderRadius: 28,
            overflow: "hidden",
            background: C.night,
            boxShadow: "0 40px 90px rgba(18,18,18,0.25)",
          }}
        >
          <div
            style={{
              ...abs,
              width: 1920,
              height: 1080,
              transformOrigin: "0 0",
              transform: `translate(${TX}px, ${TY}px) scale(${TS})`,
            }}
          >
            <Engine t={TREE_T} bare />
          </div>
          <div
            style={{
              ...abs,
              width: CARD.w,
              height: 300,
              background: `linear-gradient(${C.night} 45%, rgba(13,13,14,0))`,
            }}
          />
          <svg style={abs} width={CARD.w} height={CARD.h}>
            <path
              d={`M${CHIP.x} ${CHIP.y + CHIP.size / 2 + 18} C${CHIP.x} ${CHIP.y + 200} ${ROOT.x} ${ROOT.y - 200} ${ROOT.x} ${ROOT.y - 50}`}
              fill="none"
              stroke={C.red}
              strokeWidth={4}
              strokeDasharray="2 10"
              strokeLinecap="round"
            />
            <circle cx={ROOT.x} cy={ROOT.y - 50} r={7} fill={C.red} />
          </svg>
          <div
            style={{
              ...abs,
              transform: `translate(${CHIP.x - CHIP.size / 2}px, ${CHIP.y - CHIP.size / 2}px)`,
            }}
          >
            <Chip t={0} size={CHIP.size} spin={0.35} glow={0.6} />
          </div>
          <div style={{ ...abs, left: CHIP.x + 108, top: CHIP.y - 46 }}>
            <div style={{ fontFamily: MONO, fontSize: 18, letterSpacing: 5, color: C.red }}>
              RESEARCH AGENT
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 800,
                fontSize: 40,
                letterSpacing: -1,
                color: C.ivory,
                marginTop: 4,
              }}
            >
              Jev
            </div>
            <div style={{ fontFamily: SANS, fontSize: 19, color: "#A39E93", marginTop: 2 }}>
              SystemOne models · typesafe-ai/jev
            </div>
          </div>
        </div>
      </div>

      {/* text column */}
      <div style={{ ...abs, left: 110, top: 96, ...out(0.1, -300) }}>
        <div style={{ transform: "scale(0.36)", transformOrigin: "0 0" }}>
          <Wordmark t={100} at={0} size={250} dotAt={0.5} />
        </div>
      </div>
      <div
        style={{
          ...abs,
          left: 100,
          top: 250,
          ...out(0, -420),
          fontFamily: SERIF,
          fontWeight: 900,
          fontSize: 250,
          letterSpacing: -12,
          lineHeight: 1,
          color: C.red,
          textShadow: `7px 9px 0 ${C.ink}`,
        }}
      >
        −40%
      </div>
      <div
        style={{
          ...abs,
          left: 112,
          top: 510,
          width: 780,
          ...out(0.15, -360),
          fontFamily: SERIF,
          fontWeight: 800,
          fontSize: 52,
          letterSpacing: -1.8,
          lineHeight: 1.06,
          color: C.ink,
        }}
      >
        coding-agent cost when Codex uses a{" "}
        <span style={{ color: C.red, fontStyle: "italic" }}>Jev research agent.</span>
      </div>

      {[
        { label: "CODEX ALONE", v: BASE, col: C.ink, txt: C.ink },
        { label: "CODEX + jg", v: WITH, col: C.red, txt: C.red },
      ].map((r, i) => (
        <div
          key={r.label}
          style={{
            ...abs,
            left: 112,
            top: 700 + i * 92,
            ...out(0.25 + i * 0.1, -lerp(420, 520, i)),
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 16,
              letterSpacing: 4,
              color: C.grey,
              marginBottom: 8,
            }}
          >
            {r.label}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <div style={{ position: "relative", width: BASE * PX, height: 40 }}>
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: 40,
                  width: r.v * PX,
                  background: r.col,
                  borderRadius: "0 8px 8px 0",
                }}
              />
              {i === 1 && (
                <div
                  style={{
                    position: "absolute",
                    left: r.v * PX,
                    top: 0,
                    height: 40,
                    width: (BASE - r.v) * PX,
                    border: `2px dashed ${C.grey}`,
                    borderLeft: "none",
                    borderRadius: "0 8px 8px 0",
                    boxSizing: "border-box",
                  }}
                />
              )}
            </div>
            <div
              style={{
                fontFamily: SERIF,
                fontWeight: 900,
                fontSize: 44,
                letterSpacing: -1,
                color: r.txt,
              }}
            >
              ${r.v.toFixed(2)}
            </div>
          </div>
        </div>
      ))}

      <div
        style={{
          ...abs,
          left: 112,
          top: 922,
          width: 800,
          ...out(0.3, -300),
          fontFamily: SANS,
          fontSize: 18,
          lineHeight: 1.5,
          color: "#6F6A61",
        }}
      >
        One 10-task SWE-bench repeat · full Codex task cost incl. failed tasks · Jev cost excluded ·
        solves 7/10 with jg vs 8/10 baseline
      </div>
      <div
        style={{
          ...abs,
          left: CARD.x,
          top: CARD.y + CARD.h + 26,
          width: CARD.w,
          textAlign: "right",
          ...out(0.2, 400),
          fontFamily: MONO,
          fontSize: 20,
          color: C.grey,
        }}
      >
        <span style={{ color: C.red }}>›</span> npm i -g @dzhng/jevgrep
      </div>
    </div>
  );
};
