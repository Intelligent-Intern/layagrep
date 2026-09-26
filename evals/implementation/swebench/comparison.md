# Architecture comparison

The ten-task registration is fixed before solution inspection. Use the separate
calibration task to compare hierarchical discovery returning complete files versus
scored excerpts, then freeze a candidate before running the ten-task comparison.
Calibration outcomes are development evidence and never enter subset solve rates.

Run Codex `gpt-5.6-sol` at medium effort and Claude `opus` at high effort, recording
the resolved model. Within each engine, baseline and treatment receive identical
public issue text, image state, tools and limits. Only treatment receives Jevgrep and its explicit skill.
As explicitly requested, every treatment must invoke Jevgrep through the skill for initial research, then may use ordinary search to fill gaps.
The baseline uses ordinary research. No gold patch, hidden tests or other attempt
is available to either arm. The agent generates its query; retain the exact query
and actual consumed response, including head filtering, summary visibility, and any further reads after truncation.

Use unique fresh workspaces and official grading IDs for every attempt. Alternate
arm order according to the frozen plan. Do not rerun a failed attempt and retain
only the better outcome. A repair extension, if used, needs a separately frozen,
symmetric policy with all additional time and cost included.

The acceptance gate applies independently to both engines: treatment solve rate
must be equal or higher on the same tasks. Faster or cheaper unresolved attempts
do not offset fewer solved tasks. Compare task cost and elapsed time across all
attempts, then report the paired solved-task comparison as supporting evidence.
Also report total spend per solved task. Missing cost remains unknown. A mixed
result is a tradeoff to investigate, not a declared win.

Jev costs zero and its tokens stay separate. Native Claude cost telemetry uses the
CLI's reported price basis. Codex token-priced cost must be labelled API-equivalent
rather than subscription billing and preserve cache and long-context uncertainty.
Rates and assumptions belong in the frozen plan/measurement artifact, not a
hand-calculated conclusion. See the [accounting policy](../../accounting.md).

The hierarchy spike enumerates only directories that its previous decisions
admitted. It does not start with a global file list or read every file. Its simple
work limits and in-memory queues are experimental mechanisms; production scaling,
resumption, caching and indexing await the architecture decision and later spec.
