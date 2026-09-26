# Navigation request shape and recovery

Splitting a failed multi-item request immediately is worth testing in the full CLI. In this diagnostic it completes all item judgments with 22.2% less summed case time than retrying the original batch first. This is not a native task-speed result.

The request-shape probe selects two distinct multi-question navigation requests per saved query from v70 by hash order, without using their outcomes. Across three repetitions, original batches return the target judgment in 29/48 calls; asking only that target question with all original context succeeds in 27/48; sending only its item succeeds in 36/48. Successful jointly observed target judgments never differ in threshold admission. However, successful batches also return other judgments: they produce 192 total valid answers versus 36 in the single-item arm. Target reliability alone therefore does not establish faster discovery.

## All-item comparison

The recovery diagnostic evaluates every item from the same selected requests. It rotates arm order across three repetitions and allows eight concurrent requests, including newly split groups. All original question wording and item data remain unchanged.

| Policy | Complete cases | Known / unknown items | Requests | Summed case seconds |
| --- | ---: | ---: | ---: | ---: |
| Retry batch, then split | 48/48 | 477 / 0 | 124 | 48.16 |
| Split after first transient failure | 48/48 | 477 / 0 | 108 | 37.47 |
| Start with single items | 42/48 | 470 / 7 | 521 | 41.21 |

Immediate splitting is faster in 28/48 paired cases; its median case is slightly slower. Its aggregate improvement is not universal. It changes seven admission decisions among the 477 jointly judged observations, including directory navigation and a Sphinx test file. These are not ground-truth relevance labels. Starting singly changes 40 admissions among 470 jointly judged observations and leaves seven judgments unavailable.

The inputs come from adaptive discovery traces, so selection into the available request pool remains biased even though hash selection ignores outcomes. Context changes on splitting can change scores. Provider conditions vary over time. Full-repository retrieval and fresh native task comparisons remain necessary.

## Verification and next candidate

The SDK fixture verifies split recovery, permanent unknowns, complete item accounting and the concurrency bound. Independent review found that a guard-truncated experiment could be labeled complete; the summarizer now requires no guard hit or queued groups. The observed experiment used 753 requests, so its numeric results are unchanged. The earlier request-shape review found a possible loss of non-target partial answers; all its observed failures were provider errors, so reported totals are unaffected. The recovery probe retains partial response data explicitly.

The v73 CLI candidate changes navigation recovery and keeps worker slots available for dynamically split groups. Its HTTP fixture fails on the old behavior and passes on the candidate. Source inspection, relevance thresholds and complete-report policy remain unchanged. Its independent integration review reports no actionable correctness issue. The [completed full-repository comparison](recovery-retrieval-v74-results.md) measures this change on the same eight queries and exact admitted source revisions; no new native benefit is claimed.

Raw plans, calls, outcomes and reviews live in `evals/runs/swebench/request-shape-v71/`, `navigation-recovery-v72/`, and `early-split-v73/`. The full-repository follow-up is recorded under `recovery-retrieval-v74/`.
