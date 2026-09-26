import React from "react";
import { Composition } from "remotion";
import { DURATION, FPS, PRE } from "./cues";
import { Reel } from "./Reel";
import { Poster } from "./scenes/Poster";

export const Root: React.FC = () => (
  <>
    <Composition
      id="Reel"
      component={Reel}
      durationInFrames={(DURATION + PRE) * FPS}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="Poster"
      component={Poster}
      durationInFrames={1}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
);
