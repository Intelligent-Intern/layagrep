# jevgrep

Context retrieval for coding agents: ask a repository question and receive source
context that helps the agent act without a long sequence of searches and reads.
The architecture spike is complete enough for an implementation decision; the
production CLI is implemented and undergoing installed and benchmark verification. See the
[accepted architecture](docs/architecture.md) for the reference strategy, rationale,
and evidence limits. The [full product spec](specs/jevgrep/README.md) owns the
implementation plan and current product decisions.

## Development

Uses Duet's Bun workspaces, shared TypeScript configuration, and Turborepo pattern.
Install with `bun install`, then run `bun run dev --help`. `bun run build` creates
a Node-compatible CLI at `apps/cli/dist/bin/index.js`; invoke it with Node during development.
Use the root typecheck, lint, test, and format-check scripts before handing off changes.

Run `bun run dev auth` to paste a hidden AI Gateway key, then `bun run dev doctor`
to exercise Jev using synthetic input. `auth --stdin` supports secret-manager pipes.
Credentials live in `$XDG_CONFIG_HOME/jevgrep/credentials.json`, falling back to
`~/.config/jevgrep/credentials.json`, with owner-only permissions. The environment
variable `AI_GATEWAY_API_KEY` takes precedence. Auth saves the key; doctor verifies it.

The CLI owns user interaction and credentials. [Core](packages/core/src/index.ts)
owns the Jev integration. AI SDK is pinned because its evaluation API is experimental.
Future providers should enter at that boundary when supported, rather than leak
provider concerns into repository traversal.

The architecture spike uses a pinned SWE-bench subset with Codex Sol.
Acceptance preserves baseline official solves while reducing full task cost; Jev
usage is excluded. Claude and performance optimization are deferred. See [evaluations](evals/README.md) for the official benchmark
workflow and accounting rules. Older custom evals are deprecated and stay out of Git.

## Agent skill

The canonical [Jevgrep skill](skills/jevgrep/SKILL.md) lives under `skills/` for
agent discovery and installation through the skills CLI. It describes the `jg` search workflow and is embedded in the installed CLI.

## Releases

The npm package is `@dzhng/jevgrep`; its executable is `jg`. The project uses the
[MIT license](LICENSE). [Release guidance](scripts/RELEASING.md) describes the
verified tarball and GitHub tag workflow. Publication requires the repository's
`NPM_TOKEN` secret and a deliberate release tag after the quality gates pass.
