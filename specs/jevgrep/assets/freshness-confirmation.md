# Corrected-package confirmation

Status: running; acceptance already contradicted by a lost Django baseline solve.
Finish and retain the registered cohort rather than replacing that attempt.
This is a separate prospective ten-task cohort for the
[source-freshness correction](source-freshness.md), not a replacement of individual
cells from the preceding accepted study. The frozen plan, archived runner and
attempt evidence live at `evals/runs/swebench/installed-jg-freshness-v1/`.
All saved baselines are reused without execution. No prior treatment outcome is
pooled into this cohort.

Full Sol task cost is the scored metric. Observed Jev API costs are reported
separately and excluded; incomplete observations are subtotals, not totals.

| Task | Official result | Sol | Baseline Sol | Jev observed API cost |
| --- | --- | ---: | ---: | --- |
| scikit-learn__scikit-learn-13124 | solved; not a cost win | $0.3434830 | $0.2944360 | known $0.046611348; total unknown |
| django__django-15629 | unresolved | $1.0695890 | $1.5055472 | known $0.158282796; total unknown |

Scikit-learn returned five relevant files in 5,038 bytes, implementation reading
leads and two test source blocks. The agent then read the splitter and tests, searched documentation,
reproduced the paired-fold problem and changed the shared random-state handling.
It passed two focused tests, 61 module tests and 172 broader tests. Its unconditional
`check_random_state` call retains the known invalid-seed compatibility caveat
when shuffling is disabled. Official success does not establish that broader
behavior unchanged, and the graded patch is not repaired after the fact.
The production patch matches the preceding cohort exactly. Paired trace evidence:
`/tmp/jg-freshness-v1-sklearn-comparison/findings.md`. The additional exploration
and test work does not isolate a causal cost effect from the freshness correction.

Root execution log: `/tmp/jg-freshness-v1-run.log`. Per-task grade and accounting
receipts, complete event streams, patches and request/response evidence remain
with the attempts. Acceptance stays unproven until all ten outcomes are retained
and the full aggregate is evaluated.
