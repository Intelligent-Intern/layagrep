# Bundle source inspection without system Python

Status: verified against the exercised reference corpus and installed gates (2026-09-26).
Depends on: 01.
Read [contracts](../contracts.md) first. Recognized syntax outside the reference's
Python 3.11 boundary shares one fallback across inspection, previews and
neighboring-method selection. TypeScript uses the reference comment traversal.

## Contract and owner

Core `source` owns `inspect(snapshot) -> {units, comments, mode}` and Python preview/neighborhood helpers. First reproduce the frozen scripts on fixture source in the test container, then execute unchanged helpers in bundled CPython. See the [runtime evidence](../assets/python-runtime.md). TS/JS uses TypeScript. One snapshot supplies lines and source; unsupported or erroneous syntax falls back to text chunks.

Verify three Python uses: declarations, content previews and neighboring methods. Compare nested classes/functions, decorators, comments/docstrings, Unicode, CRLF, Python-2 syntax and parse failures. Differences must be explained as explicit production behavior changes, never normalized away. Package WASM/license assets now and resolve from the installed module location. If the chosen runtime cannot load reliably, stop this slice and revise the parser decision before integrating; do not add a Python prerequisite.

## Human-runnable artifact

Node-only parser conformance transcript.

`bun run test:parser` packs/installs the parser-bearing CLI artifact in a Node-only Docker runtime and prints extracted units from fixtures.

Commands are implementation targets. Add them in this slice; do not imply they
already exist. CLI transcripts replace visual/screenshot gates for this product.

## Verification and verdict

Earlier grammar conformance checks passed the exercised fixtures but missed
Python AST differences found by whole-product review. They do not establish
completion. Bundled CPython passed the bounded helper probe, merged production and lifecycle
comparisons, installed package checks and whole-product review.
[Runtime evidence](../assets/python-runtime.md) records the exact coverage.
The [parser conformance guide](../../../test/parser/README.md) owns executable
coverage. Neither parser comparisons nor package checks establish task quality.

Assert source text and line coordinates, meaningful comments, bounded oversized units and fallback behavior. Inspect representative source from the saved official task trees without copying personal repos. Ensure no shell-out to python/Bun/compiler and no runtime asset download.

## Delegated decisions

Pinned runtime packaging and isolation; preserve the original extraction helpers and record remaining interpreter-version differences.

## Keep green

Reference request builders stay unchanged. This is a prerequisite probe, not the end-to-end checkpoint.

## Review

Show the artifact and summarize deviations. This is a non-blocking review checkpoint:
continue on the evidence if the user does not respond. Feedback that changes the
public contract or acceptance measure requires updating this slice before broadening
implementation. Record new choices and update the README handoff before ending.
