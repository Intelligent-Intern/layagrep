# Context delivery findings

These observations explain the current whole-file spike; they are not a new
acceptance result or a final implementation specification. The frozen subset
continues unchanged in [the registered comparison](subset-plan-v1.json).

For the first two completed Sol pairs, treatment used six shell calls before its
first file edit, versus three in baseline. The extra calls include reading the
skill and invoking Jevgrep, followed by ordinary research. The CLI has not yet
reliably replaced that research. This is a count of observed calls, not causal
attribution of every second or token.

The Flask packet was 69,067 bytes. The actual model-facing tool response retained
40,109 bytes and reported truncation. Sol then read Blueprint lines 150–230 even
though that complete range was already present in the Jevgrep response. Other
follow-up reads were not confirmed duplicates; some requested test context was
outside the visible response. The raw native response, rather than the saved
full packet, is the evidence for visibility.

On Requests, the packet returned utility and exception sources but omitted
`requests/models.py` and its main test file because of the source budget. On
Django, it omitted `django/db/models/query.py` and the QuerySet API documentation
for the same reason. The relevant paths remained in the leading summary. The
agents recovered with ordinary reads, but the intended implementation context
was not delivered. Increasing the file budget alone would also increase already
truncated output.

The first seven completed Sol pairs exposed about 627 KB of tool response text
with whole-file retrieval versus 330 KB in baseline. After removing Jevgrep
responses, treatment still exposed about 355 KB. The first five complete Opus
pairs showed the same direction. This includes verification output as well as
research; it is a byte audit, not token accounting or causal attribution. It
shows why reducing the retrieval packet alone is insufficient evidence of
efficiency: the native traces must also show whether other reads and downstream
work decrease. The checkpoint is retained in
`evals/runs/swebench/subset-v1/visible-output-audit-first-seven-sol.json`.

The next architecture comparison should test focused source units with file and
line provenance. It should also test whether the skill makes clear that source
blocks come from local files and should serve as the initial read, with further
reads for missing, truncated, or changed context. This must not discourage needed
verification or present relevance scores as proof.

Explicit host-native skill invocation is another hypothesis to verify on the
pinned CLIs. OpenAI documents `$skill` references in `codex exec`; Anthropic
documents `/skill` invocation and loading rendered skill content into the
conversation. Those documents do not by themselves prove a cheaper execution
path in this harness. [OpenAI skill evals](https://developers.openai.com/blog/eval-skills),
[Claude Code skills](https://code.claude.com/docs/en/skills).

Exact commands, source omissions, and substring evidence are retained under
`evals/runs/swebench/subset-v1/` in the research-command and context-reread audits.
No hidden solution or test fields were used to generate the retrieval packets.

A separate calibration diagnostic compared the same source and two observed
queries using 7 KB overlapping windows, 3.5 KB windows, and Python declaration
boundaries capped at 3.5 KB. Each query/variant ran twice, reversing variant order
on the second repetition. Declaration selection returned 7.5–9.4 KB of source,
versus 21–32 KB for the larger windows and 13.8–23.8 KB for the smaller windows.
All checks retained `is_path`, `do_prompt`, and the existing source line changed
by both successful calibration agents. These are diagnostic anchors, not a
complete required-evidence rubric or a precision score.

Declarations required two screening requests instead of one: roughly 1.5–1.65
seconds versus 0.84–1.06 seconds for windows. All requests succeeded. The probe
used saved calibration source, not a new global repository upload, and ran
between timed benchmark cells. Its output measures source bytes before packet
formatting; it does not yet measure native agent consumption, task cost, or solve
rate. The next end-to-end candidate should test whether this extra screening
cost is repaid by less context and fewer follow-up reads. The registration,
inputs, exact ranges, results, and timing boundary are retained locally under
`evals/runs/swebench/source-unit-probe-v1/`.

The native declaration candidate is registered in
[calibration v8](calibration-plan-v8.json). Independent review caught a gap in the
initial candidate: methods were separated from their enclosing class context.
The corrected spike includes the class decorators, bases, and docstring when
scoring and returning method excerpts, with separate exact line ranges. An
offline CLI regression reproduces the rejected method with the earlier bundle
and passes with the correction. This establishes the context-delivery behavior,
not model relevance accuracy. The TypeScript spike invokes local Python AST
parsing and records fallback to line windows when parsing is unavailable; final
parser and language packaging remain undecided. The main subset still uses its
original frozen whole-file candidate.
