# Identical-runtime variance repeat

Status: running. After accepting the first corrected cohort's documented
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

Live execution and sequential grading/accounting belong to sessions `67618` and
`27936`; logs use `/tmp/jg-freshness-repeat-v1b-{run,observer}.log`. Revalidate
their handles before any resume. Final results must be shown alongside the first
cohort, without pooling selected cells or replacing its failed verdict.

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
