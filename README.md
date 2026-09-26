![jevgrep — Find the context. Start coding.](assets/cover.png)

# jevgrep

[![npm](https://img.shields.io/npm/v/@dzhng/jevgrep?style=flat-square&color=ef5638)](https://www.npmjs.com/package/@dzhng/jevgrep)
[![MIT license](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)
[![Node.js 22+](https://img.shields.io/badge/Node.js-22%2B-339933?style=flat-square)](apps/cli/README.md)
[![Release](https://img.shields.io/github/actions/workflow/status/dzhng/jevgrep/publish.yml?style=flat-square&label=release)](https://github.com/dzhng/jevgrep/actions/workflows/publish.yml)

**Find code by asking what it does.**

Coding agents spend part of every unfamiliar task finding the right files.
Jevgrep gives them a place to start: ask a repository question, and `jg` returns
relevant files, reading leads, and verbatim source excerpts in one stdout response.
It uses [Jev](https://vercel.com/ai-gateway/models/jev) to judge relevance across
folders, files, and declarations. Your coding agent then implements and tests the change.

```sh
npm install -g @dzhng/jevgrep
jg auth
jg "How are telemetry events recorded and sent?" ./my-project
```

Requires **Node.js 22+**, **macOS or Linux**, and a **Vercel AI Gateway key**.
No separate Python, Bun, or ripgrep installation is required to use `jg`.

## Give your agent the skill

Install the CLI above, then add the skill to the project where your agent works:

```sh
npx skills add dzhng/jevgrep --skill jevgrep --agent codex --agent claude-code
```

Select just the agent you use, or add `--global` for a user-wide install. The
[skill](skills/jevgrep/SKILL.md) teaches the agent when to call `jg`, how to use
returned context, and when to fill gaps with its normal tools. It skips redundant
retrieval when the needed context is already known. Installing the skill does not
install the executable or configure an API key.

For manual skill export and authentication options, see the [package guide](apps/cli/README.md).

## Start with a question, leave with source

Use `jg` when you know the behavior you need to understand but not where it lives:

```sh
jg "Where is authentication checked before a request reaches a handler?" .
jg "How are database connections created, pooled, and closed?" ./src
jg "Which tests cover retry behavior when a request times out?" .
```

Jevgrep explores the repository hierarchy and follows qualifying branches. It
selects files using content previews, then identifies useful source units and
surrounding context. It keeps qualifying file locations even when it cannot
confidently return an excerpt; it does not force every search into a fixed top-two
list.

The summary comes first, followed by file locations, reading leads, and selected
source with line references. Python and TypeScript/JavaScript support declaration
parsing; other text uses a fallback. The output is evidence for the agent to use,
not a generated answer or a guarantee that every relevant file was found.
[See a recorded output example](specs/done/jevgrep/assets/stdout-example.txt).

When you already know an exact symbol or path, a direct read or `rg` search may be
all you need. Jevgrep is most useful for questions that span unfamiliar files.

## What we measured

![Jevgrep workflow and benchmark: 40% lower Sol task cost in one ten-task SWE-bench repeat, with 7/10 solves versus 8/10 baseline. Jev cost excluded.](assets/how-it-works.png)

**About 40% lower coding-agent cost in one ten-task SWE-bench repeat.** Full Sol
cost fell from **$7.62 to $4.52**, including failed tasks and excluding Jev costs.
Solve rate was **7/10 with `jg`, versus 8/10 for the saved baseline**. This is a cost
reduction with a quality tradeoff, not evidence of equal or better solve quality.

The earlier run of the same corrected runtime solved 6/10 at $5.54. Both runs
remain separate; baselines were run once and reused, and outcomes were never
pooled. Both failed the original quality gate. The sample is a tuned Python
subset evaluated with Sol, so it does not establish general savings, faster
execution, or results for other coding agents.

The [full results and paired trace analysis](specs/done/jevgrep/assets/variance-repeat.md)
include exact costs, failed tasks, and separately observed Jev charges. See the
[evaluation guide](evals/README.md) for methodology.

## Source, credentials, and local state

Searches send eligible source content to Jev through Vercel AI Gateway. Default
filesystem filtering respects ignore files and excludes hidden, dependency/build,
binary, and obvious credential files. These filters are not a guarantee that all
sensitive information has been removed; choose a search root you intend to send.

`jg auth` saves your key in an owner-only config file. `AI_GATEWAY_API_KEY` takes
precedence when set; `jg doctor` checks the connection with synthetic input.
Evaluation answers are cached locally by default. The CLI writes its output to
stdout and does not create report files. Use `jg --help` for cache controls,
search overrides, and incomplete-result behavior.

## Development

The repository uses TypeScript, Bun workspaces, and Turborepo. From a checkout:

```sh
bun install --frozen-lockfile
bun run dev --help
bun run verify
```

Verification includes Docker tests of the installed Node-only package. For the
reasoning behind retrieval, parsing, caching, and failure handling, start with the
[architecture](docs/architecture.md) and [implementation record](specs/done/jevgrep/README.md).
[Release guidance](scripts/RELEASING.md) covers tag-triggered npm publication and
verification of the exact public package.

[MIT](LICENSE). [Artwork and generation prompts](assets/README.md).
