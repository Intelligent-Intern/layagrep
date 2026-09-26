# Faithful package: replacement work-clock confirmation

Status: running; full-cohort acceptance remains unproven. The authoritative plan
and receipts are in `evals/runs/swebench/installed-jg-cpython-work-clock-v2/`.
[Timing protocol](timing-protocol.md) owns the prospective clock rule, the v1
Docker outage, retained interruption costs and replacement rationale. No v1
outcome contributes to this cohort. Saved baselines are never rerun.

The production archive, skill, archived harness, task inputs and all 179 installed
files match v1. Artifact proof: `/tmp/jg-work-clock-v2-freeze-proof.json`.
All ten no-call validations passed before execution. The package stays frozen;
this run changes no retrieval policy.

## Retained results

Sol is full task cost; Jev is separately reported and excluded. Pending results
are not wins, and observed Jev subtotals are not complete totals. This checkpoint
will be replaced by the final aggregate after all cells finish.

| Task | Official result | Sol | Baseline Sol | Jev observed API cost |
| --- | --- | ---: | ---: | --- |
| scikit-learn__scikit-learn-13124 | solved | $0.2414888 | $0.2944360 | $0.070983906 |
| django__django-15629 | solved | $1.2852270 | $1.5055472 | known $0.152654124; total unknown |
| astropy__astropy-13579 | solved | $0.3548522 | $0.4286310 | $0.105473382 |
| pydata__xarray-3305 | solved | $0.3180666 | $0.4937066 | known $0.174302688; total unknown |
| psf__requests-1142 | solved | $0.2466230 | $0.2685004 | known $0.030577680; total unknown |
| sympy__sympy-16792 | pending | pending | $0.5479750 | pending |
| pytest-dev__pytest-6197 | pending | pending | $2.3444580 | pending |
| sphinx-doc__sphinx-8638 | pending | pending | $1.0594724 | pending |
| matplotlib__matplotlib-26466 | pending | pending | $0.3957160 | pending |
| pylint-dev__pylint-4604 | pending | pending | $0.2836264 | pending |

## Paired trace findings

Django received 43 files without source excerpts and explicitly read SQLite before
patching. Its patch includes the same-type rebuild trigger, old/new collation
comparison and MySQL nullability handling. Own regression covers BigAutoField to
CharField, FK/O2O nullability and constraints; official tests supply same-type,
reversal and many-to-many coverage. Final broad tests: 283 passes, 29 skips.
MySQL execution was not tested. More shell reads than v1 accompany higher Sol
cost, but there is no isolated causal cost attribution. Evidence:
`/tmp/jg-work-clock-v2-django-comparison/`.

Astropy received 45 files and no excerpts. Its shorter source-read, reproduction,
patch and test sequence resembles the accepted spike; no concrete functional
defect was established. Own regression is one scalar low-level case. Focused tests
passed 41; broader tests passed 107, skipped seven and failed one because of the
same expired leap-second data seen in baseline/spike. The official evaluator
separately resolved the task. Evidence: `/tmp/jg-work-clock-v2-astropy-comparison/`.

Xarray received 17 files and five excerpts, retaining the decisive Variable source.
One patch and four focused passing tests avoided the original faithful run's shell
status error. New regression checks default attr removal and explicit retention;
coverage remains narrower than the spike's full-module run. Evidence:
`/tmp/jg-work-clock-v2-xarray-comparison/`.

Scikit-learn repeats the established compatibility caveat despite its official
solve: unconditional random-state validation rejects invalid seeds previously
ignored when shuffling is disabled. Official benchmark success does not establish
all behavior equivalent. No benchmark patch is silently repaired after grading.

These tasks fit the old wall-clock allowance too. Their improvements do not
establish a clock effect or determinism across independent live model trajectories.
