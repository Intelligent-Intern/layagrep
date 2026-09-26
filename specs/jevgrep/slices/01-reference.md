# Freeze the reference and HTTP seam

Status: verified; see [reference evidence](../assets/reference-verification.md). Depends on: None. Read [contracts](../contracts.md) first.

## Contract and owner

Own the test oracle under `test/reference`, not runtime code. Retain a small licensed synthetic tree, exact accepted native request objects, fixture answers and resulting stdout. Pin source/bundle/skill hashes from research.md. Preserve original official traces outside published artifacts. Capture the actual installed SDK evaluation wire response using synthetic input; route the real SDK through a local HTTP fixture. Do not fabricate an SDK response schema from memory.

Pure request-builder seam: `buildRequest(stage, inputs) -> {state, questions}`. Fixture responder accepts actual HTTP and validates body/headers before returning pinned answers. Actual questions and ordered state are significant. Normalize only nondeterministic diagnostic timestamps, not request item ordering or source.

## Human-runnable artifact

One replayable reference corpus.

`bun run test:reference` replays the small reference tree and prints request/packet differences.

Commands are implementation targets. Add them in this slice; do not imply they
already exist. CLI transcripts replace visual/screenshot gates for this product.

## Verification and verdict

Validate healthy true/false answers, malformed/missing answers and SDK warnings. Every literal prompt and source range must trace to the frozen source. Verify the retained skill hash matches the confirmation plan, not the mutable working skill path.

## Delegated decisions

Fixture names and test organization; exact prompt wording and question meaning are not delegated.

## Keep green

No production search yet. Preserve original evidence and official baseline identity.

## Review

Show the artifact and summarize deviations. This is a non-blocking review checkpoint:
continue on the evidence if the user does not respond. Feedback that changes the
public contract or acceptance measure requires updating this slice before broadening
implementation. Record new choices and update the README handoff before ending.
