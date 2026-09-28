import React from "react";
import { Composition } from "remotion";
import { DURATION, FPS, PRE } from "./cues";
import { Film, KeyArt } from "./Film";

export const Root: React.FC = () => (
  <>
    <Composition id="Release" component={Film} durationInFrames={Math.round((DURATION + PRE) * FPS)} fps={FPS} width={1920} height={1080} />
    <Composition id="KeyArt" component={KeyArt} durationInFrames={1} fps={FPS} width={1920} height={1080} />
  </>
);
