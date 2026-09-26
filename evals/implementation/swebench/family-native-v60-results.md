# Dependency enrichment did not improve task efficiency

The dependency-family candidate has not met the acceptance target. On these two development tasks, official solve counts match baseline: Sol solves one of two, Opus two of two. Opus takes 24.0% more whole-task time and costs 49.9% more using independently reconciled Gateway charges. Sol's Django pair is also slower and costlier; its Xarray treatment has invalid timing and unknown total cost, so no complete Sol efficiency comparison is available.

| Engine / task | Baseline seconds / dollars | Jevgrep seconds / dollars | Official result |
| --- | --- | --- | --- |
| Sol / Django | 77.49 / 0.2699684 | 116.75 / 0.3696918 | Both pass |
| Sol / Xarray | 111.08 / 0.2855744 | Invalid / unknown | Both fail |
| Opus / Django | 142.59 / 0.7229065 | 274.99 / 1.06234225 | Both pass |
| Opus / Xarray | 745.35 / 1.02547675 | 826.36 / 1.558728 | Both pass |

Jev tokens and cost are excluded. Whole-task elapsed time includes retrieval, implementation, follow-up research, and verification. No attempts were retried or dropped, and results are not pooled with earlier candidates. These are two development tasks, not evidence of general solve-rate equivalence.

The interrupted Sol Xarray treatment exhibits a 5,072.68-second wall/active clock gap, failed Docker event drain, and incomplete request accounting. Later inspection found Docker's clock behind the host; restarting Docker with no active containers restored clock agreement and historical event queries. Its patch and official failure remain recorded, but neither its active timer nor reported native cost substitutes for a valid task measurement.

Opus's Xarray baseline recovered from an interrupted response stream. Its native reported cost omits part of the charge. A separate audit maps all 28 started requests to unique Gateway generation records totaling $1.02547675. The original strict accounting failure remains preserved. The table uses that independently reconciled total, including the interrupted generation. The strict eight-attempt cohort audit fails; the separate retained-attempt audit describes the usable evidence and exceptions without claiming a clean audit pass.

The source-delivery hypothesis was tested directly. Sol's Xarray treatment received the qualified override at packet line 60 and its `return self` body at line 63, then explicitly described the aliasing problem. It nevertheless chose a caller-local copy, failing the official conversion-copy test just as baseline did. This attempt contradicts missing override context as a sufficient explanation of that failure. Opus changed the conversion method itself in both arms and passed. More supplied evidence did not consistently improve the chosen implementation.

Agents continued direct source research after retrieval. Opus also ran broad suites and pristine comparisons in both arms. These choices contribute to task-time variation; the measurements do not isolate retrieval as the cause of every difference. The candidate closes an observed source gap but does not justify unconditional dependency-family expansion on efficiency grounds. The next spike should revisit retrieval and output scope, with prospectively selected additional discovery tasks to avoid tuning indefinitely to these two examples.

The frozen registration is [family-native-v60.json](family-native-v60.json). Exact traces, queries, delivered packets, official grades, charge audits, incidents, and the retained-attempt audit live under `evals/runs/swebench/family-native-v60/`. The latter includes `retained-attempts-audit.json`; `strict-final-audit.log` preserves the failed strict audit. Claude's native skill invocation and CLI behavior are observed, but its expanded initial skill body is not archived.
