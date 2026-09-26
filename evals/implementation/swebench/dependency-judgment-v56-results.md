# Task relevance versus call usefulness

Changing the question to call-site usefulness does not recover the short conversion override missing from the native context. It selects more Xarray dependencies, but that is insufficient evidence to promote this selection rule into another native candidate.

Both conditions receive identical query, candidate-definition and caller source. Only the boolean question changes. All 303 definitions from the positively judged-source condition of v55 are included, with zero exclusions. Two repetitions reverse condition order. All 1,212 requests completed; 26 failed requests leave 25 unavailable pairs, all retained. The final audit verifies registered artifacts, complete pair accounting, reversed order and unknown failure handling.

Of 581 complete pairs, 522 reject in both conditions and 26 admit in both. Call usefulness changes 23 from reject to admit and 10 from admit to reject. Mean score change is +0.0277. There are no gold relevance labels: these transitions do not measure precision, recall or task quality.

| Request measurement | Task relevance | Call usefulness |
| --- | ---: | ---: |
| Requests | 606 | 606 |
| Failed / unknown judgments | 11 | 15 |
| Median milliseconds | 388 | 396 |
| Summed seconds, including failures | 246.74 | 249.32 |

The call-focused question admits `Variable.to_index_variable` in both repetitions for both Xarray queries (0.51–0.55). It rejects `IndexVariable.to_index_variable` in all four judgments (0.27–0.43), although that override is the definition the successful agent read before fixing conversion behavior. The task-relevance question also rejects the override throughout. Lowering a threshold specifically to include this known method would not establish a general solution.

For Xarray, call-focused admissions add roughly 11–19 KB of summed definition excerpts per query/repetition, versus 5–8 KB with task relevance. Django remains variable, including a partially represented class in some admissions. These are excerpt sums, not deduplicated source sizes or useful-byte estimates. Full admissions, unknowns and per-repetition amounts are retained in the secondary metrics.

The next hypothesis is a different unit of judgment: related implementations of a called operation, so a useful base method and its short overrides can be considered together. This must be tested for ambiguity and context expansion; it is not authorization to include arbitrary same-name methods or to claim runtime dispatch is known.

Independent Sol review found two missing preparation guards. Regression fixtures showed that a missing caller could silently reduce the roster, and an oversized definition could pass the total-payload check. Preparation now requires exact coverage of the prior roster, no exclusions, and the registered definition-byte allowance. The regenerated inputs are byte-identical to the original 303-candidate set. The runner fixture also verifies the question intervention, unchanged source, reversed order, unknown failures, plan binding and no overwrite.

The frozen plan, inputs, prior registration, review and triage, all attempts, complete summary, secondary metrics and final audit live under `evals/runs/swebench/dependency-judgment-v56/`. Jev cost and tokens are excluded. No coding-agent task cost or native outcome was measured in this diagnostic.

The [completed family-judgment diagnostic](definition-families-v57-results.md) recovers the short override when related implementations are judged together.
