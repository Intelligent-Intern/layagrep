# Product exploration

Historical initial exploration. The [accepted architecture](architecture.md)
supersedes this document for the retrieval decision. This remains an incomplete
quadrant map, not a finished product specification. **All questions, proposed plans
and kickoff instructions below are superseded** by the completed
[product map](../specs/jevgrep/map.md) and [build spec](../specs/jevgrep/README.md);
retain this file only as historical exploration, not instructions for new work.

## Settled by the request

- TypeScript CLI for coding agents, accepting natural-language repository questions.
- Return relevant source context in one text result; investigate file and chunk selection.
- Primary contract: research context across multiple files, including relevant
  implementation, callers, configuration, and tests, because a repository question
  can span several owners. Return attributed source text rather than only file paths.
- Use Vercel AI SDK and Jev through AI Gateway first, with an auth command.
- Follow Duet's Bun/Turborepo monorepo conventions. Other providers come later.
- Evaluate coding-agent speed and efficiency without sacrificing task quality.

The last point interprets “without affecting performance” as maintaining agent task
quality while reducing time/cost. This assumption needs user confirmation.

## Architecture decisions reopened for evidence

The user paused the architecture questionnaire: candidate representation, all-file
screening, and text-only extraction are provisional hypotheses, not settled
requirements. Study actual research-subagent traces before selecting a pipeline.
Optimize request count and useful evidence returned. Uploading all eligible source
is acceptable if necessary, but avoiding it is preferred. No chunk-coverage option
was selected.

## Observed constraints

[Jev](https://vercel.com/ai-gateway/models/jev) evaluates typed questions rather
than writing a research report. The CLI must orchestrate selection and assemble
source context. The model listing currently advertises a 32K context window.

The [hierarchical classification cookbook](https://docs.typesafe.ai/cookbooks/hierarchical_classification)
asks choices among direct children and keeps several paths using a geometric-mean
score across decisions. This is a candidate traversal technique, not evidence that
it captures every file needed by a cross-cutting research question. A choice
competes among siblings; several siblings may independently be relevant.

The installed AI SDK confirms native evaluation support. Its API is experimental;
keep dependency versions pinned. Connection verification uses only synthetic text.

The [research behavior study](../evals/research/README.md) records trace evidence,
batching measurements, and the proposed comparison. Its proposals remain hypotheses.

## Known unknowns — queued

1. Screening batches, selection thresholds, and recognizing insufficient evidence?
2. Bounded preview selection and coverage of large files?
3. Whole files versus bounded text chunks in returned context?
4. Output budget, truncation disclosure, source attribution, and follow-up queries?
5. Repository scope: ignored files, secrets, dependencies, extra roots, dirty files?
6. Latency/cost targets, caching/freshness, and failure behavior?
7. Eval baselines, frozen tasks, quality rubric, and acceptance thresholds?

## Next quadrants

Unknown knowns: preferred agent workflow and what makes context useful in practice.
Unknown unknowns: adversarial queries, misleading names, missing dependencies,
stale indexes, model failures, and source content that resembles instructions.

The next step is an empirical study of recent research-subagent behavior and
Jev batching, followed by an evidence-grounded proposal. Screening parameters
and chunking algorithms remain open and unimplemented.

## Retrieval spike evidence

The user authorized frozen repository evals and live strategy spikes. The
[spike report](../evals/spikes/README.md) records completed comparisons against
current Duet, Photoctl, and Game snapshots. Full screening found all labeled
ranges but final packets remained incomplete; matched expansion also lost useful
evidence during output selection. Exact source-range coverage understates some
alternative evidence and does not establish downstream task correctness.

These results reopen output composition as a measured bottleneck. They do not
close the product map or select a production retrieval architecture.

## No-Jev baseline evidence

[Six completed Claude/Codex research runs](../evals/baselines/README.md) now provide
the missing baseline. They returned stronger evidence than the current Jev spikes
on these development cases, but coverage and factual correctness diverged. Exact
range boundaries penalized substantively correct Codex Game evidence; Claude
answers included incorrect additional claims despite high source coverage. No
quality-preserving Jev speedup or downstream implementation improvement has yet
been established. The next measurement needs semantic checks and held-out paired
coding tasks, not a production architecture choice based on these pilots alone.

## Evidence rubric

[Fact-based evaluation](../evals/rubrics/README.md) now separates required facts,
optional depth, packet sufficiency, and explanation correctness. Independent
source audits and challenge reviews exposed both omitted conditions and excessive
requirements in the initial labels. Alternative source evidence can earn credit;
exact line-range overlap remains only a historical diagnostic. Revisions and
all-method regrades are recorded, with source and packet identity checks.

Fresh task-level holdouts are reserved but unrun. They still use repositories seen
during development, and no complete correctness oracle or downstream speedup has
been established. Retrieval architecture and acceptance thresholds remain open.

## User clarification: useful starting context

The user explicitly rejects optimizing recall by stuffing unrelated files into
context. Jevgrep can provide a reliable starting point and let the coding agent
fill gaps with its ordinary tools. Fact rubrics do not establish uniquely required
files. The [precision and end-to-end protocol](../evals/precision/README.md) therefore
adds independent relevance/redundancy audits and makes final agent quality, total
time/cost and follow-up work the deciding comparison. The 40KB ceiling must not
be treated as a quota to fill. Existing coverage scores remain historical
diagnostics, not proof of parity.

The user has specified threshold-based file selection rather than a fixed count.
Return useful negative discovery evidence as well: checked files below threshold
and folder summaries, with failed or unperformed checks explicitly distinguished.
Negative estimates are navigational signals, not proof of irrelevance. See the
[selection rationale](../evals/implementation/research/file-count-rationale.md).

Efficiency means task cost and elapsed time at comparable quality. Jev is free
for these evaluations; its tokens are separate diagnostics, never added to coding
agent token counts. The [accounting policy](../evals/implementation/accounting.md)
owns cost treatment, cache categories and missing-telemetry rules.
