# Reusing evaluated previews

Returning source previews immediately after hierarchical file admission is faster in every recorded-query pair. This is enough to justify a native task comparison, not enough to claim better coding-agent performance: packets are larger and useful source remains omitted.

| Recorded query | Previous hierarchy | Preview handoff | Previous requests | Preview requests |
| --- | ---: | ---: | ---: | ---: |
| Django, Opus | 19.64 s | 9.50 s | 267 | 102 |
| Django, Sol | 17.85 s | 9.90 s | 245 | 135 |
| Xarray, Opus | 22.39 s | 8.77 s | 270 | 88 |
| Xarray, Sol | 21.14 s | 6.69 s | 187 | 65 |

The candidate preserves hierarchical navigation and file-content judgment, then returns sampled source already used in that judgment. It removes subsequent excerpt, reference and related-code model passes. Presentation prioritizes query-named spans and distributes the output budget across admitted files. These are strategy-package comparisons, not an isolated measurement of one mechanism.

Output grows from roughly 30–44 KB to 73–83 KB, including coverage and omissions. Preview output contains 8–13 source paths, versus 4–6 previously. Between 16 and 46 preview ranges per query do not fit the source-output allowance. More source paths are not evidence of better relevance.

For the Django Opus query, the field-definition file scores exactly 0.50 and fails the unchanged strict greater-than cutoff. For the Sol query, it passes at 0.63, but output retains only its `CharField` header while omitting implementation and distributed ranges. Neither preview packet returns the UUID conversion implementation. The candidate is therefore faster without demonstrating recovery of the diagnosed omission. A native comparison must determine whether its starting context saves enough later research to compensate for irrelevant or absent source.

All eight runs complete and pass artifact, request-count, source-snapshot and delivered-source audits. The inputs are complete tracked pre-fix trees exported from the same pinned runtime images as the native cohort. Source identities match, and each condition uses the same recorded query. Conditions run serially with alternating order; local reads and parsing count toward elapsed time. One repetition per query is exploratory evidence, and the two queries per repository are not independent tasks. Jev cost and tokens are excluded; no coding-agent cost or solve rate is measured here.

Independent review found missing byte boundaries, Unicode splitting during JSON-size trimming, sampled negative files being reported as complete, and lost omission boundaries. Each was fixed with a regression that failed before the corresponding change and passed afterward. The CLI fixture verifies multiple admitted files, deep source, no second model gate, rejected files, pruned descendants and output omissions. Old frozen candidates remain unchanged.

Registration, exports, exact requests and decisions, fixtures, reviews, per-condition output, summary and final audit are under `evals/runs/swebench/preview-handoff-v47/`. The [completed native comparison](preview-native-v48-results.md) tests the resulting task outcomes; no winner is established.
