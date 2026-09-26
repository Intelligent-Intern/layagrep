# Progressive disclosure through the native skill

The short initial read preserved official solve rate in this two-task cohort. Sol cost fell with approximately unchanged time. Opus's recorded cost also fell, but unrelated host work overlapped its final baseline, preventing a clean aggregate speed comparison. This is not yet an accepted architecture winner.

The [frozen study](brief-native-v30.json) keeps hierarchical retrieval, source thresholds and the complete returned packet unchanged. The skill saves the packet and initially reads at most 200 lines, then permits selective follow-up. All eight attempts completed and were officially graded. All generation requests reconcile with Gateway charges; Jev cost and tokens are excluded.

| Engine | Task | Baseline solve / seconds / dollars | Jevgrep solve / seconds / dollars |
| --- | --- | --- | --- |
| Sol | Pylint | fail / 224.8 / 0.733 | fail / 220.5 / 0.638 |
| Sol | Matplotlib | pass / 244.3 / 0.846 | pass / 241.0 / 0.662 |
| Opus | Pylint | pass / 259.6 / 1.073 | pass / 357.9 / 1.875 |
| Opus | Matplotlib | pass / timing contaminated / 2.232 | pass / 309.3 / 1.100 |

Sol resolves 1/2 in both arms. Aggregate cost is 17.7% lower and time 1.6% lower, effectively tied. Both failed Pylint patches miss current-directory normalization. The relevant helper was visible in the initial context; this does not establish a missing-file failure.

Opus resolves 2/2 in both arms. Actual billed totals are $3.305 baseline and $2.975 treatment, a 10.0% observed reduction. Its Pylint treatment is slower and costlier. The Matplotlib baseline takes 561.9 measured seconds, but a foreign Playwright container starts during its final 97 seconds. Retain this duration as an observation, not an uncontaminated speed comparison. The provisional 18.8% aggregate speed improvement is withdrawn. Workload overlap also limits causal interpretation of the cost difference, although billing itself is fully known. All attempts remain recorded; none was silently retried.

## What the traces establish

The four treatment initial reads are about 9–10 KB. Agents can follow local source without consuming the full packet. Returning complete context and consuming it incrementally are compatible; this study changes consumption, not file admission.

For Opus Matplotlib, Jevgrep takes 50.6 seconds and the first edit arrives at 132.9 seconds. Baseline locates and reads the core clear methods within ten seconds, then makes its first edit at 238.5 seconds. Both inspect axis reset behavior. Baseline performs broader patched/pristine verification. Whole-task differences therefore include reasoning and testing choices, not simply faster file discovery. These observations do not identify a causal mechanism for the apparent gain.

Canonical evidence is under `evals/runs/swebench/brief-native-v30/`: corrected summary and paired comparison, generation ledger, actual model-visible context, phase audits, patches, official reports, and the host-overlap incident. Valid clocks do not guarantee an uncontended host. A pre-run quiet-host check cannot detect a workload that starts later; future comparisons need continuous overlap observation.

## Next evidence

The [new discovery selection](discovery-selection-v2.json) qualifies two additional issues using public text and pre-fix source, with selection rationale kept out of agent prompts. Candidate retrieval and the brief skill are pinned before new outcomes. Runtime and official no-op/reference controls must pass before native comparisons. Earlier cohorts, including regressions, remain part of the evidence. Broader cases and repetition are still needed before finalizing the architecture.
