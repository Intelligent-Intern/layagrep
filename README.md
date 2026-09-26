# jevgrep

Context retrieval for coding agents: ask a repository question and receive source
context that helps the agent act without a long sequence of searches and reads.
The production Node-only CLI is implemented and its installed package is verified
on macOS and Linux. The [implementation record](specs/done/jevgrep/README.md)
owns the rationale, invariants and evidence limits. The user accepted the documented
quality tradeoff after the corrected candidate failed its original benchmark gate;
one separately authorized identical-cohort variance check remains pending.

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
The registered quality gate requires preserving baseline official solves while
reducing full task cost; the corrected candidate did not pass it. Jev usage is excluded. Claude and performance optimization are deferred. See [evaluations](evals/README.md) for the official benchmark
workflow and accounting rules. Older custom evals are deprecated and stay out of Git.

## Agent skill

See the [package guide](apps/cli/README.md) for installation, authentication and
Codex/Claude skill setup. The canonical [Jevgrep skill](skills/jevgrep/SKILL.md)
lives under `skills/` and is embedded unchanged in the installed CLI. Agent
configuration changes only when the user explicitly installs or exports it.

## Releases

The npm package is `@dzhng/jevgrep`; its executable is `jg`. The project uses the
[MIT license](LICENSE). [Release guidance](scripts/RELEASING.md) describes the
verified tarball and GitHub tag workflow. Publication requires the repository's
`NPM_TOKEN` secret and a deliberate release tag. The user authorized `0.1.0`
publication after the pending repeat and closeout; the frozen benchmark archive
remains `0.0.0` and is not a publication candidate.
