// The lens: one continuous desk world, a warm desk lamp, a room reflection map, and a
// game-cinematic post stack (AO, depth of field, bloom, aberration on impacts, grain).
import React, { useLayoutEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { Post } from "./Post";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { continueRender, delayRender, useCurrentFrame } from "remotion";
import { fontsReady } from "../lib/ui";
import { Desk } from "./props";

export type V3 = [number, number, number];
export type Shot = { pos: V3; target: V3; fov: number; roll?: number };

const Env: React.FC = () => {
  const { gl, scene } = useThree();
  useMemo(() => {
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.28;
    scene.background = new THREE.Color("#0b0d0c");
    scene.fog = new THREE.Fog("#0b0d0c", 40, 110);
  }, [gl, scene]);
  return null;
};

const Rig: React.FC<{ shot: Shot }> = ({ shot }) => {
  const { camera } = useThree();
  const cam = camera as THREE.PerspectiveCamera;
  cam.position.set(...shot.pos);
  cam.up.set(Math.sin(shot.roll ?? 0), Math.cos(shot.roll ?? 0), 0);
  cam.lookAt(...shot.target);
  if (cam.fov !== shot.fov) {
    cam.fov = shot.fov;
    cam.updateProjectionMatrix();
  }
  return null;
};

/** Warm desk lamp that tracks the action, plus a cool rim from behind. */
const Lights: React.FC<{ target: V3 }> = ({ target }) => {
  const spot = useMemo(() => {
    const s = new THREE.SpotLight("#FFD9A8", 1400, 0, 0.62, 0.75, 2);
    s.castShadow = true;
    s.shadow.mapSize.set(4096, 4096);
    s.shadow.bias = -0.00012;
    s.shadow.normalBias = 0.02;
    s.shadow.radius = 6;
    s.shadow.camera.near = 4;
    s.shadow.camera.far = 60;
    return s;
  }, []);
  spot.position.set(target[0] - 7, 21, target[2] + 5);
  spot.target.position.set(target[0] + 1, 0, target[2] - 1);
  spot.target.updateMatrixWorld();
  return (
    <>
      <primitive object={spot} />
      <primitive object={spot.target} />
      <hemisphereLight args={["#9fb6d4", "#1a120b", 0.22]} />
      <directionalLight position={[target[0] + 12, 9, target[2] - 16]} intensity={2.4} color="#9DBCE0" />
    </>
  );
};

export const World: React.FC<{
  shot: Shot;
  focus: V3;
  lamp: V3;
  aberration: number;
  bokeh?: number;
  focusRange?: number;
  exposure?: number;
  children: React.ReactNode;
}> = ({ shot, focus, lamp, aberration, bokeh = 3, focusRange = 5, exposure = 1, children }) => {
  const frame = useCurrentFrame();
  const [handle] = useState(() => delayRender("fonts"));
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    fontsReady().then(() => setReady(true));
  }, []);
  // Release only after the canvas has mounted, so ThreeCanvas registers its own hold first.
  useLayoutEffect(() => {
    if (ready) continueRender(handle);
  }, [ready, handle]);
  if (!ready) return null;
  return (
    <ThreeCanvas
      width={1920}
      height={1080}
      shadows="soft"
      camera={{ fov: shot.fov, near: 0.1, far: 300, position: shot.pos }}
      gl={{ antialias: false, toneMapping: THREE.NoToneMapping, preserveDrawingBuffer: true }}
      style={{ position: "absolute", left: 0, top: 0 }}
    >
      <Env />
      <Rig shot={shot} />
      <Lights target={lamp} />
      <Desk />
      {children}
      <Post focus={focus} focusRange={focusRange} bokeh={bokeh} aberration={aberration} exposure={exposure} frame={frame} />
    </ThreeCanvas>
  );
};

/** Camera keyframes: [time, shot]; each segment eases with its own curve. */
export function shotAt(t: number, keys: [number, Shot, ((x: number) => number)?][]): Shot {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, sa] = keys[i],
      [b, sb, ease] = keys[i + 1];
    if (t <= b) {
      const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
      const e = (ease ?? smooth)(x);
      const L = (p: number, q: number) => p + (q - p) * e;
      return {
        pos: [L(sa.pos[0], sb.pos[0]), L(sa.pos[1], sb.pos[1]), L(sa.pos[2], sb.pos[2])],
        target: [L(sa.target[0], sb.target[0]), L(sa.target[1], sb.target[1]), L(sa.target[2], sb.target[2])],
        fov: L(sa.fov, sb.fov),
        roll: L(sa.roll ?? 0, sb.roll ?? 0),
      };
    }
  }
  return keys[keys.length - 1][1];
}
const smooth = (x: number) => x * x * x * (x * (x * 6 - 15) + 10);
