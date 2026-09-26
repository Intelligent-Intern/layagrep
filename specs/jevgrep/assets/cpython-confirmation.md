# Frozen bundled-CPython confirmation

Study: `evals/runs/swebench/installed-jg-cpython-parity-v1/plan.json`.
The [runtime evidence](python-runtime.md) owns the exact archive and preflight
checks. This is one prospective ten-task cohort; superseded studies do not
contribute results, and saved baselines are never rerun. Acceptance remains open.

## Verified completed pairs

| Task | Official result | Full Sol cost | Saved baseline | Cost change | Observed Jev cost, excluded |
| --- | --- | ---: | ---: | ---: | ---: |
| Requests 1142 | Solved, no evaluator errors | $0.2307800 | $0.2685004 | −14.05% | $0.011333322 |
| scikit-learn 13124 | Solved, no evaluator errors | $0.2161638 | $0.2944360 | −26.58% | $0.061259100 |

Both Sol bills are complete, with nine generations each. Jev response-cost
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
