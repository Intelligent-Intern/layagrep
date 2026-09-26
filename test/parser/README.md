# Parser conformance

The synthetic corpus in `fixtures/python-reference.json` records unmodified frozen
Python helper results, with helper hashes. Expectations are captured in a Python
container; application tests run the production TypeScript implementation in Node.
`capture-reference.py` reads that corpus on stdin and writes refreshed expectations
on stdout when the original helpers are mounted read-only at `/reference`. Capture
output is deliberately separate from assertion: a failing port never rewrites its
own expected result.

The parser keeps class context separate from methods, includes decorators in their
declarations, and treats function-local functions as part of the outer unit. Query
preview windows and additive neighboring-method ranges preserve the recorded Python
policy. Comments stay independently available for later context expansion.

The reference language boundary is CPython 3.11: the retained Requests runtime
uses 3.11.5 and the isolated fixture oracle uses 3.11.2. The bundled grammar accepts
syntax from other versions, so one shared compatibility check rejects recognized
Python 2 forms and Python 3.12-only type parameters, type aliases and f-string
expression forms. Inspection, previews and neighboring-method selection then use
the same text fallback. Source bytes are retained; no Python executable is required
by the product. Valid reference syntax is preserved, including print-shaped shift
expressions and ordinary f-strings. The cases live in the parser tests; this is
bounded conformance coverage, not a replacement implementation of CPython's grammar.

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
