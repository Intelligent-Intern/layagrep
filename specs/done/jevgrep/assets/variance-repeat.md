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
