# Joint scoring in the hierarchy

Joint file/fragment scoring improves initial source presentation but adds retrieval work. Across eight fresh pairs on four recorded development queries, total retrieval time rises from 94.38 to 104.31 seconds (10.5%). These are retrieval-only measurements; no coding-agent cost or official solve-rate improvement has been established.

| Query | Prior seconds, two repetitions | Joint seconds, two repetitions |
| --- | ---: | ---: |
| Django / Opus | 12.78, 14.46 | 17.46, 14.82 |
| Django / Sol | 17.13, 15.10 | 17.57, 16.04 |
| Xarray / Opus | 10.79, 6.95 | 8.33, 8.65 |
| Xarray / Sol | 9.02, 8.15 | 10.87, 10.57 |

All sixteen registered runs completed. Order alternates across queries and reverses on repetition two. Both conditions use the same pinned source trees and original queries. The audit verifies submitted fragment bytes and returned source against those snapshots, exact registered artifacts, request accounting, and explicit ranking fallbacks. Jev cost and tokens remain excluded.

Joint scoring makes 1,428 requests versus 1,163. Failed attempts are 630 versus 527, all Gateway internal-server errors; the failure rates are similar (44.1% versus 45.3%). Most failures recover through the existing retry/split path. Joint runs leave four unscored-file observations versus five in the prior runs, and retain prior preview priority for three admitted-file observations whose fragment ranking remains unavailable. Those fallbacks remain unknown judgments, not negatives.

Within the first 200 lines, the inspected Django join-key conversion appears in three of four joint outputs and none of the prior outputs. The inspected Xarray swap_dims body appears in all four joint outputs and none of the prior outputs. This narrow source-presence check is not a completeness, precision, agent-consumption, or task-quality metric. The Xarray conversion-method implementation is still absent.

The remaining Django presentation miss is traceable: its useful fragments score highly, but per-file round robin emits weakly relevant source from other files before returning to the next useful fragment. The [ordering-only replay](global-packet-v53-results.md) tests that issue using the saved judgments.

Question-count buckets show more failures in larger joint requests, but source size and content also change with those buckets. This is an observational association, not evidence for a particular question limit. The raw comparison, exact submitted requests, full and head-only output, fallbacks, source audits and question-count breakdown live under `evals/runs/swebench/joint-hierarchy-v52/`.
