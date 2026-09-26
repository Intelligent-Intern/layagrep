# Identical-runtime variance repeat

Status: complete; all ten tasks are officially graded and fully billed for Sol. After accepting the first corrected cohort's documented
tradeoff, the user authorized exactly one additional full cohort to examine
variation. The original outcomes remain intact and no baseline is rerun.

The repeat is `evals/runs/swebench/installed-jg-freshness-repeat-v1b/`, using the
same frozen `0.0.0` archive as [the first cohort](freshness-confirmation.md).
All 179 installed files, the skill, harness, registry and task inputs are
byte-identical. The plan hash is
`9223698cbc84abb2a247ddb29d634a86ca9ec04b0ef74c4198a0f7d7187f1ff5`.
Ten offline runtime preflights and ten no-call validations passed before launch.
The repeat is an additional observation, not permission to pick the better
attempt per task or rerun until acceptance passes.

The initial no-call preparation, `installed-jg-freshness-repeat-v1`, resolved a
newer transitive `ws` dependency. Exactly two installed files differed. That
preparation is retained with an invalid-runtime-drift disposition and made zero
paid calls. The replacement preparation copies the original installed prefix and
uses the unchanged archived runner. Its `preparation-method.json` and
`/tmp/jg-freshness-repeat-v1b-freeze-proof.json` retain the method and file hashes.
No product or evaluation policy changed to repair the setup.

Both execution and sequential grading/accounting exited successfully. Logs use
`/tmp/jg-freshness-repeat-v1b-{run,observer}.log`. The immutable
[repeat aggregate](variance-repeat-aggregate.json) retains all ten results.

| Measurement | Saved baseline | First corrected cohort | Identical-runtime repeat |
| --- | ---: | ---: | ---: |
| Official solves | 8/10 | 6/10 | 7/10 |
| Baseline solves preserved | — | 6/8 | 7/8 |
| Solved tasks cheaper than baseline | — | 4 | 4 |
| Full Sol cost, including failures | $7.6220690 | $5.5410776 | $4.5195532 |
| Sol savings | — | 27.30% | 40.70% |
| Original gate accepted | — | false | false |

The repeat's known Jev subtotal is $1.021334412; its full total is unknown and
excluded from scored Sol cost. These are provider metadata observations, not
invoice reconciliation. No baseline was rerun and no outcomes were pooled.
Requests recovered its solve; Django still lost a baseline solve. This single
repeat demonstrates variation, not a reliability estimate or causal explanation.
The user's separate acceptance of the documented tradeoff remains explicit.

An independent read-only audit reconciled all ten receipts, grading reports,
158 distinct Sol generation charges, frozen runtime artifacts and saved baseline
hashes: 273 checks with no discrepancies. The two cohorts' generation IDs are
disjoint. Aggregate SHA-256:
`2c0a7c78b000e14197fa12364b70d2d258f31eb1a85d416599e0ce2945a6ac90`.
Audit detail: `/tmp/jg-final-repeat-audit.md`. A separate claim audit checked this
record, the closure docs and all ten paired trace comparisons without findings.


## Completed observations

Scikit-learn solved in both corrected-package runs. Repeat Sol cost is $0.3745434
versus first-run $0.3434830 and baseline $0.2944360, so neither corrected run is a
cost win. The repeat used 13 generations versus 14, not more generations. Both
passed the same three test scopes (2, 61 and 172 tests). Its two returned source
blocks match the first run, while the query, file selection and reading leads
differ. The repeat additionally corrected RNG initialization to preserve ignored
invalid seeds when shuffling is disabled, a compatibility issue the first patch
retained. Official solve equality therefore does not imply identical patch quality.
Evidence: `/tmp/jg-repeat-sklearn-comparison.md`.

Django failed the same official collation regression in the repeat. Its complete
Sol bill is $0.9526992 versus $1.0695890 in the first run and $1.5055472 baseline.
No registered pass-to-pass test failed and no infrastructure failure was reported.
The repeat therefore also fails the original requirement to preserve every
baseline solve. This does not replace the user's separate product-acceptance
decision or authorize another repeat. Jev's known subtotal for this task is
$0.151341876; its full total is unknown and excluded.
Unlike the first run, no retained repeat command/output reads the critical SQLite
guard. The packet returned 42 files without excerpts and ranked SQLite 24th rather
than ninth. Its narrower regression covered a PK type change with one foreign key,
not a collation-only change. Final local tests ran 192 with 28 skips (164 passed).
These are observed differences, not proof that ranking caused the miss. Evidence:
`/tmp/jg-repeat-django-comparison.md`.

Astropy solved again. Repeat Sol cost is $0.3507346 versus first-run $0.3914126
and baseline $0.4286310, retaining a successful cost win. Its observed Jev total
is complete at $0.076535382 and remains excluded from scored Sol cost.
The repeat used ten generations versus fourteen and restored a lazy forward-call
guard for the no-dropped-axis case. Its authored regression uses celestial and
spectral coordinates rather than the first run's linear fixture. Final local
coverage passed 107, skipped seven and retained the known expired-leap-second
failure. Evidence: `/tmp/jg-repeat-astropy-comparison.md`.

Xarray solved again at $0.5114540 versus first-run $0.3182098 and baseline
$0.4937066, losing its earlier cost-win classification. The production patch
matches the first run. Its packet grew from 2,787 bytes without excerpts to
17,524 bytes with 12 blocks; the agent ran three successful test selections
instead of one and added default-attribute and groupby coverage. These observed
changes accompany higher cost without isolating its cause. Jev's known subtotal
is $0.181858194, full total unknown. Evidence: `/tmp/jg-repeat-xarray-comparison.md`.

Requests solved on the repeat after failing the first corrected run. Its complete
Sol cost is $0.2721328 versus first-run $0.2388080 and baseline $0.2685004, so the
recovered solve is not a strict cost win. Jev's complete observed total is
$0.010286388, excluded from scored cost.
The repeat's entire seven-block source section is byte-identical to the first
run. This time the patch handles HEAD as well as GET from its first edit, and
its tests cover GET, HEAD, POST, bodies and explicit headers. Two then six local
tests passed, compared with one then four in the first run. The query and file
roles differ, so the recovered case coverage does not isolate a single cause.
The agent also left a generated test log in its retained patch; that is solver
artifact hygiene, not a Jevgrep-created report. Evidence:
`/tmp/jg-repeat-requests-comparison.md`.

SymPy solved again at $0.5426052 versus first-run $0.3320948 and baseline
$0.5479750, retaining a narrow successful cost win. Its complete observed Jev
total is $0.112039242 and is excluded from scored cost.
The repeat adds direct dimension-metadata and generated-C coverage beyond the
first run's generated-Cython check. After an absent-pytest invocation and an
incorrect authored return-type expectation, it corrected the test and finished
with 69 repository-runner tests passing. It used 25 generations versus fourteen
and made no compiled-execution attempt. Evidence:
`/tmp/jg-repeat-sympy-comparison.md`.

Pytest solved again at $0.6108848 versus first-run $0.8116844 and baseline
$2.3444580, retaining a successful cost win. Its complete observed Jev total
is $0.059945634 and is excluded from scored cost.
Its packet shrank from 16,695 bytes with four excerpts to 4,798 bytes without
excerpts; both runs read Package directly. The final streaming implementation
matches the first run apart from a local variable name. The repeat used two
test selections (four passes, then 74 passes with one dependency-warning failure
and one expected failure), without the first run's selector repairs. Own coverage
remains a flat-package case, and the broad test scope is narrower. Evidence:
`/tmp/jg-repeat-pytest-comparison.md`.

Sphinx solved again at $0.4001468 versus first-run $1.2444744 and baseline
$1.0594724, recovering a successful cost win. Its complete observed Jev total
is $0.110341140. The production fix is identical. The packet shrank from
31,851 bytes with 14 excerpts to 14,005 bytes without excerpts; both runs read
the implementation directly. The repeat's instance-variable/type regression
passed immediately in one 35-pass domain-suite run, versus three test-authoring
repairs and broader verification in the first run. Omitted broader coverage
does not show that the known environment warning was fixed. Evidence:
`/tmp/jg-repeat-sphinx-comparison.md`.

Matplotlib remains unresolved at $0.2444352 versus first-run $0.4256784 and
baseline $0.3957160. Its packet grew from 3,846 bytes without excerpts to 9,865
bytes with eight blocks. It delivered the Annotation constructor and an OffsetFrom
header, but not the missing OffsetFrom constructor logic. The agent fixed only
Annotation, using the same tuple conversion as the saved baseline. Local tests
passed 389 with 14 skips; they did not cover the missing OffsetFrom behavior.
The official combined annotation/OffsetFrom test still failed. Jev's known subtotal
is $0.208445538, full total unknown. Evidence:
`/tmp/jg-repeat-matplotlib-comparison.md`.

Pylint remains officially unresolved at $0.2599172 versus first-run $0.3656432
and baseline $0.2836264. Official test collection failed with a missing `IS_PYPY`
import before any tests executed. This is not proof of a patch assertion failure.
Its complete observed Jev total is $0.056059794, excluded from scored Sol cost.

The repeat's production patch matches the saved baseline and accepted spike;
the first corrected patch used an equivalent shared traversal for the inspected
path. Its packet contained 34 files without excerpts versus 32 files with two
fixture excerpts. Local checks passed one, twenty and six tests; the repeat
used fewer pre-patch reads and no standalone AST probe. Neither those differences
nor the lower cost establish a causal effect of retrieval. Evidence:
`/tmp/jg-repeat-pylint-comparison.md`.
