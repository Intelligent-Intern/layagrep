# Evidence and reference boundaries

Research checked 2026-09-25. These references support implementation decisions;
they do not supersede the product's measured retrieval policy.

- [TypeSafe hierarchical cookbook](https://docs.typesafe.ai/cookbooks/hierarchical_classification)
  explores multiple frontier paths. Its fixed-width beam and single winning leaf
  are not Jevgrep's threshold-based multi-file contract. Reproduce the evaluation
  call seam; do not transplant its pruning policy.
- [Jev on Gateway](https://vercel.com/ai-gateway/models/jev) is the selected provider.
  The installed `ai/src/evaluate/evaluate.ts` accepts native state/questions,
  validates answers, defaults to two retries and logs warnings. Pin the current SDK;
  explicitly own retries and warning routing so hidden retries do not escape the
  50k guard and SDK logs do not violate stdout-only output.
- [Web Tree-sitter](https://github.com/tree-sitter/tree-sitter/blob/master/lib/binding_web/README.md)
  supports WASM grammar assets in Node and documents ABI/loading constraints.
  [Python grammar](https://github.com/tree-sitter/tree-sitter-python) provides the
  candidate bundled parser. Use a pinned runtime/grammar pair with license notices;
  verify the actual packed assets load without Python or build tools installed.
  This is a proposed production mechanism, not the winning spike's parser.
- [Git ignore semantics](https://git-scm.com/docs/gitignore) distinguish tracked
  files and explain nested pattern precedence and excluded-parent negation.
  Jevgrep must document its traversal policy explicitly rather than claim to be
  `git ls-files`. Pattern matching applies outside Git repositories too.
- [npm pack](https://docs.npmjs.com/cli/v11/commands/npm-pack/) supplies the release
  artifact boundary. Run the installed tarball, not a workspace-linked package.

## Local reference patterns

[Duet-agent](../../../duet-agent/package.json) demonstrates Docker-isolated mutable
state. [Photoctl](../../../photoctl/test/macos/packed-install.test.ts) demonstrates
clean installs and shared user journeys through the real binary. Its
[HTTP fixture](../../../photoctl/packages/test-harness/src/gateway-fixture.ts)
validates request shape rather than bypassing the SDK. Its test driver disables
ambient credentials. Borrow these mechanisms, not Photoctl's JSON/stderr protocol,
native imaging dependencies or large package graph.

## Frozen reference and limitations

[Retained acceptance audit](assets/accepted-spike-audit.json) copies the local
accepted audit so the essential evidence survives ignored run directories.
Original source: `evals/runs/swebench/auto-research-80/accepted-70-audit.json`.
The original relative paths in that JSON describe its source location.

Frozen source: `evals/implementation/swebench/hierarchy-unit-locators-spike.ts`,
SHA-256 `6ca9dcf92d5dfe062ec1169de066273897589cc16f6c8e7055cd4b3854739bcc`.
Frozen bundle SHA-256 `9112edb080f87b1961780dd144b0c951a2e6728c8dce574452251c30acae996b`.
Frozen ranked-leads skill SHA-256 `cf435e8174459a6b336d1530acb938edd4e93338d7c7d4d2573a574fc82edb93`.
Keep original traces and bills; the copied audit is not a replacement for them.

Candidate full Sol cost $4.7421112 versus $7.622069 baseline, including failed
attempts. Seven successful cost wins; eight solves each, all baseline solves
preserved. All ten tasks were observed during development; Python-only, one fixed
baseline each. Pylint retains its collection caveat. No untouched holdout, guaranteed
speedup, language generality, or whole-computer scalability is established.

File-list-only, per-declaration source-only representation, broader relationships,
and test-example heuristics did not replace the accepted strategy. Preserve their
lessons without making them defaults by documentation. See the
[experiment lessons](../../evals/implementation/swebench/architecture-lessons.md).

The frozen spike validates `--max-source-bytes` but never uses the parsed value
to allocate output. Its measured output is uncapped. The product budget experiment
must compare against that behavior, not treat the flag default as an enforced cap.
