# Product decision map

Completed quadrant walk, 2026-09-25. This map records the constraints behind the [implementation record](README.md).
Decisions below are user-confirmed unless explicitly attributed to the implementer
or territory. Current behavior is owned by code and the contracts, not this historical interview.

## Known knowns

The [accepted architecture](../../../docs/architecture.md) is hierarchical retrieval,
not an answer-generating agent: question → directories → files → source units →
stdout. Preserve every qualifying file, with optional reading leads and selected
verbatim excerpts. Summary comes first; no negative inventory or report files.
The request guard is 50,000, solely to prevent runaway work.

Use TypeScript, Bun/Turbo workspaces, AI SDK native evaluation objects and AI
Gateway Jev. Auth accepts a pasted key. Future providers are deferred. The
[CLI](../../../apps/cli/src/index.ts) owns search, authentication, diagnostics and skill delivery.

Acceptance is official SWE-bench solve quality and full coding-agent task cost.
Exclude Jev costs/tokens; include returned text in the coding agent's bill. Fixed
baselines run once per task/model/harness. Personal-repository evals stay deprecated
and out of commits. Sol is the first evaluation consumer. The accepted tuned
Python-only sample achieved 7/10 successful cost wins and preserved all eight
baseline solves; this is not untouched generalization evidence.

## Known unknowns: closed interview decisions

| Question                  | Decision and reason                                                                                                                         | Owner             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Persistent cache?         | Enabled by default, freshness checked; `--no-cache` and clear supported. Repeated work should be reusable.                                  | User              |
| Eligibility?              | Respect `.gitignore`/`.ignore`; skip hidden, dependency/build, binary and obvious credential files by default. Broadening must be explicit. | User              |
| Source output cap?        | Choose by solve quality and full agent cost. Retain all qualifying file locations and label omitted source.                                 | Delegated by user |
| Platforms/distribution?   | npm, macOS and Linux; Windows deferred.                                                                                                     | User              |
| Executable name?          | `jg`, like `rg`; repo, package and skill keep the Jevgrep name.                                                                             | User              |
| Runtime prerequisites?    | Node only; bundle Python parsing and TS/JS parsing, text fallback.                                                                          | User              |
| Compatibility/migrations? | Neither; hard cutover from experiments while preserving evidence.                                                                           | User              |
| Partial provider failure? | Preserve useful results, prominently label incomplete, distinct exit code.                                                                  | User              |
| First useful checkpoint?  | Installed CLI + skill + real search; Docker E2E and one saved SWE-bench task before expanding.                                              | User              |

## Unknown knowns: expectations extracted

The consumer is an autonomous coding agent, often running under output truncation.
It needs useful evidence early, optional leads, and permission to fill remaining
gaps; it should not reread supplied ranges or treat every lead as required reading.
Production skill invocation is selective; benchmark invocation is required to
isolate retrieval's effect. No daemon, service, editor extension, or background
index is needed for this release.

Installation must work outside this checkout. The
[installed package journeys](../../../test/installed.test.mjs) and
[native runtime checks](../../../scripts/test-native.mjs) establish that boundary
with isolated configuration and fixture credentials. Earlier sibling-project
examples informed test isolation; they are not runtime dependencies or portable
verification evidence.

## Risks resolved and bounded

The experimental Python helper required a host interpreter; bundled CPython
preserves its exercised behavior under the Node-only contract. Initial metadata
navigation and later source-sampled relationships remain distinct; adding early
content sampling would change the measured policy. Service failure is explicit
incomplete evidence, and selected source remains distinct from expanded context.
Adversarial filesystem fixtures cover policy and mutation without claiming
whole-computer effectiveness. The stdout-only CLI contract is tested through the
installed binary. [Restoration](assets/parity-restoration.md),
[runtime](assets/python-runtime.md), and [freshness](assets/source-freshness.md)
records own the evidence and limitations.

## Evidence disposition

The [implementation record](README.md) links the completed parser, filesystem,
HTTP, installed-package and downstream quality evidence. Initial directory
sampling and source-budget experiments did not replace the accepted strategy.
External service failure remains incomplete evidence, never a passed quality gate.
The user accepted closure with the corrected candidate's failed numerical gate;
that product decision does not rewrite the historical result.
