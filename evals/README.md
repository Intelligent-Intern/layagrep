# Official benchmark evaluation

Use SWE-bench's official behavioral grader to compare product versions on matched
tasks, source, model and harness. Keep architecture experiments and packaged-product
runs separately identified. The [architecture](../docs/architecture.md) records
the retrieval principles; saved no-Jev results provide additional context.

The maintained [installed-package harness](implementation/swebench/installed.md)
drives the actual `jg` executable with Sol and reuses the fixed baselines.
It supports a single-task checkpoint or a complete ten-task cohort, preserving raw
Jev requests/responses, coding-agent actions, patches, official grades and bills.

A baseline is immutable per task/model/harness and is never rerun to improve a
comparison. The benchmark requires initial Jevgrep use to isolate retrieval's
effect, while the production skill remains selective. Agents may fill remaining
context gaps with ordinary tools.

[Cost and quality policy](cost-quality-policy.md) owns acceptance. Count the full
coding-agent task, including implementation, verification and failed attempts.
Jev cost and tokens are excluded. Unknown bills cannot count as cost wins. Timing
is diagnostic; report solve outcomes alongside cost changes. The tuned
Python cohort does not prove untouched-task or language-wide generalization.

Raw traces, repository snapshots and generated study artifacts stay in ignored
run storage. Commit reproducible official tooling and concise evidence reports.
Personal-repository fixtures and custom-rubric evaluations are deprecated and
stay outside Git; they are not product acceptance evidence.

The [research archive](implementation/swebench/research-archive.md) preserves the
superseded official experiments in Git without adding obsolete runners to `main`.

The [final product research report](results/relevance-threshold-2026-09-27.md) records the neutral-skill cohort and parameter-effect map. The earlier [source-first cohort](results/source-first-2026-09-27.md) retains its separate package and skill identity.

The [speed study](results/speed-2026-09-28.md) compares the frozen local optimizations and native TypeSafe route against that previous cohort and the same saved no-Jev baselines.
