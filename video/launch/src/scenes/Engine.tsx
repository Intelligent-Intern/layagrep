import React from "react";
import { E } from "../cues";
import { C, EASE, clamp01, kick, lerp, map, pulse, ramp, shake, sp, wobble } from "../lib/anim";
import {
  At,
  Burst,
  DotGrid,
  FileIcon,
  FolderIcon,
  MONO,
  SANS,
  SERIF,
  Shockwave,
  Stamp,
  abs,
} from "../lib/ui";

const STEPS = [
  {
    at: E.root,
    n: "01",
    title: "Walk the folder frontier",
    sub: "Jev judges each directory from its children — rejected branches are never read or uploaded.",
  },
  {
    at: E.fragLabel,
    n: "02",
    title: "Classify files by content",
    sub: "Content fragments, not filenames, decide which files qualify.",
  },
  {
    at: E.declLabel,
    n: "03",
    title: "Split into declarations",
    sub: "Python and TS/JS parse into functions & classes, with exact line refs.",
  },
  {
    at: E.outLabel,
    n: "04",
    title: "Emit one stdout packet",
    sub: "Summary → files → reading leads → verbatim source. No report files.",
  },
];

const ROOT = { x: 740, y: 540 };
const DIRS = [
  { name: "src/", y: 330, ok: true },
  { name: "docs/", y: 475, ok: false },
  { name: "tests/", y: 650, ok: true },
  { name: "scripts/", y: 800, ok: false },
];
const DX = 1020;
const FILES = [
  { name: "db/connection.py", y: 215, parent: 0, ok: true },
  { name: "db/pool.py", y: 330, parent: 0, ok: true },
  { name: "db/models.py", y: 445, parent: 0, ok: false },
  { name: "test_connection.py", y: 650, parent: 2, ok: true },
];
const FX = 1330;

const BLOCKS = [
  { code: ["import sqlalchemy as sa"], ref: "L1–4", h: 58 },
  { code: ["class Pool:", "    def acquire(self): …"], ref: "L12–48", h: 96 },
  {
    code: ["def create_engine(url,", "        pool_size=10):", "    return sa.create_engine(…)"],
    ref: "L50–71",
    h: 130,
  },
  { code: ["def close(conn): …"], ref: "L73–80", h: 58 },
  { code: ["def _retry(fn, n=3): …"], ref: "L82–95", h: 58 },
];
const PACKET = [
  { t: "jevgrep · summary: 3 files, complete", c: C.red },
  { t: "files", c: "#77736B" },
  { t: "  src/db/connection.py   source", c: "#E9E3D6" },
  { t: "  src/db/pool.py         lead L12–48", c: "#E9E3D6" },
  { t: "  50│def create_engine(url, …", c: C.blue },
];

const bez = (x1: number, y1: number, x2: number, y2: number, k: number) => {
  const xm = (x1 + x2) / 2,
    u = 1 - k;
  return {
    x: u * u * u * x1 + 3 * u * u * k * xm + 3 * u * k * k * xm + k * k * k * x2,
    y: u * u * u * y1 + 3 * u * u * k * y1 + 3 * u * k * k * y2 + k * k * k * y2,
  };
};
const Wire: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  k: number;
  color: string;
  w?: number;
  dash?: boolean;
}> = ({ x1, y1, x2, y2, k, color, w = 3, dash }) => {
  const xm = (x1 + x2) / 2;
  return (
    <path
      d={`M${x1} ${y1} C${xm} ${y1} ${xm} ${y2} ${x2} ${y2}`}
      pathLength={1}
      fill="none"
      stroke={color}
      strokeWidth={w}
      strokeLinecap="round"
      strokeDasharray={dash ? "0.012 0.018" : "1 1"}
      strokeDashoffset={dash ? 0 : 1 - k}
      opacity={dash ? k : 1}
    />
  );
};

export const Engine: React.FC<{ t: number; bare?: boolean }> = ({ t, bare }) => {
  const kp = kick(t, 0.09);
  const sh = shake(
    t,
    [
      [E.root, 10],
      ...E.dirStamps.map((s) => [s, 2] as [number, number]),
      ...E.blocks.map((b) => [b + 0.08, 3] as [number, number]),
    ],
    "e",
  );
  const step = STEPS.reduce((a, s, i) => (t >= s.at ? i : a), 0);

  const treeOut = ramp(t, E.declLabel, E.declLabel + 0.45, EASE.inOut);
  const cardIn = sp(t, E.declLabel, { damping: 15, stiffness: 150, mass: 0.8 });
  const packetPhase = ramp(t, E.outLabel, E.outLabel + 0.4, EASE.inOut);
  const collapse = ramp(t, E.shoot, E.shoot + 0.12, EASE.in);
  const shoot = ramp(t, E.shoot + 0.08, 14.0, EASE.in);

  // Camera drifts across the diagram, pushing in as each stage lands.
  const camX = lerp(0, -40, ramp(t, 8, 11.5, EASE.inOut)) + treeOut * 20;
  const camS = 1 + kp * 0.008 + 0.04 * ramp(t, 8, 9.2) - 0.04 * treeOut * 0.5;
  const introScale = map(t, [8, 8.35], [1.35, 1]);

  return (
    <div style={{ ...abs, width: 1920, height: 1080, background: C.night, overflow: "hidden" }}>
      <DotGrid color="#F4EFE4" opacity={0.07 + kp * 0.08} offset={t * 12} />
      <div
        style={{
          ...abs,
          width: 1920,
          height: 1080,
          background:
            "radial-gradient(900px 600px at 70% 50%, rgba(239,86,56,0.10), transparent 70%)",
        }}
      />

      <div
        style={{
          ...abs,
          width: 1920,
          height: 1080,
          transformOrigin: "1150px 540px",
          transform: `translate(${camX + sh.x}px, ${sh.y}px) rotate(${sh.r}deg) scale(${camS * EASE.out(1) * introScale})`,
        }}
      >
        {/* ---------- tree ---------- */}
        <div
          style={{
            ...abs,
            width: 1920,
            height: 1080,
            opacity: 1 - treeOut * 0.88,
            transform: `translateX(${-treeOut * 260}px) scale(${1 - treeOut * 0.12})`,
            transformOrigin: "700px 540px",
            filter: treeOut > 0.01 ? `blur(${treeOut * 3}px)` : undefined,
          }}
        >
          <svg style={{ ...abs, overflow: "visible" }} width={1920} height={1080}>
            {DIRS.map((d, i) => {
              const k = ramp(t, E.dirs + i * 0.0625, E.dirs + i * 0.0625 + 0.35);
              const pruned = !d.ok ? ramp(t, E.prune, E.prune + 0.3) : 0;
              return (
                <g key={d.name}>
                  <Wire
                    x1={ROOT.x + 50}
                    y1={ROOT.y}
                    x2={DX - 44}
                    y2={d.y}
                    k={k}
                    color={d.ok && t > E.dirStamps[i] ? C.red : "#4A4843"}
                    w={d.ok && t > E.dirStamps[i] ? 4 : 3}
                  />
                  {pruned > 0 && (
                    <Wire
                      x1={DX + 50}
                      y1={d.y}
                      x2={DX + 230}
                      y2={d.y}
                      k={pruned}
                      color="#4A4843"
                      dash
                    />
                  )}
                </g>
              );
            })}
            {FILES.map((f, i) => {
              const k = ramp(t, E.files + i * 0.0625, E.files + i * 0.0625 + 0.3);
              const lit = t > E.fileStamps[i] && f.ok;
              return (
                <Wire
                  key={f.name}
                  x1={DX + 150}
                  y1={DIRS[f.parent].y}
                  x2={FX - 38}
                  y2={f.y}
                  k={k}
                  color={lit ? C.red : "#4A4843"}
                  w={lit ? 4 : 3}
                />
              );
            })}
          </svg>
          {/* Jev probes travelling down each wire just before its verdict */}
          {E.dirStamps.map((st, i) => {
            const k = ramp(t, st - 0.22, st, EASE.inOut);
            if (k <= 0 || k >= 1) return null;
            const p = bez(ROOT.x + 50, ROOT.y, DX - 44, DIRS[i].y, k);
            return (
              <At key={i} x={p.x} y={p.y} sx={1.6} r={Math.atan2(DIRS[i].y - ROOT.y, 300) * 57}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    background: C.red,
                    boxShadow: `0 0 24px ${C.red}`,
                  }}
                />
              </At>
            );
          })}
          {E.fileStamps.map((st, i) => {
            const k = ramp(t, st - 0.2, st, EASE.inOut);
            if (k <= 0 || k >= 1) return null;
            const p = bez(DX + 150, DIRS[FILES[i].parent].y, FX - 38, FILES[i].y, k);
            return (
              <At key={i} x={p.x} y={p.y} sx={1.6}>
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 8,
                    background: C.red,
                    boxShadow: `0 0 22px ${C.red}`,
                  }}
                />
              </At>
            );
          })}

          {/* root */}
          <At
            x={ROOT.x}
            y={ROOT.y}
            s={
              sp(t, E.root, { damping: 9, stiffness: 260, mass: 0.6 }) *
              (1 + pulse(t, E.dirStamps, 0.1) * 0.08)
            }
          >
            <div
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}
            >
              <FolderIcon w={96} fill={C.ivory} />
              <div style={{ fontFamily: MONO, fontSize: 22, color: C.ivory }}>my-repo/</div>
            </div>
          </At>
          <Shockwave t={t} at={E.root} x={ROOT.x} y={ROOT.y} max={500} width={16} />

          {DIRS.map((d, i) => {
            const at = E.dirs + i * 0.0625;
            const s = sp(t, at, { damping: 10, stiffness: 280, mass: 0.5 });
            const pruned = !d.ok ? ramp(t, E.prune, E.prune + 0.3) : 0;
            const lit = d.ok && t > E.dirStamps[i];
            const w = wobble(t, E.dirStamps[i], 30, 0.08);
            return (
              <At
                key={d.name}
                x={DX + pruned * 10}
                y={d.y}
                s={s * (1 - pruned * 0.12) * (1 + w * 0.12)}
                o={1 - pruned * 0.62}
              >
                <div
                  style={{ position: "relative", display: "flex", alignItems: "center", gap: 16 }}
                >
                  <FolderIcon w={78} fill={lit ? C.red : "#2E2D2B"} />
                  <div
                    style={{
                      position: "absolute",
                      left: 92,
                      fontFamily: MONO,
                      fontSize: 22,
                      color: lit ? C.ivory : "#9A958C",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d.name}
                    {pruned > 0.2 && (
                      <span style={{ color: "#6D6962", fontSize: 16, marginLeft: 12 }}>
                        · not inspected
                      </span>
                    )}
                  </div>
                  <div style={{ position: "absolute", left: -34, top: -30 }}>
                    <Stamp t={t} at={E.dirStamps[i]} ok={d.ok} size={40} dark />
                  </div>
                </div>
              </At>
            );
          })}
          {/* lookahead chip */}
          <At x={DX + 96} y={282} s={sp(t, E.files - 0.05)} r={-3}>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 15,
                color: C.red,
                border: `1.5px solid ${C.red}`,
                borderRadius: 20,
                padding: "3px 10px",
                letterSpacing: 1,
              }}
            >
              lookahead → db/
            </div>
          </At>

          {FILES.map((f, i) => {
            const at = E.files + i * 0.0625;
            const s = sp(t, at, { damping: 10, stiffness: 280, mass: 0.5 });
            const lit = f.ok && t > E.fileStamps[i];
            const rej = !f.ok && t > E.fileStamps[i];
            const frag = sp(t, E.fragLabel + i * 0.08, { damping: 16 });
            const scan = clamp01((t - E.fragLabel - 0.1 - i * 0.08) / 0.4);
            const w = wobble(t, E.fileStamps[i], 30, 0.08);
            return (
              <At key={f.name} x={FX} y={f.y} s={s * (1 + w * 0.14)} o={rej ? 0.4 : 1}>
                <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                  <FileIcon
                    w={52}
                    fill={lit ? C.red : C.soot}
                    stroke={lit ? C.red : "#6D6962"}
                    lines={lit ? C.ivory : "#6D6962"}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 70,
                      top: -2,
                      fontFamily: MONO,
                      fontSize: 20,
                      color: lit ? C.ivory : "#9A958C",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {f.name}
                  </div>
                  {/* content fragment preview */}
                  <div
                    style={{
                      position: "absolute",
                      left: 70,
                      top: 30,
                      width: 250,
                      height: 50,
                      borderRadius: 8,
                      background: "#1B1B1D",
                      border: "1px solid #2E2D2B",
                      overflow: "hidden",
                      opacity: frag,
                      transform: `scaleY(${frag})`,
                      transformOrigin: "top",
                    }}
                  >
                    {[0, 1, 2].map((j) => (
                      <div
                        key={j}
                        style={{
                          position: "absolute",
                          left: 10,
                          top: 9 + j * 13,
                          height: 5,
                          borderRadius: 3,
                          width: [170, 120, 200][j] - i * 10,
                          background: lit && j === 1 ? C.red : "#3C3A37",
                        }}
                      />
                    ))}
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        width: 40,
                        left: -40 + scan * 290,
                        background:
                          "linear-gradient(90deg, transparent, rgba(239,86,56,0.55), transparent)",
                      }}
                    />
                  </div>
                  <div style={{ position: "absolute", left: -38, top: -34 }}>
                    <Stamp t={t} at={E.fileStamps[i]} ok={f.ok} size={36} dark />
                  </div>
                </div>
              </At>
            );
          })}
        </div>

        {/* ---------- declaration card ---------- */}
        {t > E.declLabel - 0.05 && (
          <div
            style={{
              ...abs,
              width: 560,
              height: 620,
              transformOrigin: "0 0",
              opacity: 1 - collapse,
              transform: `translate(${lerp(FX - 20, lerp(1110, 720, packetPhase), cardIn)}px, ${lerp(FILES[0].y - 20, 240, cardIn)}px) scale(${lerp(0.09, 1, cardIn) * (1 - packetPhase * 0.14) * (1 - collapse * 0.6)})`,
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 22,
                background: "#18181A",
                border: "1.5px solid #34322F",
                boxShadow: "0 40px 80px rgba(0,0,0,0.5)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                height: 52,
                borderBottom: "1px solid #34322F",
                display: "flex",
                alignItems: "center",
                padding: "0 22px",
                gap: 12,
                fontFamily: MONO,
                fontSize: 20,
                color: C.ivory,
              }}
            >
              <FileIcon w={20} fill={C.red} stroke={C.red} lines={C.ivory} lineCount={2} />
              src/db/connection.py
            </div>
            {(() => {
              let y = 70;
              return BLOCKS.map((b, i) => {
                const at = E.blocks[i];
                const s = sp(t, at, { damping: 11, stiffness: 240, mass: 0.6 });
                const w = wobble(t, at + 0.09, 28, 0.08);
                const top = y;
                y += b.h + 10;
                const src = i === 2 && t > E.pick[0];
                const lead = i === 1 && t > E.pick[1];
                const dim = t > E.pick[0] + 0.1 && !src && !lead;
                const pk = src
                  ? wobble(t, E.pick[0], 26, 0.1)
                  : lead
                    ? wobble(t, E.pick[1], 26, 0.1)
                    : 0;
                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: 24,
                      top,
                      width: 512,
                      height: b.h,
                      borderRadius: 12,
                      background: src ? C.red : "#232325",
                      border: `2px solid ${lead ? C.red : src ? C.red : "#3A3835"}`,
                      opacity: t < at - 0.02 ? 0 : dim ? 0.32 : 1,
                      transform: `translateY(${(1 - s) * -520}px) rotate(${(1 - s) * (i % 2 ? 6 : -6)}deg) scale(${1 + w * 0.05 + pk * 0.06}, ${1 - w * 0.08})`,
                      transformOrigin: "50% 100%",
                      padding: "12px 16px",
                      boxSizing: "border-box",
                      fontFamily: MONO,
                      fontSize: 19,
                      lineHeight: 1.45,
                      color: src ? C.ivory : "#D6D0C3",
                      whiteSpace: "pre",
                    }}
                  >
                    {b.code.map((c, j) => (
                      <div key={j}>{c}</div>
                    ))}
                    <div
                      style={{
                        position: "absolute",
                        right: 12,
                        top: 10,
                        fontSize: 14,
                        color: src ? C.ivory : "#77736B",
                      }}
                    >
                      {b.ref}
                    </div>
                    {(src || lead) && (
                      <div
                        style={{
                          position: "absolute",
                          right: 12,
                          bottom: 10,
                          fontSize: 13,
                          fontWeight: 700,
                          letterSpacing: 2,
                          padding: "3px 9px",
                          borderRadius: 12,
                          background: src ? C.ivory : C.red,
                          color: src ? C.red : C.ivory,
                          transform: `scale(${sp(t, src ? E.pick[0] : E.pick[1], { damping: 9, stiffness: 300 })})`,
                        }}
                      >
                        {src ? "SOURCE" : "LEAD"}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* ---------- stdout packet ---------- */}
        {t > E.outLabel - 0.05 && (
          <div
            style={{
              ...abs,
              width: 570,
              height: 330,
              transformOrigin: "285px 165px",
              transform: `translate(${1250 + (1 - sp(t, E.outLabel, { damping: 15 })) * 300}px, ${375}px) scale(${1 - collapse * 0.7})`,
              opacity: sp(t, E.outLabel) * (1 - collapse),
              borderRadius: 18,
              background: C.ivory,
              padding: "22px 26px",
              boxSizing: "border-box",
              fontFamily: MONO,
              fontSize: 20,
              lineHeight: 1.9,
              whiteSpace: "pre",
              boxShadow: "0 40px 90px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ fontSize: 14, letterSpacing: 4, color: C.grey, marginBottom: 6 }}>
              STDOUT
            </div>
            {PACKET.map((l, i) => {
              const s = sp(t, E.lines[i], { damping: 18, stiffness: 280 });
              return (
                <div
                  key={i}
                  style={{
                    color: l.c === "#E9E3D6" ? C.ink : l.c === C.blue ? C.blueDeep : l.c,
                    opacity: s,
                    transform: `translateX(${(1 - s) * 40}px)`,
                    fontWeight: i === 0 ? 700 : 400,
                  }}
                >
                  {l.t}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* capsule shoots out → becomes the payload in the Jev scene */}
      {t > E.shoot && (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              style={{
                ...abs,
                height: 3,
                borderRadius: 2,
                background: i % 3 ? "#4A4843" : C.red,
                top: 480 + i * 16,
                left: lerp(1400, 2400, shoot) - 600 * shoot - i * 40,
                width: 700 * shoot,
                opacity: 1 - shoot * 0.3,
              }}
            />
          ))}
          <At
            x={lerp(1600, 2300, shoot)}
            y={540}
            sx={1 + shoot * 2.2}
            sy={1 - shoot * 0.35}
            s={sp(t, E.shoot, { damping: 10, stiffness: 300 })}
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
                whiteSpace: "nowrap",
              }}
            >
              jg ▸ stdout
            </div>
          </At>
          <Burst t={t} at={E.shoot} x={1600} y={540} n={12} r0={60} r1={260} width={5} />
        </>
      )}

      {!bare && (
        <>
          {/* ---------- stage labels (fixed to screen) ---------- */}
          <div
            style={{
              ...abs,
              left: 110,
              top: 108,
              fontFamily: MONO,
              fontSize: 18,
              letterSpacing: 5,
              color: "#77736B",
              opacity: sp(t, E.root),
            }}
          >
            HOW IT WORKS — BEHIND <span style={{ color: C.red }}>jg</span>
          </div>
          <div style={{ ...abs, left: 110, top: 150, width: 600, height: 300, overflow: "hidden" }}>
            {STEPS.map((s, i) => {
              const inK = sp(t, s.at, { damping: 17, stiffness: 180 });
              const next = STEPS[i + 1];
              const outK = next ? ramp(t, next.at - 0.02, next.at + 0.22, EASE.in) : 0;
              if (t < s.at - 0.02 || outK >= 1) return null;
              const y = (1 - inK) * 200 - outK * 240;
              return (
                <div
                  key={s.n}
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    transform: `translateY(${y}px)`,
                    opacity: 1 - outK,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
                    <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 26, color: C.red }}>
                      {s.n}
                    </span>
                    <span
                      style={{
                        fontFamily: SERIF,
                        fontWeight: 800,
                        fontSize: 62,
                        lineHeight: 1.02,
                        color: C.ivory,
                        letterSpacing: -2,
                        width: 520,
                        display: "inline-block",
                      }}
                    >
                      {s.title}
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: 18,
                      marginLeft: 50,
                      fontFamily: SANS,
                      fontSize: 23,
                      lineHeight: 1.45,
                      color: "#A39E93",
                      width: 460,
                      opacity: ramp(t, s.at + 0.12, s.at + 0.4),
                    }}
                  >
                    {s.sub}
                  </div>
                </div>
              );
            })}
          </div>
          {/* progress pips for the four stages */}
          <div style={{ ...abs, left: 160, top: 470, display: "flex", gap: 10 }}>
            {STEPS.map((s, i) => (
              <div
                key={i}
                style={{
                  width: i === step ? 56 : 16,
                  height: 6,
                  borderRadius: 3,
                  background: i <= step ? C.red : "#3A3835",
                  transition: "none",
                  transform: `scaleY(${1 + (i === step ? pulse(t, [s.at], 0.1) : 0)})`,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
