---
name: launch-video
description: Produce a professional, beat-locked motion-graphics launch video (showreel quality, with music) that introduces a CLI, library, or product from its repo. Use when asked for a launch, promo, explainer, sizzle, or showreel video, an animated motion-graphics intro for a project, or a video to post on X/social with a good preview thumbnail.
---

# Launch Video

Build a ~30s showreel entirely in code: Remotion scenes plus a soundtrack
synthesized from the same **cue sheet**, so every hit on screen lands on a hit in
the mix. The bar is a real production, not a demo or prototype. Read
[references/brief.md](references/brief.md) first: the original brief and the
feedback that shaped this workflow.

## Workflow

1. **Mine the repo for the story.** Read the README, architecture docs, benchmark
   records, and existing brand art (palette, typefaces, cover images). Done when
   you can state, with a source for each: the one-line purpose, the mechanism
   behind the scenes (the audience is technical), the models/engines to credit,
   and the headline number with its exact disclosure. Flag any name or claim the
   repo cannot back (a model family, a vendor) instead of inventing its meaning.
2. **Score the cue sheet first.** Pick a tempo (120 BPM → bar = 2s) and put
   every scene change on a bar line. Write one module holding every event time
   (scene starts, word reveals, stamps, typing, impacts, risers); scenes and the
   music both import it. Arc that works: problem cold open → drop + product
   reveal with a real command (the README's first example) → behind-the-scenes mechanism → the engine/model →
   proof number (breakdown, riser, slam) → lockup with install command. Done when
   every visual event has a cue and every cue has a sound.
3. **Synthesize the soundtrack from the cue sheet.** Kick, clap, hats, sidechained
   bass/pad/arp on a chord progression; builds into drops; a sound for each UI
   event (pop, tick, key click, ✓ blip, ✗ thud, whoosh, impact, ding). Master to
   roughly −11 to −14 LUFS. You cannot listen: verify with ffmpeg `ebur128` and a
   `showspectrumpic` spectrogram that risers and impacts sit at cue times, and
   say in the handoff that the audio was checked by measurement, not by ear.
   Default style unless the brief says otherwise: bright electronic (synth-pop /
   future bass).
4. **Build the scenes** under the motion rules below. Drive them from absolute
   time in seconds, not frames, so cue values stay literal.
5. **Review by contact sheet.** Render a half-scale draft, tile ~6 moments per
   scene, and fix collisions, clipping, overflow, and dead space; confirm type
   details on full-res stills. Done when every scene has been looked at, not
   sampled.
6. **Make the thumbnail frame** (rules below), render the master (1080p60,
   high-quality H.264, 320k AAC), and reveal it in Finder.
7. **Keep the project.** Commit it into the repo as a standalone package outside
   the workspace (renders and generated audio ignored, excluded from Docker
   contexts, formatted to repo style) with a short README: commands, the shared
   cue-sheet principle, and the claims disclosure to preserve.

## Motion rules

- **No raw screenshots.** Rebuild every UI as components (file/folder icons,
  terminal, chips, stamps, bars) so each part can move.
- **Juicy by default:** springs with overshoot, squash & stretch on landings,
  staggered cascades, mask-reveal kinetic type, shockwave + radial burst +
  camera shake on impacts, shards/confetti on the payoff, number counters.
- **Match cuts** between scenes (an element becomes the next scene's element;
  zoom through a surface into the next world), never plain crossfades.
- **Beat-reactive surfaces:** camera scale, backdrop grid, glows, and the
  progress bar pulse on the kick.
- **Production polish:** reuse the repo's brand palette and type; add a HUD
  (corner marks, scene counter, timecode, progress), film grain, and vignette.
- **Claims stay exact.** Restate measured results with their disclosure line
  (sample size, what is excluded, any quality tradeoff) in small type; never
  round or generalize past the source.

## Thumbnail

- Feeds (X) thumbnail an early frame, not strictly frame 0; a one-frame poster
  gets skipped. Hold the preview for ~0.3s of pre-roll, then animate it away
  into the cold open. Shift the music by the pre-roll and fill it with a whoosh
  into the first hit.
- The pre-roll background must match the cold open's; a dark poster before a
  light open reads as a flash.
- The best preview is the product doing its job (logo + tagline + a completed
  command's output), even when the headline claim is a benchmark: the number
  gets its payoff scene and a separate key-art still (also README art), not the
  thumbnail.
