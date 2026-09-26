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
- The initial Tree-sitter Python port failed exact AST compatibility during
  whole-product review. [Bundled CPython evidence](assets/python-runtime.md)
  records the measured replacement and its remaining verification boundary.
- [Git ignore semantics](https://git-scm.com/docs/gitignore) distinguish tracked
  files and explain nested pattern precedence and excluded-parent negation.
  Jevgrep must document its traversal policy explicitly rather than claim to be
  `git ls-files`. Pattern matching applies outside Git repositories too.
- [npm pack](https://docs.npmjs.com/cli/v11/commands/npm-pack/) supplies the release
  artifact boundary. Run the installed tarball, not a workspace-linked package.

## Installed verification rationale

Tests exercise packed installed processes with isolated writable state and real
HTTP fixtures. Workspace imports and ambient credentials would bypass the
installation and transport boundaries under test. The
[installed journeys](../../../test/installed.test.mjs) own this verification;
reference projects informed the pattern but are not required evidence dependencies.

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
[retained restoration lessons](assets/parity-restoration.md).

The frozen spike validates `--max-source-bytes` but never uses the parsed value
to allocate output. Its measured output is uncapped. The product budget experiment compared against that uncapped behavior; it did
not earn promotion. The parsed spike flag was never an enforced default cap.
