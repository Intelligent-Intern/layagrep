# jevgrep v0.4 release video

A 40-second three.js film for the jevgrep v0.4 release: same 8/10 SWE-bench solves as the
agent alone, 30% less Sol cost (measured 28.6%). It is built with [Remotion](https://www.remotion.dev) and
[react-three-fiber](https://r3f.docs.pmnd.rs). The soundtrack is synthesized in code: no
samples, stock music, or plugins.

```sh
npm install
npm run studio   # scrub the timeline in a browser
npm run draft    # regenerate music, then out/draft.mp4 at half scale
npm run render   # regenerate music, then out/jevgrep-0.4.mp4 (1080p60, CRF 14, 320k AAC)
```

This is a standalone npm project outside the Bun workspace; it imports nothing from the CLI.

## The world

One continuous desk. The agent pays for every page it reads, so jg is the clerk who builds a
case file. Each change in v0.4 gets an everyday prop at its own station, and the camera
travels between them:
a limbo string for the relevance bar, two rubber stamps for relevance vs scope, scissors and
paperclips for structural context, face-down cards for tests, a guillotine for output
truncation, and receipts for cost.

## Timing is shared

[`src/cues.ts`](src/cues.ts) is the only place times live. Stations, camera keys, and
[`scripts/music.mjs`](scripts/music.mjs) all read it, so every stamp, chop and slam lands on a
hit in the mix. Retime a cue there and picture and sound move together.

The video opens on a 0.3 s hold of the finished title card (`THUMB_T`), because social feeds
thumbnail an early frame. `pre.wav` covers that hold and `music.wav` starts at the cold open.

## Rendering notes

- WebGL needs ANGLE in headless Chrome; [`remotion.config.ts`](remotion.config.ts) sets it.
- The post stack (AO, depth of field, bloom, aberration, grain) is built imperatively in
  [`src/three/Post.tsx`](src/three/Post.tsx). `@react-three/postprocessing` sets up its
  composer in an effect, after Remotion's one-shot `advance()`, and drops every effect from a
  render tab's first frame.
- Textures are drawn on canvases after the vendored fonts in `public/fonts` load, so frames
  never depend on the network.
- Judge effects in rendered frames (`npx remotion still …`), not the studio preview. The mix
  cannot be heard in review: check loudness with ffmpeg's `ebur128` filter and cue placement
  with `showspectrumpic`.

## Claims

[`src/data.ts`](src/data.ts) holds the numbers from
`evals/results/relevance-threshold-2026-09-27.md`: per-task Sol costs, $7.62 → $5.44, and the
same 8/10 official solves. The measured reduction is 28.6%; on screen it is rounded to "30%
less", as the repository README rounds it. The 51 → 10 file count is the single Django task
from the same report. The changes appear as one package because the report does not isolate
their individual effects, and the comparison is against the agent without jg, not jg v0.3.
This is a marketing cut with no on-screen disclosure; keep the rounded claim tied to that
report if the numbers change.
