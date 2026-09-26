# Official benchmark evaluation

The [accepted architecture](../docs/architecture.md) records the final spike decision.
The [research ledger](runs/swebench/auto-research-80/research.json) retains experiments
and the explicit revision from an 80% to a 70% target.

Evaluate Jevgrep discovery strategies on a pinned subset of SWE-bench using its official
behavioral grader. Current architecture spikes use Codex Sol with and without Jevgrep, with the
same source, model settings and execution limits within each pair. Claude
evaluation is deferred to full implementation. The [SWE-bench workflow](implementation/swebench/) owns dataset
selection, reproducibility and grading. An earlier [discovery mechanism spike](implementation/swebench/strategy-v42-notes.md) compares hierarchical and broader retrieval.

The [matched Sol research-trace findings](implementation/swebench/paired-sol-research-findings.md)
connect baseline reading behavior to the next architectural probes.

An earlier [completed native comparison](implementation/swebench/batch-native-v81-results.md)
tests batched source inspection. Solve rates match baseline, but both engines take
more time and cost more overall. All timing and accounting checks pass.
The [earlier complete-source comparison](implementation/swebench/open-native-v70-results.md)
remains separate; results are not pooled across candidates.
The [content-informed folder comparison](implementation/swebench/folder-content-v85-results.md)
tests descendant code samples before folder pruning; it does not establish a task-level improvement.
The [two-level discovery comparison](implementation/swebench/lookahead-v86-results.md)
tests speculative enumeration and proceeds to a separate whole-task evaluation.
The [Gateway error diagnostic](implementation/swebench/gateway-errors-v84-results.md)
captures intermittent upstream failures without treating them as relevance judgments.

The [navigation question-scope diagnostic](implementation/swebench/navigation-scope-v82-results.md)
records a wording change that did not recover the observed navigation gap.
The [independent-question diagnostic](implementation/swebench/dual-navigation-v87-results.md)
tests a separate related-implementation judgment and preserves partial valid answers.
The [source-opening diagnostics](implementation/swebench/source-opening-v64-results.md)
separate that coverage gap from query-sensitive relevance judgments; provider failures
limit the evidence and no new native improvement is established.
The [broader relevance diagnostic](implementation/swebench/behavior-question-v67-results.md)
finds both useful additions and excess context, and shows the existing output cap
can discard a recovered chunk before the agent receives it.
The [full-repository batching comparison](implementation/swebench/batch-retrieval-v80-results.md)
measures retrieval throughput; the native comparison above tests its downstream effect.

The [source-batching diagnostic](implementation/swebench/source-batch-v78-results.md)
separates request savings from small-group latency and changed source judgments.

The [full-repository recovery comparison](implementation/swebench/recovery-retrieval-v74-results.md)
shows why retrieval latency must be read alongside unresolved judgments and returned source.

The [navigation recovery diagnostic](implementation/swebench/navigation-recovery-v72-results.md)
tests faster recovery from provider failures while preserving explicit unknowns;
full-repository and native outcomes remain separate acceptance gates.

The [current acceptance policy](cost-quality-policy.md) requires baseline-or-better
official solve rate and agent cost per task for Sol. Elapsed
time is diagnostic only during these architecture spikes. Keep failures and infrastructure problems visible. Report
per-task outcomes and aggregate spend per solved task; do not average only the
successful or fastest attempts. Small subsets provide initial evidence, not a
general performance guarantee.

The frozen [accounting policy](accounting.md) defines billing and measurement;
the current acceptance policy above supersedes its speed requirement. Jev is free for
this evaluation, and its tokens are not coding-agent tokens. Normal agent search
remains available after Jev returns context and discovery signals.

Own-repository fixtures, custom evidence rubrics, previous DeepSWE experiments,
and their results and harnesses are deprecated. They remain local reference
material and are excluded from Git. They are not acceptance evidence for the new
benchmark workflow. Generated datasets, images, workspaces, predictions and raw
traces also stay outside version control; commit only reproducible tooling,
selection manifests and concise official-benchmark reports.
