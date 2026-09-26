# Batched-source native comparison

Batched source inspection is not a winning native strategy in this cohort. It preserves each engine's baseline solve rate, but increases aggregate task time and coding-agent cost for both Sol and Opus. The retrieval-only speedup does not establish end-to-end benefit.

All four development tasks run with fresh baselines and treatments under the pinned native models and runtimes. Treatments invoke the Jevgrep skill for initial research, then may use ordinary local search. Each attempt is retained and officially graded. Prior outcomes informed this candidate, so these are development results, not an untouched holdout.

| Engine | Baseline → Jevgrep solves | Mean task seconds | Mean coding-agent cost | Time change | Cost change |
| --- | --- | --- | --- | --- | --- |
| Sol | 3/4 → 3/4 | 130.04 → 205.47 | $0.552 → $0.701 | +58.0% | +26.9% |
| Opus | 4/4 → 4/4 | 291.55 → 301.80 | $1.524 → $1.778 | +3.5% | +16.7% |

These means include failed tasks. Total spend per solved task is $0.736 → $0.934 for Sol and $1.524 → $1.778 for Opus. Jev tokens and cost are excluded; retrieval latency is included in task time. All generation charges are reconciled, with no missing costs treated as zero.

## What the traces establish

Both Sol Django patches fail the official collation migration test. The treatment prunes the SQLite directory at 0.37 and does not return its source, but this omission alone is not a sufficient explanation: Opus also prunes SQLite, at 0.39, then discovers and fixes it through ordinary search and passes. Additional navigation coverage remains a hypothesis to test, not a required-file oracle.

The completed Sol traces show mixed pre-edit behavior. Django uses fewer commands before the first file change with Jevgrep, but reaches that edit later. Requests reaches its first edit slightly earlier with Jevgrep, yet finishes later. Those intervals include reading, reasoning and reproduction; they are not pure discovery time or causal estimates. Later implementation and verification choices matter too.

Sphinx illustrates why time and cost need separate measurement. Opus with Jevgrep is faster but more expensive, while its baseline spends time comparing a broad suite against pristine source. Both runs pass the official grade; the baseline's modified and pristine full-suite outputs list the same ten failing tests. In contrast, the Opus Requests pair improves both time and cost. Neither isolated pair overrides the complete cohort.

The final Opus SymPy treatment passes the official grade but spends substantially more than baseline. One attempted external-test command exits successfully after running zero tests; that command provides no verification. Generated-code checks and the official grader remain distinct from unavailable compiled-backend coverage.

## Integrity and next hypothesis

The final audit verifies all 16 completed attempts, all registered artifact hashes, native source/model identity, clock and host observations, generation accounting, and required skill invocation plus model-visible Jevgrep summaries. There are 14 official solves across the 16 attempts, with no grading infrastructure errors. Claude's expanded initial skill body is not archived; invocation, registration and CLI behavior are observed without claiming that missing artifact exists.

The next diagnostic changes navigation question scope while holding the query, item previews, metadata and threshold fixed. It asks whether naming one reproduction backend improperly excludes related implementations. Its known Django failure case is labeled separately from the main hash-selected sample. More admitted files will not be treated as an accuracy gain without further evidence.

Frozen protocol: `batch-native-v81.json`. Raw results, paired comparisons, traces and audits: `evals/runs/swebench/batch-native-v81/`. The complete result remains available regardless of subsequent candidates.
