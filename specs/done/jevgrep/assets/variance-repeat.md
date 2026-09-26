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
