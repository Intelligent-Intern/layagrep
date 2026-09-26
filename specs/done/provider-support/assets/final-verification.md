# Final provider-support verification

2026-09-26. Implementation gates passed; no npm release or paid task benchmark
was run. Existing baselines, historical study artifacts, the reference manifest,
covered source files, corpus and frozen research skill remain unchanged.

| Gate                                                      | Result                                                                                                                                   |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run verify`                                          | Exit 0: types, lint, 125 core/CLI/reference, 18 Node protocol, 23 parser, 4 release, 27 maintained harness and 32 installed Docker tests |
| `bun run format:check`                                    | Exit 0                                                                                                                                   |
| Latest schema-4 harness, local Python and Docker          | 27/27 in each, exit 0; rerun after the final plan-version adjustment                                                                     |
| Exact candidate, installed Docker `--prebuilt`            | 32/32, exit 0                                                                                                                            |
| Same candidate, native `--prebuilt`                       | 10/10, exit 0; Node v24.14.0, darwin/arm64 25.6.0                                                                                        |
| Independent whole-diff Codex review                       | No actionable defects; pending suite completion was not assumed by the reviewer                                                          |
| Live built CLI `jg doctor`, isolated saved Vercel setup   | Exit 0, expected success text, empty stderr                                                                                              |
| Live built CLI `jg doctor`, isolated saved TypeSafe setup | Exit 0, expected success text, empty stderr                                                                                              |
| Live OpenRouter                                           | Unverified: credentials unavailable in the authorized local environment                                                                  |

Candidate: `@dzhng/jevgrep` source version 0.2.0, prepared with the existing package
validator but **not published**. SHA-256:

```text
d8d7d0012da3163f2f615fddc01e07795251af28296950b5f248d990322bd6b2
```

The packaged file allowlist excludes the routing preload and fixtures; runtime
requirements remain Node only. Docker runtime tests use network isolation and
synthetic local HTTP; dependency downloads used Docker Desktop's existing proxy
through a temporary Docker client config, without changing the user's settings.

The broker's real local-upstream test verifies auth replacement, exact native
request/response capture, and rejection before forwarding for wrong targets,
credentials or bodies. Synthetic accounting retains 22 input tokens when cost
is absent while the full Jev total remains unknown. Jev observations remain
excluded from scored coding-agent cost. This proves maintained tooling behavior,
not a newly measured solve rate, cost saving or latency.

Review and cleanup preserved the one evaluator/one preset owner, removed the old
module and environment setup path, retained exact-version license validation,
and avoided a public transport override. The sole new data-format choice is
recorded in [the choices ledger](../choices.md). No new benchmark cohort was
prepared or executed.

The user subsequently supplied TypeSafe and Gateway keys in `.env.local`. Both
passed isolated live auth/doctor checks; neither key was printed or committed,
and the user’s saved setup was not changed. OpenRouter availability was checked
without printing values and no key was present.

The fresh closeout audit corrected an evidence pointer, moved the exact packet to
a raw text artifact to preserve trailing spaces, and added content-type validation
before reference normalization. The strengthened transport/replay/provider-parity
gate passed 15/15 in Docker. Removing the assertion in a temporary copy caused the
new regression to fail at the expected point. The production tarball was unchanged.
