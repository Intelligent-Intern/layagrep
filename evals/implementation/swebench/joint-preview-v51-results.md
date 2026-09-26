# Joint file and fragment judgments

Joint scoring is promising for presentation, but is not a native performance win. It places Django's join-key conversion near the beginning when the request succeeds, at almost unchanged median request latency. Its higher failure rate makes a naive “unknown fragments last” ordering unsafe: useful source can disappear behind low-relevance material.

The diagnostic uses identical segmented preview source in both conditions. File-only requests ask one navigation question; joint requests add usefulness questions for each visible fragment. The population includes every admitted file from the prior native cohort and rejected files in those same parent folders. There are no gold relevance labels. This isolates the extra questions, not the effect of replacing the original multi-file batching with single-file requests.

| Measurement | File-only | Joint |
| --- | ---: | ---: |
| Requests | 702 | 702 |
| Errors / unknown file judgments | 28 (4.0%) | 59 (8.4%) |
| Median request time | 399 ms | 405 ms |
| Summed request time, including failures | 296.48 s | 297.42 s |

All 1,404 registered requests completed, in two repetitions with reversed condition order. Of 618 pairs with both file judgments available, 615 retain the same admission decision; two change from admit to reject and one from reject to admit. The other 84 pairs remain unavailable. Joint requests return 3,262 fragment judgments and 534 unknown fragments. Errors are retained without retry; neither missing judgments nor unstarted work is counted as rejection. Jev cost is zero and its tokens are excluded. These measurements do not establish retrieval precision, recall, coding-agent cost, or solve rate.

The presentation replay holds prior file admissions fixed and reorders only existing source fragments, under the same source-byte allowance. The Django Claude query exposes the join-key conversion in the first 200 lines in both repetitions. The Sol query does so only in the repetition where its file request succeeds. When Xarray's Dataset request fails, sorting unknowns last can instead lead with weakly relevant coordinate code. The conversion implementation is absent from the Xarray previews; no ranking can supply that missing source. Some overlapping preview windows also repeat source after ranking.

The next candidate should preserve the existing ordering for unavailable judgments, retain explicit uncertainty, and measure joint scoring under the hierarchy's actual batching and retry/splitting behavior. Avoid treating successful-call rankings as evidence that failures are harmless. Native Sol/Opus comparisons are still required before any claim of improved whole-task performance.

The frozen plan, inputs, original failed metadata registration, review and triage, all attempts, summary, full and head-only packets, and audits live in `evals/runs/swebench/joint-preview-v51/`. Review caught inaccurate newline-boundary line labels; a failing regression verified the fix before live requests. Regeneration changed only line metadata and payload lengths, not source, questions, or the file roster. The reported preparation-artifact absence was an omission from the isolated review copy; the actual compiled artifact exists and completed preparation.

The [integrated hierarchy comparison](joint-hierarchy-v52-results.md) measures batching, recovery, and presentation under the actual CLI.
