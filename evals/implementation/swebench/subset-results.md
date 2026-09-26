# SWE-bench subset v1

Snapshot: 2026-09-20T14:36:02.336247+00:00. 34/40 native attempts recorded. Acceptance remains unproven until the complete comparison and evidence audit.

Treatment is the frozen hierarchical whole-file candidate with an explicit skill and leading summary. Every treatment is required to invoke Jevgrep for initial research, as requested. The task roster, order, model settings and candidate are fixed in [the registration](subset-plan-v1.json).

Only pairs with both official reports and no known infrastructure incident appear below; all attempts remain in the raw records and raw aggregate totals. Times include retrieval, coding and self-verification. Preparation and official grading are separate.

| Task | Engine | Solves, baseline / Jev | Seconds, baseline / Jev | USD, baseline / Jev |
| --- | --- | --- | ---: | ---: |
| pallets__flask-5014 | Sol | 1 / 1 | 53.4 / 78.8 | 0.165 / 0.227 |
| pallets__flask-5014 | Opus | 1 / 1 | 50.8 / 63.8 | 0.402 / 0.427 |
| psf__requests-5414 | Sol | 1 / 1 | 96.7 / 138.2 | 0.205 / 0.366 |
| psf__requests-5414 | Opus | 1 / 1 | 175.5 / 186.6 | 0.473 / 0.588 |
| django__django-14559 | Sol | 1 / 1 | 109.9 / 109.5 | 0.236 / 0.388 |
| django__django-14559 | Opus | 1 / 1 | 71.3 / 88.1 | 0.451 / 0.571 |
| astropy__astropy-7606 | Sol | 1 / 1 | 88.6 / 69.2 | 0.177 / 0.186 |
| astropy__astropy-7606 | Opus | 1 / 1 | 62.2 / 72.7 | 0.344 / 0.368 |
| matplotlib__matplotlib-20488 | Sol | 1 / 1 | 103.5 / 99.2 | 0.229 / 0.310 |
| scikit-learn__scikit-learn-13496 | Sol | 1 / 1 | 99.6 / 88.8 | 0.393 / 0.279 |
| scikit-learn__scikit-learn-13496 | Opus | 1 / 1 | 95.3 / 262.2 | 0.597 / 0.808 |
| pydata__xarray-4966 | Sol | 1 / 1 | 115.4 / 168.7 | 0.282 / 0.453 |
| pylint-dev__pylint-6903 | Sol | 1 / 1 | 147.0 / 131.3 | 0.311 / 0.302 |
| pytest-dev__pytest-5840 | Sol | 0 / 0 | 218.1 / 249.5 | 0.811 / 0.639 |
| sympy__sympy-23824 | Sol | 1 / 1 | 67.8 / 81.4 | 0.221 / 0.264 |

Infrastructure incident: the Matplotlib Opus baseline lost Docker during host storage exhaustion. It has no official grade and no final native cost. Its recorded duration is invalid for an efficiency comparison. The failed attempt remains in the records; it must not be counted as evidence favoring Jevgrep. The xarray Opus baseline also failed before implementation because Claude OAuth had expired; its empty patch and zero cost are an authentication incident, not model-performance evidence. A clean ten-task acceptance claim is unavailable from this batch.

Sol prices are API-equivalent standard-rate estimates from reconciled native usage, not subscription billing. Opus prices are native reported task costs. Jev costs zero and its tokens never enter coding-agent token totals. See the [accounting policy](../../accounting.md).

Native traces, per-request usage, exact queries, model-visible responses, Jev decisions, image receipts and official grading reports are retained locally under `evals/runs/`. Saved context files are not treated as proof that the agent consumed their entire contents. No result here includes the deprecated private-repository evaluations.
