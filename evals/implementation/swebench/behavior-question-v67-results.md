# Broader behavioral relevance: completed source diagnostic

The broader question recovers some useful source, but also adds weakly related context. It is not yet a winning retrieval strategy or native performance result.

Both arms inspect identical full-source windows from the files admitted by all eight saved treatment queries in the [native comparison](fragment-native-v63-results.md). Only the relevance question changes. Each source unit gets one question per request, with two repetitions and alternating arm order. The broader question includes related implementations of the investigated behavior, even when the reported example names another variant; it still asks for concrete behavioral evidence.

All 32 runs complete. Across the 3,198 paired unit observations, 1,719 have judgments in both arms and 1,479 are unknown in at least one arm. Among jointly judged units, the broader question admits 165 previously rejected units and rejects eight previously admitted units. These are admission changes, not precision or recall scores. Provider errors are retained and make aggregate positive counts incomparable without this paired restriction.

## What the source inspection shows

The first Sol/Django pair recovers the previously missed SQLite `_alter_field` source at 0.59 versus 0.45 under the original question. However, the broader question admits about 180 KB of source versus 80 KB in the original arm. The existing 64 KB packer then omits that recovered chunk for lack of space. The second repetition leaves that location unjudged in both arms. This is one successful recovery followed by missing evidence, not replicated recovery.

Manual inspection of selected changed chunks shows mixed utility. Django's TextField collation parameters are directly informative, but their window also contains TimeField setup. Sphinx's class-attribute docstring tests and default-value fixtures are weak evidence for constructor return-type suppression. A dropped documentation window explicitly describes the queried return-type configuration. Broader admission therefore needs assessment of excess and lost context, not simply credit for more source.

Some Sympy additions contain the caller that passes arguments into `code_gen.routine`, while others contain wrapper build options or a separate function-prototype abstraction. These examples are exploratory manual judgments, not an exhaustive or blinded evidence rubric.

## Handoff implication

Scoring useful code is insufficient if a later output cap removes it or it appears beyond the agent's initial read. A source-only packing audit reproduces the existing cap using known judgments. Its first 200 lines omit the recovered SQLite unit even in cases where the full packet includes it. This audit excludes the summary prefix, making it an optimistic visibility check; it is not actual model delivery. Unknown source is counted separately rather than treated as negative or silently substituted into the packet.

The next integrated candidate should preserve accepted source in its complete saved report and advertise it in the opening summary. It must still be judged by fresh native solve rate, whole-task time and coding-agent cost, including the burden of excess context. No threshold has been tuned to this example, and no task outcome has been retried or removed.

## Evidence

Frozen inputs, every request and failure, paired changes, source-only packets and manual observations live in `evals/runs/swebench/behavior-question-v67/`. The independent static review is tracked there separately. This diagnostic changes neither the production CLI nor the frozen native candidate. Jev tokens and cost remain excluded; retrieval latency still matters to the eventual native comparison.
