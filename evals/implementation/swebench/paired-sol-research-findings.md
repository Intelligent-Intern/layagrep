# What matched Sol research traces imply for Jevgrep

## Current spike finding

The [frozen ranked-leads comparison](../../runs/swebench/ranked-leads/confirmation-result.json)
meets the observed Sol solve-and-cost criterion on the studied subset. Its linked
grading receipts and billing ledgers are the source of truth for results. This is
an iterated development subset, not evidence of equal success probability on
unseen tasks or another coding model.

The useful handoff is a starting point for research. Initial Jevgrep use remains
required, but the [tested skill](../../runs/swebench/ranked-leads/skill.md) treats
recommended paths as leads rather than mandatory reading. This explicitly changes
the earlier read-all experiment. The comparison measures the CLI and skill
together; it does not isolate a benefit attributable solely to Jev's classifier.

The [candidate](hierarchy-selected-source-only-spike.ts) discovers files
hierarchically and revisits skipped directories through concrete class
relationships. It emits threshold-passing paths, estimated roles, and selected
source windows to stdout, with the file summary first. Small files are not dumped
automatically. Optional parsing helps preserve declaration and comment boundaries;
unavailable parsing falls back to text windows. The coding agent fills remaining
gaps using ordinary repository tools.

The [billing audit](../../runs/swebench/cost-component-audit/result.json) and
[provider audit](../../runs/swebench/provider-consistency-audit/result.json) explain
why output size alone is an inadequate cost proxy. Broad recommendations can cause
large follow-up searches, cached context still costs money, and a provider switch
can require a new cache write. Keep full observed charges and report these limits.

## Earlier matched-trace study

Scope: the four matched Sol baseline/treatment attempts in `lookahead-native-v88`.
All eight patches pass the official grader. Sphinx treatment ends with a model
connection failure, so its full cost and agent verification remain incomplete.
These are observed reading strategies, not a gold list of required files.

## The repeated pattern

Baseline research usually follows implementation → nearby regression test →
fixture/helper or backend implementation. Jevgrep often retrieves the test code
but gives the model an implementation-heavy opening. Saved context is not the
same as consumed context: the raw tool results contain approximately 8–11 KB,
not the entire saved report. Every treatment makes follow-up repository reads.

| Task | Baseline's useful reading chain | Jevgrep delivery and follow-up |
| --- | --- | --- |
| Sphinx return annotation | `sphinx/ext/autodoc/typehints.py` → `tests/test_ext_autodoc_configs.py` → `tests/roots/test-ext-autodoc/target/typehints.py` | All three are saved, but visible source headers cover only `typehints.py`. Treatment rereads implementation and investigates class tests, fixtures, documenter internals and changelog. |
| Sympy unused matrix argument | `sympy/utilities/codegen.py` + `autowrap.py` → `sympy/utilities/tests/test_codegen.py` + `test_autowrap.py` | All four are saved. Opening source covers the wrapper and argument-synthesis branch, with no test excerpt. Treatment still reads both test modules. |
| Requests bodyless GET | `requests/models.py` → `test_requests.py` → `requests/sessions.py` and `adapters.py` for preparation flow | Opening source covers models and adapter; tests are saved but not shown there. `sessions.py` is rejected at 0.49. Treatment later reads sessions plus bundled urllib3 code. |
| Django FK collation | base/MySQL schema editors → related-field metadata → schema tests/models → SQLite schema editor; later migration-state helpers | Opening source contains three ranges from the base schema editor. SQLite folder is pruned at 0.38. Treatment reaches SQLite after a regression failure. Schema models and FK unit tests pass file relevance but contribute no saved source chunks. Migration state is rejected at 0.44, then both agents need its model-state concepts during test debugging. |

The Django baseline explicitly reads SQLite before its first patch. Both agents
subsequently struggle with constructing realistic old/new app states; baseline
file access does not prove its approach was optimal. Similarly, Requests vendor
reads and Sphinx changelog work may be detours, not necessary context.

## Architectural implications

**Return connected evidence, not just independently ranked fragments.** The
opening should make the implementation and a relevant regression example available
together. Test fixtures and helpers matter when they show how to reproduce the
behavior. This is a prioritization rule, not a fixed number of files or a reason
to admit unrelated tests. Keep every threshold-passing result in the full report.

**Separate navigation from relationship expansion.** Hierarchy can find the
initial implementation at scale. After finding it, inspect concrete links to tests,
fixtures, callers and backend overrides, with local evidence for each relationship.
Do not require every supporting file to independently match the original symptom.
The Requests session path and Django migration-state helpers illustrate why that
can miss useful context. Broad dependency expansion has already shown noise in
older spikes; prefer relationships grounded in the selected implementation/test.

**Do not turn a platform clue into proof that sibling implementations are irrelevant.**
Django's MySQL symptom still required preserving SQLite behavior. A pruned folder
means its descendants are unchecked. Expose relevant sibling omissions so the
agent can decide whether to follow them; do not dump every sibling into context.

**Cost savings cannot all be attributed to retrieval.** Sympy's cheaper treatment
also avoids a missing-pytest invocation and repeated corrections to a new test
fixture. Both arms end with 69 passing tests. Those different implementation and
verification choices contribute to cost; this pair does not prove Jevgrep caused
them. Sphinx's baseline finds the core implementation/test/fixture quickly with
ordinary search, so adding a semantic pass has less discovery work to replace.

## Current single-task decision

The active spike now uses Sphinx only and reuses its fixed Sol baseline at
`evals/runs/swebench/file-list-strict/sphinx-baseline` (official pass, $0.3191042).
Do not rerun that baseline. Historical baselines and attempts remain evidence,
not alternatives to select after seeing treatment results. Jev is excluded from
agent cost. Unknown billing is never zero.

The frozen coherent-small candidate passed all three planned attempts, at
$0.265478, $0.4658834, and $0.275063. All coding-agent requests are accounted for.
Mean cost is $0.3354748, 5.1% above the fixed baseline. Two cheaper attempts do
not erase the expensive repeat; average cost parity is not established. The
candidate preserves small relevant implementation files intact, while using
selected blocks for larger files and fixtures. A replay showed why this matters:
a complete useful file passed file relevance at 0.66 but all stricter block
judgments fell below 0.5. The expensive native repeat added instruction-file
lookup retries, test-configuration inspection and verbose test-output reading.
Frozen plans, all three traces, grades and accounting are retained in
`evals/runs/swebench/coherent-small/replication-result.json` and its attempt folders.

The repo-context variant retains that source packing and adds scoped instruction-file lookup and suggested test entry points. Its two prospectively fixed confirmations both passed, with complete bills averaging $0.2479055 (22.3% below the fixed baseline). The pilot also passed but has an incomplete bill and is excluded from this confirmation mean, not treated as free. This supports retaining the architecture on the development task; it does not establish held-out success or isolate which change caused the savings. Both confirmations still searched for missing context after reading Jevgrep output. Exact receipts, costs, and limitations are in `evals/runs/swebench/repo-context/confirmation-result.json`.

A single exact-reference feedback pass recovers source explicitly named in selected evidence. Its pilot and two frozen confirmations all passed, with fully accounted mean agent cost of $0.2472288; confirmations alone averaged $0.2736654. Every run returned the referenced fixture without a model-output truncation warning. This remains one development task and does not establish an advantage over the simpler repo-context variant, whose confirmation mean was nearly identical. Keep the candidate frozen rather than tuning further to this case. Receipts and limitations live in `evals/runs/swebench/reference-feedback/replication-result.json`.

The recent traces separate two costs. Large source packets can be truncated by
the agent's tool wrapper even when an end marker survives. Small file lists can
still create large downstream context when the skill requires inspecting every
listed file. The hybrid output delivered 12.8KB without truncation, yet its known
agent bill already exceeded baseline because Sol continued reading broad helper
and test sections. Output bytes alone are not the optimization target.

The earlier map-first skill told Sol to use already-visible context and retrieve
specific gaps. It did not require inspecting every suggested file. The current
file-list skill does, following the user's explicit experiment instruction.
Therefore earlier cheaper traces cannot establish an output-format advantage:
reading policy changed too. Keep that requirement until the user chooses whether
to test selective consumption. A saved report is not part of the current CLI;
results must remain on stdout.

Source classification also exposes a recall/precision tradeoff. Complete
functions prevent arbitrary chunk boundaries, but broadly related declarations
can produce excessive context. Narrower questions shift score distributions;
scores are not calibrated or interchangeable across question wordings. A failed
request is unknown relevance, not a negative judgment. Returned files and ranges
are starting evidence, not an oracle of necessary files.

Current trace and accounting evidence is preserved under
`evals/runs/swebench/file-list-only/`, `file-list-focused/`, `file-locations/`,
`file-excerpts/`, `declaration-excerpts/`, `local-declarations/`, `hybrid-context/`,
and `core-default/`. Each contains the actual Sol query, returned context,
subsequent reads, final patch, official grade and available generation billing.
The retrieval-only `edit-sites/` and `core-files/` diagnostics have no task-quality
or agent-cost claim. Raw artifacts remain local and excluded from Git.
