# Parser conformance

The synthetic corpus in `fixtures/python-reference.json` records unmodified frozen
Python helper results, with helper hashes. Expectations are captured in a Python
container; application tests run the production inspector and bundled interpreter in Node.
`capture-reference.py` reads that corpus on stdin and writes refreshed expectations
on stdout when the original helpers are mounted read-only at `/reference`. Capture
output is deliberately separate from assertion: a failing port never rewrites its
own expected result.

The parser keeps class context separate from methods, includes decorators in their
declarations, and treats function-local functions as part of the outer unit. Query
preview windows and additive neighboring-method ranges preserve the recorded Python
policy. Comments stay independently available for later context expansion.

The reference language boundary is CPython 3.11: the retained Requests runtime
uses 3.11.5 and the isolated fixture oracle uses 3.11.2. Production uses CPython
3.11.3 through Pyodide and the unchanged frozen helpers. This removes the separate
grammar and hand-written compatibility rules. Version differences remain explicit;
the cases establish bounded conformance, not universal equivalence. Source bytes
are retained, and no system Python executable is required by the product.

Python context expansion preserves the reference's conservative whole-line comment
matching, including hash-prefixed lines in multiline strings. TypeScript comment
collection follows the reference AST-child traversal; it does not broaden expansion
by walking additional closing-brace and literal tokens. Syntax
errors use text chunks; asset loading errors are setup failures rather than silent
behavior changes. The whole-CLI HTTP comparison in
[the Python parity test](../reference/python-parity.test.ts) checks computed previews,
fallback questions, follow-up evidence and stdout against the actual frozen bundle.

Units carry byte spans into the same immutable snapshot as their one-based line
ranges. Consumers use `sourceForUnit` for request text: widening a partial unit back
to whole lines would defeat the bound. UTF-8 boundaries and original line endings
survive splitting, including a single oversized line. The parser-size ceiling uses
bounded chunks rather than discarding source. These mechanism tests do not replace
the packed Node-only CLI conformance gate.
