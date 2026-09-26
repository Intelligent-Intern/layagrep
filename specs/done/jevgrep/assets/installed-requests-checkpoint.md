# Installed Requests checkpoint

The frozen installed candidate solved `psf__requests-1142` under the official
SWE-bench grader. This is an integration/quality pass and a cost loss, not a cohort
acceptance result. The saved baseline was reused without execution.

| | Installed jg | Fixed baseline |
| --- | ---: | ---: |
| Officially resolved | yes | yes |
| Full Sol cost | $0.3491436 | $0.2685004 |
| Sol generations | 13 | 11 |

All treatment generations have matching billing metadata. Cost increased
$0.0806432 (30.03%). Jev cost and tokens are excluded. The agent invoked `jg` once;
its 85 Jev HTTP attempts all returned 200. The CLI packet was 2,852 UTF-8 bytes.
The implementation patch is identical to baseline; treatment added broader tests.

Both arms use `openai/gpt-5.6-sol`, medium effort, the same 900-second deadline,
Codex 0.153.4 and the retained runtime/source identities. The treatment's mandatory
initial retrieval instruction and installed canonical skill are explicit arm
changes. Candidate package SHA256:
`aebb98108817285b21b0dced87786e4060dd28a1509a2ac3236c3d3689217be7`.

## Exact observed retrieval

Sol's query was:

> requests.get always adds Content-Length header; expected GET requests with no body to omit automatically generated Content-Length, while preserving body/header behavior. Find request preparation, header calculation helpers, callers, and tests.

The packet supplied `requests/models.py:231–256,385–414` and
`test_requests.py:18–26`, plus six file leads. It exposed the unconditional header
assignment and authentication recalculation immediately. `prepare_body` appeared
as a lead rather than source. The test excerpt contained HTTPBIN/helper/class
scaffolding, not behavioral assertions.

Sol recognized the defect, then read broader models/test source and inspected
adapters, utilities, structures and setup. Its first bundled inspection failed
before producing output; it recovered with separate commands. It ran verification
twice, with a test edit between the successful runs. This was not unchanged-test
repetition. Treatment had 24 command executions and 48,127 output bytes versus
baseline's 9 and 42,168; some commands were parallel, so these are not model-call
counts.

Thin surrounding/test context and broad optional leads are hypotheses for future
presentation work. Additional guidance searches, recovery from the failed command,
source reads and test elaboration are observed agent behavior. One pair cannot
assign the cost increase causally or eliminate ordinary model variance.

## Retained evidence

Local ignored study: `evals/runs/swebench/installed-jg-requests-checkpoint-v3/`.
It contains the frozen plan, npm package, installed prefix and safe input export.
Its `attempt/` retains raw native rollout/events, `jg-stdout.txt`, raw Jev bodies,
patch, official grading console/receipt and generation lookups/accounting.
Baseline: `evals/runs/swebench/lookahead-native-v88/psf__requests-1142/codex-baseline/`.
Official report run: `jg-installed-psf__requests-1142-8cd1b55070bf`.

A separate live installed query completed first in
`evals/runs/swebench/installed-jg-live-query-v1/`. Its Docker launch stderr contains
only the initial Node image pull; the application output is the saved stdout.
The maintained runner and this compact report are versioned; raw task artifacts
remain local. No task, baseline or failure was dropped from the result.

### Separately observed Jev API cost

All 85 retained Jev responses include Gateway cost metadata: summed reported cost
is **$0.011889360**, with 283,080 input tokens and 8,963 output tokens. Sol cost is
$0.3491436; including Jev gives $0.361032960. This is response-reported API cost,
not an invoice reconciliation. The raw sum is retained in the attempt's
`jev-accounting.json`. Jev stays excluded from the scored task-cost metric per
user policy. The earlier accounting field `jev_cost_usd: 0` represented that
scoring exclusion; it was not a measured zero API charge.

The 85 client calls also contain 100 internal Gateway provider attempts, so the
previous statement that all calls returned HTTP 200 must not be read as saying
there were no internal provider failures or fallbacks.
