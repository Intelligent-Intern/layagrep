# Complete source and query context diagnostics

Reading beyond selected-file previews fixes source coverage, but does not yet establish better relevance selection or native task performance.

The source-opening diagnostic holds the eight actual queries and their admitted files from the [completed native comparison](fragment-native-v63-results.md) fixed. Source copied from each admitted runtime image is checked against its Git tree. Preview intervals and contiguous full-source windows receive the same relevance question, with two repetitions and alternating arm order. Chunk segmentation changes along with coverage, so this is not a pure coverage-only comparison.

All 32 runs complete. Provider failures leave about 63% of preview units and 60% of full-source units unjudged. These remain unknown, not negative. The full-source units expose the previously unseen SQLite location, but its judgments fail in every registered run. A separate single-unit diagnostic succeeds with a below-threshold score. Neither positive-unit counts nor the failed judgments constitute a precision or recall measurement.

## Context and query findings

AST inspection establishes that the unit covering the missed SQLite location already includes the complete `_alter_field` method. The subsequent enclosing-function probe therefore duplicates and labels existing source; it does not add missing function context. This correction is recorded before inspecting its outcomes. Duplication does not recover the unit for the narrower query.

A separate counterbalanced probe compares the two actual agent queries and the original public issue on identical source, without hidden tests or patch information. The Sol query scores 0.45–0.47, the broader Opus query scores 0.63 in all three repetitions, and the original issue scores 0.25–0.27 with one unavailable judgment. The issue and Sol query explicitly emphasize MySQL; the source is SQLite. This one location demonstrates sensitivity to query scope, not a general advantage for broader queries. Sending the original issue verbatim is not sufficient here.

The next useful test is a general relevance-question comparison across all saved queries and admitted source, measuring both recovered context and excess context. Selecting a lower threshold or a backend-specific prompt from this single observed failure would not establish general retrieval quality. Fresh native comparisons remain necessary for solve rate, time and coding-agent cost.

## Evidence

Raw source receipts, frozen plans, complete request logs, retained failures and summaries live in `evals/runs/swebench/source-opening-v64/`, `function-context-v65/`, and `issue-query-v66/`. The full-source chunking test verifies exact byte coverage, Unicode and line ranges; an opening-only mutation fails it. These are architecture diagnostics, not reviewed production implementations or native acceptance evidence. Jev cost and tokens remain excluded under the evaluation policy.
