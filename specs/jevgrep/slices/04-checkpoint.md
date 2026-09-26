# Deliver the installed CLI and agent workflow

Status: planned. Depends on: 01, 02, 03. Read [contracts](../contracts.md) first.

## Contract and owner

Compose core `retrieve` and the CLI contract. Port hierarchy, file admission, source/lead decisions, accepted relationship pass and separate roles; copy exact accepted request builders. Add bounded directory source samples as an explicitly labeled production change. Keep one deterministic candidate ordering so cache inputs can later be reproducible; record its request difference from the spike.

CLI owns credentials, rendering, stdout-only errors, cancellation and exit codes. Core result carries selected versus rendered ranges and completeness. Ship `jg skill` and the canonical `skills/jevgrep/SKILL.md` following write-skills. Production invocation is selective, benchmark wrapper forces first retrieval. Implement initial finite evaluator attempts and 50k counter now; the later fault slice expands conformance rather than allowing runaway work here.

Build/pack/install outside checkout. First checkpoint deliberately has no persistent cache yet; do not advertise final cache behavior until slice 06. This is feature staging, not a temporary second retrieval implementation. Start with the accepted source allocation, retaining all qualifying paths.

## Human-runnable artifact

One complete installed-product evidence bundle.

`bun run test:e2e -- --case checkpoint`; then `bun run eval:swebench -- --task psf__requests-1142 --candidate installed --reuse-baseline` (commands to create, not currently available).

Commands are implementation targets. Add them in this slice; do not imply they
already exist. CLI transcripts replace visual/screenshot gates for this product.

## Verification and verdict

Docker fixture exercises installed auth, help, doctor, query, skill and partial output with empty stderr and isolated HOME/XDG. Pack excludes evals, secrets and workspace dependencies. Run one explicit live Jev query, then Sol through installed skill/CLI on the saved Requests task; inspect query, stdout, subsequent reads, patch, official grade and full bill. Reuse baseline; do not rerun it. One pass proves integration only, not cohort quality.

## Delegated decisions

Internal naming and command implementation, packaging mechanics; public contract and chosen checkpoint task are fixed.

## Keep green

Parser/filesystem/reference checks; no automatic report file. Cache is the only intentionally unshipped final capability at this checkpoint.

## Review

Show the artifact and summarize deviations. This is a non-blocking review checkpoint:
continue on the evidence if the user does not respond. Feedback that changes the
public contract or acceptance measure requires updating this slice before broadening
implementation. Record new choices and update the README handoff before ending.
