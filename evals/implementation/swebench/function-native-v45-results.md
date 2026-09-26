# Function context: completed native comparison

This candidate does not meet the goal. Sol preserves official solve rate but is 48.6% slower and 14.8% more expensive. Opus spends 27.2% less time and 5.1% less money, but solve rate falls from 2/2 to 1/2. Lower spending with fewer solved tasks is not an improvement.

| Engine / task | Baseline seconds | Jevgrep seconds | Baseline cost | Jevgrep cost | Official solve |
| --- | ---: | ---: | ---: | ---: | --- |
| Sol / Django | 88.56 | 109.92 | $0.366185 | $0.306836 | Both pass |
| Sol / Xarray | 99.78 | 170.04 | $0.282613 | $0.437717 | Both fail |
| Opus / Django | 162.01 | 245.38 | $0.832390 | $1.042796 | Both pass |
| Opus / Xarray | 499.74 | 236.51 | $1.166108 | $0.853551 | Baseline passes; treatment fails |

Sol cost per official solve is $0.648797 baseline versus $0.744553 treatment. Opus is $0.999249 versus $1.896347. These totals include failed tasks. Jev cost and tokens are excluded by policy; retrieval latency remains part of task time.

All native attempts completed before their deadlines. Official grading reports no infrastructure errors. Registered artifact hashes, source identities, model/runtime identities, timing observations, native skill invocation, visible summaries, and complete Gateway generation accounting pass the final audit. No attempt was retried or removed. Docker observations do not establish isolation from every possible non-container host workload.

## Scope

The [frozen registration](function-native-v45.json) owns the experiment. Two additional official discovery cases were selected from their public issues and pre-fix source before native inference, with passing reference-patch and failing no-op admission controls. This is an exploratory two-task comparison, not a representative or unseen-repository sample. Do not pool it with previous candidates.

The candidate combines content previews, a manifest of delivered ranges, and enclosing function signatures for later excerpts. A modern isolated Python parser is used only by Jevgrep; the coding agents retain each benchmark's original test environment. Both engines receive the same verification guidance within their pair and must use the native Jevgrep skill for initial research in treatment.

## What the traces establish

Both Django treatments admit the field-definition file but omit its UUID conversion source. Sol's conversion excerpts score 0.43 against the ordinary source cutoff of 0.70. The Opus query's related-code graph already contains `UUIDField.to_python`, yet the reconsideration pass excludes it because its file was previously accepted. File discovery succeeded; subsequent selection still lost useful context. This supports testing caller evidence for rejected excerpts inside accepted files, not indiscriminately lowering every threshold.

The Sol Django initial output also spends much of its source section on class setup and checks. Its `head -200` response ends before the join-key comparison, although the leading manifest advertises the broader saved ranges. No subsequent explicit read of the saved packet is observed. Source saved to disk is not necessarily source consumed by the agent.

All three failed Xarray patches fix the `swap_dims` caller while leaving `IndexVariable.to_index_variable()` returning the same object. They fail the official conversion-copy regression. The Opus baseline changes the conversion method itself and passes. Each failed agent identifies the shared-object behavior in its trace, so missing initial retrieval is not sufficient to explain the fix-scope choice. The Sol baseline fails without Jevgrep too; this is counterevidence to a simple causal story.

The Opus baseline spends several minutes on a broad test suite. Its elapsed time is retained, but this single verification choice prevents treating the aggregate speed difference as a stable retrieval effect. More local tests did not rescue the treatment's wrong fix scope.

## Evidence and next spike

Raw evidence and the executable final audit live in `evals/runs/swebench/function-native-v45/`: paired comparison, receipts, exact queries, model-visible output, patches, official grades, generation accounting, and focused omission/ordering audits. Claude's native slash invocation and CLI behavior are observed; its expanded initial skill body is not archived.

The [completed caller-evidence diagnostic](caller-evidence-v46-results.md) compares ordinary declaration judgments with bounded caller evidence across the saved graph candidates. It does not recover the two observed omissions at the existing cutoff. A native comparison remains required before claiming that any subsequent retrieval change improves task outcomes.
