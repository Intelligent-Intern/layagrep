# Confirm quality and the release artifact

Status: verifying. Depends on: 07. Read [contracts](../contracts.md) first.

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

Commands are implementation targets. Add them in this slice; do not imply they
already exist. CLI transcripts replace visual/screenshot gates for this product.

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

The final cohort plan is frozen at
`evals/runs/swebench/installed-jg-final-cohort-v1/plan.json` with the exact tarball
from the measured output trial. All ten source/runtime/skill preflights and the
no-call run validation passed. Treatment execution is underway, not acceptance.
The plan includes all ten cells prospectively; the diagnostic Requests run is
not pooled into this cohort. Saved baselines remain unchanged.
