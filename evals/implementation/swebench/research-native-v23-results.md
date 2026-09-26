# SWE-bench selective source task pilot: Sol and Opus

Snapshot: 2026-09-22T07:42:29.661327+00:00. 24/24 native attempts recorded. Acceptance remains unproven until the complete comparison and evidence audit.

Treatment is the frozen selective-source hierarchical candidate with bounded recovery and grouped coverage with native skill expansion and a leading summary. Every task has a fresh baseline in this comparison; older baseline runs are not reused. Every treatment is required to invoke Jevgrep for initial research, as requested. The task roster, order, model settings and candidate are fixed in [the registration](research-native-v23.json).

Only pairs with both official reports and no known infrastructure incident appear below; all attempts remain in the raw records and raw aggregate totals. Times include retrieval, coding and self-verification. Preparation and official grading are separate.

| Task | Engine | Solves, baseline / Jev | Seconds, baseline / Jev | USD, baseline / Jev |
| --- | --- | --- | ---: | ---: |
| pylint-dev__pylint-7080 | Opus | 1 / 1 | 198.8 / 361.8 | 1.096 / 1.745 |
| sphinx-doc__sphinx-11445 | Sol | 1 / 1 | 341.6 / 272.1 | 0.765 / 0.434 |
| sphinx-doc__sphinx-11445 | Opus | 1 / 1 | 385.1 / 399.0 | 0.955 / 1.009 |
| matplotlib__matplotlib-20826 | Sol | 1 / 0 | 395.8 / 515.1 | 1.119 / 1.007 |
| matplotlib__matplotlib-20826 | Opus | 1 / 0 | 515.6 / 900.1 | 1.495 / unknown |
| django__django-15280 | Sol | 1 / 1 | 210.4 / 271.5 | 0.456 / 0.494 |
| django__django-15280 | Opus | 1 / 1 | 772.5 / 760.0 | 2.175 / 2.242 |
| pydata__xarray-3095 | Opus | 1 / 1 | 588.2 / 613.5 | 1.261 / 1.047 |

Known infrastructure incidents prevent a clean acceptance claim. Affected pairs are omitted from the comparison table while all attempts remain in raw records and aggregate totals.

Sol prices are API-equivalent standard-rate estimates from reconciled native usage, not subscription billing. Jev costs zero and its tokens never enter coding-agent token totals. See the [accounting policy](../../accounting.md).

Native traces, per-request usage, exact queries, model-visible responses, Jev decisions, image receipts and official grading reports are retained locally under `evals/runs/`. Saved context files are not treated as proof that the agent consumed their entire contents. No result here includes the deprecated private-repository evaluations.
