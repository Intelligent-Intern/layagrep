# Bundle source inspection without Python

Status: reopened for TS/JS syntax-fallback comment preservation (2026-09-26).
Depends on: 01.
Read [contracts](../contracts.md) first. Recognized syntax outside the reference's
Python 3.11 boundary shares one fallback across inspection, previews and
neighboring-method selection. TypeScript uses the reference comment traversal.

## Contract and owner

Core `source` owns `inspect(snapshot) -> {units, comments, mode}` and Python preview/neighborhood helpers. First reproduce the frozen scripts on fixture source in the test container, then port their semantic units to packaged Tree-sitter Python WASM. TS/JS uses TypeScript. One snapshot supplies lines and source; unsupported or erroneous syntax falls back to text chunks.

Verify three Python uses: declarations, content previews and neighboring methods. Compare nested classes/functions, decorators, comments/docstrings, Unicode, CRLF, Python-2 syntax and parse failures. Differences must be explained as explicit production behavior changes, never normalized away. Package WASM/license assets now and resolve from the installed module location. If the chosen runtime/grammar cannot load reliably, stop this slice and revise the parser decision before integrating; do not add a Python prerequisite.

## Human-runnable artifact

Node-only parser conformance transcript.

`bun run test:parser` packs/installs the parser-bearing CLI artifact in a Node-only Docker runtime and prints extracted units from fixtures.

Commands are implementation targets. Add them in this slice; do not imply they
already exist. CLI transcripts replace visual/screenshot gates for this product.

## Verification and verdict

The merged Docker gate passes 16 Node parser conformance tests and the whole-CLI
HTTP comparisons for Python fallback, oversized declarations and TypeScript
comment expansion. The [parser conformance guide](../../../test/parser/README.md)
defines the reference version and coverage limits. Packaged runtime journeys
verify asset loading without Python, Bun or a compiler. These checks prove the
exercised inspection behavior, not universal grammar equivalence or downstream
task quality.

Assert source text and line coordinates, meaningful comments, bounded oversized units and fallback behavior. Inspect representative source from the saved official task trees without copying personal repos. Ensure no shell-out to python/Bun/compiler and no runtime asset download.

## Delegated decisions

Pinned compatible grammar/runtime versions, extraction implementation and extra easy grammars using the same seam; record differences from the spike.

## Keep green

Reference request builders stay unchanged. This is a prerequisite probe, not the end-to-end checkpoint.

## Review

Show the artifact and summarize deviations. This is a non-blocking review checkpoint:
continue on the evidence if the user does not respond. Feedback that changes the
public contract or acceptance measure requires updating this slice before broadening
implementation. Record new choices and update the README handoff before ending.
