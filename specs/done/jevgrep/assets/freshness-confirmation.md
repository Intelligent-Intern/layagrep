# Corrected-package confirmation

Status: complete; rejected by the registered acceptance gate. Six of ten tasks
solved, six of eight baseline solves were preserved, and four solved tasks were
strict cost wins. All ten Sol bills are complete: **$5.5410776** versus baseline
**$7.6220690**, a **27.30% reduction including failed tasks**. Lower total cost
does not compensate for the lost solves. Jev's observed subtotal is
**$1.035782622**; its full total is unknown and excluded from scored cost.
The [complete aggregate](freshness-aggregate.json) is retained byte-for-byte from
the study, SHA-256 `37f2dc0883d0e366b75e74b0f178498a393da9f8ef9cd573d5881630efc0d65a`.
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
| sphinx-doc__sphinx-8638 | solved; not a cost win | $1.2444744 | $1.0594724 | known $0.196647108; total unknown |
| matplotlib__matplotlib-26466 | unresolved | $0.4256784 | $0.3957160 | known $0.157293066; total unknown |
| pylint-dev__pylint-4604 | unresolved at collection | $0.3656432 | $0.2836264 | known $0.067285722; total unknown |

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
with the attempts. All coding, grading and accounting processes are terminal;
no attempt was replaced and no baseline was rerun. The product quality gate
remains open because the completed aggregate rejects the candidate.

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

The exact solver-visible SQLite guard and normal-FK traversal span was also
byte-identical before both runs' first patches: 743 bytes, SHA-256
`31346969bf77570fa98be35fc913ba8a2ec646a23017f22f4ec7bed2ba8af592`.
The passing run read a wider range including later many-to-many and rebuild code.
Initial packets shared 42 files, with no excerpts in either; the failing run lost
the base `_alter_field` and same-type schema-test reading leads, and gained a
type-changing migration-test lead. Its query emphasized BigAutoField-to-varchar,
while the passing query framed character-PK collation. These differences make
query/test-scope narrowing a plausible hypothesis, not an established cause.
Evidence: `/tmp/jg-freshness-v1-django-retrieval-diff.md`.

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

A direct retained-packet comparison found all seven Requests source blocks
byte-identical between the preceding passing run and this failing run, including
line labels and whitespace. The file list shrank from nine to six, dropping three
vendored urllib3 paths; some role labels and an adapter reading lead also changed.
The queries and later solver actions differed. Exact source equality rules out
loss of those delivered blocks, but does not isolate all possible effects of
the other context differences. Hash proof:
`/tmp/jg-freshness-v1-requests-source-equality.json`.

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

Sphinx returned 100 files and 14 test/fixture blocks in 31,851 bytes, fully visible
to the agent. Follow-up reads supplied the Python-domain implementation; its final
production fix matches all successful comparators. Eight pre-patch read/search
calls and three corrections to the authored test accompanied a higher bill than
baseline. The new test covers typed instance variables, without the preceding
cohort's class-variable and explicit-reference assertions. Final domain tests
passed 35; broader autodoc tests passed 74 with the same meta-registration warning
failure previously reproduced in a pristine checkout. Official grading resolved
the task. Evidence: `/tmp/jg-freshness-v1-sphinx-comparison/findings.md`.

Matplotlib returned 23 files in 3,846 bytes without excerpts. The final patch
copies Annotation's coordinates but leaves OffsetFrom's caller-owned coordinates
unchanged. Its regression exercises Annotation and the rendered arrow only.
After correcting an initial NumPy slice attempt, local text tests passed 104 with
12 skips and offsetbox tests passed 285 with two skips. Official evaluation still
failed the combined Annotation/OffsetFrom input-copy regression, as in baseline.
Evidence: `/tmp/jg-freshness-v1-matplotlib-comparison/findings.md`.

Pylint returned 32 files in 6,990 bytes with two fixture blocks and a reading lead
to the relevant checker. The agent read that checker, added qualified/unqualified
ABC coverage and passed one focused plus 20 checker tests. Its implementation
differs structurally from earlier variants but handles the inspected paths
equivalently. Official evaluation failed during collection on missing `IS_PYPY`,
before patch assertions ran. That retained environmental limitation remains a
formal nonpass, not a proven patch defect. Evidence:
`/tmp/jg-freshness-v1-pylint-comparison/findings.md`.

## Interpretation boundary

The two lost baseline solves are concrete patch/test omissions despite delivered
code: Django's same-type rebuild condition and Requests' HEAD behavior. This
does not isolate model variance or the freshness correction as the sole cause.
Healthy controlled parity passed, but it is not a substitute for this failed
live confirmation. The preceding accepted cohort remains evidence about its
own frozen archive, not a result that can replace this one. No further unchanged
cohort is justified merely to obtain a passing draw; changes to retrieval, skill
or acceptance require a separate explicit decision and identified experiment.
