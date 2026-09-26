# Historical SWE-bench research snapshot

This branch preserves the official benchmark experiments developed while designing
Jevgrep. It is an archival record, **not the released product or maintained eval
runner**. Use [main](https://github.com/dzhng/jevgrep/tree/main) for the CLI and
current benchmark instructions.

The [snapshot manifest](research-snapshot-manifest.json) identifies all 358
previously untracked files by their original repository path and SHA-256. Their
bytes are unchanged. The parent commit supplies the tracked reference code and
current harness that coexisted with those files. This is a source snapshot, not a
claim that every historical experiment is independently runnable from this branch.
No experiments were executed or baseline attempts repeated during preservation.

## Finding the research

- [Experiment reports and code](evals/implementation/swebench/) retain successful,
  failed, interrupted and superseded directions; they are not one pooled cohort.
- [Paired agent trace findings](evals/implementation/swebench/paired-sol-research-findings.md)
  explain observed differences in how the coding agent used retrieval.
- [Context findings](evals/implementation/swebench/context-findings.md) record
  early handoff and output-consumption lessons.
- [Retrieval lessons](evals/implementation/swebench/architecture-lessons.md) and the
  [final implementation record on main](https://github.com/dzhng/jevgrep/tree/main/specs/done/jevgrep)
  distinguish the accepted strategy from the alternatives.

Historical plans, prompts, model choices, deadlines, paths and status statements
remain as written. They may describe rejected behavior, unavailable host paths,
obsolete providers or a study that was never completed. They are evidence of what
was tried, not instructions to resume it or claims about the released CLI.

Raw agent traces, API responses, source snapshots and evaluator datasets remain
outside Git in ignored local run storage. The records contain paths and hashes
into that storage; a fresh clone does not include it. No personal-repository eval
fixtures or real credentials are included. A private-key header string in a test
is a synthetic filtering fixture, not key material.
