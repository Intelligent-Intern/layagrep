import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { DURATION, FPS, PRE, SCENE } from "./cues";
import { C, kick, ramp } from "./lib/anim";
import { MONO, abs } from "./lib/ui";
import { Problem } from "./scenes/Problem";
import { Reveal } from "./scenes/Reveal";
import { Engine } from "./scenes/Engine";
import { Jev } from "./scenes/Jev";
import { Bench } from "./scenes/Bench";
import { Outro } from "./scenes/Outro";
import { Poster } from "./scenes/Poster";

const SCENES = [
  { at: SCENE.problem, end: SCENE.reveal, C: Problem, dark: false },
  { at: SCENE.reveal, end: SCENE.engine, C: Reveal, dark: false },
  { at: SCENE.engine, end: SCENE.jev, C: Engine, dark: true },
  { at: SCENE.jev, end: SCENE.bench, C: Jev, dark: true },
  { at: SCENE.bench, end: SCENE.outro, C: Bench, dark: false },
  { at: SCENE.outro, end: SCENE.end, C: Outro, dark: false },
];

const Grain: React.FC<{ frame: number }> = ({ frame }) => (
  <svg
    style={{ ...abs, pointerEvents: "none", mixBlendMode: "overlay", opacity: 0.32 }}
    width={1920}
    height={1080}
  >
    <filter id="grain">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.85"
        numOctaves={2}
        seed={Math.floor(frame / 2) % 50}
      />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#grain)" />
  </svg>
);

const Hud: React.FC<{ t: number; dark: boolean; idx: number }> = ({ t, dark, idx }) => {
  const col = dark ? "rgba(244,239,228,0.5)" : "rgba(18,18,18,0.45)";
  const kp = kick(t, 0.1);
  const mark = (x: number, y: number, rx: number, ry: number) => (
    <path
      d={`M${x} ${y + ry * 22} V${y} H${x + rx * 22}`}
      fill="none"
      stroke={col}
      strokeWidth={2}
    />
  );
  return (
    <>
      <svg style={abs} width={1920} height={1080}>
        {mark(40, 40, 1, 1)}
        {mark(1880, 40, -1, 1)}
        {mark(40, 1040, 1, -1)}
        {mark(1880, 1040, -1, -1)}
      </svg>
      <div
        style={{
          ...abs,
          left: 72,
          top: 44,
          fontFamily: MONO,
          fontSize: 15,
          letterSpacing: 3,
          color: col,
        }}
      >
        JEVGREP <span style={{ color: C.red }}>●</span> jg
      </div>
      <div
        style={{
          ...abs,
          left: 1600,
          top: 44,
          width: 250,
          textAlign: "right",
          fontFamily: MONO,
          fontSize: 15,
          letterSpacing: 3,
          color: col,
        }}
      >
        {String(idx + 1).padStart(2, "0")} / 06 &nbsp; 00:{String(Math.floor(t)).padStart(2, "0")}:
        {String(Math.floor((t % 1) * FPS)).padStart(2, "0")}
      </div>
      <div
        style={{
          ...abs,
          left: 72,
          top: 1030,
          width: 1776,
          height: 2,
          background: dark ? "rgba(244,239,228,0.12)" : "rgba(18,18,18,0.1)",
        }}
      >
        <div
          style={{
            height: 2 + kp * 2,
            marginTop: -kp,
            width: `${(t / DURATION) * 100}%`,
            background: C.red,
          }}
        />
      </div>
    </>
  );
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const preFrames = Math.round(PRE * FPS);
  const t = (frame - preFrames) / FPS;
  const idx = SCENES.findIndex((s) => t >= s.at && t < s.end);
  const scene = SCENES[Math.max(0, idx)];
  const S = scene.C;
  // Bench opens with a wipe over the dark Jev scene, so its HUD flips once ivory covers.
  const dark = scene.dark || (scene.C === Bench && t < SCENE.bench + 0.25);
  return (
    <AbsoluteFill style={{ background: C.ivory }}>
      <Audio src={staticFile("pre.wav")} />
      <Sequence from={preFrames}>
        <Audio src={staticFile("music.wav")} />
      </Sequence>
      {/* Key art holds, then flies apart into the cold open (feeds thumbnail an early frame). */}
      {t < 0 ? (
        <Poster exit={ramp(t, 0.3 - PRE, 0, (x) => x)} />
      ) : (
        <>
          <S t={t} />
          <div
            style={{
              ...abs,
              width: 1920,
              height: 1080,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.18) 100%)",
            }}
          />
          <Grain frame={frame} />
          <Hud t={t} dark={dark} idx={Math.max(0, idx)} />
        </>
      )}
    </AbsoluteFill>
  );
};
