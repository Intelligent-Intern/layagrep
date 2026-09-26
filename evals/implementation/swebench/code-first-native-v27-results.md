# Code-first delivery: no acceptance yet

The [frozen v27 study](code-first-native-v27.json) tested hierarchical discovery,
caller-aware references, and executable source before Python docstrings. Both
Django and Xarray informed tuning; this is exploratory evidence, not a held-out
or representative SWE-bench result. All eight registered attempts are retained.

| Engine | Baseline official solves | Jevgrep official solves | Baseline total time | Jevgrep total time | Baseline agent cost | Jevgrep agent cost |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Sol | 2/2 | 2/2 | 242.1s | 271.1s | $0.827 | $0.880 |
| Opus | 2/2 | 1/2 | 1395.0s | 1800.2s | $4.639 | Unknown; $3.865 recorded |

Jev tokens and charges are excluded under the evaluation policy. Completed Sol
costs and Opus baseline costs reconcile with Gateway generation charges. Both
Opus treatments timed out without terminal usage reports; their recorded charges
are subtotals, not complete task costs. All four baseline runs and both Sol
treatments completed. Neither Opus treatment completed.

The delivery change exposed useful implementation in the head of stdout, but
saved context is not proof of consumption. Sol's wrappers truncated responses;
Opus explicitly read only the first 200 lines. Sol used fewer coding requests
on both tasks, yet its aggregate task time increased 12% and cost increased 6%.
Its Xarray baseline located the implementation rapidly with ordinary search,
which weakens the premise that this task requires substantial discovery.

Opus's Django treatment left a passing patch but timed out during a fixed wait
for tests that had already completed. Its Xarray treatment timed out during a
pristine comparison with the implementation stashed; the final patch contained
only generated test artifacts and failed official checks. An earlier patch is
not substituted for the final checkout. Baselines also performed broad test
reruns and fixed waits, so these observations do not establish that retrieval
caused the verification behavior.

The next comparison should give both arms identical guidance to retain logs,
poll running processes, and preserve the working patch during long comparisons.
Fresh baselines are required after that protocol change. Separately, the saved
score distribution motivates testing stricter source admission to reduce
incidental context; fewer selected lines alone cannot prove better relevance.
Hierarchical content previews, threshold-based multi-file selection, checked
negatives, and explicit omissions remain requirements.

Machine-readable comparisons, exact queries, model-visible output, timeout
audits, and generation reconciliation live in
[`evals/runs/swebench/code-first-native-v27/`](../../runs/swebench/code-first-native-v27/).
