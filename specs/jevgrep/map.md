# Product decision map

Completed quadrant walk, 2026-09-25. This map feeds the [build plan](README.md).
Decisions below are user-confirmed unless explicitly attributed to the implementer
or territory. The product is not implemented by this document.

## Known knowns

The [accepted architecture](../../docs/architecture.md) is hierarchical retrieval,
not an answer-generating agent: question → directories → files → source units →
stdout. Preserve every qualifying file, with optional reading leads and selected
verbatim excerpts. Summary comes first; no negative inventory or report files.
The request guard is 50,000, solely to prevent runaway work.

Use TypeScript, Bun/Turbo workspaces, AI SDK native evaluation objects and AI
Gateway Jev. Auth accepts a pasted key. Future providers are deferred. The
[CLI scaffold](../../apps/cli/src/index.ts) currently exposes auth/doctor only.

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

Installation must work outside this checkout. [Photoctl's packed-install test](../../../photoctl/test/macos/packed-install.test.ts)
proves that property with installed tarballs and cleared development overrides.
[Duet-agent's runner](../../../duet-agent/package.json) isolates writes inside
Docker with a temporary home. Photoctl's [spawn helper](../../../photoctl/packages/test-harness/src/spawn.ts)
uses real CLI processes and disables ambient credentials; its
[Docker configuration](../../../photoctl/test/compose.yaml) makes permission tests
meaningful. These are reference patterns, not benchmark fixtures or sources to copy
wholesale. Jevgrep retains its stdout-only contract.

## Unknown unknowns: landmines from the sweep

Coverage: production CLI/auth/core and manifests; accepted traversal and source-unit
spikes; architecture and lessons; both reference repos' test runners and selected
installed-process/provider tests. No whole-repo security or performance audit claimed.

| Evidence                                                                                                                       | Why it bites                                                                      | Disposition                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [Python parser](../../evals/implementation/swebench/source-method-windows-spike.ts) invokes `python3`                          | The spike violates the new Node-only installation contract.                       | Decided: bundle parser; pin parser parity before integrating.                                       |
| [Traversal](../../evals/implementation/swebench/hierarchy-unit-locators-spike.ts) adds directory source samples on a follow-up | Calling the winner universally content-sampled would misdescribe it.              | Sharp edge: freeze reference separately; evaluate initial directory sampling as an explicit change. |
| [Lessons](../../evals/implementation/swebench/architecture-lessons.md) record failed calls and excerpt expansion               | Missing source can be service failure; surrounding context can inflate selection. | Decided: typed partial status, selected and rendered ranges separately owned.                       |
| [Architecture](../../docs/architecture.md) limits whole-computer claims                                                        | Nested roots, files changing during search and permissions are unvalidated.       | Verification requirement: adversarial filesystem fixtures; no scalability claim from ten repos.     |
| [Auth scaffold](../../apps/cli/src/auth.ts) and CLI emit stderr                                                                | Existing success/error paths conflict with the requested output contract.         | Decided: cut over deliberately; assert empty stderr through the installed CLI.                      |

## Facts implementation must establish

Bundled CPython version and component-license compatibility, Node runtime asset loading,
exact SDK evaluation HTTP shape, and initial directory sampling quality must be
proved at the owning slice before its consumer lands. Excerpt budget is delegated
to comparative task evidence, not another product interview. An unavailable external
service is an incomplete validation result, never a passed quality gate.

## Copyable next instruction

“Implement the Jevgrep spec slice by slice, starting at its Next Agent Prompt.
Keep Docker end-to-end coverage and reuse saved benchmark baselines. Record
new evidence and deviations in the spec; do not silently change retrieval policy.”
