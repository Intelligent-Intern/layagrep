# Corrected-package confirmation

Status: running; acceptance contradicted by lost Django and Requests baseline solves.
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
| astropy__astropy-13579 | solved; cost win | $0.3914126 | $0.4286310 | known $0.077806470; total unknown |
| pydata__xarray-3305 | solved; cost win | $0.3182098 | $0.4937066 | $0.123411498 |
| psf__requests-1142 | unresolved | $0.2388080 | $0.2685004 | $0.011300058 |
| sympy__sympy-16792 | solved; cost win | $0.3320948 | $0.5479750 | known $0.098661402; total unknown |
| pytest-dev__pytest-6197 | solved; cost win | $0.8116844 | $2.3444580 | $0.098483154 |

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

Django's packet contained 51 files in 8,071 bytes without excerpts. SQLite was
listed and its critical type-only rebuild guard was read, untruncated, before the
first patch. The final patch left that guard unchanged. Official evaluation ran
123 tests: 121 passed, one failed and one skipped. The failure is a normal foreign
key retaining no collation after its referenced primary key changes collation
without changing type; later many-to-many and reversal assertions were not reached.

The agent's own regression changed AutoField to CharField, missing that same-type
condition. Its broad suite ran 312 tests: 283 passed and 29 skipped. A separate
hidden-relation fixture failed locally and was simplified without a production
fix, but that is not the official failing case. Paired evidence and the exact
pre-patch SQLite read are retained in
`/tmp/jg-freshness-v1-django-comparison/`. The needed code was delivered and read;
this does not prove model variance alone caused the outcome, nor that adding
initial excerpts would prevent it.

Astropy returned 39 files in 6,381 bytes without excerpts. Two source reads and a
linear-coordinate reproduction led to the established dropped-axis fix. Focused
tests passed 41 twice; a broader local directory passed 64, skipped seven and
failed on the same expired leap-second data seen in the saved comparisons.
Official grading independently resolved the task. The patch computes a forward
transformation even when no axis is dropped, unlike the guarded comparator
patches; this adds work but no functional defect was established. Own regression
is a scalar linear case, with a manual high-level roundtrip rather than a committed
high-level test. Evidence: `/tmp/jg-freshness-v1-astropy-comparison/findings.md`.

Xarray returned 17 files in 2,787 bytes without excerpts; the preceding cohort
returned the same file count with five source blocks. The agent filled the gap by
reading Variable and Dataset. Its production changes match the preceding cohort,
but its added assertion covers explicit attribute retention only. Three local
tests passed with 119 warnings; no test failure or rerun occurred. More separate
exploration calls accompanied essentially the same full Sol bill. Evidence:
`/tmp/jg-freshness-v1-xarray-comparison/findings.md`.

Requests returned six files in 7,147 bytes with seven source blocks, including the
entire content-length helper and the same six model-source blocks delivered by
successful comparator runs. The agent read the helper again, then limited its
fix to GET requests. Official GET assertions passed, but bodyless HEAD retained
`Content-Length` and failed the required regression. The agent's new tests covered
GET only; one focused and then four local tests passed. Other broad official
failures involve legacy environment behavior, but they do not explain this
explicit HEAD assertion failure. The relevant implementation was available;
the patch and test scope were too narrow. Evidence:
`/tmp/jg-freshness-v1-requests-comparison/findings.md`.

SymPy returned 29 files in 4,899 bytes without excerpts. Three reads led to the
established unused-matrix-dimension fix, using lists where comparator patches use
tuples. The new regression checks generated Cython source. An initial pytest
command failed because pytest was absent; the repository runner then passed 13
autowrap and 55 codegen tests. A compiled check failed while importing NumPy,
before compilation, so local verification does not establish compiled execution.
Official grading resolved the task. Evidence:
`/tmp/jg-freshness-v1-sympy-comparison/findings.md`.

Pytest returned 25 files in 16,695 bytes with four source blocks, mainly Session
context; the agent then read Package directly. Its final production fix matches
the first faithful treatment apart from a loop variable name. Its new regression
is a flat package case; prior independent testing of the equivalent earlier patch
passed the nested case, so lack of a new nested test is not proof of a defect.
Before a final streaming refinement, the broad suite passed 220 with two
`pkg_resources` dependency failures and one expected failure. Final focused
verification passed nine with one such dependency failure after correcting test
selectors. Official evaluation separately resolved the task. Evidence:
`/tmp/jg-freshness-v1-pytest-comparison/findings.md`.
