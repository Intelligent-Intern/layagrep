# Caller evidence diagnostic

Adding caller context does not repair the two observed source omissions in this diagnostic. It raises some relevance scores, but provides insufficient evidence to add another retrieval pass.

All 480 registered requests were attempted across 120 recorded declarations, with two repetitions and reversed condition order. Twelve failed requests leave 228 complete pairs. Of those, 211 remain rejected, 13 change from rejected to admitted, one changes from admitted to rejected, and three remain admitted. These are decision transitions at the existing source cutoff, not precision or recall: the candidate set has no gold relevance labels.

`UUIDField.to_python` stays rejected: 0.35 to 0.39, then 0.35 to 0.37 with callers. The recorded `IndexVariable` declaration rises from 0.31 to 0.54 and from 0.29 to 0.49, still below the 0.70 source cutoff. New admissions mainly concern Xarray dataset construction and dimension replacement helpers. This does not establish that those additions would improve task implementation.

Median request latency is approximately 382 ms without callers and 385 ms with callers. Serialized input state grows from about 214 KB to 986 KB per repetition. The conditions record one versus eleven request failures; the sample does not establish a general provider failure rate. Jev remains free, but requests, failures, and additional returned context can still affect task time and coding-agent cost.

The candidate set includes every saved graph declaration with bounded nonoverlapping caller evidence from all four treatment queries in the [completed native comparison](function-native-v45-results.md). No candidates were selected by their observed scores. The declaration and question remain identical across conditions; only possible caller source is added. These source relationships are not verified runtime traces.

The independent review found that the review record did not bind the full experiment plan. A tampering regression failed before the fix and passes after it. The completed audit verifies plan, runner, input and source hashes, complete unique attempt coverage, reversed condition order, nonoverlapping caller evidence, and failures remaining unknown. Registration, exact payloads, request records, review triage and the audit are under `evals/runs/swebench/caller-evidence-v46/`.

The [preview-handoff spike](preview-handoff-v47-results.md) tests reusing source previews already judged during hierarchical file discovery, rather than repeatedly screening their contents. Its retrieval comparison is complete; native task benefit remains unproven.
