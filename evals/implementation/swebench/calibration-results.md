# Architecture calibration evidence

This is one separate official SWE-bench task, `sphinx-doc__sphinx-9320`, excluded from the fixed ten-task comparison. It validates the experiment and exposes architecture questions; it cannot establish general solve-rate equivalence or a speed/cost win. Subsequent fixed-subset results are tracked [separately](subset-results.md).

The initial v5 comparison used the explicit Jevgrep skill and summary-first output. Baselines are reused only where their prompt, image, model, limits and tools are unchanged. Exact registration and artifact hashes are in [the calibration plan](calibration-plan-v5.json).

| Engine | Research | Official solve | Task seconds | Task cost, USD |
| --- | --- | --- | ---: | ---: |
| Sol | baseline | 1/1 | 80.3 | 0.280 |
| Sol | files | 1/1 | 83.3 | 0.236 |
| Sol | chunks | 1/1 | 96.9 | 0.244 |
| Opus | baseline | 1/1 | 26.1 | 0.200 |
| Opus | files | 1/1 | 59.9 | 0.438 |
| Opus | chunks | 1/1 | 61.1 | 0.438 |

Sol cost is an API-equivalent standard-rate estimate, reconciled against per-request native usage, including cache pricing. Opus cost is native reported list-price telemetry. Neither is a billing receipt. Jev costs zero and its tokens are excluded from agent usage; retrieval latency remains in task time. The [accounting policy](../../accounting.md) defines the comparison.

The native skill catalog included Jevgrep in both engines. Both read the skill and invoked the installed shell command. Opus used `head -100`; the model-visible result still contained the relevant paths, checked-negative counts, failure status, and saved-report location. Sol likewise received the summary before source. This validates the intended integration, not automatic skill selection without an explicit task instruction.

All four v5 treatment searches completed. File mode made four Jev requests; chunk mode made five or six. Retrieval took approximately 2.8–3.8 seconds. The chunk runs retained all five windows covering the main implementation and its test file, so they did not materially shrink that source. One chunk run filtered an additional console helper after path admission. These are observations about this case, not a general conclusion about excerpt selection.

One whole-file query admitted the command directory but scored `sphinx/cmd/quickstart.py` at 0.17, returning only the test file. The agent recovered with local reads. The retained batch answers and question-to-path mapping make this a concrete file-gate failure to investigate before choosing the architecture. Do not infer that every checked-negative estimate is correct.

Earlier development attempts remain in the raw records: one Opus attempt searched for a deferred tool rather than invoking the CLI; another encountered a missing protocol header in the experiment proxy. Neither returned Jev context. A subsequent Sol attempt hit an upstream gateway timeout and fell back to local research. The first two are integration failures; the timeout is retrieval-availability evidence. None is silently replaced by a favorable outcome or combined with the current candidate.

Cumulative known native calibration-task spend is recorded in the local `calibration-summary.json`. It includes earlier attempts and excludes engineering/review work; missing accounting remains explicit. Raw receipts, native trajectories, consumed-output evidence, Jev metrics and per-request accounting are under `evals/runs/swebench/`; official grader reports are under `evals/runs/tooling/swebench/logs/evaluation/`. Those local artifacts are ignored by Git.

The skill and summary-first contract are supported. The current evidence does not justify declaring either whole files or fixed-size chunks the final architecture. The next bounded spike should examine what evidence and question framing the hierarchical gates need; production optimization and the implementation spec remain deferred.

## File-gate diagnostic

The recorded leaf batches from all four current treatment queries were replayed
with two repetitions per variant. The known target was the implementation file
changed by the native calibration agents; other file relevances were not labelled.
This is a diagnostic on development data, not task acceptance evidence.

| Question evidence | Target above threshold | Requests | Request bytes |
| --- | ---: | ---: | ---: |
| Item-ID references, paths in shared state | 6/8 | 8 | 38,822 |
| Explicit paths in questions | 8/8 | 8 | 43,152 |
| Explicit paths plus source previews | 8/8 | 12 | 278,480 |

The problematic query's ID-based scores were 0.15 and 0.14; explicit-path scores
were 0.96 in both repetitions. This supports supplying the actual target path in
each classification question. It does not establish precision for every other
candidate or prove source previews never help. The next candidate keeps lazy
hierarchical traversal and names the path, plus line range for excerpts, in each
question. Source previews are not added to path discovery on this evidence.

The registered inputs, source-image identity, probe hash and all responses are
retained in `evals/runs/swebench/gate-probe-v1/`. [The probe](gate-probe.ts) is
disposable experiment code. The candidate is registered separately in
[calibration v6](calibration-plan-v6.json); earlier outcomes remain unchanged.

## Declaration context and native skill invocation

The source-unit diagnostic and its limitations are described in
[context findings](context-findings.md). These subsequent Sol runs all used the
same separate calibration task and passed official grading:

| Research configuration | Task seconds | Task cost, USD |
| --- | ---: | ---: |
| Earlier baseline | 80.3 | 0.280 |
| v6 hierarchical whole files | 93.4 | 0.340 |
| v8 declarations with enclosing class context | 88.8 | 0.211 |
| v9 same candidate, native `$jevgrep` invocation | 80.7 | 0.227 |

The initial declaration candidate, v7, was reviewed but never run natively. Its
missing enclosing-class context was corrected before v8. A v8 launcher pointed
at the older registration once; the artifact hash check rejected it before any
inference. That preflight failure is retained separately from task outcomes.

The v9 trace confirms that the full skill content entered the initial context
and the first tool call invoked Jevgrep, removing the separate skill-reading
call. Its task cost was about 19% below the earlier baseline, with elapsed time
0.4 seconds higher. These single runs are development evidence, not a proven
speed improvement or general solve-rate parity. Baselines predate these runs;
the eventual acceptance comparison needs fresh paired runs of the selected
candidate. Opus declaration calibration awaits restored Claude authentication.

The next Sol comparison is registered in
[the declaration subset plan](subset-units-sol-v1.json), with fresh paired
baselines on all ten tasks and balanced arm order. Its
[results](subset-units-sol-v1-results.md) remain separate from the whole-file
comparison and the one-task calibration. This tests whether the observed
calibration benefit survives broader tasks; it does not assume that it will.
