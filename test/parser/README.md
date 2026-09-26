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

Intentional grammar differences are visible: Tree-sitter accepts Python-2
`print` syntax that the Python-3 reference rejects, and actual comment tokens include
inline comments while avoiding hashes inside strings. TypeScript comment collection
also retains comments between tokens and before closing braces. The packaged grammar is a
syntax inspector, not a Python interpreter or semantic validator. Syntax errors
reported by either language parser use text chunks. Asset loading errors are setup
failures, because silently changing behavior would hide a broken installation.

Units carry byte spans into the same immutable snapshot as their one-based line
ranges. Consumers use `sourceForUnit` for request text: widening a partial unit back
to whole lines would defeat the bound. UTF-8 boundaries and original line endings
survive splitting, including a single oversized line. The parser-size ceiling uses
bounded chunks rather than discarding source. These mechanism tests do not replace
the packed Node-only CLI conformance gate.
