# Full-repository navigation recovery

Immediate splitting after a failed navigation batch reduced summed retrieval time by 12.46%, but increased unresolved judgments. This is a latency/coverage tradeoff requiring further investigation, not a demonstrated improvement in relevance or native task performance.

The comparison ran all eight queries previously issued by the native agents against complete exports of the same four pinned runtime Git trees. Each query ran twice per arm with alternating arm order. All 32 outcomes are retained; source hashes matched before and after the experiment. These are host CLI measurements, not container-native implementation timings or an independent task holdout.

| Measured across 16 retrievals per arm | Retry before splitting | Split immediately |
| --- | ---: | ---: |
| Summed wall seconds | 355.06 | 310.82 |
| HTTP requests | 5,160 | 5,398 |
| Unresolved source judgments | 114 | 261 |
| Unresolved navigation judgments | 7 | 27 |

Immediate splitting was faster in 12 of the 16 paired observations. Exploration paths and returned source changed, so this does not isolate scheduler speed from work omitted or added. Neither returned-source overlap nor unknown counts establish precision or recall. Jev is treated as free; these measurements say nothing about coding-agent cost per task.

## Failure evidence

One Django candidate run encountered 361 source HTTP 429 responses. The source retry loop immediately retried rate-limited requests and exhausted its attempts while many judgments remained unavailable. A local HTTP fixture subsequently reproduced failure to honor `Retry-After: 1`: the original CLI retried after approximately two milliseconds. This establishes a recovery defect, not the counterfactual result of fixing it in the observed live run.

One faster SymPy candidate run failed to score `autowrap.py` and `codegen.py`, including both singleton recovery attempts, with HTTP 503 responses. Those files were unknown rather than rejected for relevance. Faster retrieval that omits such source cannot be assumed useful to the coding agent.

The follow-up separates rate limits from payload splitting: wait on a shared provider cooldown and retry a rate-limited navigation batch intact. Local source and navigation fixtures fail on the previous candidate and pass on the new one; existing source-delivery fixtures still pass. These checks do not guarantee recovery from persistent provider failures. Concurrent cooldown extension, date-form retry headers, repeated rate-limit exhaustion, and guard boundaries remain coverage limitations.

## Evidence and limits

The registered plan, all calls, pairing analysis, failure traces, source receipts, and independent review are under `evals/runs/swebench/recovery-retrieval-v74/`. Independent review verified the recorded outcomes, provenance, source fidelity and arithmetic with no actionable findings. The rate-limit candidate and fixture evidence are under `rate-recovery-v75/`; the new paired live comparison is registered under `rate-retrieval-v76/`.

Native task solve rate, coding-agent cost and end-to-end time remain the promotion criteria. No new native comparison is claimed here.

## Rate-limit follow-up

The paired v76 full-repository comparison completed all 32 registered runs, retaining every result and verifying source hashes before and after. Its cooldown candidate recorded 72 unresolved source judgments versus 159 for the prior candidate, but used 507.09 seconds versus 372.63 seconds in aggregate (36.1% slower). Navigation remained variable, with 26 versus 27 unresolved judgments and different explored source; these aggregate counts do not isolate a causal coverage gain. One candidate run honored a provider-requested 57-second pause, included in elapsed time. This establishes neither faster retrieval nor native-task benefit. Raw evidence is under `evals/runs/swebench/rate-retrieval-v76/`.
