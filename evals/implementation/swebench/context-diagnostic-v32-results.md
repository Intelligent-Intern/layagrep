# Making the retrieval judgment explicit

The SymPy failure supports testing query-linked caller context, but does not yet provide an automatic retrieval strategy. These probes are retrospective diagnostics on a known miss. Their manually chosen context must not be treated as evidence of held-out performance.

The first probe holds the original three-file batch and file-admission question fixed. Symptom-focused query wording does not rescue the edited module. Adding already-observed caller snippets raises its probability modestly, but never above the existing file threshold. The [native study](discovery-native-v31-results.md) records that result and the original failure.

The second probe holds the query, three candidate files and caller snippets fixed, and changes only the question:

| Judgment | `mod.py` probabilities | Neighboring candidate probabilities |
| --- | --- | --- |
| Original broad query relevance | 0.31–0.32 | 0.14–0.20 |
| Defines an operation directly used by the caller snippets | 0.88–0.91 | 0.58–0.67 |
| Helps explain those callers while investigating the query | 0.52–0.55 | 0.25–0.32 |

The last wording admits the edited module at the unchanged file threshold while leaving the neighboring candidates below it. A relationship alone is a broader signal and admits all three. These are score observations, not an authoritative required-file rubric. The second and third conditions each have three successful repetitions; the first has two, with one repetition unavailable after failed requests. Failures are preserved as unknowns.

The next architectural question is how to obtain relevant caller evidence automatically from the source already encountered, without reading a gold patch or prescribing task-specific paths. Source-excerpt admission and whole-task speed, cost and solve rate still need verification. Do not silently lower thresholds or insert these handpicked snippets into a native benchmark.

Exact registered inputs, payloads, attempts, errors and probabilities are in `evals/runs/swebench/context-diagnostic-v32/` and `evals/runs/swebench/relation-diagnostic-v32/`. No diagnostic inference overlapped timed native runs.

The [automatic evidence-selection probe](automatic-context-v33-results.md) tests
whether the useful context can be obtained from already-encountered source.
