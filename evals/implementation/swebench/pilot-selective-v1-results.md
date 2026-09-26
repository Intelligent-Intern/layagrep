# SWE-bench selective source task pilot: Sol and Opus

Snapshot: 2026-09-21T05:04:44.273270+00:00. 16/16 native attempts recorded. Acceptance remains unproven until the complete comparison and evidence audit.

Treatment is the frozen selective-source hierarchical candidate with bounded recovery and grouped coverage with native skill expansion and a leading summary. Every task has a fresh baseline in this comparison; older baseline runs are not reused. Every treatment is required to invoke Jevgrep for initial research, as requested. The task roster, order, model settings and candidate are fixed in [the registration](pilot-selective-v1.json).

Only pairs with both official reports and no known infrastructure incident appear below; all attempts remain in the raw records and raw aggregate totals. Times include retrieval, coding and self-verification. Preparation and official grading are separate.

| Task | Engine | Solves, baseline / Jev | Seconds, baseline / Jev | USD, baseline / Jev |
| --- | --- | --- | ---: | ---: |
| django__django-14559 | Sol | 1 / 1 | 125.2 / 102.0 | 0.331 / 0.356 |
| django__django-14559 | Opus | 1 / 1 | 75.4 / 144.4 | 0.369 / 0.749 |
| sympy__sympy-23824 | Sol | 1 / 1 | 63.4 / 71.1 | 0.169 / 0.265 |
| sympy__sympy-23824 | Opus | 1 / 1 | 57.6 / 57.5 | 0.352 / 0.352 |
| pallets__flask-5014 | Sol | 1 / 1 | 66.3 / 65.3 | 0.267 / 0.262 |
| pallets__flask-5014 | Opus | 1 / 1 | 65.8 / 107.1 | 0.445 / 0.594 |
| psf__requests-5414 | Sol | 0 / 1 | 87.9 / 124.3 | 0.241 / 0.383 |
| psf__requests-5414 | Opus | 1 / 1 | 227.4 / 168.8 | 0.689 / 0.312 |

Sol prices are API-equivalent standard-rate estimates from reconciled native usage, not subscription billing. Jev costs zero and its tokens never enter coding-agent token totals. See the [accounting policy](../../accounting.md).

Native traces, per-request usage, exact queries, model-visible responses, Jev decisions, image receipts and official grading reports are retained locally under `evals/runs/`. Saved context files are not treated as proof that the agent consumed their entire contents. No result here includes the deprecated private-repository evaluations.
