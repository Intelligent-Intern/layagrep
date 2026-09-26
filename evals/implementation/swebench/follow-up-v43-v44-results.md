# Follow-up retrieval diagnostics

Neither diagnostic establishes a reason to replace the hierarchical reference. These remain development replays; no new coding-agent task results are claimed.

## Exact-token ranking before Jev

All eight fresh paired runs completed and passed the source/artifact/accounting audit. Cold local reads and preprocessing are included.

| Recorded query | Hierarchy | BM25 candidate |
| --- | ---: | ---: |
| SymPy, Sol | 38.55 s | 105.33 s |
| SymPy, Opus | 34.87 s | 86.67 s |
| Django, Sol | 19.40 s | 119.22 s |
| Django, Opus | 18.64 s | 108.35 s |

Local ranking substantially narrows the excerpt set but retains the cost of parsing the entire eligible repository. On the first query, documentation parsing alone takes 36.5 seconds. The relative lexical cutoff also removes the `Basic.subs` implementation excerpt before Jev sees it. This is an observed selection disagreement on development data, not a required-file scoring rubric. Lower request count is insufficient evidence of useful context or whole-task improvement.

The candidate skips an observed-file relationship stage that has no eligible file rejections in this mode. Compare the registered strategy packages, not BM25 in isolation. Details, exact returned ranges, unavailable checks, and all outcomes remain under `evals/runs/swebench/lexical-rank-v44/`.

## Explicit supporting-code criteria

The paired prompt diagnostic attempted all 192 registered requests on 48 recorded related-file candidates with two repetitions. It recorded 32 failed attempts, leaving 67 complete pairs and 29 unavailable pairs. Failures are unknown, not negative judgments.

Only two complete-pair decisions crossed the admission threshold: the same logic helper in both repetitions. `Mod` remained below threshold in its three complete pairs; its other pair was unavailable. The mean score shift was +0.02. This neither repairs the observed miss nor establishes better precision, so the wording change is not promoted on this evidence.

The review caught an incomplete prerequisite guard and repetition order that was not guaranteed balanced. Both were corrected before provider requests, with regressions demonstrating failure before each fix. Requests, registration, review triage, and summaries remain under `evals/runs/swebench/research-role-v43/`.

## Next acceptance work

The next source-context prototype preserves enclosing function signatures for later excerpts, including nested declarations. Its Node tests and CLI fixture pass, and the original chunker fails the signature regression under Node. It has no live outcome evidence yet.

Two additional public discovery cases are source/runtime qualified: their behavior-neutral controls fail and official reference-patch controls pass as expected. The existing native agent PATH selects Python 3.6 for one case, which lacks AST end locations. Parser routing must use the available modern isolated Python while retaining the original test environment before testing the context prototype natively. Operator qualification notes and control artifacts remain outside native prompts.
