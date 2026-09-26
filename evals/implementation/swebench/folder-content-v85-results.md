# Content-informed folder discovery

Adding descendant code samples to folder judgments did not improve retrieval speed in this comparison. It also did not recover the known cross-backend navigation miss. This candidate is not promoted to the native task benchmark on this evidence; content-informed navigation remains an architectural option to investigate in other forms.

The comparison uses all eight saved v70 queries, the same pinned repository trees, and two counterbalanced repetitions. Only the folder evidence changes: bounded descendant content samples accompany the existing child names and metadata. File previews, source classification, threshold, report policy, and request guard remain fixed. These are development queries, not a holdout or relevance ground truth.

| Measure across 16 runs per arm | Existing hierarchy | Content-informed folders |
| --- | ---: | ---: |
| Retrieval elapsed time | 369.90 s | 439.47 s |
| HTTP requests | 3,648 | 3,969 |
| Unresolved source judgments | 0 | 0 |
| Unresolved navigation observations | 19 | 23 |
| Returned source bytes | 2,669,157 | 2,653,361 |
| Local preview bytes read | 41,608,935 | 95,644,443 |

The candidate is 18.8% slower in aggregate and faster in six of sixteen pairs. It makes 8.8% more requests and performs substantially more local preview work. Similar returned-source volume does not establish equal relevance or completeness.

For the MySQL-specific Django query, the SQLite folder remains pruned in both repetitions: existing scores are 0.25 and 0.23; content-informed scores are 0.27 and 0.26. Those scores do not prove irrelevance. They show that these particular samples and navigation instructions do not overcome the observed scope restriction. No claim about downstream solve rate follows from this retrieval-only experiment.

## Evidence boundaries

All 32 registered runs completed, with valid clock measurements and source hashes verified before and after. The source audit accounts for 4,822 unique ranges across runs, checks classification identities, and verifies that accepted text reaches the saved report. Sampled descendants remain explicitly non-exhaustive; pruning does not turn unseen descendants into checked negatives.

The CLI fixture demonstrates discovery through a misleading folder name, preserves excluded-file boundaries, and passes inherited source-output checks. Independent review found a complete-payload overflow risk with long paths. The fix measures the entire folder request and records omitted optional evidence. Its synthetic regression passes and a disabled-bound mutation fails. A separate attempted filesystem reproduction exceeded macOS's path limit and is not counted as regression evidence.

Raw registration, immutable candidate, calls, navigation and source audits, aggregates, and review evidence live under `evals/runs/swebench/folder-content-v85/`. Jev tokens and cost remain excluded by evaluation policy; its latency is included. Whole-task Sol and Opus quality, time, and agent cost still determine success.
