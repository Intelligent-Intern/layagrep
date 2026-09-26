# Source-budget decision

Choose **1,500 source bytes** for the frozen production cohort. This is the one
bounded candidate required by slice 07, compared with the completed uncapped
installed Requests checkpoint. Both officially solved; the smaller candidate
lowered full Sol cost against the installed comparator. It did not beat baseline.

| Requests treatment | Sol cost USD | Official solved | Jev observed API cost USD |
| --- | ---: | --- | ---: |
| Saved baseline | 0.2685004 | yes | — |
| Installed uncapped | 0.3491436 | yes | 0.011889360 |
| Installed 1,500 source bytes | 0.2926056 | yes | 0.011987346 |

The candidate costs 16.19% less than uncapped and 8.98% more than baseline.
Jev stays excluded from scored Sol cost. All ten candidate Sol generations have
billing; all 85 Jev responses have observed cost metadata. Gateway reports 89
internal provider attempts. These API costs are not invoice reconciliation.

The candidate retains all six file locations and reading leads, includes the
994-byte method/auth excerpt and 214-byte test helper, and explicitly omits the
689-byte request-class scaffold. Selected source remains verbatim. Whole excerpts
are allocated by the strongest contained reading lead above 0.5, with stable ties;
class context has no such score and may therefore be undervalued. The default is
not a claim that 1,500 is optimal for arbitrary tasks or codebases.

Source allocation was the experimental retrieval-policy change. The newer package
also includes the intervening cancellation/authentication fixes and release notices;
those were absent from the earlier uncapped tarball. Benchmark task prompt,
skill, source and model/harness were frozen, but Sol chose a differently worded
initial query and live Jev judgments could vary. This single paired observation
cannot isolate the causal effect of bytes or establish generalization. The final
cohort must still preserve all eight baseline solves and obtain seven fully billed
solved cost wins under one policy. No baseline was rerun, and neither Requests
treatment is a baseline cost win.

The frozen study is `evals/runs/swebench/installed-jg-requests-budget1500-v1/plan.json`.
Its `runner/` archive owns reproduction. The attempt retains exact command/stdout,
raw rollout, events, patch, proxy and Jev traces, generation lookups/accounting,
and official grading receipt. Grade run
`jg-installed-psf__requests-1142-d53200025a3a` resolved one instance, with zero
unresolved, infrastructure-failure or error instances. See the
[uncapped checkpoint report](installed-requests-checkpoint.md) for its paired trace.

Installed verification passed on the exact candidate archive: Node runtime,
canonical skill, bounded-output preservation and `head -200`. Component renderer
checks cover UTF-8, partial-byte containment, whole-excerpt allocation, stable
ordering and exact unlimited output.

Candidate tarball SHA-256: `98bcf47e7de30ad82c8b452a86b958505c3befe6512d00f98486101c6a9fc802`. Returned stdout: 2,183 UTF-8 bytes; source allocation counts source only.

## Paired trace findings

The production patch is identical across baseline, uncapped and capped runs.
The capped run used 10 Sol requests and eight shell commands; uncapped used 13
and 24; baseline used 11 and nine. Capped still read `models.py` ranges 280–420
and 1–280, `test_requests.py` 1–360, adapters, sessions, auth and setup, and searched
docs and the repository. Both retrieval packets supplied the faulty helper and
authentication recalculation, but only the `httpbin` helper as test-source evidence.
Broad subsequent inspection persisted despite the shorter packet.

Baseline ran four new tests and then seven broader tests. Capped ran four new
tests and then nine broader tests. Uncapped ran six tests twice with a test edit
between runs. Relative to baseline, the capped bill adds 3,456 cache-creation
tokens and 349 generated/reasoning tokens; these explain approximately $0.017280
and $0.006980 respectively. Fewer turns and less generated text explain much of
the saving against uncapped, but their causal connection to the byte cap remains
uncertain. Better test evidence is a possible future hypothesis, not an untested
change folded into this frozen policy.

## Accepted spike comparison prompted by user review

The accepted spike's Requests treatment cost $0.2597596 versus $0.2685004
baseline (3.26% lower). Its stdout was 7,059 UTF-8 bytes, compared with 2,852
uncapped production and 2,183 capped production. It returned five relevant files,
reported incomplete discovery and a scoped `AGENTS.md` lookup, and supplied more
request construction, header preparation and surrounding method context. The
production packets supplied six paths, less source and no scoped guidance lookup.
These are actual packet differences, not proof of their causal contribution.

The production skill was also rewritten from the accepted skill: detailed
symbol-first reads, lookup reuse and explicit polling instructions were shortened.
Production traces include repeated guidance searches and broader follow-up reads.
All runs retain the faulty content-length method. The source-cap comparison
therefore does not establish parity with the winning spike; one can reduce cost
against the uncapped production run while still regress against the spike.

The causal split between changed representation, changed agent instructions,
live classification/query variation and Sol behavior is unresolved. This needs
an exact spike-versus-production trace/request comparison before attributing the
regression to normal variance or calling the production policy a reproduced win.
The active frozen cohort remains unchanged and must be reported in full.
