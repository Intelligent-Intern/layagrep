# Architecture spikes

This phase settles architecture through small SWE-bench experiments. It does not
implement the final product, durable checkpoints, caching, indexing, or runtime
optimizations. Write the implementation spec after the architecture has evidence.

The settled direction is hierarchical discovery from a requested filesystem root,
with directories explored on demand. A complete repository inventory or content
preload cannot be a prerequisite: the intended search scope may be much larger
than a repository. File admission uses relevance thresholds, not a fixed count.
Return useful checked-negative discovery signals and distinguish them from
unvisited branches and failed checks. A pruned folder does not establish that
every descendant file was individually assessed.

Agent integration includes an explicit Jevgrep skill that references the CLI.
The skill teaches when to ask a semantic research question, how to interpret
coverage, and when to continue with ordinary search. Test that integration in
native agents rather than relying on special orchestration prompts alone.

CLI output leads with a compact summary of relevant paths, available context,
checked-negative areas, omissions, and failures. Agents often keep only the head
of a response; essential navigation and coverage signals must survive that.
Detailed context and all decisions follow, with a saved report for selective
reads. Returning a large blob does not imply the agent consumed all of it.
Summary display limits must not become retrieval selection limits.

The spikes need to settle what information Jev should receive when deciding to
enter a directory and select a file, whether selected files need further content
screening, and how much complete-file versus excerpt context helps the receiving
agent. Keep the model-call and filesystem interfaces simple enough to change.
Implementation mechanisms such as persistent queues and caching are deferred.

Use the pinned official subset and grader with Codex Sol and Claude Opus. Equal
or better task solve rate is mandatory; compare task time and cost under the
[accounting policy](../../accounting.md), including failed attempts. Jev is free.
Retrieval-only measurements can explain outcomes but cannot establish success.
Keep the benchmark agents' task queries and actual consumed context as evidence.

Observed context-delivery limitations and the next questions to test are recorded
in [context findings](context-findings.md). These do not change the frozen study.

The [code-first delivery study](code-first-native-v27-results.md) and subsequent
[stricter-admission study](precision-native-v28-results.md) record two-engine
tuning evidence. The [compact discovery extension](discovery-extension-v29-results.md)
improved aggregate cost and time in its first paired run. The
[counterbalanced repetition](discovery-repeat-v29-results.md) preserved solve rate
but did not establish a Sol cost benefit; host sleep and incomplete billing
invalidate the repeated Opus efficiency comparison. The handoff remains an open
architecture question. The [progressive-disclosure study](brief-native-v30-results.md)
preserves solve rate and reduces observed cost in a small cohort, but host-workload
overlap invalidates its aggregate Opus speed comparison. Additional discovery
coverage and repetition remain necessary before accepting the handoff.

The [additional discovery cases](discovery-native-v31-results.md) improve observed
Sol solve rate and reduce cost for both engines, but do not establish faster
completion. Their traces expose relevance misses despite full file previews;
simple query rewording and extra caller snippets do not repair the diagnosed miss.
