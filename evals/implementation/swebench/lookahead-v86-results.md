# Two-level hierarchical discovery

Crossing an intermediate directory before asking Jev reduces serial discovery rounds, but it does not improve aggregate retrieval latency in this comparison. The candidate still advances to a fresh whole-task evaluation: retrieval timing alone cannot measure whether different context reduces coding-agent follow-up work. That native comparison was registered before the retrieval study finished and retains every task.

The comparison uses all eight saved v70 queries on the same pinned repository trees, with two counterbalanced repetitions. Intermediate folders are enumerated without a relevance judgment; files and boundary folders receive the existing questions and previews. Thresholds, source scoring, model, recovery policy, and report format remain unchanged. This is development evidence, not a holdout or relevance ground truth.

| Across 16 runs per arm | Existing hierarchy | Two-level discovery |
| --- | ---: | ---: |
| Retrieval elapsed time | 345.03 s | 404.52 s |
| HTTP requests | 3,296 | 4,448 |
| Unresolved source judgments | 1 | 0 |
| Unresolved navigation observations | 8 | 28 |
| Returned source bytes | 2,673,717 | 2,727,641 |

The candidate is 17.2% slower in aggregate and faster in four of sixteen pairs. SQLite remains pruned for the MySQL-specific Django query in both repetitions. More speculative enumeration can increase the work between decisions, so fewer directory rounds alone are not a speed guarantee. Returned-source volume does not establish precision or completeness.

Endpoint failures are substantial in both arms: 1,129 of 3,296 evaluations fail in the existing hierarchy, versus 1,566 of 4,448 with lookahead (34.3% and 35.2%). Lookahead also increases successful navigation evaluations from 1,371 to 2,082 and file previews from 3,231 to 6,959. Thus there is additional work alongside failure recovery. These counts cannot apportion wall time or establish a failure-free counterfactual. Each retrieval run invokes the CLI once; the HTTP counts are requests inside that search. A separate command-trace audit likewise confirms one invocation in each of the eight treatment runs in the preceding completed native comparison.

## Verification and next gate

All 32 runs completed with valid clock measurements and repository hashes checked before and after. The source audit accounts for 5,035 ranges across runs, compares uploaded text with the repository byte slices, and checks that accepted bytes reach the saved report. It distinguishes empty files, CRLF text, and explicitly unattempted unknown ranges.

Independent review found four defects in the inherited audit rather than the traversal: empty-file rejection, newline normalization, rejection of unattempted unknown ranges, and failure to detect same-length source substitution. Each fix has a failing-before/passing-after regression. The preceding folder-content comparison also passes the strengthened byte-identity audit. CLI fixtures verify content discovery before intermediate-folder pruning, deep traversal, exclusions, and honest unchecked-descendant reporting.

Raw registration, candidates, calls, audits, and review evidence live under `evals/runs/swebench/lookahead-v86/`. The separate native registration is `lookahead-native-v88.json`; it uses the existing grounded skill and fresh Sol/Opus baselines and treatments. Jev tokens and cost remain excluded, retrieval latency remains included, and official task quality plus agent time and cost remain the acceptance criteria.
