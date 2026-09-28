import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { noise2D } from "@remotion/noise";
import { B, DURATION, FPS, K, O, P, PRE, S, SCENE, T, THUMB_T, X } from "./cues";
import { C, clamp01, kick, sp } from "./lib/anim";
import { MONO, SERIF, abs } from "./lib/ui";
import { World, shotAt, type Shot } from "./three/World";
import { Opening, openingShots } from "./three/stations/Opening";
import { Bar, barShots, keptCount } from "./three/stations/Bar";
import { Scope, scopeShots } from "./three/stations/Scope";
import { Clip, clipShots } from "./three/stations/Clip";
import { Cut, cutShots } from "./three/stations/Cut";
import { Payoff, payoffShots } from "./three/stations/Payoff";
import { A } from "./cues";

const SHOTS = [...openingShots, ...barShots, ...scopeShots, ...clipShots, ...cutShots, ...payoffShots].sort((a, b) => a[0] - b[0]);

// Impacts: [time, shake amplitude, aberration].
const HITS: [number, number, number][] = [
  [0, 0.08, 0.3],
  [T.slam, 0.35, 1],
  [T.stamp, 0.18, 0.5],
  [T.version, 0.12, 0.4],
  [B.snap, 0.12, 0.7],
  ...S.pages.flatMap(([r, s]) => [[r, 0.06, 0.2], [s, 0.06, 0.2]] as [number, number, number][]),
  [X.cut1, 0.2, 0.8],
  [X.cut2, 0.2, 0.8],
  [P.drop, 0.3, 1],
  [P.slam, 0.4, 1],
  [O.hit, 0.25, 0.7],
];
const env = (t: number, at: number, decay: number) => (t >= at ? Math.exp(-(t - at) / decay) : 0);

function camera(t: number): Shot {
  const s = shotAt(t, SHOTS);
  let amp = 0.015; // handheld breathing
  for (const [at, a] of HITS) amp += a * env(t, at, 0.12);
  const n = (k: string) => noise2D(k, t * 9, 0) * amp;
  return { ...s, pos: [s.pos[0] + n("x"), s.pos[1] + n("y"), s.pos[2] + n("z")], roll: (s.roll ?? 0) + n("r") * 0.08 };
}
const aberration = (t: number) => Math.min(1, HITS.reduce((v, [at, , a]) => v + a * env(t, at, 0.09), 0));

// ---------- overlay ----------
type Header = { at: number; end: number; chip?: string; text: string; live?: (t: number) => string };
const pagesRead = (t: number) => A.flicks.filter((f) => t >= f + 0.42).length;
const HEADERS: Header[] = [
  { at: 0.25, end: A.implode, text: "Every page an agent reads is billed.", live: (t) => `${pagesRead(t)} pages read` },
  { at: B.rise + 0.3, end: B.exit, chip: "01 · stricter bar", text: "Only files above 0.5 relevance get in.", live: (t) => `${keptCount(t)} files · one Django task` },
  { at: S.enter + 0.3, end: S.exit, chip: "02 · two judgments", text: "Relevant isn't enough. It must be in scope." },
  { at: K.enter + 0.3, end: K.tests, chip: "03 · structural context", text: "Clip the code. Keep its context." },
  { at: K.tests, end: K.exit, chip: "04 · selective tests", text: "Only the tests that explain it." },
  { at: X.enter + 0.3, end: X.exit, chip: "05 · source first", text: "Source first, so it survives the cut." },
  { at: P.drop + 0.3, end: SCENE.outro - 0.15, text: "Same 8 of 10 solved. 30% less cost." },
];

const HeaderView: React.FC<{ t: number }> = ({ t }) => {
  const h = HEADERS.find((x) => t >= x.at && t < x.end);
  if (!h) return null;
  const inn = sp(t, h.at, { damping: 16, stiffness: 160 });
  const out = clamp01((h.end - t) / 0.16);
  return (
    <div style={{ ...abs, left: 96, top: 72, opacity: out }}>
      {h.chip && (
        <div
          style={{
            display: "inline-block",
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 17,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: "#16120E",
            background: C.red,
            padding: "5px 12px",
            borderRadius: 3,
            marginBottom: 16,
            transform: `translateX(${(1 - inn) * -40}px)`,
            opacity: inn,
          }}
        >
          v0.4 &nbsp;/&nbsp; {h.chip}
        </div>
      )}
      <div style={{ fontFamily: SERIF, fontWeight: 600, fontSize: 56, lineHeight: 1.08, color: C.ivory, textShadow: "0 4px 30px rgba(0,0,0,0.75)", letterSpacing: -0.5 }}>
        {h.text.split(" ").map((w, i) => {
          const k = sp(t, h.at + i * 0.035, { damping: 15, stiffness: 180 });
          return (
            <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", marginRight: "0.25em", paddingBottom: "0.1em" }}>
              <span style={{ display: "inline-block", transform: `translateY(${(1 - k) * 110}%)` }}>{w}</span>
            </span>
          );
        })}
      </div>
      {h.live && (
        <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 26, color: C.red, letterSpacing: 1, opacity: inn, textShadow: "0 2px 16px rgba(0,0,0,0.8)" }}>
          {h.live(t)}
        </div>
      )}
    </div>
  );
};

const Hud: React.FC<{ t: number }> = ({ t }) => {
  return (
    <>
      <div style={{ ...abs, left: 1520, top: 80, width: 304, textAlign: "right", fontFamily: MONO, fontSize: 15, letterSpacing: 3, color: "rgba(244,239,228,0.5)" }}>
        JEVGREP <span style={{ color: C.red }}>●</span> v0.4
      </div>
    </>
  );
};

const Outro: React.FC<{ t: number }> = ({ t }) => {
  if (t < O.ding) return null;
  const k = sp(t, O.ding, { damping: 18, stiffness: 120 });
  return (
    <div style={{ ...abs, left: 0, top: 960, width: 1920, textAlign: "center", fontFamily: MONO, fontSize: 22, letterSpacing: 4, color: "rgba(244,239,228,0.8)", opacity: k }}>
      github.com/dzhng/jevgrep
    </div>
  );
};

export const Film: React.FC = () => {
  const frame = useCurrentFrame();
  const preFrames = Math.round(PRE * FPS);
  const tReal = (frame - preFrames) / FPS;
  // Pre-roll holds the finished title card (feeds thumbnail an early frame).
  const t = tReal < 0 ? THUMB_T : tReal;
  const shot = tReal < 0 ? shotAt(THUMB_T, SHOTS) : camera(t);
  const fadeOut = clamp01((DURATION - tReal) / 0.5);
  return (
    <AbsoluteFill style={{ background: "#0b0d0c" }}>
      <Audio src={staticFile("pre.wav")} />
      <Sequence from={preFrames}>
        <Audio src={staticFile("music.wav")} />
      </Sequence>
      <World shot={shot} focus={shot.target} lamp={shot.target} aberration={tReal < 0 ? 0 : aberration(t)} bokeh={3.2} focusRange={5.5}>
        <Opening t={t} />
        <Bar t={t} />
        <Scope t={t} />
        <Clip t={t} />
        <Cut t={t} />
        <Payoff t={t} />
      </World>
      {tReal >= 0 && <HeaderView t={t} />}
      {tReal >= 0 && <Hud t={t} />}
      <Outro t={t} />
      <div style={{ ...abs, width: 1920, height: 1080, background: "#000", opacity: 1 - fadeOut, pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

/** README / social key art: the payoff desk with the headline claim and its disclosure. */
export const KeyArt: React.FC = () => {
  const t = SCENE.outro - 0.5;
  const shot: Shot = { pos: [163, 13.5, 9.5], target: [161, 0, -1.2], fov: 44 };
  return (
    <AbsoluteFill style={{ background: "#0b0d0c" }}>
      <World shot={shot} focus={[165, 0, -1]} lamp={[164, 0, -1]} aberration={0} bokeh={2.4} focusRange={7}>
        <Payoff t={t} />
      </World>
      <div style={{ ...abs, width: 1920, height: 1080, background: "linear-gradient(100deg, rgba(8,10,9,0.82) 0%, rgba(8,10,9,0.55) 38%, rgba(8,10,9,0) 60%)" }} />
      <div style={{ ...abs, left: 96, top: 90, fontFamily: SERIF, color: C.ivory, textShadow: "0 6px 40px rgba(0,0,0,0.8)" }}>
        <div style={{ fontSize: 132, fontWeight: 900, lineHeight: 1, letterSpacing: -3, marginBottom: 22 }}>
          jevgrep <span style={{ color: C.red }}>v0.4</span>
        </div>
        <div style={{ fontSize: 80, fontWeight: 600, lineHeight: 1.05, letterSpacing: -1 }}>Same intelligence.</div>
        <div style={{ fontSize: 80, fontWeight: 600, lineHeight: 1.05, letterSpacing: -1, color: C.red }}>30% less cost.</div>
      </div>
    </AbsoluteFill>
  );
};
