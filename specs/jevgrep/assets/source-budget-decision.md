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
