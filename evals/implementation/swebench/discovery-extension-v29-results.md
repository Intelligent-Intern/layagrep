# Compact hierarchical discovery: exploratory extension

The first complete comparison matches official solve rate and lowers aggregate task time and coding-agent cost for both engines. It is an encouraging spike result, not evidence of a stable advantage: gains concentrate in Matplotlib, where baseline agents took implementation and verification detours. Both models spent more money on Pylint with Jevgrep. Repeat every pair before accepting the strategy.

## Scope and measurement

The [frozen plan](discovery-extension-v29b.json) uses the previously selected Pylint and Matplotlib discovery tasks. These tasks have been evaluated before; they are not held out. All eight native attempts completed, with official grading of each final patch. Fresh baselines receive the same foreground-verification guidance as treatments. Only treatments invoke the Jevgrep skill for initial research. Earlier cohorts remain separate.

Jev tokens and cost are excluded. Time includes retrieval, subsequent agent research, implementation, and verification. Preparation and official grading are separate. Reported agent costs use native cache-aware accounting; All eight costs reconcile with Gateway generation records, including request starts, terminal responses, and generation identities. Failed solves remain in task costs and cost per solved task.

| Engine | Task | Baseline solve / seconds / dollars | Jevgrep solve / seconds / dollars |
| --- | --- | --- | --- |
| Sol | Pylint | fail / 379.2 / 0.957 | fail / 474.3 / 1.252 |
| Sol | Matplotlib | pass / 722.5 / 1.431 | pass / 329.1 / 0.866 |
| Opus | Pylint | pass / 195.2 / 0.997 | pass / 181.6 / 1.248 |
| Opus | Matplotlib | pass / 870.8 / 3.918 | pass / 378.0 / 1.487 |

Sol resolves 1/2 in each arm: aggregate time falls 27.1% and cost 11.3%; mean cost per task falls from $1.194 to $1.059. Opus resolves 2/2 in each arm: aggregate time falls 47.5% and cost 44.4%; mean cost per task falls from $2.458 to $1.367. Cost per solved task, including failed attempts, is $2.388 versus $2.118 for Sol and $2.458 versus $1.367 for Opus.

## What the traces establish

Content-backed hierarchical retrieval supplied the owner implementation and related tests. Both Sol Pylint attempts nevertheless missed the current-directory normalization bug: returning relevant files does not establish that the agent understood the defect. Opus solved it in both arms.

Matplotlib baselines reached the likely owner quickly, then spent time exploring alternative implementations and broader verification. The Opus baseline returned to an approach similar to the treatment after a substantial detour. These are observed differences, not proof that retrieval caused the entire timing gap. Official grading passed all four Matplotlib patches.

Sol consumed the full roughly 34 KB packets. Opus used `head -200` on Pylint and `head -150` on Matplotlib, seeing approximately 9.7 KB and 7.7 KB respectively before reading files directly. The leading summary worked; footer compaction cannot explain Opus's gain because its head output is unchanged by that formatting experiment. Checked negatives remain estimates, with unvisited descendants and exclusions distinguished from scored negatives.

The candidate retains hierarchical content previews, threshold-based source admission, code-first excerpts, and one-hop reference discovery. Compact coverage metadata reduces repeated paths without changing the selected source. It does not introduce a fixed file limit or a retrieval deadline; the 50,000-request guard only prevents runaway loops.

## Source fidelity and retained failures

The initial v29 Pylint baseline stopped before inference because recreating Git history with `git add .` omitted an originally tracked file inside an ignored directory. The exact-tree guard caught this. That failed launch remains preserved. The separately registered v29b cohort captures the original tracked paths, reconstructs a single-commit history with literal forced path admission, and checks that the resulting tree equals the admitted official source. Both repositories passed that check and imported code from `/testbed`.

The canonical raw evidence is under `evals/runs/swebench/discovery-extension-v29b/`: the paired comparison, generation accounting, per-attempt delivery audits, exact model-visible packets, native traces, patches, and official grading receipts. These generated artifacts are ignored by Git. The pre-inference incident remains under `evals/runs/swebench/discovery-extension-v29/`.

The [unchanged-candidate repetition](discovery-repeat-v29-results.md) is complete and narrows this initial finding. It did not establish a Sol cost reduction, and laptop sleep invalidated the repeated Opus efficiency comparison. All attempts remain recorded; neither cohort establishes representative SWE-bench performance.
