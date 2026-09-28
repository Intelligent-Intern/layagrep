// Physical props for the case-file world. Units: 1 = 10 cm. Desk top is the y = 0 plane.
import React, { useMemo } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { TAPE, blotterTex, inkTex, manilaTex, matTex, pageTex, tapeTex, woodTex, type PageSpec } from "./tex";

type V3 = [number, number, number];

// ---------- shared materials ----------
export const MAT = {
  brass: new THREE.MeshPhysicalMaterial({ color: "#C9A25A", metalness: 1, roughness: 0.28, clearcoat: 0.4 }),
  steel: new THREE.MeshPhysicalMaterial({ color: "#D6DBE0", metalness: 1, roughness: 0.18 }),
  darkSteel: new THREE.MeshStandardMaterial({ color: "#3A3F44", metalness: 0.9, roughness: 0.35 }),
  lacquer: new THREE.MeshPhysicalMaterial({ color: "#D8432A", roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.08 }),
  rubber: new THREE.MeshStandardMaterial({ color: "#2A1C18", roughness: 0.9 }),
  cardboard: new THREE.MeshStandardMaterial({ color: "#A27D52", roughness: 0.92 }),
  cardboardIn: new THREE.MeshStandardMaterial({ color: "#6E5237", roughness: 0.95 }),
  manila: new THREE.MeshStandardMaterial({ color: "#D9BF86", roughness: 0.85 }),
  manilaDeep: new THREE.MeshStandardMaterial({ color: "#B99B5E", roughness: 0.88 }),
  ivory: new THREE.MeshStandardMaterial({ color: "#F1EBDD", roughness: 0.9 }),
  red: new THREE.MeshStandardMaterial({ color: "#EF5638", roughness: 0.6 }),
  redString: new THREE.MeshStandardMaterial({ color: "#E0432A", roughness: 0.7, emissive: "#6a1405", emissiveIntensity: 0.4 }),
  beetle: new THREE.MeshPhysicalMaterial({ color: "#111214", roughness: 0.2, clearcoat: 1, metalness: 0.2 }),
  black: new THREE.MeshStandardMaterial({ color: "#161616", roughness: 0.6 }),
};

// ---------- desk ----------
export const Desk: React.FC = () => {
  const wood = useMemo(
    () =>
      new THREE.MeshStandardMaterial({ map: woodTex(), roughnessMap: woodTex(true), roughness: 0.55, metalness: 0 }),
    [],
  );
  const blot = useMemo(() => new THREE.MeshStandardMaterial({ map: blotterTex(), roughness: 0.78 }), []);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[75, -0.02, 0]} receiveShadow material={wood}>
        <planeGeometry args={[320, 160]} />
      </mesh>
      {/* the blotter under the main stations */}
      <mesh position={[75, -0.01, 0]} receiveShadow material={blot}>
        <boxGeometry args={[230, 0.02, 60]} />
      </mesh>
    </group>
  );
};

// ---------- paper ----------
const planeCache = new Map<string, THREE.BufferGeometry>();
/** A sheet lying in XZ, gently curled along its width so the light rolls across it. */
function sheetGeo(w: number, h: number, curl: number) {
  const key = `${w}:${h}:${curl.toFixed(3)}`;
  let g = planeCache.get(key);
  if (!g) {
    g = new THREE.PlaneGeometry(w, h, 24, 6);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) / (w / 2),
        y = p.getY(i) / (h / 2);
      p.setZ(i, curl * (x * x * 0.8 + y * y * 0.2));
    }
    g.computeVertexNormals();
    g.rotateX(-Math.PI / 2);
    planeCache.set(key, g);
  }
  return g;
}

const matCache = new Map<THREE.Texture, THREE.MeshStandardMaterial>();
export const paperMat = (tex: THREE.Texture) => {
  let m = matCache.get(tex);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.88, side: THREE.DoubleSide });
    matCache.set(tex, m);
  }
  return m;
};

export const Sheet: React.FC<{
  spec?: PageSpec;
  tex?: THREE.Texture;
  w?: number;
  h?: number;
  curl?: number;
  position?: V3;
  rotation?: V3;
  scale?: number;
  opacity?: number;
}> = ({ spec, tex, w = 2.1, h = 2.9, curl = 0.04, position, rotation, scale }) => {
  const t = tex ?? pageTex(spec ?? { seed: 0 });
  return (
    <mesh geometry={sheetGeo(w, h, curl)} material={paperMat(t)} position={position} rotation={rotation} scale={scale} castShadow receiveShadow />
  );
};

/** Flat decal (ink, labels) floating a hair above a surface. */
export const Decal: React.FC<{ tex: THREE.Texture; w: number; h: number; position?: V3; rotation?: V3; opacity?: number; rough?: number }> = ({
  tex,
  w,
  h,
  position,
  rotation,
  opacity = 1,
  rough = 0.7,
}) => (
  <mesh position={position} rotation={rotation ?? [-Math.PI / 2, 0, 0]} renderOrder={2}>
    <planeGeometry args={[w, h]} />
    <meshStandardMaterial map={tex} transparent opacity={opacity} roughness={rough} depthWrite={false} polygonOffset polygonOffsetFactor={-4} />
  </mesh>
);

export const InkStamp: React.FC<{ label: string; color: string; mark?: "check" | "cross" | "none"; w?: number; position?: V3; rz?: number; opacity?: number }> = ({
  label,
  color,
  mark = "check",
  w = 1.8,
  position,
  rz = 0.12,
  opacity = 0.95,
}) => <Decal tex={inkTex(label, color, mark)} w={w} h={w / 4} position={position} rotation={[-Math.PI / 2, 0, rz]} opacity={opacity} rough={0.5} />;

// ---------- rubber stamp ----------
const handleGeo = new THREE.LatheGeometry(
  [
    [0.0, 0],
    [0.34, 0],
    [0.3, 0.08],
    [0.16, 0.2],
    [0.13, 0.55],
    [0.22, 0.75],
    [0.3, 0.92],
    [0.26, 1.06],
    [0.12, 1.12],
    [0.0, 1.13],
  ].map(([x, y]) => new THREE.Vector2(x, y)),
  48,
);

export const RubberStamp: React.FC<{ w?: number; d?: number; position?: V3; rotation?: V3; scale?: number }> = ({ w = 2.2, d = 0.9, position, rotation, scale = 1 }) => {
  const wood = useMemo(
    () => new THREE.MeshPhysicalMaterial({ map: woodTex(), color: "#C08A5A", roughness: 0.45, clearcoat: 0.6, clearcoatRoughness: 0.3 }),
    [],
  );
  const block = useMemo(() => new RoundedBoxGeometry(w, 0.42, d, 4, 0.08), [w, d]);
  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh position={[0, 0.06, 0]} castShadow material={MAT.rubber}>
        <boxGeometry args={[w * 0.96, 0.12, d * 0.92]} />
      </mesh>
      <mesh position={[0, 0.33, 0]} geometry={block} material={wood} castShadow receiveShadow />
      <mesh position={[0, 0.54, 0]} geometry={handleGeo} material={MAT.lacquer} castShadow scale={[1.3, 1.25, 1.3]} />
    </group>
  );
};

// ---------- folders ----------
/** Manila case folder: back board, tab, and a front cover hinged on its left edge (x = -w/2). */
export const CaseFolder: React.FC<{
  w?: number;
  d?: number;
  open?: number; // 0 closed … 1 fully open (cover rotated over to the left)
  front?: THREE.Texture;
  tab?: THREE.Texture;
  position?: V3;
  rotation?: V3;
  children?: React.ReactNode; // lies on the cover, moves with it
  inside?: React.ReactNode;
}> = ({ w = 13.2, d = 8.4, open = 0, front, tab, position, rotation, children, inside }) => {
  const frontMat = useMemo(
    () => (front ? new THREE.MeshStandardMaterial({ map: front, roughness: 0.82 }) : MAT.manila),
    [front],
  );
  const tabMat = useMemo(() => (tab ? new THREE.MeshStandardMaterial({ map: tab, roughness: 0.85 }) : MAT.manilaDeep), [tab]);
  const back = useMemo(() => new RoundedBoxGeometry(w, 0.03, d, 2, 0.012), [w, d]);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={back} material={MAT.manilaDeep} position={[0, 0.015, 0]} castShadow receiveShadow />
      <mesh position={[-w / 2 + 2.2, 0.015, -d / 2 - 0.3]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.03, 0.62]} />
        <primitive object={tabMat} attach="material" />
      </mesh>
      {inside}
      <group position={[-w / 2, 0.05, 0]} rotation={[0, 0, open * Math.PI * 0.98]}>
        <group position={[w / 2, 0, 0.08]}>
          <mesh castShadow receiveShadow material={frontMat}>
            <boxGeometry args={[w, 0.03, d - 0.16]} />
          </mesh>
          <group position={[0, 0.02, 0]}>{children}</group>
        </group>
      </group>
    </group>
  );
};

/** Upright hanging-file folder with a tab; pivots about its bottom edge (fold: 0 up … 1 flat). */
export const UprightFolder: React.FC<{ h: number; w?: number; fold?: number; position?: V3; mat?: THREE.Material; tabX?: number; tabMat?: THREE.Material }> = ({
  h,
  w = 1.5,
  fold = 0,
  position,
  mat = MAT.manila,
  tabX = 0,
  tabMat,
}) => (
  <group position={position} rotation={[-fold * Math.PI * 0.5, 0, 0]}>
    <mesh position={[0, h / 2, 0]} castShadow receiveShadow material={mat}>
      <boxGeometry args={[w, h, 0.05]} />
    </mesh>
    <mesh position={[tabX, h + 0.1, 0]} castShadow material={tabMat ?? mat}>
      <boxGeometry args={[w * 0.4, 0.2, 0.05]} />
    </mesh>
  </group>
);

/** Open-top archive box filled with folders. */
export const ArchiveBox: React.FC<{ position?: V3; rotation?: V3; seed?: number }> = ({ position, rotation, seed = 0 }) => {
  const W = 3.4,
    D = 2.5,
    H = 1.4,
    t = 0.05;
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, t / 2, 0]} receiveShadow castShadow material={MAT.cardboard}>
        <boxGeometry args={[W, t, D]} />
      </mesh>
      {(
        [
          [0, H / 2, D / 2, W, H, t],
          [0, H / 2, -D / 2, W, H, t],
          [W / 2, H / 2, 0, t, H, D],
          [-W / 2, H / 2, 0, t, H, D],
        ] as number[][]
      ).map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x, y, z]} castShadow receiveShadow material={MAT.cardboard}>
          <boxGeometry args={[w, h, d]} />
        </mesh>
      ))}
      {Array.from({ length: 10 }, (_, i) => {
        const r = Math.sin(i * 12.9 + seed * 7.1) * 0.5;
        return (
          <group key={i} position={[0, 0.05, -D / 2 + 0.2 + i * 0.22]} rotation={[r * 0.12, 0, r * 0.02]}>
            <mesh position={[0, 0.62, 0]} castShadow receiveShadow material={i % 3 === 1 ? MAT.ivory : MAT.manila}>
              <boxGeometry args={[W - 0.2, 1.24, 0.03]} />
            </mesh>
            <mesh position={[-1.2 + ((i * 0.37 + seed) % 2.4), 1.34, 0]} castShadow material={MAT.manilaDeep}>
              <boxGeometry args={[0.5, 0.2, 0.03]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// ---------- brass post + red string ----------
export const BrassPost: React.FC<{ h: number; position?: V3 }> = ({ h, position }) => (
  <group position={position}>
    <mesh position={[0, 0.06, 0]} castShadow receiveShadow material={MAT.brass}>
      <cylinderGeometry args={[0.45, 0.5, 0.12, 40]} />
    </mesh>
    <mesh position={[0, h / 2, 0]} castShadow material={MAT.brass}>
      <cylinderGeometry args={[0.07, 0.07, h, 24]} />
    </mesh>
    <mesh position={[0, h + 0.1, 0]} castShadow material={MAT.brass}>
      <sphereGeometry args={[0.16, 32, 16]} />
    </mesh>
  </group>
);

/** Red string along a sagging curve from a to b; `draw` 0..1 shoots it out from a. */
export const StringLine: React.FC<{ a: V3; b: V3; sag?: number; draw?: number; r?: number }> = ({ a, b, sag = 0, draw = 1, r = 0.035 }) => {
  const geo = useMemo(() => {
    if (draw <= 0.001) return null;
    const A = new THREE.Vector3(...a),
      B = new THREE.Vector3(...b);
    const M = A.clone().lerp(B, 0.5);
    M.y -= sag;
    const curve = new THREE.QuadraticBezierCurve3(A, M, B);
    const pts = curve.getPoints(40).slice(0, Math.max(2, Math.ceil(41 * draw)));
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, r, 8, false);
  }, [a[0], a[1], a[2], b[0], b[1], b[2], sag, draw, r]);
  if (!geo) return null;
  return <mesh geometry={geo} material={MAT.redString} castShadow />;
};

export const Pin: React.FC<{ position: V3 }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 0.12, 0]} castShadow material={MAT.lacquer}>
      <sphereGeometry args={[0.16, 24, 16]} />
    </mesh>
    <mesh position={[0, 0.04, 0]} material={MAT.steel}>
      <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
    </mesh>
  </group>
);

// ---------- paperclip ----------
const clipGeo = (() => {
  const pts = [
    [0, -0.3], [0, 0.55], [0.09, 0.64], [0.18, 0.55], [0.18, -0.45], [0.09, -0.56], [-0.06, -0.56], [-0.13, -0.45], [-0.13, 0.62], [-0.02, 0.74], [0.09, 0.74],
  ].map(([x, y]) => new THREE.Vector3(x, 0, y));
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, 0.022, 8, false);
})();
export const Paperclip: React.FC<{ position?: V3; rotation?: V3; scale?: number }> = ({ position, rotation, scale = 1 }) => (
  <mesh geometry={clipGeo} material={MAT.steel} position={position} rotation={rotation} scale={scale} castShadow />
);

// ---------- beetle ----------
export const Beetle: React.FC<{ position?: V3; rotation?: V3; t: number; scale?: number }> = ({ position, rotation, t, scale = 1 }) => (
  <group position={position} rotation={rotation} scale={scale}>
    <mesh position={[0, 0.12, 0]} scale={[0.22, 0.13, 0.3]} castShadow material={MAT.beetle}>
      <sphereGeometry args={[1, 32, 16]} />
    </mesh>
    <mesh position={[0, 0.1, -0.32]} scale={[0.12, 0.09, 0.1]} castShadow material={MAT.beetle}>
      <sphereGeometry args={[1, 24, 12]} />
    </mesh>
    {[-1, 1].flatMap((s) =>
      [-0.12, 0.02, 0.16].map((z, i) => (
        <mesh
          key={`${s}${i}`}
          position={[s * 0.24, 0.05, z]}
          rotation={[0, s * (0.4 + Math.sin(t * 38 + i * 2 + (s > 0 ? 1.5 : 0)) * 0.35), s * 0.5]}
          material={MAT.beetle}
          castShadow
        >
          <boxGeometry args={[0.22, 0.02, 0.02]} />
        </mesh>
      )),
    )}
  </group>
);

// ---------- scissors ----------
const bladeShape = (() => {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(2.2, 0.02);
  s.quadraticCurveTo(2.35, 0.05, 2.2, 0.12);
  s.lineTo(0, 0.2);
  s.closePath();
  return new THREE.ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: true, bevelSize: 0.01, bevelThickness: 0.01, bevelSegments: 2 });
})();
export const Scissors: React.FC<{ open: number; position?: V3; rotation?: V3; scale?: number }> = ({ open, position, rotation, scale = 1 }) => {
  const a = 0.08 + open * 0.38;
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {[-1, 1].map((s) => (
        <group key={s} rotation={[0, s * a, 0]} position={[0, s * 0.02, 0]}>
          <mesh geometry={bladeShape} rotation={[s > 0 ? Math.PI / 2 : -Math.PI / 2, 0, 0]} position={[0, 0, 0]} scale={[1, s, 1]} material={MAT.steel} castShadow />
          <mesh position={[-0.75, 0, s * 0.28]} rotation={[Math.PI / 2, 0, 0]} scale={[1.25, 0.8, 1]} castShadow material={MAT.lacquer}>
            <torusGeometry args={[0.28, 0.07, 12, 36]} />
          </mesh>
          <mesh position={[-0.3, 0, s * 0.1]} rotation={[0, -s * 0.35, Math.PI / 2]} castShadow material={MAT.lacquer}>
            <cylinderGeometry args={[0.06, 0.08, 0.5, 12]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.05, 0]} material={MAT.darkSteel}>
        <cylinderGeometry args={[0.06, 0.06, 0.12, 16]} />
      </mesh>
    </group>
  );
};

export { manilaTex, pageTex };

// ---------- label-maker tape ----------
/** Glossy tape whose first `n` letters are punched; anchored at its left end. */
export const Tape: React.FC<{ text: string; color: string; n: number; h?: number; position?: V3; rotation?: V3 }> = ({
  text,
  color,
  n,
  h = 0.5,
  position,
  rotation,
}) => {
  const base = tapeTex(text, color);
  const tex = useMemo(() => {
    const c = base.clone();
    c.needsUpdate = true;
    return c;
  }, [base]);
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.15 }), [tex]);
  if (n <= 0) return null;
  const full = text.length * TAPE.cw + TAPE.pad * 2;
  const vis = Math.min(full, n * TAPE.cw + TAPE.pad * 2);
  tex.repeat.set(vis / full, 1);
  const w = (h * vis) / TAPE.h;
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[w / 2, 0.012, 0]} rotation-x={-Math.PI / 2} material={mat} castShadow receiveShadow>
        <planeGeometry args={[w, h]} />
      </mesh>
    </group>
  );
};

// ---------- receipt printer ----------
/** Receipt feeding out of a printer slot toward +z; `p` 0..1 printed; texture top at the tip. */
export const Receipt: React.FC<{ tex: THREE.Texture; length: number; width?: number; p: number; position?: V3; rotation?: V3 }> = ({
  tex: base,
  length,
  width = 1.6,
  p,
  position,
  rotation,
}) => {
  const tex = useMemo(() => {
    const c = base.clone();
    c.needsUpdate = true;
    return c;
  }, [base]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, side: THREE.DoubleSide }), [tex]);
  if (p <= 0.001) return null;
  const L = length * p;
  tex.repeat.set(1, p);
  tex.offset.set(0, 1 - p);
  return (
    <group position={position} rotation={rotation}>
      {/* plane +y (texture top) points to +z after the flip, so the first line printed leads */}
      <mesh position={[0, 0.02, L / 2]} rotation={[-Math.PI / 2, 0, Math.PI]} material={mat} castShadow receiveShadow>
        <planeGeometry args={[width, L]} />
      </mesh>
    </group>
  );
};

export const Printer: React.FC<{ position?: V3; rotation?: V3 }> = ({ position, rotation }) => {
  const body = useMemo(() => new RoundedBoxGeometry(2.4, 1.1, 1.8, 4, 0.18), []);
  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={body} position={[0, 0.55, -0.9]} material={MAT.black} castShadow receiveShadow />
      <mesh position={[0, 1.02, -0.02]} material={MAT.darkSteel}>
        <boxGeometry args={[1.8, 0.1, 0.08]} />
      </mesh>
      <mesh position={[0.8, 1.11, -1.2]} material={MAT.red}>
        <cylinderGeometry args={[0.1, 0.1, 0.04, 20]} />
      </mesh>
    </group>
  );
};

// ---------- guillotine paper cutter ----------
/** Board with a cutting mat; the arm hinges at the far end of the cut line (x = 0, z = -d/2). */
export const Guillotine: React.FC<{ angle: number; w?: number; d?: number; position?: V3 }> = ({ angle, w = 11, d = 7, position }) => {
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ map: matTex(), roughness: 0.8 }), []);
  return (
    <group position={position}>
      <mesh position={[-w / 2, 0.15, 0]} material={MAT.black} castShadow receiveShadow>
        <boxGeometry args={[w, 0.3, d]} />
      </mesh>
      <mesh position={[-w / 2, 0.305, 0]} rotation-x={-Math.PI / 2} material={mat} receiveShadow>
        <planeGeometry args={[w - 0.2, d - 0.2]} />
      </mesh>
      {/* steel cutting edge along the board's right side */}
      <mesh position={[0, 0.33, 0]} material={MAT.steel} receiveShadow>
        <boxGeometry args={[0.12, 0.06, d]} />
      </mesh>
      <group position={[0.1, 0.42, -d / 2 + 0.2]} rotation={[-angle, 0, 0]}>
        <mesh position={[0, 0.02, d / 2 + 0.3]} material={MAT.steel} castShadow>
          <boxGeometry args={[0.08, 0.34, d + 0.6]} />
        </mesh>
        <mesh position={[0.1, 0.1, d / 2 + 0.3]} material={MAT.darkSteel} castShadow>
          <boxGeometry args={[0.14, 0.2, d + 0.2]} />
        </mesh>
        <mesh position={[0.05, 0.1, d + 0.9]} rotation-x={Math.PI / 2} material={MAT.lacquer} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 1.2, 24]} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation-z={Math.PI / 2} material={MAT.brass} castShadow>
          <cylinderGeometry args={[0.28, 0.28, 0.4, 24]} />
        </mesh>
      </group>
    </group>
  );
};

/** Open-top wire wastebasket. */
export const Wastebasket: React.FC<{ position?: V3 }> = ({ position }) => (
  <group position={position}>
    <mesh position={[0, 1.3, 0]} material={MAT.darkSteel} castShadow receiveShadow>
      <cylinderGeometry args={[1.6, 1.25, 2.6, 48, 1, true]} />
    </mesh>
    <mesh position={[0, 0.03, 0]} material={MAT.darkSteel} receiveShadow>
      <cylinderGeometry args={[1.25, 1.25, 0.06, 48]} />
    </mesh>
    <mesh position={[0, 2.6, 0]} rotation-x={Math.PI / 2} material={MAT.steel} castShadow>
      <torusGeometry args={[1.6, 0.05, 10, 64]} />
    </mesh>
  </group>
);

/** Two-sided card: front face up when flip = 0, back face up when flip = 1 (turns about z). */
export const FlipCard: React.FC<{ front: THREE.Texture; back: THREE.Texture; flip: number; w?: number; h?: number; position?: V3; rotation?: V3 }> = ({
  front,
  back,
  flip,
  w = 2.1,
  h = 2.9,
  position,
  rotation,
}) => (
  <group position={position} rotation={rotation}>
    <group position={[0, Math.sin(Math.PI * flip) * 1.1, 0]} rotation={[0, 0, Math.PI * flip]}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, 0]} material={paperMat(front)} castShadow receiveShadow>
        <planeGeometry args={[w, h]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, Math.PI]} position={[0, -0.006, 0]} material={paperMat(back)} castShadow receiveShadow>
        <planeGeometry args={[w, h]} />
      </mesh>
    </group>
  </group>
);
