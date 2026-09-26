# Stricter source admission: parity remains unproven

The [frozen v28 study](precision-native-v28.json) retained hierarchical discovery,
content previews, code-first output, and caller-aware references. Source admission
was raised to 0.7 while navigation remained at 0.5, without a fixed file count.
Both arms received identical verification guidance and fresh baselines. These
are the same two tuning tasks; no held-out or representative benchmark claim is
supported. All eight attempts are retained.

| Engine | Official solves, baseline / Jevgrep | Total seconds, baseline / Jevgrep | Agent cost, baseline / Jevgrep |
| --- | --- | --- | --- |
| Sol | 2/2 / 2/2 | 410.9 / 395.6 | $0.950 / $1.025 |
| Opus | 2/2 / 2/2 | 1312.8 / 1309.1 | $4.365 / unknown ($3.513 recorded) |

Jev remains free; its tokens do not enter agent cost. Complete Sol charges and
completed Opus charges reconcile with Gateway generations. The timed-out Opus
Xarray treatment lacks terminal usage; its recorded generation charges remain
an explicit subtotal. Both Sol treatments completed; only one Opus treatment
completed. The saved Xarray patch passed official checks despite the timeout.

Sol gained 3.7% in aggregate time but cost 7.9% more. Xarray used fewer coding
requests, yet more newly cached input and more output outweighed its reduction
in cached input. Smaller retrieval output alone did not establish lower task
cost. Tool-output truncation remains visible in native traces.

Opus's Django treatment was faster and cheaper than its fresh baseline, but
verification choices contributed to the timing difference. The Xarray treatment
then waited on a `pgrep -f` pattern present in its own shell command. Process
inspection showed pytest had already exited. After the requested Bash timeout,
Claude backgrounded the faulty wait, stopped it, and resumed; it subsequently
started additional broad tests and a fixed sleep and hit the task deadline.
The final working patch stayed applied and was graded without substitution.

The pinned Claude SDK describes timeout auto-backgrounding and has no
`TaskOutput` schema. Future waiting guidance must match that actual interface;
a requested Bash timeout cannot be treated as a process-kill guarantee. The
harness deadline remains the enforced outer bound. The current attempt is not
repaired or retried under its existing registration.

Two reversed-order retrieval repetitions for each saved query supported testing
the higher threshold: less text was returned, but latency and coverage changes
varied by query. Those diagnostics do not establish precision, task quality, or
end-to-end benefit. Further changes need fresh paired runs, and any promising
candidate still needs repetition and broader discovery-heavy task coverage.

Comparisons, native traces, billing reconciliation, and the self-matching wait
audit are retained in
[`evals/runs/swebench/precision-native-v28/`](../../runs/swebench/precision-native-v28/).
Retrieval diagnostics and the independently reviewed prompt adapter evidence are
in [`evals/runs/swebench/precision-v28/`](../../runs/swebench/precision-v28/).
