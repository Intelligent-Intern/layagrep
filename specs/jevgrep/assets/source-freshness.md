# Source freshness at deferred boundaries

The final review reproduced two gaps: queued navigation could upload buffered
content after an ignore change, and a non-Python file changed during role
evaluation could retain stale excerpts. Earlier green checks did not cover those
boundaries. The correction is committed in `92ca7f9`.

Retrieval now binds request inputs to their source snapshots without adding that
metadata to Jev's payload. It checks eligibility and content before evaluation,
again before each provider attempt after any retry delay, and before returning
the final result. The existing filesystem reader remains the policy owner.
Source invalidation removes stale evidence and marks discovery incomplete.

Two details preserve useful behavior. Preflight reads become ready in FIFO order,
so adding asynchronous validation does not reorder healthy requests. When a
buffered group contains an invalid donor, finite splitting retains healthy
siblings rather than discarding the entire group. Neither changes healthy
prompts, thresholds, source budgets, skill text or rendering.

This is revalidation, not a filesystem lock. Sequential checks cannot prevent a
file changing afterward, and already transmitted requests cannot be recalled.
The guarantee is that detected changes are not knowingly reused at subsequent
validation boundaries.

## Evidence and candidate identity

The new real-filesystem/HTTP regressions cover queued requests, provider retries,
relationship and cross-file donors, healthy siblings and final output. The packed
CLI also exercises queued uploads and final invalidation. Pre-fix reproductions
and corrected results are retained under `/tmp/jg-freshness-*-red*.log` and
`/tmp/jg-freshness-*-green.log`; the maintained tests are in
`test/retrieval-freshness.test.ts` and `test/installed.test.mjs`.

The corrected frozen archive is
`/tmp/jg-freshness-candidate/dzhng-jevgrep-0.0.0.tgz`, SHA-256
`4589072fc0ff44257599dddda8bc5807c9c5515bbe1dcaedfe729645d9c4622c`.
Its native macOS arm64 smoke passed two cases. Both Linux arm64 and amd64 passed
all seven selected installed cases, including source freshness and Python assets.
Logs: `/tmp/jg-freshness-native.log` and
`/tmp/jg-freshness-frozen-{arm64,amd64}.log`.

The first merged default verification passed 109 tests but timed out one existing
donor test at five seconds while both platform checks ran concurrently. This is
not a passing full gate. The serial rerun passed that donor test in 0.51 seconds
and all 110 Bun tests. The remaining full verification is running, with evidence
in `/tmp/jg-freshness-merged-verify-serial.log`; no test allowance was changed.

The accepted work-clock cohort measured the preceding archive. A separate frozen
ten-task treatment cohort must validate this corrected executable; saved baselines
remain immutable and earlier treatment cells cannot be pooled into its result.
