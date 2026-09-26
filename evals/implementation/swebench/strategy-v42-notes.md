# Discovery mechanism comparison

The hypothesis is that repeated folder, file, and excerpt admission adds latency and compounds false negatives. This spike compares discovery mechanisms while preserving the excerpt relevance question, reference expansion, source layout, and output allowance. It is a development retrieval diagnostic, not an acceptance run.

[The strategy entry point](strategy-v42-spike.ts) owns the variants. Hierarchical discovery is the reference. Direct excerpt scoring retains folder pruning but bypasses file previews and file admission. Flat scoring bypasses both navigation gates. Lexical candidate selection performs a cold local content scan before Jev scores excerpts; it has no learned index or top-N cutoff. Lexically unmatched files remain semantically unknown, not Jev-checked negatives.

All variants use expanded local enumeration and source-read guards so the flat control can inspect these benchmark repositories. This makes the hierarchical arm a fresh control, not a replay identical to the earlier frozen candidate. Files excluded by policy, unvisited descendants, screening failures, and source omissions still limit coverage. Flat scoring does not establish scalability to a whole computer. Local scan time and bytes must count when assessing that tradeoff.

Reference expansion remains common. The earlier observed-file reconsideration branch only revisits negative or failed whole-file decisions. Arms that bypass those decisions consequently do not recover rejected excerpts through that branch. This asymmetry is part of these strategy packages and must be considered before attributing a difference solely to request count.

The local registration, source identities, balanced order, exact recorded native queries, executable hashes, review, fixture checks, and raw results live under `evals/runs/swebench/strategy-v42/`. The fixtures prove that gates are bypassed and that lexical omissions remain unknown; they do not establish relevance quality. A mutation that restores the file gate fails the direct-mode source-delivery assertion.

More returned paths can mean useful coverage or distracting context. Inspect actual returned ranges and omissions before selecting a candidate for fresh native runs. Acceptance requires official solve rate, whole-task time, and coding-agent cost for both Sol and Opus. Jev tokens are excluded under the [accounting policy](../../accounting.md). No task-level win is established by this diagnostic.

The [diagnostic report](strategy-v42-results.md) separates measured retrieval results from pending native acceptance evidence.
