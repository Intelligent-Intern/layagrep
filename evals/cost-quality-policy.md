# Spike acceptance: quality and agent cost

The current objective is at least baseline official task solve rate and no greater
coding-agent cost per attempted task, assessed with Codex Sol on matched SWE-bench tasks. Claude evaluation is deferred
to full implementation. Keep spikes small and focused on architectural uncertainty. Report cost per official solve as an additional
measure; it must not hide increased spend per attempted task. Seek improvements
in both quality and cost, and report small-cohort uncertainty explicitly.

Run a baseline only once per task, model, and harness. Reuse that fixed result
for every retrieval or skill iteration; candidate changes do not justify another
baseline. Retain the complete baseline traces, patch, official grade, and billing
ledger for analysis. Preserve earlier duplicate attempts as historical evidence;
do not select a different baseline after seeing a treatment result.

Each matched Sol cohort has a frozen plan under [SWE-bench runs](runs/swebench/).
Compare its complete set of attempts with the fixed baselines, retaining every
task outcome. Report individual task costs alongside the cohort mean so savings
on one task do not conceal regressions on another. Development pilots remain
separate from prospective confirmations. The earlier Sphinx studies retain their
original scope and baseline; do not pool them into this cohort.

Elapsed time is diagnostic only during architecture spikes. A clock discontinuity
or unrelated host workload does not by itself invalidate an official grade or
fully reconciled agent bill. Actual execution failures, incomplete billing and
grading infrastructure failures still require investigation and remain visible.

Jev tokens and cost are excluded. Source context delivered to the coding agent
counts toward that agent’s cost. Include unsuccessful attempts in spending;
unknown charges are unknown, never zero. Required initial Jevgrep use and ordinary
follow-up search remain part of the paired protocol.

This policy supersedes the speed acceptance requirement in historical reports and
the frozen [accounting policy](accounting.md). Their billing, retention and source
isolation rules still apply. Frozen plans and raw evidence remain unchanged;
protocol amendments identify where the revised criterion takes effect. Do not pool
different candidates or select favorable repetitions to establish a winner.
