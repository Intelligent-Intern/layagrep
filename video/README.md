# Launch reel

A 30-second motion-graphics video introducing `jg`, built with
[Remotion](https://www.remotion.dev). The soundtrack is synthesized in code: no
samples, stock music, or plugins.

```sh
npm install
npm run studio   # scrub the timeline in a browser
npm run render   # regenerate music, then out/jevgrep-reel.mp4 (1080p60)
npm run poster   # out/poster.png key art
```

This is a standalone npm project, outside the Bun workspace, so the CLI never
depends on Remotion.

## Timing is shared

[`src/cues.ts`](src/cues.ts) is the only place times live. Scenes read their
animation events from it, and [`scripts/music.mjs`](scripts/music.mjs) reads the
same cues to place every kick, riser, impact, and UI sound. Retime something there
and both picture and sound move together. Scene code takes absolute time `t`
(seconds) rather than local frames so cue values stay literal.

The video opens on a short hold (`PRE`) of a finished `jg` run from the reveal
scene (`THUMB_T`), because social feeds thumbnail an early frame, not strictly
frame 0. The `Poster` composition is separate key art for the README. `pre.wav` covers that hold and
`music.wav` starts at the cold open.

## Reviewing changes

Render a draft with `npx remotion render src/index.ts Reel out/draft.mp4 --scale=0.5`
and tile moments with `scripts/contact-sheet.sh out/draft.mp4 name 1.0 2.5 …`.
The music script cannot be heard in review; check loudness with ffmpeg's
`ebur128` filter and structure with `showspectrumpic`.

## Claims

The benchmark scene and poster restate the README's measured result, including
its disclosure: one 10-task SWE-bench repeat, failed tasks included, Jev cost
excluded, 7/10 solves versus 8/10 baseline. Keep that disclosure if the numbers
change.
