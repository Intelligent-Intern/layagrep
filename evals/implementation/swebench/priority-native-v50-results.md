# Packing priority: completed native comparison

The candidate preserves official solve rate but does not improve both time and cost for both engines. Sol costs 4.1% less with 1.1% more elapsed time. Opus takes 3.2% less time but costs 9.0% more. These small, mixed differences on two known development tasks are not a stable win.

| Engine / task | Baseline seconds | Jevgrep seconds | Baseline cost | Jevgrep cost | Official solve |
| --- | ---: | ---: | ---: | ---: | --- |
| Sol / Django | 112.90 | 127.20 | $0.428751 | $0.432564 | Both pass |
| Sol / Xarray | 111.81 | 99.88 | $0.348712 | $0.313357 | Both fail |
| Opus / Django | 145.28 | 203.47 | $0.775458 | $0.936878 | Both pass |
| Opus / Xarray | 545.27 | 464.83 | $1.260727 | $1.283030 | Both pass |

Cost per official solve is $0.777462 baseline versus $0.745921 treatment for Sol, and $1.018092 versus $1.109954 for Opus. Failed tasks remain included. Jev cost and tokens are excluded; retrieval, follow-up reading, implementation and verification remain in task time.

The [frozen registration](priority-native-v50.json) changes only packing priority from the previous native candidate. Query-named source and enclosing context receive budget before broad previews. Discovery, file admission, source previews, skill, models, runtime images, prompts, limits and official grading remain unchanged. Fresh attempts reverse within-pair order. The [deterministic replay](priority-packet-v49-results.md) establishes the packing effect separately from model variability.

All eight attempts complete, and the final audit admits source/model identities, artifact hashes, timing and Docker observations, treatment invocation and visible summaries, official grading infrastructure, and complete generation-charge reconciliation. No attempt is repeated or removed. As before, Claude's expanded initial skill body is not archived; native invocation and CLI behavior are observed.

## Trace findings

The Django implementation body is now returned, but declaration order still places substantial class setup before the join-key conversion. Both initial head responses stop before that expression. Sol then directly reads the relevant source range; no later explicit saved-packet read is observed. Returning a body is not equivalent to putting its useful part in front of the agent.

The Sol Xarray patches again change only the caller and fail the official conversion-copy regression. Both Opus patches change the conversion method and pass. A local reproducer passing remains distinct from the official benchmark outcome.

The Opus Xarray attempts spend several minutes on broader verification and investigation of existing failures. That time remains in the comparison. Their difference must not be attributed solely to retrieval or packing.

Raw evidence, exact queries, model-visible output, direct-read observations, patches, grades, request ledgers, paired comparison and final audit are under `evals/runs/swebench/priority-native-v50/`. Results are not pooled with previous candidates, and these tasks are not held-out validation.

The next hypothesis is to score visible preview fragments for usefulness during the same file-evaluation call, then use those scores for presentation. This could put behavior-specific logic ahead of broad class context without restoring a separate inference pass. It must be tested for extra latency, changed file decisions, unavailable fragment judgments and displaced context before another native comparison.

The [completed joint-scoring diagnostic](joint-preview-v51-results.md) tests this presentation hypothesis and its reliability limits.
