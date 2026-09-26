# Content windows beyond the opening of a file

A preview-only diagnostic reduces the amount of source text submitted while changing relatively few file-admission decisions. It does not yet establish better relevance, full-search speed, or native task performance.

The candidate keeps small files verbatim. For larger Python files, it uses an opening window, query-named declaration headers and implementation excerpts, and distributed source windows. A name match guides preview placement; it never admits or excludes a file. Unmatched or unparseable files still receive content previews. Source ranges, partial lines and unrepresented matches are explicit. Long docstrings are skipped when locating the implementation, and same-line fragments carry UTF-8 byte-column bounds.

Both arms have the same 16,384-byte maximum preview-text allowance. The alternative often uses less. Scalar metadata and range labels are part of the representation; a separate span audit is not duplicated in the model payload.

The registered comparison covers every truncated Python file preview encountered by the two recorded v37 SymPy queries: 133 Sol-query files and 116 Opus-query files. The visited frontier is fixed, and immutable pre-fix source supplies the alternative windows. No hidden tests, known patch, required-file list or new task outcomes are used. Each arm receives the same neutral file-relevance question; arm order is balanced by a stable hash. This is a single-file experiment, not a replay of multi-file batching or hierarchical discovery.

| Recorded query | Complete pairs | Opening admitted | Alternative admitted | Newly admitted / rejected | Mean alternative text bytes |
| --- | ---: | ---: | ---: | ---: | ---: |
| Sol | 131 / 133 | 32 | 32 | 3 / 3 | 7,550 |
| Opus | 109 / 116 | 13 | 17 | 4 / 0 | 8,210 |

The opening previews use 16,384 bytes each. There are 563 request attempts, including 74 failed attempts; nine arms remain unavailable after their retry. Failures are retained and not treated as negative decisions. Ten of 240 complete pairs cross the 0.5 cutoff. Query-named declarations occur in only 47 of 249 file/query pairs, so distributed sampling also contributes to the comparison. No parser failures or unrepresented matching implementations occur in this cohort.

These changed judgments are not precision or recall measurements. For example, some arithmetic/evaluation test files move below the cutoff, while additional expression helpers move above it. Neither direction is declared correct without task-level evidence. Small files, including the previously problematic `mod.py`, are unchanged by this preview policy; this experiment does not repair its semantic admission failure.

Generic checks cover deep declarations, enclosing classes, unmatched files, tails, long docstrings, Unicode, syntax fallback, tiny allowances and explicit omissions. Independent Sol review identified same-line docstring and Unicode-identifier issues; both were fixed and checked before scoring. A mutation that disables query-name collection loses an implementation deep in the middle of a file, while the original selector represents it. A supplementary check verifies exact UTF-8 byte ranges for same-line Unicode declarations.

The helper is not yet integrated into the CLI. Integration must preserve lazy filesystem traversal, distinguish sampled previews from complete source, measure the extra local reads/parser work, retain source-policy checks and use a fallback for files beyond the inspection bound. Full hierarchical replay must precede another native comparison. The independently verified [head manifest](head-manifest-v39-results.md) remains a separate delivery change.

Inputs, registered hashes, all attempts, review, checks and per-file judgments are in `evals/runs/swebench/preview-v40/`. Jev cost remains excluded by user policy.
