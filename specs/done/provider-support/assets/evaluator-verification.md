# Evaluator preservation evidence

2026-09-26. All three fixed presets reproduce the frozen request multiset and
complete stdout through the built production CLI under controlled probabilities.
Missing and invalid responses remain incomplete with exit 2. The historical
oracle, manifest, corpus and skill research body were not changed.

The application still owns actual HTTP attempt counting, the 50,000 guard,
shared cooldown, retries, navigation splitting and cancellation. SDK retries are
disabled. The Node disconnect comparison matches the historical recovery path;
409/422 do not acquire a navigation retry or split; 503 remains split-eligible.
Numeric and HTTP-date Retry-After checks pass. Auth failure aborts siblings and
future requests. Existing retry-time source exclusion/mutation checks pass.

The cache keeps its existing answer-only storage. Provider replacement causes a
miss; old protocol, endpoint, model, policy, prompt and changed source cannot
share an answer. Warm identical requests reuse answers. The installed artifact
continues to hide excluded source and reject stale donors.

The broad Docker pass completed 125 core/CLI/reference tests, 18 Node protocol
checks, 23 parser tests and 4 release tests. Independent code review found no
remaining actionable defect. These are deterministic preservation checks, not a
new task-solve or savings benchmark.

The evaluator and auth were integrated as one cutover, rather than temporarily
publishing provider selection before transport routing. This changed commit
sequencing only; all planned behavior and gates remained.
