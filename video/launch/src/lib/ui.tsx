import React from "react";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { C, clamp01, rand, sp } from "./anim";

export const SERIF = loadFraunces("normal", {
  weights: ["400", "600", "800", "900"],
  subsets: ["latin", "latin-ext"],
}).fontFamily;
loadFraunces("italic", { weights: ["600", "800"], subsets: ["latin"] });
export const MONO = loadMono("normal", {
  weights: ["400", "500", "700"],
  subsets: ["latin"],
}).fontFamily;
export const SANS = loadInter("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
}).fontFamily;

export const abs: React.CSSProperties = { position: "absolute", left: 0, top: 0 };

/** Places a child centered on (x, y). */
export const At: React.FC<{
  x: number;
  y: number;
  s?: number;
  r?: number;
  o?: number;
  sx?: number;
  sy?: number;
  z?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ x, y, s = 1, r = 0, o = 1, sx = 1, sy = 1, z, children, style }) => (
  <div
    style={{
      ...abs,
      transform: `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${r}deg) scale(${s * sx}, ${s * sy})`,
      opacity: o,
      zIndex: z,
      ...style,
    }}
  >
    {children}
  </div>
);

export const FileIcon: React.FC<{
  w?: number;
  fill?: string;
  stroke?: string;
  lines?: string;
  lit?: number;
  lineCount?: number;
  open?: number;
}> = ({
  w = 56,
  fill = C.paper,
  stroke = C.ink,
  lines = C.grey,
  lit = 0,
  lineCount = 4,
  open = 0,
}) => {
  const h = w * 1.28,
    fold = w * 0.3;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ overflow: "visible", display: "block" }}
    >
      <path
        d={`M4 4 H${w - fold} L${w - 4} ${fold} V${h - 4} H4 Z`}
        fill={fill}
        stroke={stroke}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <path
        d={`M${w - fold} 4 V${fold} H${w - 4}`}
        fill="none"
        stroke={stroke}
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {Array.from({ length: lineCount }, (_, i) => {
        const y = fold + 8 + i * ((h - fold - 16) / lineCount);
        const len = (w - 20) * (0.55 + 0.45 * rand(i + w, 3)) * (1 - open * 0.4 * rand(i, 9));
        return (
          <rect
            key={i}
            x={10}
            y={y}
            width={len}
            height={3.2}
            rx={1.6}
            fill={i === 1 && lit > 0 ? C.red : lines}
            opacity={i === 1 ? 1 : 0.9}
          />
        );
      })}
    </svg>
  );
};

export const FolderIcon: React.FC<{
  w?: number;
  fill?: string;
  stroke?: string;
  open?: number;
}> = ({ w = 70, fill = C.ink, stroke = "none", open = 0 }) => {
  const h = w * 0.78;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ overflow: "visible", display: "block" }}
    >
      <path
        d={`M3 ${h * 0.14} Q3 3 ${w * 0.1} 3 H${w * 0.36} L${w * 0.46} ${h * 0.16} H${w - 6} Q${w - 3} ${h * 0.16} ${w - 3} ${h * 0.24} V${h - 6} Q${w - 3} ${h - 3} ${w - 8} ${h - 3} H8 Q3 ${h - 3} 3 ${h - 8} Z`}
        fill={fill}
        stroke={stroke}
        strokeWidth={2.5}
      />
      <path
        d={`M3 ${h * 0.34 - open * 8} H${w - 3}`}
        stroke={stroke === "none" ? "rgba(255,255,255,0.18)" : stroke}
        strokeWidth={2}
      />
    </svg>
  );
};

/** Rubber-stamp verdict badge: overshoots in from large, rotates, settles. */
export const Stamp: React.FC<{
  t: number;
  at: number;
  ok: boolean;
  size?: number;
  dark?: boolean;
}> = ({ t, at, ok, size = 44, dark }) => {
  if (t < at - 0.02) return null;
  const s = sp(t, at, { damping: 11, stiffness: 320, mass: 0.5 });
  const scale = 2.4 - 1.4 * s;
  const draw = clamp01((t - at - 0.02) / 0.12);
  const col = ok ? C.red : dark ? "#5A5650" : C.grey;
  return (
    <div
      style={{
        transform: `scale(${scale}) rotate(${(1 - s) * (ok ? -40 : 40)}deg)`,
        opacity: clamp01(s * 3),
      }}
    >
      <svg width={size} height={size} viewBox="0 0 44 44">
        <circle cx={22} cy={22} r={20} fill={col} />
        {ok ? (
          <path
            d="M12 23 L19 30 L32 15"
            fill="none"
            stroke={C.ivory}
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray={40}
            strokeDashoffset={40 * (1 - draw)}
          />
        ) : (
          <path
            d="M15 15 L29 29 M29 15 L15 29"
            fill="none"
            stroke={dark ? "#BDB6A8" : C.ivory}
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeDasharray={40}
            strokeDashoffset={40 * (1 - draw)}
          />
        )}
      </svg>
    </div>
  );
};

/** Word that rises out of a mask with a spring. */
export const MaskWord: React.FC<{
  t: number;
  at: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  from?: number;
  gap?: number;
}> = ({ t, at, children, style, from = 1.1, gap = 0.26 }) => {
  const s = sp(t, at, { damping: 15, stiffness: 170, mass: 0.8 });
  return (
    <span
      style={{
        display: "inline-block",
        overflow: "hidden",
        verticalAlign: "bottom",
        paddingBottom: "0.12em",
        marginBottom: "-0.12em",
        marginRight: `${gap}em`,
      }}
    >
      <span
        style={{
          display: "inline-block",
          transform: `translateY(${(1 - s) * from * 100}%) rotate(${(1 - s) * 8}deg)`,
          transformOrigin: "left bottom",
          ...style,
        }}
      >
        {children}
      </span>
    </span>
  );
};

/** Expanding ring from an impact point. */
export const Shockwave: React.FC<{
  t: number;
  at: number;
  x: number;
  y: number;
  color?: string;
  max?: number;
  dur?: number;
  width?: number;
}> = ({ t, at, x, y, color = C.red, max = 900, dur = 0.7, width = 24 }) => {
  const k = (t - at) / dur;
  if (k < 0 || k > 1) return null;
  const e = 1 - Math.pow(1 - k, 3);
  const r = e * max;
  return (
    <svg style={{ ...abs, overflow: "visible" }} width={1920} height={1080}>
      <circle
        cx={x}
        cy={y}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={width * (1 - k) + 0.5}
        opacity={1 - k * 0.6}
      />
    </svg>
  );
};

/** Radial streak burst — reads as speed / energy release. */
export const Burst: React.FC<{
  t: number;
  at: number;
  x: number;
  y: number;
  n?: number;
  color?: string;
  r0?: number;
  r1?: number;
  dur?: number;
  seed?: number;
  width?: number;
}> = ({
  t,
  at,
  x,
  y,
  n = 14,
  color = C.red,
  r0 = 60,
  r1 = 420,
  dur = 0.45,
  seed = 0,
  width = 6,
}) => {
  const k = (t - at) / dur;
  if (k < 0 || k > 1) return null;
  const e = 1 - Math.pow(1 - k, 3);
  return (
    <svg style={{ ...abs, overflow: "visible" }} width={1920} height={1080}>
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + rand(i, seed) * 0.4;
        const len = r1 * (0.6 + 0.4 * rand(i, seed + 1));
        const head = r0 + e * len,
          tail = r0 + Math.pow(k, 0.5) * len * 0.95;
        return (
          <line
            key={i}
            x1={x + Math.cos(a) * tail}
            y1={y + Math.sin(a) * tail}
            x2={x + Math.cos(a) * head}
            y2={y + Math.sin(a) * head}
            stroke={color}
            strokeWidth={width * (1 - k)}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
};

/** Geometric confetti with gravity and spin. */
export const Confetti: React.FC<{
  t: number;
  at: number;
  x: number;
  y: number;
  n?: number;
  seed?: number;
  colors?: string[];
}> = ({ t, at, x, y, n = 40, seed = 0, colors = [C.red, C.ink, C.blueDeep, C.red] }) => {
  const dt = t - at;
  if (dt < 0 || dt > 2.2) return null;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const a = -Math.PI / 2 + (rand(i, seed) - 0.5) * Math.PI * 1.6;
        const v = 700 + rand(i, seed + 2) * 1100;
        const drag = (1 - Math.exp(-dt * 3)) / 3;
        const px = x + Math.cos(a) * v * drag;
        const py = y + Math.sin(a) * v * drag + 900 * dt * dt * 0.5;
        const size = 10 + rand(i, seed + 3) * 18;
        const shape = i % 3;
        const spin = (rand(i, seed + 4) - 0.5) * 1400 * dt;
        return (
          <At
            key={i}
            x={px}
            y={py}
            r={spin}
            o={clamp01(2.2 - dt * 1.2)}
            sx={Math.cos(dt * (6 + rand(i, 7) * 8))}
          >
            {shape === 0 ? (
              <div
                style={{
                  width: size,
                  height: size * 0.45,
                  background: colors[i % colors.length],
                  borderRadius: 2,
                }}
              />
            ) : shape === 1 ? (
              <div
                style={{
                  width: size * 0.7,
                  height: size * 0.7,
                  borderRadius: "50%",
                  border: `3px solid ${colors[i % colors.length]}`,
                }}
              />
            ) : (
              <svg width={size} height={size} viewBox="0 0 10 10">
                <path d="M5 0 L10 10 H0 Z" fill={colors[i % colors.length]} />
              </svg>
            )}
          </At>
        );
      })}
    </>
  );
};

/** Dot grid backdrop with beat-reactive brightness. */
export const DotGrid: React.FC<{
  color: string;
  opacity: number;
  gap?: number;
  offset?: number;
}> = ({ color, opacity, gap = 40, offset = 0 }) => (
  <div
    style={{
      ...abs,
      width: 1920,
      height: 1080,
      opacity,
      backgroundImage: `radial-gradient(${color} 1.6px, transparent 1.8px)`,
      backgroundSize: `${gap}px ${gap}px`,
      backgroundPosition: `${offset}px ${offset * 0.5}px`,
    }}
  />
);
