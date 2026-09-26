# Provider errors and semantic admission are separate problems

Replaying the exact related-file payloads from the two native SymPy queries confirms intermittent provider failure, but also shows that successful requests would still reject `Mod` at the existing 0.5 threshold. Retrying alone is not a repair for these queries.

The first registered probe alternates the two payloads, six repetitions each, with one request at a time and no SDK retries. Eleven of twelve requests succeed. Sol-query scores range from 0.33 to 0.36; Opus-query scores range from 0.24 to 0.25. The error body reports temporary service unavailability from the `typesafe-ai` provider, with no available fallback. It does not identify a batch-size limit. The same payload succeeds at other times.

A second registered probe holds those payloads fixed and uses counterbalanced blocks with worker counts 1, 4, 8, 8, 4, 1. Each block sends 16 requests, alternating the two payloads, without retries.

| Workers | Successful / attempted | Failed | Combined block seconds |
| --- | ---: | ---: | ---: |
| 1 | 29 / 32 | 3 | 16.92 |
| 4 | 26 / 32 | 6 | 4.81 |
| 8 | 24 / 32 | 8 | 3.08 |

Higher concurrency has more failures but higher throughput in this small workload. This is not proof of a universal concurrency limit, a large-batch diagnosis, or a native task-speed improvement. The earlier native logs also contain successful requests with substantially larger token counts and failures on single-item requests, so a simple hard input-size explanation is not established.

The full native comparison remains [v37](related-native-v37-results.md). These diagnostics ran after its timed attempts finished. All request attempts are preserved, and error-body capture is bounded and credential-redacted. Jev cost remains excluded by user policy. Raw inputs, registrations, responses and summaries are in `evals/runs/swebench/provider-errors-v38/`.

The practical implication is to keep three concerns separate: provider failures, low relevance judgments, and useful source that is delivered but not made visible to the coding agent. The next handoff must expose returned caller paths and failed checks in its head summary without turning unknown or rejected files into confirmed relevant files. Source-preview coverage remains another architecture question: opening-only previews cannot show declarations deep in large files.
