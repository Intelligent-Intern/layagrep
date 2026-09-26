# Frozen bundled-CPython confirmation

Study: `evals/runs/swebench/installed-jg-cpython-parity-v1/plan.json`.
The [runtime evidence](python-runtime.md) owns the exact archive and preflight
checks. This is one prospective ten-task cohort; superseded studies do not
contribute results, and saved baselines are never rerun. Acceptance is currently failing solve preservation because Django did not solve;
the remaining frozen cells continue to characterize the same policy.

## Verified completed pairs

| Task | Official result | Full Sol cost | Saved baseline | Cost change | Observed Jev cost, excluded |
| --- | --- | ---: | ---: | ---: | ---: |
| Requests 1142 | Solved, no evaluator errors | $0.2307800 | $0.2685004 | −14.05% | $0.011333322 |
| scikit-learn 13124 | Solved, no evaluator errors | $0.2161638 | $0.2944360 | −26.58% | $0.061259100 |
| Django 15629 | Unresolved; one required test failed | $1.0015696 | $1.5055472 | −33.47%, **not a win** | Known $0.179557602; full total unknown |

All three Sol bills are complete: nine generations each for Requests and
scikit-learn, 24 for Django. Jev response-cost
coverage is complete: Requests has 72 client calls and 81 provider attempts;
scikit-learn has 215 calls and 233 provider attempts. These are observed API
metadata, not invoice reconciliation. Unknown or failed remaining outcomes cannot
be counted as wins. Original grading and accounting receipts live beside each
attempt in the study; remaining cells continue under the same frozen policy.

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
