# Global fragment ordering: completed native comparison

The candidate preserves official solve rate and lowers coding-agent cost, but does not improve whole-task time for either engine. Sol costs 2.0% less with 9.7% more elapsed time. Opus costs 13.4% less with 3.6% more elapsed time. This is not the required overall win, and these two known development tasks do not establish general performance.

| Engine / task | Baseline seconds | Jevgrep seconds | Baseline cost | Jevgrep cost | Official solve |
| --- | ---: | ---: | ---: | ---: | --- |
| Sol / Django | 96.34 | 102.51 | $0.359197 | $0.357801 | Both pass |
| Sol / Xarray | 113.81 | 127.94 | $0.353998 | $0.341419 | Both fail |
| Opus / Django | 166.85 | 308.08 | $0.882559 | $0.996326 | Both pass |
| Opus / Xarray | 613.70 | 500.39 | $1.685405 | $1.227416 | Both pass |

Cost per official solve is $0.713194 baseline versus $0.699220 treatment for Sol, and $1.283982 versus $1.111871 for Opus. Failed tasks remain included. Jev cost and tokens are excluded; retrieval, follow-up reading, implementation and all agent-chosen verification remain in task time.

All eight attempts complete, with six official passes and no timing, host-observation, grading-infrastructure or missing-charge incident. Every coding-agent generation is reconciled to Gateway charges. Treatment CLI invocation and initial output are observed in all four traces. Claude's expanded initial skill body is not archived; native invocation and CLI behavior are the observed evidence. The [registration](global-native-v54.json) freezes fresh paired baselines, reversed within-pair order, identical models and task guidance, runtime source trees and official grading. No failed attempt is repeated or excluded.

The initial Django output now exposes the join-key conversion for both coding agents, yet follow-up source and test reads remain. Opus chooses a UUID-field fix and runs full-suite comparisons against pristine source; its baseline changes GenericForeignKey directly and performs narrower verification. Those choices cannot be attributed solely to retrieval, and their time is not removed from the comparison.

Both Sol Xarray patches change the caller and fail the official conversion-copy regression. The successful Opus treatment reads the missing `to_index_variable` / `to_base_variable` definitions locally, then changes the conversion method. Its packet contains the caller body but not the conversion definition, even in the full saved report. The baseline also follows conversion and copy behavior. This identifies a context gap; it does not prove that supplying the missing method would change Sol's decision or save time.

The next hypothesis is a bounded expansion from calls visible in relevant source to possible definitions in already admitted files, including receiver-ambiguous matches with explicit uncertainty. That mimics an observed agent research step without another whole-repository scan. It needs checks for irrelevant expansion, source size, local parsing cost and native outcomes before promotion.

Exact queries, model-visible output, dependency-read sequences, patches, official grades, request ledgers, paired comparison and final audit are under `evals/runs/swebench/global-native-v54/`. Results are not pooled with previous candidates or repetitions.

The [completed dependency-expansion diagnostic](dependency-expansion-v55-results.md) recovers the missing definitions but exposes substantial ambiguous-source expansion.
