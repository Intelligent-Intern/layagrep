# Full-repository source batching

Batched source inspection reduced aggregate retrieval time by 24.6% and HTTP requests by 29.9% in this paired experiment. It also returned more source and changed navigation outcomes. This is sufficient motivation for native trials, not proof of equal task quality or lower coding-agent cost.

The experiment uses all eight saved v70 queries against complete exports of the same four pinned runtime Git trees. Each query runs twice per arm with alternating order. Both candidates use the same navigation, source limits, relevance threshold and rate-limit recovery. The candidate groups up to eight adjacent source chunks within a file and processes up to eight batches concurrently; each chunk retains its own relevance question.

| Across 16 retrievals per arm | Individual chunks | Batched chunks |
| --- | ---: | ---: |
| Summed wall seconds | 333.38 | 251.51 |
| HTTP requests | 4,724 | 3,311 |
| Unresolved source judgments | 2 | 0 |
| Unresolved navigation judgments | 3 | 11 |
| Accepted source bytes | 2,260,636 | 2,810,011 |

Batching is faster in 14 of 16 paired observations. Accepted source volume rises 24.3%. Zero unresolved source judgments applies to inspected source; it does not mean every relevant file was discovered. More unresolved navigation and changed exploration paths limit any causal interpretation of aggregate coverage or latency.

The source-accounting audit checks all 32 runs and 5,116 unique sent ranges across them. Every admitted file is fully partitioned or explicitly unavailable. Every sent range is accounted for exactly once as accepted, rejected or unknown; accepted and rejected scores match their model responses, and every accepted source text appears in the saved report. This verifies data handling, not relevance accuracy. Source hashes also match before and after the full batch.

## Native follow-up

The next registered native comparison retains all four development tasks, with fresh paired baselines and treatments for Sol and Opus. It preserves the required initial Jevgrep skill, model/runtime settings, official grading, and coding-agent cost reconciliation. Retrieval time remains part of task time. Jev cost and tokens are excluded. Previous outcomes informed the candidate, so this remains a development cohort rather than a holdout claim.

Raw plans, calls, receipts, source-accounting results and aggregates are under `evals/runs/swebench/batch-retrieval-v80/`. The frozen native follow-up is `batch-native-v81.json`; its runs are under `evals/runs/swebench/batch-native-v81/`. Whole-task solve rate, time and coding-agent cost determine whether the change is useful.
