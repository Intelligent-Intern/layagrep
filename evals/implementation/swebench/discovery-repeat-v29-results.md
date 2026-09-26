# Repeating compact hierarchical discovery

The unchanged candidate has not demonstrated the required cost benefit for both engines. The reversed-order repetition preserved solve rate, but Sol became slower and costlier. Opus's repetition cannot support an efficiency conclusion because laptop sleep interrupted its Matplotlib pair and left request charges incompletely observed.

The [frozen repetition](discovery-repeat-v29c.json) retains both tasks and reverses the complete order of the [first cohort](discovery-extension-v29-results.md). No task, candidate, prompt, threshold, model, or budget changed. All eight native agents completed, and all final patches were officially graded.

| Engine | Task | Baseline solve / seconds / dollars | Jevgrep solve / seconds / dollars |
| --- | --- | --- | --- |
| Sol | Pylint | fail / 200.0 / 0.636 | fail / 237.0 / 0.773 |
| Sol | Matplotlib | pass / 222.4 / 0.623 | pass / 301.8 / 0.762 |
| Opus | Pylint | pass / 214.9 / 1.215 | pass / 347.2 / 1.847 |
| Opus | Matplotlib | pass / timing invalid / full cost unknown | pass / timing invalid / full cost unknown |

Sol resolves 1/2 in each arm. Treatment takes 27.6% more time and costs 22.0% more in this repetition. Across both registered repetitions, Sol resolves 2/4 in both arms, takes 11.9% less aggregate time, and costs 0.17% more ($3.653 versus $3.646). That is effectively cost parity, not a demonstrated reduction. The first-run gain depended heavily on long baseline implementation and verification paths that did not recur.

Both Sol Pylint patches in this repetition addressed mixed separators but left the `./` prefix intact, failing the official current-directory normalization test. The relevant owner code was returned and inspected; this is not evidence that a missing file caused the failed solve.

## Sleep and billing incident

The Opus Matplotlib baseline reports 594.6 seconds on the native elapsed timer, while its outer wall time spans 1,649.9 seconds. Treatment reports 439.8 seconds versus 1,283.8 seconds of outer wall time. The outer values include preparation and teardown and must not be substituted as precise agent timers. System power logs confirm clamshell and maintenance sleep during both intervals. These were not crashes.

The new broker exposed an unfinished generation request in each arm. Treatment also has an interrupted streamed generation whose Gateway charge was omitted from the native terminal cost. Its recorded generation subtotal is $1.41447425, exceeding the native $1.2489005 by $0.16557375. Baseline's recorded subtotal is $2.185145, equal to its native report, but its unfinished request still prevents a complete-cost claim. Unknown request costs are not zero. Successful generation lookup and equality with a native report alone cannot prove all requests were accounted for.

Earlier provisional statements that this Opus repetition saved 3% time and 9% cost are withdrawn. Official solve results remain valid: Opus resolves 2/2 in each arm. Its Pylint pair is fully accounted; its Matplotlib pair and aggregate efficiency are explicitly unknown. The first cohort had no corresponding timing gaps and all costs reconciled.

Canonical evidence is in `evals/runs/swebench/discovery-repeat-v29c/`: corrected paired comparison and summary, generation accounting, the two sleep/accounting incidents, power-event extracts, native traces, exact consumed context, and grading receipts. Six unaffected attempts reconcile exactly with Gateway costs. All attempts are preserved.

## What to test next

The traces consistently distinguish delivery behavior: Opus reads a short head and follows relevant paths, while Sol consumes substantially more of the initial packet. A useful next architecture spike is progressive disclosure through the skill: retain the complete CLI packet and checked-negative coverage, but make the first agent read explicitly small, then permit selective reads from the saved context. Keep retrieval and source selection unchanged to isolate the handoff effect. This is a hypothesis, not an accepted product decision.

Future timed commands should hold an idle-sleep assertion and reject efficiency claims when wall and elapsed timers diverge. An idle assertion does not prevent explicit lid sleep. Preserve interrupted runs and incomplete billing rather than retrying them invisibly.
