// Imperative post stack. @react-three/postprocessing builds its composer in an effect, which
// runs after Remotion's one-shot advance() on a tab's first frame, so that frame silently loses
// every effect. Building synchronously during render keeps each captured frame fully graded.
import { useMemo } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import {
  BloomEffect,
  ChromaticAberrationEffect,
  DepthOfFieldEffect,
  EffectComposer,
  EffectPass,
  NoiseEffect,
  BlendFunction,
  RenderPass,
  SMAAEffect,
  ToneMappingEffect,
  ToneMappingMode,
  VignetteEffect,
} from "postprocessing";
import { N8AOPostPass } from "n8ao";

export type PostParams = {
  focus: [number, number, number];
  focusRange: number;
  bokeh: number;
  aberration: number;
  exposure?: number;
  frame: number;
};

export const Post: React.FC<PostParams> = ({ focus, focusRange, bokeh, aberration, exposure = 1, frame }) => {
  const { gl, scene, camera, size } = useThree();
  const fx = useMemo(() => {
    const composer = new EffectComposer(gl, { frameBufferType: THREE.HalfFloatType });
    composer.setSize(size.width, size.height);
    composer.addPass(new RenderPass(scene, camera));
    const ao = new N8AOPostPass(scene, camera, size.width, size.height);
    ao.configuration.aoRadius = 0.9;
    ao.configuration.distanceFalloff = 0.7;
    ao.configuration.intensity = 2.4;
    ao.configuration.gammaCorrection = false;
    ao.setQualityMode("High");
    composer.addPass(ao);
    const dof = new DepthOfFieldEffect(camera, { worldFocusDistance: 10, worldFocusRange: 4, bokehScale: 3, resolutionScale: 0.75 });
    dof.target = new THREE.Vector3();
    composer.addPass(new EffectPass(camera, dof));
    const bloom = new BloomEffect({ mipmapBlur: true, intensity: 0.6, luminanceThreshold: 0.82, luminanceSmoothing: 0.25, radius: 0.7 });
    composer.addPass(new EffectPass(camera, bloom));
    const ca = new ChromaticAberrationEffect({ offset: new THREE.Vector2(), radialModulation: true, modulationOffset: 0.15 });
    composer.addPass(new EffectPass(camera, ca));
    const tone = new ToneMappingEffect({ mode: ToneMappingMode.AGX });
    const vignette = new VignetteEffect({ offset: 0.3, darkness: 0.7 });
    const noise = new NoiseEffect({ blendFunction: BlendFunction.OVERLAY, premultiply: false });
    noise.blendMode.opacity.value = 0.16;
    composer.addPass(new EffectPass(camera, tone, vignette, noise));
    composer.addPass(new EffectPass(camera, new SMAAEffect()));
    return { composer, dof, ca, noise };
  }, [gl, scene, camera, size.width, size.height]);

  fx.dof.target!.set(...focus);
  fx.dof.cocMaterial.worldFocusRange = focusRange;
  fx.dof.bokehScale = bokeh;
  fx.ca.offset.set(0.0005 + aberration * 0.007, 0.0003 + aberration * 0.0035);
  gl.toneMappingExposure = exposure;

  // Priority > 0 takes over rendering from R3F. Delta is fixed from the frame number so the
  // grain pattern is deterministic across render tabs.
  useFrame(() => {
    fx.composer.render((frame % 97) / 60 + 0.016);
  }, 1);
  return null;
};
