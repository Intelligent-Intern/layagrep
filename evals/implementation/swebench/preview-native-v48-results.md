# Preview reuse: completed native comparison

Preview reuse does not yet meet the goal for both engines. Sol has equal official solve rate but takes 11.1% longer and costs 11.6% more. Opus preserves solve rate with essentially equal total time (0.17% lower) and 3.7% lower cost. This small development cohort does not establish a stable improvement.

| Engine / task | Baseline seconds | Jevgrep seconds | Baseline cost | Jevgrep cost | Official solve |
| --- | ---: | ---: | ---: | ---: | --- |
| Sol / Django | 102.83 | 116.79 | $0.375384 | $0.432281 | Both pass |
| Sol / Xarray | 114.72 | 125.00 | $0.404293 | $0.437563 | Both fail |
| Opus / Django | 195.46 | 195.57 | $1.056380 | $0.872555 | Both pass |
| Opus / Xarray | 540.35 | 538.98 | $1.264901 | $1.362241 | Both pass |

Cost per official solve is $0.779677 baseline versus $0.869844 treatment for Sol, and $1.160640 versus $1.117398 for Opus. Failed tasks remain in the totals. Jev cost and tokens are excluded; retrieval and subsequent verification remain in task time.

The [frozen registration](preview-native-v48.json) retains both previous development cases, with fresh attempts and reversed within-pair order. Models, native skill, task prompts, runtime images, official grading and deadlines are unchanged. This tests the [preview-handoff candidate](preview-handoff-v47-results.md), which returns already evaluated file previews without another source relevance pass. Do not pool these results with earlier candidates or describe the cases as unseen validation.

All eight attempts finish and pass the experiment-integrity audit: source/model identities and registered artifacts match, official grading has no infrastructure failures, clock and Docker observations are admitted, all four treatment skill invocations and initial summaries are observed, and every coding-agent generation charge reconciles. No attempts are retried or removed. Claude's expanded initial skill body is not archived; its invocation and CLI behavior are observed.

## What remains wrong

The output budget can retain the header of a highly relevant declaration while excluding its body. In Sol's Django treatment, the file scores 0.95, but only the `GenericForeignKey` class header is returned; its implementation span is omitted. Broader opening previews consume the budget first. In both engines, initial Django output is dominated by headers and test-file source rather than the join-key implementation. The leading manifest remains useful, but saved or advertised source is not necessarily source consumed.

The successful Xarray Opus treatment receives no source for the conversion method in its packet and reads it afterward. Both Opus arms ultimately fix the conversion method itself and pass, while both Sol arms patch only the caller and fail the official conversion-copy regression. Retrieval is not sufficient to explain that fix-scope difference.

Both Xarray Opus attempts spend several minutes on broad verification and investigation of existing failures. Their near-equal elapsed totals are retained without claiming that retrieval caused a stable speed benefit.

Raw receipts, exact queries, visible output, patches, grades, generation accounting, `paired-comparison.json`, `final-audit.json` and the native packing observation live under `evals/runs/swebench/preview-native-v48/`. The [packing-priority diagnostic](priority-packet-v49-results.md) replays identical recorded decisions without new inference; native task validation is the next step.
