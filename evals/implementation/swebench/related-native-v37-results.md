# Related declarations: completed native comparison

The candidate preserves official solve rate on this two-task cohort but does not meet the efficiency goal for both models. Sol costs 19.8% more and takes 81.6% longer. Opus costs 20.7% less; its Django time is essentially tied, while its SymPy baseline times out during broad verification, preventing a clean aggregate comparison of completed-task time.

| Engine / task | Baseline seconds | Jevgrep seconds | Baseline cost | Jevgrep cost | Official solve |
| --- | ---: | ---: | ---: | ---: | --- |
| Sol / SymPy | 123.23 | 202.71 | $0.517546 | $0.4812774 | Both pass |
| Sol / Django | 149.60 | 292.69 | $0.476304 | $0.7094548 | Both pass |
| Opus / SymPy | 900.09, timeout | 363.07 | $0.985501 | $0.7194575 | Both saved patches pass |
| Opus / Django | 203.21 | 203.25 | $1.06267425 | $0.90526125 | Both pass |

Sol totals are 272.83 seconds and $0.993850 baseline, versus 495.41 seconds and $1.1907322 treatment. Cost per official solve is $0.496925 versus $0.5953661.

Opus totals are $2.04817525 baseline versus $1.62471875 treatment; cost per official solve is $1.024087625 versus $0.812359375. Measured time spent is 1,103.30 versus 566.32 seconds, but the baseline's completion time is censored by its deadline. Native completion is 1/2 baseline versus 2/2 treatment; official patch solve rate is 2/2 in both arms. Do not describe 900 seconds as a successful task completion or the aggregate spent-time reduction as a stable retrieval speedup.

All eight attempts are graded without infrastructure failures. All Gateway generation requests and charges reconcile, and clock and Docker host-overlap observations are admitted. The timed-out baseline has no final native usage event; complete Gateway accounting supplies its cost. Its receipt, patch, grade, request log and billing records are retained. The queue stopped for audit, then resumed only the two untouched Django cells. No attempt was rerun or removed. Jev tokens and cost are excluded from coding-agent totals by user policy.

## What changed

The [single-admission diagnostic](related-handoff-v37-results.md) was integrated into the previous hierarchical candidate. It reconsiders previously negative or unavailable files using source already encountered during discovery. A related-file score greater than 0.5 admits matching declarations and caller evidence without another source relevance gate. Ordinary source screening remains at 0.7. Selection has no fixed file count; uncertainty and omissions remain explicit.

The skill, required initial invocation, model settings, runtime images, verification guidance, deadlines and official grader remained unchanged. Fresh baselines were run with reversed model/arm order. Both previous tasks were retained; SymPy is a retrospectively diagnosed development case. This is not held-out or representative SWE-bench evidence, and these results are not pooled with earlier candidates.

Before native runs, a fresh retrieval-only replay on the complete immutable pre-fix SymPy tree recovered the complete `Mod` declaration. Previous candidate: 55.70 seconds, 778 requests, 42,801 stdout bytes. New candidate: 53.01 seconds, 745 requests, 83,500 bytes. The related branch took 4.82 seconds and 14 requests. Different model decisions and retries prevent attributing the total elapsed difference to that branch. Output approximately doubled, creating a real risk of unnecessary context.

## What the traces show

For Sol SymPy, automatic relationships find `Mod`, but both related-file checks return HTTP 503. It remains explicitly unscored and no source from it is returned. After Jevgrep, the agent runs the reproducer, receives a traceback, and reads the file locally. Retrieval takes 97.38 seconds, including 8.53 seconds for the new branch.

Opus SymPy also encounters two failed `Mod` checks. Its full output nevertheless includes the critical lines 161–177 as caller evidence for another admitted file. Neither those lines nor their path appears in the initial head response, and no subsequent saved-context read is observed. The summary enumerates admitted file candidates rather than every path with delivered caller source: material on disk is not necessarily material the agent sees.

Sol Django receives the main update/compiler context. The related branch adds transaction helpers and takes 2.65 seconds of the 37.32-second retrieval. The agent also runs the full 15,710-test suite, which reports five failures/errors, alongside passing focused tests. That verification choice contributes to its longer whole-task time; it is not removed from the primary comparison.

Sol reaches its first source-patch tool call at 51.76 versus 146.02 seconds on SymPy and 74.91 versus 116.00 seconds on Django. These are descriptive milestones, not an isolated estimate of retrieval causality. The phase and request audits preserve the underlying observations.

A [post-cohort provider diagnostic](provider-errors-v38-results.md) separates service errors from semantic admission: successful replays of both native payloads still score `Mod` below 0.5. More retries alone would not repair them. That diagnostic is not substituted for the recorded native failures.

## Verification and artifacts

Independent Sol review caught an accidentally shared navigation/related cutoff and lost endpoints for omitted ranges; both were fixed before registration. Controlled Node CLI fixtures verify reconsideration, preserved prior judgments, unavailable checks remaining unknown, verbatim source, independent thresholds, and pruned descendants remaining uninspected. A clipping regression fails under mutation and passes after restoration. An initial review timeout is retained.

Four treatment skill invocations and their initial model-visible summaries are audited. Codex expanded skill content is captured; Claude's native slash invocation, session registration and CLI behavior are observed, but its expanded initial skill body is not archived.

Registration: [related-native-v37.json](related-native-v37.json). Replay/checks: `evals/runs/swebench/integrated-v37/`. Native evidence, `paired-comparison.json`, `final-audit.json`, delivery audits, phase audit and timeout audit: `evals/runs/swebench/related-native-v37/`. The goal remains unproven. The next work is to expose delivered caller paths and failed checks in the head summary, and test better content-preview coverage on independently qualified discovery tasks.
