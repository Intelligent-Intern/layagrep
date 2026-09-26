# Mechanism-first query experiment

The faithful bundled-CPython port remains unchanged. Its complete cohort missed
acceptance; [confirmation evidence](cpython-confirmation.md) owns those results.
This separately identified experiment tests the caller's initial query scope,
not a replacement parser, traversal strategy, threshold or source representation.

## Contract registered before the coding-agent run

Candidate branch commit: `99b6afefd0dfe33311a2c1139c67551a2d7e4478`.
Candidate package SHA-256:
`bb3c8e0d5c5011d1a97eae397812f7b830f9a1c119f40aac4afb68b3be419c51`.
The normal build changes only the skill asset and its embedded JavaScript string.
All nine other package payloads match the parent; bundle bytes outside that one
string are identical. The executable's `jg skill` output matches the candidate
canonical skill. Proof lives in `/tmp/jg-mechanism-query-v1/rebuilt/`.
The initial archive changed only the asset and failed preparation because the
embedded copy was stale. That failed preparation remains in
`installed-jg-mechanism-query-v1`, with zero model calls and no frozen plan.
The rebuilt archive uses a fresh output directory; it does not replace an attempt.
The production worktree's canonical skill is unchanged. Both archives remain
unpublishable development version `0.0.0`; release validation intentionally rejects
that version. No validation-only version shadow is substituted for the candidate.

Replace only the skill's instruction to describe symptoms, expected behavior and
reproduction clues with:

> Start by asking how the existing mechanism works and where it is tested. Leave the symptom, desired fix, and platform-specific restriction out of this first query; apply those constraints when interpreting the result and implementing.

This is a coupled change to query scope, not just tone. It contains no benchmark
names, implementation paths, missing conditions, or evaluator answer hints.
The original issue remains unchanged in the agent prompt, and every later skill
instruction remains byte-identical.

Prepare one new ten-task frozen plan, `installed-jg-mechanism-query-v1b`, using the
same package installation process, registry, task snapshots, baseline prompts,
Sol model/effort, 900-second agent limit and official grading/accounting. Baselines
run zero times. Execute Django first, once. All internal repairs, tool calls and
tests performed by that attempt remain in its full bill. No interactive hints,
replacement attempts or mid-run candidate edits are allowed.

The first check is whether the actual initial query follows the new instruction
and provides useful implementation/test evidence. This diagnoses compliance; it
does not replace outcome measurement. Local outcome: official Django solve with a
fully accounted Sol bill, compared with its fixed $1.5055472 baseline and the
parent's failed $1.0015696 attempt. Jev and experimental research spend stay
separate from scored Sol cost, including incomplete provider observations.

If Django solves below baseline cost, continue the same frozen plan's remaining
cells without rerunning Django. If it still fails, retain the result and diagnose
before spending on the remainder. A solved but more expensive outcome is a
partial win to investigate, not grounds to discard the strategy automatically.
Promotion still requires the original full-cohort gate: preserve all eight baseline
solves and reach at least seven successful lower-cost solves. Never pool outcomes
from different candidates. A focused result or classifier score cannot complete
the product goal.

## Evidence and parameter-effect map

| Hypothesis | Controlled observation | Verdict / next discriminator |
| --- | --- | --- |
| Query content affects declaration selection | Same sklearn source/questions: current query 0.26, spike query 0.50, neutral mechanism query 0.69 | Supported as query sensitivity in one observation each; no task-quality claim |
| Neutral wording alone fixes Django selection | Same SQLite method/source/questions: current 0.09, neutral same concepts 0.06 | Not supported |
| Broader mechanism scope admits relevant missing context | Removing collation and MySQL focus together raises that Django method to 0.52 | Coupled scope effect in one observation; individual contributions and downstream value unknown |
| Initial mechanism-first skill improves the failed task | Django remains officially unresolved; full Sol $1.2353512 versus parent $1.0015696 and baseline $1.5055472 | Reject this candidate for promotion; no remaining nine task runs |

Each diagnostic used three successful Jev calls, no SDK retries and a 60-second
diagnostic timeout, without changing production's timeout. Observed research Jev
cost: $0.000414750 for sklearn and $0.000318360 for Django. Exact preregistration,
requests, responses and unchanged-source proofs are in `/tmp/jg-query-sensitivity/`
and `/tmp/jg-django-query-sensitivity/`. These are development diagnostics on
known cases; they establish no untouched generalization.

## Completed Django result

Preparation and all ten no-call checks passed. One Django attempt ran under
`installed-jg-mechanism-query-v1b`; the remaining nine cells were not run. Its exact
initial query was:

> How does the existing mechanism propagate attributes from referenced fields when altering relationship columns, and where is it tested?

The official evaluator reports one unresolved task, no infrastructure/error
instances, and the same failed collation-only regression as the parent. All
pass-to-pass tests succeed. Full Sol billing accounts for all 33 generations:
**$1.2353512**, 17.95% below the immutable baseline but 23.34% above the failed
parent. This is not a cost win because the task is unresolved. Separately, 1,937
Jev calls have a known observed cost subtotal of **$0.282719220**; transport
coverage is incomplete, so the full Jev total remains unknown and excluded.

The CLI returned 212 files and 96 source blocks, including SQLite implementation.
Its full stdout is 350,468 bytes; the file list alone is 61,230 bytes. The coding agent's
20,000-token tool limit truncated the packet, omitting the SQLite source block
while retaining its first-place path and reading leads. Later, after a failing
schema regression, an explicit file read delivered the critical type-change-only
condition and explicitly identified the collation-only rebuilding issue. Sol
still replaced that regression with an AutoField-to-CharField
migration scenario and left the SQLite condition unchanged. The replacement
passes because it changes the type as well as collation; it does not establish
collation-only propagation. More selected context did not produce a correct fix.

Raw rollout ordinal 28 (file line 29) records the truncated initial tool result.
The later read at ordinal 115 and output at 120 establish that the condition did
eventually reach the agent. The replacement also corrected a real fixture issue
by separating old/new migration states; that correction did not require changing
the SQL type. Baseline and spike retained proper states and the same-type case.
Detailed paired evidence lives in
`/tmp/jg-mechanism-query-django-comparison/`; authoritative traces, patch, grade
receipt and generation accounting remain in the study's Django attempt folder.
Do not attribute the failure solely to missing context or solely to truncation.
The candidate is not promoted, the production skill remains unchanged, and no
baseline was rerun. Diagnose the observed handoff before another paid candidate.

## No-call follow-up diagnostics

Exact native-body hashes identify 11 repeated requests in the parent Django run
and seven in the skill candidate. Their retained answers vary by at most 0.01
and 0.05 probability respectively; none crosses the strict 0.5 source-selection
threshold. Each repeat group has only one successfully delivered response; the
other retained response followed a transport failure. This sample does not
support retry score variation as the cause of lost source selection, and cannot
establish service stability across unobserved requests. Reproducible script and
per-question evidence: `/tmp/jg-query-retry-variance/`.

Actual SQLite first-pass replay is equal against the frozen source oracle for
both retained queries. Each produces the same 32 declarations and four ordered
native requests, including source, questions and grouping, using four successfully
delivered answers. The original query selects no excerpts. The broader query
selects identical windows 10–27, 97–177 and 395–544, four reading leads, and 10,895
verbatim source bytes; the critical `_alter_field` scores 0.55. The reference uses
the retained image's Python 3.11.5; production uses bundled 3.11.3. Source SHA-256:
`6ebbe1fb51de14f0142ca4dc2d26efaaf184bb7e48732d2483c1597ea222c736`.

The isolated extension stops at request index four: a proposed second pass uses
file-local selected evidence, while the real pipeline's global selection state
does not contain that retained SQLite request. No answer is fabricated. A bounded
follow-up resolves that difference: replaying `test_operations.py` (31 requests),
`test_autodetector.py` (46) and SQLite (4) produces identical first-pass results in
both implementations. Those 15 evidence entries alone serialize to 74,563 bytes,
above the 64,000-byte follow-up threshold. Reordering entries cannot change that
length, and additional donors only increase it. Both pipelines therefore skip
the additional pass for this unchanged admitted subset. The threshold never caps
the returned source. This establishes the skip decision without reconstructing
every file or completion order.

Proof and scripts are retained in `/tmp/jg-django-parity/`, including
`threshold-proof.json` and `replay-subset.sh`. Whole-Django discovery, global
completion order and role/output parity are not established by this bounded check.

Any wider replay must restore actual pipeline state and delivered-response order,
preserve arrays, and stop at unmatched requests. Late responses the client never
received cannot be substituted as successful answers. Do not launch another paid
query-breadth candidate on this evidence: source selection now matches for the
examined inputs, and the missed condition later reached the solver explicitly.
