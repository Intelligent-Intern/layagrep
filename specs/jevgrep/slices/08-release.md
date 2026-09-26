# Confirm quality and the release artifact

Status: open. The first faithful confirmation was rejected; the new frozen work-clock cohort is running after its Django-first continuation gate passed. Depends on: 07. Read [contracts](../contracts.md) first.

## Contract and owner

Freeze code, packed tarball, skill, runtime, prompt/policy hashes and Sol harness before the official ten-task confirmation. Retain grades, trace queries, stdout, reads, patches and complete bills. Run saved baselines zero times. No per-task strategy changes or selective result exclusion. Preserve baseline solves and reach seven successful cost wins; report missing billing/infrastructure errors as unknown/non-passes with original evidence.

Verify packed runtime on supported Linux architectures and macOS Apple Silicon, with isolated config/cache and no development resolution. Reuse installed process journeys. Docker is Linux evidence, not macOS evidence. Run the full closeout gate once after focused iteration. Include a release workflow that publishes the verified package to npm: explicit
version/tag selection, package-content validation, a dry run, GitHub Actions triggered by `v*` tag pushes, with `NODE_AUTH_TOKEN` supplied
from `${{ secrets.NPM_TOKEN }}` (the user will add this secret), then install that exact registry version
in a fresh environment and run help/version/skill plus a fixture-backed search.
Release credentials must never enter the repository. Check package-name ownership
before choosing an unscoped name; record the final registry name in the docs.

Implement and test the workflow without publishing a development checkpoint.
Actual registry publication remains a user-triggered release action after all gates
pass; implementing this spec does not itself authorize publishing now.

Cut over root eval commands to official workflow. Remove deprecated personal-eval entry points from supported scripts and prevent their data/source fixtures entering a commit; preserve existing local historical evidence. Keep official reference source/hash manifests, never depend on ignored traces as the only durable rationale.

## Human-runnable artifact

One frozen release-candidate dossier.

`bun run verify`; the maintained runner's `prepare`, `run --all`, `grade --all`,
`account --all`, and `aggregate` operations on one frozen plan, as documented in
[the runner workflow](../../../evals/implementation/swebench/installed.md); native
macOS installed smoke command documented by the harness.

These commands are implemented. Use the frozen installed runner to finish the
open quality gate and retain its evidence. CLI transcripts replace visual/screenshot
gates for this product.

## Verification and verdict

Check all eight baseline solves preserved and >=7 lower-cost solves under one policy; overall solve rate >=baseline. Costs include failed attempts; unknown bills never wins. Validate package contents/licenses, Node >=22, help before auth, stdout-only protocol and skill distribution. A quality failure reopens its owning slice with trace evidence, never relaxes the gate silently.

## Delegated decisions

Artifact layout, not the user-selected GitHub Actions tag/NPM_TOKEN workflow or acceptance accounting; actual publication requires a later release request.

## Keep green

All earlier tests and official evidence. No claim of untouched generalization, Windows support, universal speedup or whole-computer validation.

## Review

Show the artifact and summarize deviations. This is a non-blocking review checkpoint:
continue on the evidence if the user does not respond. Feedback that changes the
public contract or acceptance measure requires updating this slice before broadening
implementation. Record new choices and update the README handoff before ending.

The earlier `installed-jg-final-cohort-v1` study is stopped and superseded because
its package changed the accepted spike's behavior. Its receipts remain historical
evidence, not release acceptance. [Parity restoration](../assets/parity-restoration.md)
owns the prerequisite for preparing another frozen cohort. Saved baselines remain
unchanged; no result from the superseded package can be pooled into the new study.
