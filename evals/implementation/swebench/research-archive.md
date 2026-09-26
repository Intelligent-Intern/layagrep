# Research preservation

The official SWE-bench spike history is committed in this repository on
`codex/archive-swebench-spikes-2026-09-26`. It is deliberately separate from the
maintained CLI and installed-package harness on `main`; do not merge its obsolete
runners or historical instructions into the product.

The immutable [snapshot](https://github.com/dzhng/jevgrep/tree/06a9d79fac2cee77b91f155fc7b3130dc95708f7)
preserves all 358 previously untracked official research files at their original
relative paths: experiment implementations, tests, native-agent harness variants,
frozen configurations, prompts, result reports and analysis. The
[manifest](https://github.com/dzhng/jevgrep/blob/06a9d79fac2cee77b91f155fc7b3130dc95708f7/research-snapshot-manifest.json)
records each file's SHA-256; every byte was verified against the local archive.
No model calls, baseline reruns, or result recomputation accompanied preservation.

## Reading the evidence

- [Paired agent trace findings](https://github.com/dzhng/jevgrep/blob/06a9d79fac2cee77b91f155fc7b3130dc95708f7/evals/implementation/swebench/paired-sol-research-findings.md)
  explain how baseline and retrieval-assisted agents explored the same tasks.
- [Context findings](https://github.com/dzhng/jevgrep/blob/06a9d79fac2cee77b91f155fc7b3130dc95708f7/evals/implementation/swebench/context-findings.md)
  record early handoff and output-consumption problems.
- [Historical reports and source](https://github.com/dzhng/jevgrep/tree/06a9d79fac2cee77b91f155fc7b3130dc95708f7/evals/implementation/swebench)
  preserve alternatives, including failed and superseded experiments. Old model,
  timing, output and status statements describe their own studies, not the release.
- [Retrieval lessons](architecture-lessons.md) and the
  [implementation record](../../../specs/done/jevgrep/README.md) own the synthesis
  and final product evidence, including the failed original quality gates.

The snapshot is source history, not a promise that every old experiment runs from
a fresh clone. Raw responses, agent traces, baseline artifacts, source snapshots,
and evaluator datasets remain in ignored local `evals/runs/swebench/` and
`evals/runs/tooling/`. Their recorded paths and hashes remain unchanged. These
large artifacts are not included in Git; losing that local storage would lose
evidence that cannot be recovered from the source snapshot alone.

Deprecated personal-repository evaluations are excluded from the public archive.
Their tooling and fixtures were moved intact to
`~/.local/share/jevgrep/retired-personal-evals/`, outside the checkout. Its local
`moved-paths.json` records original paths. Redundant `.claude` skill links were
removed; canonical development skills remain in `.agents/skills/`.
