# Thresholded preview fragments: completed native comparison

This candidate does not meet the goal. Sol loses one official solve while taking 42.4% more time and costing 9.6% more. Opus preserves all four solves and costs 8.0% less, but a clock discontinuity invalidates its aggregate timing comparison.

| Engine / task | Baseline seconds | Jevgrep seconds | Baseline cost | Jevgrep cost | Official solve |
| --- | ---: | ---: | ---: | ---: | --- |
| Sol / Django 15629 | 206.27 | 285.52 | $0.821004 | $0.772381 | Baseline passes; treatment fails |
| Sol / Sphinx 10449 | 53.27 | 116.63 | $0.194535 | $0.329762 | Both pass |
| Sol / Requests 1142 | 74.95 | 108.06 | $0.220311 | $0.325090 | Both pass |
| Sol / Sympy 16792 | 124.16 | 142.98 | $0.540476 | $0.519974 | Both pass |
| Opus / Django 15629 | 459.17 | 476.00 | $2.964566 | $2.870780 | Both pass |
| Opus / Sphinx 10449 | Invalid | 185.60 | $0.896336 | $0.765228 | Both pass |
| Opus / Requests 1142 | 101.75 | 123.40 | $0.646974 | $0.637046 | Both pass |
| Opus / Sympy 16792 | 228.45 | 219.07 | $0.885656 | $0.691184 | Both pass |

Sol cost per official solve is $0.444081 baseline versus $0.649069 treatment; Opus is $1.348383 versus $1.241059. These totals include failed tasks. Jev tokens and cost are excluded; retrieval latency remains part of whole-task time. Every generation charge is reconciled against Gateway accounting.

## What changed

The [frozen registration](fragment-native-v63.json) compares fresh paired native runs on the [prospectively selected discovery subset](discovery-selection-v4.json). Hierarchical navigation uses folder metadata and file content previews. When preview-fragment judgments are complete, only fragments strictly above the relevance threshold enter the source packet. Rejected ranges remain explicit signals; unavailable judgments retain the earlier uncertainty fallback. Compact negative summaries preserve exact details in the saved report. There is no fixed number of selected files.

All eight treatments invoked the native skill and received a model-visible summary. Saved context is not assumed consumed. The expanded initial Claude skill request body is not archived; slash invocation, registration and resulting CLI use are observed.

## What the traces establish

The failed Sol Django treatment admits the SQLite schema editor file, but the source previews never include the function location changed by the successful baseline. Its preview fragments are then all rejected. Lowering the fragment threshold cannot recover source Jev never saw. The Opus treatment also lacks that location initially, but follows up with direct reads and passes. This supports testing complete source inspection within admitted files, while retaining the distinction between finding a file and selecting useful source inside it.

The Django Sol retrieval also encounters many provider failures. Both large and single-question requests fail, so request size alone is not an established explanation. These costs in elapsed time remain in the reported results.

This is an exploratory four-task sample. The public Sphinx issue supplies a strong configuration clue, and Requests is a small repository. Both remain in the frozen cohort; neither is dropped after observing outcomes. These results do not establish performance on large repositories or computer-wide discovery.

## Integrity and limitations

All sixteen native attempts completed, with fifteen official solves and no grading infrastructure errors. Registered artifact hashes, source trees, runtime/model identities, delivery evidence and generation accounting pass the retained-attempt audit. The strict audit intentionally fails on the Sphinx Opus baseline's clock discontinuity: its wall and active timers differ by about 61 seconds. Its cost and official pass are retained, but neither its pair nor the full Opus cohort supports a speed claim. No attempt was repeated or removed.

Raw receipts, traces, patches and audits live in `evals/runs/swebench/fragment-native-v63/`. `audited-comparison.json` corrects an inherited cohort-name label in the frozen comparison script after verifying all input identities; the original output and frozen script remain intact. The next experiment should distinguish missed navigation from missed source within selected files before another native comparison.
