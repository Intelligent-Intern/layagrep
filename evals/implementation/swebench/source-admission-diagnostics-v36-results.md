# Where the second relevance gate loses context

Three controlled diagnostics did not repair the source-admission miss. They clarify the next architectural hypothesis: a file-level relationship judgment may be sufficient to hand off its matching declaration, without asking the model to judge every excerpt again. This is a policy to test, not an accepted improvement.

The declaration-boundary probe keeps the query and automatically selected caller evidence fixed. Complete `Mod.eval` scores 0.61–0.62, versus 0.51–0.58 for its fragments, across three repetitions. None passes the existing 0.7 source threshold. Boundaries contribute to the score difference but do not explain the entire loss.

The next probe separates caller relevance from implementation relationship, requiring both probabilities to exceed 0.7. It recognizes the implementation relationship strongly, but caller relevance remains low; no source is admitted in 101 successful observations out of 102 planned. The unavailable observation and failed attempts remain recorded. The conjunction is a decision rule, not a calibrated joint probability.

Automatic caller windows sometimes omitted a declaration line even when the complete function was small. A further probe preserves complete caller functions that fit its fixed byte allowance, while keeping query, candidate source, questions, uncertainty labels and thresholds unchanged. All 102 observations complete, and neither the combined judgment nor the two-question rule admits source. The missing header therefore does not repair this example either.

These are retrospective diagnostics on two automatically admitted files, not a required-file rubric or evidence of native task performance. Inputs and all attempts are under `evals/runs/swebench/declaration-diagnostic-v34/`, `atomic-diagnostic-v35/`, and `caller-boundary-v36/`.

The next candidate should explicitly distinguish ordinary source screening from a related-file handoff: after accepting a query-linked file, preserve the matching declaration and its caller evidence, with uncertain relationships and omissions labeled. Do not disguise that as an unchanged excerpt policy. Test its potential for extra unrelated context, agent cost, elapsed time and official solve rate with fresh paired runs.
