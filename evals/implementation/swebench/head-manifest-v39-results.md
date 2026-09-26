# Making delivered source visible in the head summary

The summary now enumerates delivered source paths, including caller/reference excerpts whose broad file check was negative or unavailable. Previously it listed accepted file candidates, so returned caller code could have no visible path entry. That hid `mod.py` in the recorded Opus SymPy attempt.

The manifest preserves source-range gaps, distinguishes current unknown checks from negative scores, and keeps selected candidates without returned source visible. It also reports incomplete source checks alongside successfully returned excerpts from the same file. Superseded file failures remain in detailed history rather than being presented as current failures.

This is a summary-only candidate. Retrieval, thresholds, source selection, source packing, the 50,000-request guard and provider retry policy remain unchanged. No file-count cap is introduced. A sufficiently large manifest can exceed 200 lines; the full report remains authoritative.

Offline replay of all four v37 treatment packets places every delivered path within the first 200 lines. Summaries occupy 30–82 lines. The Opus SymPy replay exposes four previously hidden paths: `mod.py`, `assumptions/wrapper.py`, `core/tests/test_priority.py`, and `sets/setexpr.py`. This exposes what was returned; it does not establish that every returned path is necessary or useful. In the Sol SymPy replay, `mod.py` is instead visible as a failed check with no returned source.

Three Node behavioral tests cover caller-only source, overlapping ranges with preserved gaps, superseded judgments, selected candidates with no source, and mixed successful/failed source screening. A mutation that filters paths back to accepted candidates makes the regression fail. Full CLI fixtures cover successful admission and unavailable rechecks. Independent Sol review found no issues; the retrieval prefix is verified unchanged.

No native speed, cost or solve-rate improvement is claimed from this rendering replay. The next preview experiment will be assessed separately before another native candidate is registered.

Source: `hierarchy-head-v39-spike.ts` and `handoff-manifest-v39-spike.ts`. Compiled candidate, recorded head outputs, review, mutation check, fixture results and artifact hashes: `evals/runs/swebench/head-v39/`. The underlying negative native result remains [v37](related-native-v37-results.md).
