# Visible calls to possible definitions

A one-hop lookup within already admitted files recovers the Xarray conversion definitions missing from the preview packet. It is locally cheap, but broad name matching expands too much source to promote directly into the coding agent's context. This is a candidate-generation diagnostic, not a retrieval-quality or native performance win.

Every completed treatment query from v54 is included. One condition seeds calls from all delivered source; the other seeds only delivered fragments whose Jev usefulness score exceeds 0.5. The latter does not treat unscored fragments as irrelevant: they are simply unseeded in that condition. The diagnostic parses only supplied admitted Python files, looks up every same-name definition, and labels runtime dispatch and import binding as unverified. It does not scan additional repository files or make model calls.

| Query | Definition bytes: all returned seeds | Definition bytes: positively judged seeds | Definitions: positively judged seeds |
| --- | ---: | ---: | ---: |
| Django / Opus | 192,623 | 124,277 | 129 |
| Django / Sol | 191,074 | 117,706 | 124 |
| Xarray / Opus | 104,558 | 26,189 | 23 |
| Xarray / Sol | 131,720 | 29,300 | 27 |

Local reading, hash verification, parsing and lookup take roughly 0.15–0.31 seconds per case on this host. This is a single local diagnostic observation, not a latency distribution or native timing claim. Definition bytes are summed excerpts; overlapping class/method source is not deduplicated. Truncated definitions, unsupported/unparseable files, unmatched calls and the edge guard remain explicit. No case reaches the edge guard.

Both Xarray queries recover `Variable.to_index_variable` and `IndexVariable.to_index_variable`, including the short implementation the successful native agent read manually. That demonstrates source availability, not that Sol would choose a different fix. In Django, common names dominate expansion: positively judged seeds still lead to 41 `__init__` definitions, alongside multiple field conversion and preparation methods. The candidates do not have relevance gold labels; counts cannot be interpreted as precision or recall.

The next question is how to narrow possible definitions using receiver and caller evidence without pretending ambiguous name matches prove a call edge. Returning the entire expansion would add substantial context and can displace stronger evidence. A relevance/dispatch diagnostic should precede another integrated native comparison.

Source-byte fixtures and the real-query runner verify exact definition bytes and call-identifier visibility. Independent Sol review found that AST-normalized Unicode identifiers could produce incorrect byte ranges; a Kelvin-sign fixture first failed, then passed after preserving source spelling separately from lookup names. All three fixtures pass. The old registration and outputs are retained, and the rerun's real-query results are unchanged apart from exact-spelling metadata and measured time.

The frozen plan, original and corrected results, source checks, review and triage, and final audit live under `evals/runs/swebench/dependency-expansion-v55/`. Jev cost and tokens are excluded; this diagnostic makes zero model calls and measures no coding-agent task cost.

The [completed same-evidence Jev judgment comparison](dependency-judgment-v56-results.md) narrows this expansion but still rejects the needed short override.
