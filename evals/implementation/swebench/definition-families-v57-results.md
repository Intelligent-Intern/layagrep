# Judging related implementations together

Judging source-declared method families together recovers the short Xarray override that individual gates repeatedly rejected. This is promising enough for an integrated dependency-context spike, but there are no native task outcomes or relevance gold labels here.

All 303 prior candidates are partitioned using same-file, source-declared inheritance. The 177 singletons remain unchanged and are not reevaluated in this diagnostic. The 22 multi-member groups contain 126 definitions. Cross-file bases, dynamic binding and receiver identity remain unverified; unrelated same-name methods are not grouped merely by name.

Both arms see identical family definitions, inheritance-source evidence and caller excerpts. One arm asks a question per definition; the other asks one group question and includes all members when positive. Both granularity and question count change. Two repetitions reverse condition order. All 88 requests completed and passed artifact, accounting and failure-state audits.

| Request measurement | Individual judgments | Family judgment |
| --- | ---: | ---: |
| Requests | 44 | 44 |
| Failed requests | 4 | 2 |
| Unknown member judgments | 46 | 29 |
| Median milliseconds | 387 | 388 |
| Summed seconds | 17.75 | 17.45 |

Of 252 member-level pairs, 177 have both judgments available; 75 remain unknown. There are 104 reject-to-admit transitions, ten admissions in both arms, 59 rejections in both, and four admit-to-reject transitions. Member decisions from the same family are correlated, not independent samples. These counts do not establish precision, recall or a reliability advantage.

For both Xarray queries in both repetitions, the family judgment admits the base conversion method together with `IndexVariable.to_index_variable` (0.71–0.83). Individual judgments with the same family context still reject the override (0.43–0.48), while admitting the base method. Grouping changes the decision boundary without lowering the threshold to fit that known method.

Selected family excerpts total 4,697 bytes for the Opus Xarray query and 5,247 bytes for Sol in each repetition. Django family excerpts total 7,586–10,754 bytes, with some family judgments unavailable. These are sums of definition excerpts for the multi-member groups only; singleton candidates and caller excerpts are not included, overlapping source is not deduplicated, and unreturned family failures are not treated as negatives.

The integrated hypothesis is to follow calls from useful source into candidate definition groups, judge each group, and present accepted dependencies beside their calling context. It must retain explicit uncertainty and output omissions, account for additional parsing/inference and context, and pass fresh native comparisons. A method family being useful does not prove that every implementation executes in the reported scenario.

Review found invalid lexical lookup through enclosing class scopes and missing whole-roster checks. A regression first demonstrated incorrect grouping, then passed with immediate execution scope, enclosing function scopes and module globals handled separately. The inspection verifies the prior reviewed plan, exact input hash and all 303 identities. Missing-singleton and changed-input fixtures reject invalid registration. The helper was renamed to avoid shadowing Python's standard `inspect` module. Canonical evidence ordering and read-only preparation verification remove a reproducibility issue found before inference. Final model inputs preserve the original member/source content with deterministic evidence order.

The source grouping, fixtures, old registrations, frozen inputs and plan, review and triage, all requests, complete summaries and final audit live under `evals/runs/swebench/definition-families-v57/`. Jev cost and tokens are excluded. No coding-agent task cost was measured.

The [integrated retrieval comparison](family-context-v58-results.md) delivers the override beside its caller, with additional retrieval time.
