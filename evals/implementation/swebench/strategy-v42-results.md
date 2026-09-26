# Discovery strategy diagnostic

All four recorded-query comparisons are complete. Hierarchical retrieval was faster in each within this diagnostic. The sixteen-run audit passed: registered identities, thresholds, request accounting, output sizes, executable hashes, and source contents matched the saved exports. These are replayed retrieval queries, not fresh coding-agent task attempts, so they establish neither solve-rate parity nor task-level cost or speed improvements.

| Retrieval strategy | SymPy: Sol query | SymPy: Opus query | Django: Sol query | Django: Opus query |
| --- | ---: | ---: | ---: | ---: |
| Hierarchical folder, file, and source screening | 51.89 s | 41.11 s | 23.05 s | 18.25 s |
| Hierarchy with file screening bypassed | 90.95 s | 73.81 s | 34.37 s | 32.41 s |
| Flat source screening | 389.78 s | 381.83 s | 387.26 s | 317.87 s |
| Naive substring candidates, then Jev | 439.00 s | 388.68 s | 309.36 s | 244.05 s |

The development tasks are `sympy__sympy-21379` and `django__django-15563`, with one repetition per query/strategy. Provider failures, retries, parsing, and local reads remain in elapsed time. Queries from the same task are not independent tasks; these timings are not native task-completion times.

The broad scans reached `Mod` and still rejected its implementation excerpts. For the recorded Opus query, hierarchical retrieval nevertheless delivered `Mod` lines 161–177 as caller evidence for another selected declaration; the head manifest now exposes that available range. File rejection and absence of source are therefore distinct facts. A native trace must establish whether an agent uses this handoff.

The hierarchical results also expose a gate-calibration issue: some files receive positive file judgments, while every source excerpt is rejected by the later source gate. The file and excerpt probabilities answer different questions and are not established as comparable confidence scales.

The completed Django packets include the ID-selection and related-update code; their actual native consumption is not measured here. The source-delivery audit distinguishes a range appearing in the leading manifest from its implementation appearing later in stdout.

The naive lexical filter is weak: substring matches admit most of the first query's eligible files. This does not disprove stronger lexical retrieval. Flat and naive lexical runs also build observed-file relationships that cannot be reconsidered without prior whole-file judgments; this package overhead is recorded separately. It is removed from the pending BM25 candidate, not retroactively subtracted from these results.

The [experiment notes](strategy-v42-notes.md) explain the controls and limitations. Local registration, immutable executable hashes, complete requests and source decisions, summaries, and audits are under `evals/runs/swebench/strategy-v42/`. The [completed follow-up diagnostics](follow-up-v43-v44-results.md) report exact-token ranking and explicit relevance criteria; neither establishes native task-level improvement. Jev remains free under the accounting policy; no coding-agent cost is measured here.

Audit success verifies the recorded experiment, not retrieval completeness. Partial results and provider failures remain visible. These timings have one repetition per cell, no claim of isolated host activity, and no pinned underlying Jev service version; source audits compare current exports with their saved archives.
