# Bundle source inspection without Python

Status: verified (2026-09-25). Depends on: 01. Read [contracts](../contracts.md) first.

## Contract and owner

Core `source` owns `inspect(snapshot) -> {units, comments, mode}` and Python preview/neighborhood helpers. First reproduce the frozen scripts on fixture source in the test container, then port their semantic units to packaged Tree-sitter Python WASM. TS/JS uses TypeScript. One snapshot supplies lines and source; unsupported or erroneous syntax falls back to text chunks.

Verify three Python uses: declarations, content previews and neighboring methods. Compare nested classes/functions, decorators, comments/docstrings, Unicode, CRLF, Python-2 syntax and parse failures. Differences must be explained as explicit production behavior changes, never normalized away. Package WASM/license assets now and resolve from the installed module location. If the chosen runtime/grammar cannot load reliably, stop this slice and revise the parser decision before integrating; do not add a Python prerequisite.

## Human-runnable artifact

Node-only parser conformance transcript.

`bun run test:parser` packs/installs the parser-bearing CLI artifact in a Node-only Docker runtime and prints extracted units from fixtures.

Commands are implementation targets. Add them in this slice; do not imply they
already exist. CLI transcripts replace visual/screenshot gates for this product.

## Verification and verdict

`bun run test:parser` passes: 15 Node parser conformance tests followed by two
packed-runtime journeys, printing the Python declaration units read by the real
SDK fixture. The runtime has no Python, Bun or compiler. The frozen-helper corpus
and intentional grammar differences are documented in
[parser conformance](../../../test/parser/README.md). This proves source inspection
and installed asset loading, not downstream task quality.


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
