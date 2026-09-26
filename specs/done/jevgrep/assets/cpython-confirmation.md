# Frozen bundled-CPython confirmation

Study: `evals/runs/swebench/installed-jg-cpython-parity-v1/plan.json`.
The [runtime evidence](python-runtime.md) owns the exact archive and preflight
checks. This is one prospective ten-task cohort; superseded studies do not
contribute results, and saved baselines are never rerun. The cohort is complete and **not accepted**: seven solves versus eight baseline
solves, seven baseline solves preserved, and six successful cost wins versus the
required seven. Full Sol cost is $4.9338206 versus $7.622069 baseline (35.27% lower).
The lower total includes failed tasks and does not compensate for the lost solve.
Jev is excluded; its known subtotal is $1.067555286, with full total unknown.

## Verified completed pairs

| Task | Official result | Full Sol cost | Saved baseline | Cost change | Observed Jev cost, excluded |
| --- | --- | ---: | ---: | ---: | ---: |
| Requests 1142 | Solved, no evaluator errors | $0.2307800 | $0.2685004 | −14.05% | $0.011333322 |
| scikit-learn 13124 | Solved, no evaluator errors | $0.2161638 | $0.2944360 | −26.58% | $0.061259100 |
| Django 15629 | Unresolved; one required test failed | $1.0015696 | $1.5055472 | −33.47%, **not a win** | Known $0.179557602; full total unknown |
| Astropy 13579 | Solved, no evaluator errors | $0.5697514 | $0.4286310 | +32.92%, **not a win** | Known $0.093963408; full total unknown |
| Xarray 3305 | Solved, no evaluator errors | $0.3963624 | $0.4937066 | −19.72% | Known $0.173733546; full total unknown |
| SymPy 16792 | Solved, no evaluator errors | $0.4377728 | $0.5479750 | −20.11% | $0.085087926 |
| pytest 6197 | Solved, no evaluator errors | $0.5946860 | $2.3444580 | −74.63% | $0.100513098 |
| Sphinx 8638 | Solved, no evaluator errors | $0.7531188 | $1.0594724 | −28.92% | Known $0.106778952; full total unknown |
| Matplotlib 26466 | Unresolved, as in baseline | $0.4608290 | $0.3957160 | +16.45%, **not a win** | $0.183680616 |
| Pylint 4604 | Unresolved; retained collection limitation | $0.2727868 | $0.2836264 | −3.82%, **not a win** | Known $0.071647716; full total unknown |

All ten Sol bills and official grading receipts are retained. Matplotlib fails
the annotation/OffsetFrom input-copy image test. Pylint collects no tests because
`IS_PYPY` cannot be imported from `pylint.constants`, matching its retained harness
limitation. Neither is silently excluded or counted as a win. Unknown or failed outcomes cannot count as wins. Jev
costs are observed API metadata rather than invoice reconciliation; incomplete
transport coverage keeps full totals unknown without discarding known subtotals.
Original grading and accounting receipts live beside each attempt in the study.

## Requests paired trace finding

Exact CLI query:

```sh
jg "requests.get always adds Content-Length header; expected GET requests with no body to omit automatically generated Content-Length, while preserving behavior for requests with bodies. Find request preparation/header calculation code and regression tests or test helpers."
```

The complete packet is 6,880 bytes and six files. Its six `models.py` source blocks
are byte-identical to the accepted spike, totaling 4,761 unnumbered source bytes.
It adds `api.py` as a file location and omits the spike's 213-byte `httpbin` helper
excerpt. Neither packet includes an actual regression-test method.

Sol reads the preparation call sites and test conventions, makes one successful
patch, runs its new offline unittest, then expands verification to four tests.
The implementation diff exactly matches the accepted spike's. Compared with the
baseline, it avoids broad implementation reads and two separate behavior probes.
Its Git history/blame lookup returns only synthetic initialization and adds little
information. Unlike the spike, its tests do not explicitly exercise authenticated
GET; the official task still resolves, and auth recomputation appears in the
returned source. This boundary must not be rewritten as universal patch quality.

Savings are predominantly lower billed input, not lower generated/reasoning usage
against every comparator. Different queries and model trajectories prevent
attributing the result specifically to CPython or any individual excerpt.
Full raw-output comparison and exact source-byte offsets are retained locally in
`/tmp/jg-cpython-requests-comparison/`. Authoritative treatment evidence is the
study's Requests attempt; comparators are the retained baseline at
`lookahead-native-v88/psf__requests-1142/codex-baseline` and accepted spike at
`auto-research-80/unit-locators-confirmation/psf__requests-1142`, relative to
`evals/runs/swebench/`. Use raw rollout files for complete tool output; event
summaries can retain only the final output segment.

## Scikit-learn quality caveat

The new packet contains eight files and zero source excerpts. Jev scored the main
implementation 0.27 (a reading lead) and the existing shuffle test 0.15 (no lead).
No declaration passed the 0.5 source threshold across 58 classification requests.
Sol then read the implementation and tests locally, made one patch and passed two
focused tests followed by the full module's 62 tests.

Source review finds a compatibility miss: normalizing `random_state`
unconditionally can reject an invalid but unused seed when `shuffle=False`.
Both the baseline and accepted spike caught this edge, made normalization
conditional, and legitimately retested. An offline runtime reproduction in the retained Python 3.6.13 image confirms
the difference: original, baseline and accepted spike return ten folds for an
unused `object()` seed; the new patch raises `ValueError`. Valid-seed shuffled
and unshuffled controls agree across the corrected implementations. Exact probe
commands and patch identities are in `/tmp/jg-sklearn-rng-probe/`. The official cost win remains the formal benchmark result, but it does
not establish equal patch robustness. Some omitted work protected compatibility;
it must not all be described as unnecessary exploration. Full paired evidence is
retained at `/tmp/jg-cpython-sklearn-comparison/`.

## Django failure and cost coverage

The patch applied, but official `test_alter_field_pk_fk_db_collation` failed:
the related foreign-key column had no collation instead of `nocase`. Creation
coverage and all pass-to-pass tests succeeded; there was no infrastructure or
evaluator error. The baseline solved this task. This result fails the cohort's
solve-preservation gate regardless of its lower cost. Paired trace review identifies the missing SQLite condition: the new patch
leaves related-table rebuilding conditional on a type change; both baseline and
accepted spike also check a collation change. The official test changes only the
collation, so the new branch never rebuilds the referencing table.

The new agent's focused collation test failed. It attributed the failure to model
state, removed the failing related-column assertions, and replaced the scenario
with an AutoField-to-CharField migration. That type change exercises the existing
condition and therefore misses the required collation-only transition. The later
313-test pass did not establish the missing behavior. In contrast, the accepted
spike retained a failing collation-only scenario, read the relevant SQLite range,
and corrected the condition; baseline read that range too.

Both retrieval packets locate SQLite's schema editor and return no source excerpts.
The new packet has one reading lead versus four in the accepted spike. These
packet differences might influence exploration, but do not prove retrieval caused
the failure. The missing condition and changed test scenario directly explain the
observed failure. No outcome is discarded or policy changed mid-cohort.

Jev saved 936 cost-bearing responses, but 13 transport endings recorded broken
pipes with zero delivered bytes. Those requests timed out at the client; late
response bodies were still retained. Eleven declaration requests recovered by
retry, and two navigation requests recovered by splitting. The CLI returned
complete output, but strict accounting leaves the full observed Jev total unknown
while retaining the known response-cost subtotal above. This is not zero usage
and does not change the fully accounted Sol bill.

## Astropy cost regression

The packet contains 60 files and zero excerpts (10,132 bytes); the accepted spike
had 27 files and zero excerpts (4,631 bytes). Both rank the implementation and
its tests first. Jev scores the inverse method 0.42, yielding a lead; reusable
`dropped_world_dimensions` code scores 0.13, yielding neither excerpt nor lead.
Sol reads the implementation locally.

The treatment adds package/changelog inspection, a behavior probe, separate test
enumeration, two failure-log reads, a late high-level test and a final source read.
All comparators encounter the same expired leap-second failure in broader tests,
so it cannot alone explain the added cost. The final focused rerun follows a test
change and is justified. Forty-one focused tests pass. The treatment shares lazy
cached coordinates between metadata and inversion, whereas the references compute
them locally with a guard; no new functional defect was established.

Higher cached-input and cache-creation charges dominate the cost increase. Packet
breadth and the observed exploration are associated differences, not isolated
causes. Detailed comparison is retained at `/tmp/jg-cpython-astropy-comparison/`.

## Separate query-wording diagnostic

The frozen candidate remains unchanged. A preregistered three-call Jev-only probe
replays one retained scikit-learn declaration request, changing only `state.query`.
All source bytes, declarations, questions and other state fields are identical.
The main `_make_test_folds` declaration scores 0.26 with the current query
(retained score 0.27), 0.50 with accepted-spike wording and 0.69 with a neutral
investigative query. Only 0.69 crosses the existing strict `>0.5` selection rule.

Three logical/transport/provider calls succeed with zero retries; observed cost
is $0.000414750, research spend separate from cohort task costs. A 60-second
abort limit is diagnostic-only; production policy is unchanged. One observation
per wording cannot eliminate variance or prove downstream quality. This supports
query sensitivity as a next hypothesis, not promotion of a new strategy. The
contract, exact request/response artifacts and hashes are retained in
`/tmp/jg-query-sensitivity/`. A next experiment must remain separately identified,
retain the same official solve/cost gate, and test actual task outcomes before any
candidate adoption. No Sol or baseline agent was rerun for this diagnostic.

## Xarray and SymPy paired traces

Xarray returns 19 files and nine excerpts (9,107 source bytes); its decisive
`Variable.quantile` blocks are byte-identical to the accepted spike. Three batched
exploration commands replace the baseline's 15 pre-patch reads. The new agent
makes a shell mistake after five tests pass: Bash-only `PIPESTATUS` fails under
`/bin/sh`, requiring a proper Bash rerun. Its added attribute-preservation test is
narrower than baseline/spike coverage, and it omits the spike's broad three-module
run. No new functional defect was established, but lower verification coverage
is part of the cost comparison. Evidence: `/tmp/jg-cpython-xarray-comparison/`.

SymPy returns 28 files, five leads and no excerpts. Both it and the spike identify
`CodeGen.routine`; the new packet adds two useful declaration leads. The new
implementation patch is byte-identical to baseline. It passes 69 tests in one
native-suite run; baseline first attempts unavailable pytest, then repeats the
native suite while correcting its new expected fixture. The spike also repairs
expected import order before passing. All test generated wrapper code but lack
NumPy/Cython for a compiled reproduction. No implementation regression was found.
Evidence: `/tmp/jg-sympy-paired/`. These trace differences are observed associations,
not isolated causal estimates of retrieval's contribution.

## Pytest and Sphinx paired traces

Pytest's packet contains 24 files and six excerpts (12,518 source bytes), mainly
Session traversal context; the ultimately changed `Package.collect` is a lead.
The baseline's broader traversal rewrite repeatedly breaks hook calls, initializer
collection, ordering and skipping. Its 14 implementation/test patches and 15 test
runs follow real repairs; they are not gratuitous repeats. The treatment uses two
patches and two runs. A code-review concern about nested packages did not reproduce:
with assertion-raising nested initializers and an unrelated passing root test,
original code fails while treatment, baseline and spike each pass. No functional
regression is established by that concern. Evidence:
`/tmp/jg-cpython-pytest-comparison/` and `/tmp/jg-pytest-nested-probe/`.

Sphinx returns 85 files, eight leads and zero excerpts, explicitly incomplete after
five provider issues. Its implementation change is byte-identical to both
comparators. Baseline detours through index generation, changelogs and Git objects;
current skips that route. Current and spike repair a test assertion index before
passing domain tests. Current also reproduces a broader warning-related failure
in a pristine checkout. Its added regression covers fewer field variants than the
spike, but no implementation defect was found. Evidence: `/tmp/jg-sphinx8638-paired/`.

## Separate mechanism-first experiment

This cohort is terminal and failed acceptance; do not rerun or replace it. Keep
its CLI, parser, traversal, thresholds, requests and skill as the recorded
incumbent. The bounded Django query diagnostic is complete, and the separately
identified skill trial now belongs to the
[mechanism-first experiment](query-framing-study.md). That record owns the
candidate, preregistered Django-first continuation rule and subsequent outcomes.
A classifier score increase or one task solve is insufficient for promotion.
Sol baselines remain immutable, and any new candidate must still preserve all
eight baseline solves and achieve seven successful lower-cost solves before
final acceptance.
