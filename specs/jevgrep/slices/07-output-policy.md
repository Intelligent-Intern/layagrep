# Choose source allocation using completed tasks

Status: measuring. Depends on: 06. Read [contracts](../contracts.md) first.

## Contract and owner

The renderer owns byte allocation after selection; threshold-admitted file and lead locations are never dropped. Compare accepted allocation against one smaller bounded candidate while freezing query, prompts, model/harness and retrieval selection as far as the live service permits. Start with the saved Requests task for a cheap diagnostic; retain current policy if the candidate loses solve quality or does not lower full agent cost. Do not chase the old 8/10 research goal.

Record the chosen default and all attempts in the spec before freezing the release candidate. Validate that omitted source is explicitly marked and head output conveys the most useful status/locations. Exact bytes count UTF-8, not JS string length. Do not cut source mid-codepoint; boundaries and partial-unit markers must stay truthful.

## Human-runnable artifact

Recorded source-budget decision.

Use `bun run eval:swebench prepare --package /absolute/package.tgz --output /absolute/new-study --task psf__requests-1142`, then the maintained runner's `run`, `grade` and `account` operations on that plan. See [the runner workflow](../../../evals/implementation/swebench/installed.md). `bun run test:e2e -- --case output` verifies installed rendering and actual head truncation.

Commands are implementation targets. Add them in this slice; do not imply they
already exist. CLI transcripts replace visual/screenshot gates for this product.

## Verification and verdict

Inspect complete agent traces, official grade and full bill; Jev free/excluded, returned source counted. A smaller packet alone is not a win. Fixtures prove all qualified files survive either budget, duplicate ranges merge without unselected expansion, and large location lists remain honest under head truncation.

## Delegated decisions

Numerical output budget and ranking tie breaks, chosen from evidence and documented; exact source remains verbatim.

## Keep green

Full quality confirmation still required in 08; one-task tuning cannot establish generalization.

## Review

Show the artifact and summarize deviations. This is a non-blocking review checkpoint:
continue on the evidence if the user does not respond. Feedback that changes the
public contract or acceptance measure requires updating this slice before broadening
implementation. Record new choices and update the README handoff before ending.

Current candidate: 1,500 source bytes, with whole excerpts ranked by contained
reading leads scoring above 0.5; equal scores keep original order. It preserves
all admitted paths and leads. This is a heuristic because class-context snippets
have no reading-lead score. Production default remains 0 (uncapped) until measured.
On the retained Requests packet it keeps the decisive method and test helper
(1,208 source bytes) while omitting 689 bytes of scaffolding. Unlimited output
is byte-identical to the retained 2,852-byte stdout. This is packet evidence only.

The candidate package and skill are frozen in the single-task study
`evals/runs/swebench/installed-jg-requests-budget1500-v1/plan.json`.
No baseline execution is available in the maintained runner.
