# Complete admitted-file inspection: native comparison

This candidate preserves or improves solve rate, but does not meet the speed-and-cost goal. Sol solves four tasks versus three for its baseline while taking 32.0% more time and costing 0.8% more. Opus solves all four in both arms, costs 6.8% less, and takes 9.9% more time.

| Engine / task | Baseline seconds | Jevgrep seconds | Baseline cost | Jevgrep cost | Official solve |
| --- | ---: | ---: | ---: | ---: | --- |
| Sol / Django 15629 | 255.77 | 230.24 | $1.046424 | $0.871185 | Baseline fails; treatment passes |
| Sol / Sphinx 10449 | 82.49 | 127.55 | $0.349992 | $0.380608 | Both pass |
| Sol / Requests 1142 | 83.61 | 97.01 | $0.317828 | $0.345904 | Both pass |
| Sol / Sympy 16792 | 88.60 | 219.01 | $0.312204 | $0.445294 | Both pass |
| Opus / Django 15629 | 654.97 | 667.57 | $4.620377 | $3.974767 | Both pass |
| Opus / Sphinx 10449 | 129.29 | 185.32 | $0.700027 | $0.721157 | Both pass |
| Opus / Requests 1142 | 87.19 | 150.52 | $0.501121 | $0.874872 | Both pass |
| Opus / Sympy 16792 | 148.10 | 116.55 | $0.742060 | $0.545575 | Both pass |

Sol cost per official solve is $0.675482 baseline versus $0.510748 treatment; Opus is $1.640896 versus $1.529093. All attempts, including the failed baseline, contribute to spending. Jev cost and tokens are excluded; retrieval latency remains part of whole-task time.

## Candidate and scope

The [frozen registration](open-native-v70.json) owns the comparison. This uses the same four development tasks as v63, with fresh paired baselines and treatments, counterbalanced arm order, unchanged required-initial native skill and identical model/runtime settings within each pair. Earlier outcomes informed candidate design; these are not unseen holdout tasks and results are not pooled with prior runs.

File navigation uses content previews and directory metadata. Admitted files are inspected throughout within explicitly reported inspection bounds, then contiguous source windows receive individual behavioral relevance judgments. Every accepted chunk is saved in the full report. The stdout source allowance is separate, and its leading manifest describes saved source. Failed judgments remain unknown rather than automatically admitting an entire file. There is no fixed file count. The report assembly fix counts each block once instead of repeatedly encoding the growing report.

## What the traces establish

Sol retrieval totals 140 seconds against an overall treatment slowdown of 163 seconds. Sphinx's added time is almost entirely retrieval; Sympy also takes substantially longer after retrieval. Subtraction is descriptive, not a counterfactual prediction: removing retrieval would change agent behavior.

The Sol Django treatment succeeds despite navigation pruning SQLite and rejecting `fields/related.py` at 0.49. It recovers both through ordinary search and reads. The baseline fails the official collation-only migration test and omits the SQLite backend from its patch. The outcome supports the treatment as a useful starting point in this attempt, not complete retrieval or proof of causation. Opus's different query admits and returns the SQLite function range.

Agents initially consume much less than the complete reports. The four Sol tool results contain about 8–11 KB, while saved reports range from 33–295 KB. They subsequently read repository files directly; no explicit saved-report follow-up read is observed in those traces. Preserving accepted source prevents data loss but does not establish that the agent uses it. The manifest and initial excerpts remain important.

Provider failures are concentrated in navigation more than source scoring in the audited retrievals. Single-question calls fail too. Adaptive splitting and retries bias these observations, so the logs do not establish a causal batch-size limit. A controlled request-shape experiment is a stronger next step than simply increasing concurrency or assuming broader source improves speed.

## Verification and evidence

All sixteen attempts complete, with fifteen official solves and no grading infrastructure failures. The strict final audit verifies registered hashes, source trees, runtime/model identities, native skill invocation, model-visible summaries, clock and host observations, and complete Gateway generation accounting. No attempt is repeated or dropped. Claude's expanded initial skill body is not archived; slash invocation, registration and CLI behavior are observed.

Local verification has limits distinct from official grades. Both Django Opus agents encounter the harness HTTP_PROXY server-test failure; the baseline reproduces it on pristine source. The Sphinx treatment records an ordering-sensitive failure and a pristine comparison. Requests has pre-existing network/runtime failures. Sympy's generated-code tests pass, but compiled Cython reproduction lacks dependencies. These traces are retained rather than reported as uniformly green local suites.

Raw receipts, queries, delivered context, patches, official grades, accounting and focused audits live in `evals/runs/swebench/open-native-v70/`. `final-audit.json` and `paired-comparison.json` contain the complete integrity and outcome results. The goal remains unachieved: the next candidate must retain quality while reducing retrieval delay and unnecessary context work, followed by fresh native measurement.
