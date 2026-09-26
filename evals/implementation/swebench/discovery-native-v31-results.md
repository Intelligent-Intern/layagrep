# Additional discovery cases with brief initial reads

The unchanged hierarchical candidate improves observed Sol solve rate and reduces coding-agent cost for both engines in this two-task extension. It does not establish the requested speed benefit: Opus is slower overall, and lid sleep invalidates one Sol timing comparison.

The [registered study](discovery-native-v31.json) uses two cases selected from public issue text and pre-fix source before native outcomes. Official neutral/reference controls passed. Retrieval, thresholds, models, task instructions and the brief skill match the preceding study; continuous container-start observation was added. All eight native attempts completed, were officially graded and have fully reconciled Gateway costs. Jev cost and tokens are excluded.

| Engine | Task | Baseline solve / seconds / dollars | Jevgrep solve / seconds / dollars |
| --- | --- | --- | --- |
| Sol | SymPy | pass / 153.8 / 0.454 | pass / timing invalid / 0.460 |
| Sol | Django | fail / 179.1 / 0.486 | pass / 179.2 / 0.431 |
| Opus | SymPy | pass / 256.1 / 0.592 | pass / 475.5 / 0.892 |
| Opus | Django | pass / 227.8 / 0.955 | pass / 173.3 / 0.552 |

Sol resolves 2/2 with Jevgrep versus 1/2 baseline. Total cost falls 5.2%, from $0.940 to $0.892, including the failed baseline attempt. Django time is effectively tied. SymPy treatment experienced a recorded 24-second clamshell sleep, producing a 21.7-second wall/active clock gap. Its patch passes and billing is complete, but aggregate Sol speed is not admitted. The attempt was retained without retry; only untouched cells resumed after the incident audit.

Opus resolves 2/2 in each arm. Total cost falls 6.6%, from $1.546 to $1.444, while time rises 34.1%, from 484.0 to 648.8 seconds. Django improves; SymPy regresses. Both tasks remain reported.

## What the traces establish

SymPy exposes a retrieval miss despite substantive previews. Opus's query names substitution, assumptions and polynomial helpers. Jev sees all of `mod.py` but assigns file relevance 0.25. It admits `hyperbolic.py` at 0.6, then rejects every source excerpt; the explicitly named realness handler scores 0.35. Neither reaches the delivered source. Retrieval takes 82.8 seconds and 657 requests, including 317 failed attempts, 299 recovered. These are observed service errors, not proof of a particular server-side cause.

Sol's more symptom-focused query also rejects `mod.py`, at 0.15. Its hyperbolic file is unscored after request failures, a distinct unknown. Retrieval takes 55.1 seconds and 472 requests; only polynomial-construction source is returned. Both agents recover through a local traceback. The Opus baseline finds the implementation and makes its first edit in 26 seconds. Public symptoms spanning several concepts did not make this a difficult discovery problem once executed.

Django retrieval returns the SQL update implementation. Sol baseline handles direct parents but fails the official grandparent case: selecting the first ancestor link does not select the full relation path. Treatment constructs that path and passes. Its initial context does not contain the ancestor helper or grandparent example; subsequent local reads informed the implementation. The outcome is a real measured quality difference, but one pair cannot establish its causal mechanism. Opus also changes its verification behavior between arms, so whole-task gains must not be described solely as time saved locating files.

Canonical evidence is under `evals/runs/swebench/discovery-native-v31/`: paired comparison, native traces, exact consumed context, grading reports, generation ledger, failure audits, continuous host observations and the sleep incident. No foreign container overlap was detected. This does not establish absence of every non-container workload.

## Next diagnostic

A retrospective four-condition probe keeps the original three-file batch and admission question fixed while varying symptom-focused query wording and explicit caller snippets. Successful `mod.py` scores remain below the existing 0.5 threshold: original wording 0.22–0.23, symptom wording 0.19–0.20, original wording with caller snippets 0.30–0.33, and symptom wording with snippets 0.29. Failed requests remain unknown. Neither simple change is a demonstrated repair.

The probe lives in `evals/runs/swebench/context-diagnostic-v32/`. Its contextual snippets were selected after observing the failure; it diagnoses model behavior and cannot establish an automatic retrieval strategy or held-out benefit. A [follow-up question diagnostic](context-diagnostic-v32-results.md) distinguishes broad relevance from an explicit caller relationship. Further spikes must test a mechanism that derives useful context from available source and then repeat whole-task comparisons. The architecture goal remains open.
