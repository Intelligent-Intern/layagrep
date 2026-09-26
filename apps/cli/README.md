# Jevgrep (`jg`)

Ask a repository question and get relevant file locations plus verbatim source
excerpts. Jevgrep helps a coding agent begin unfamiliar multi-file work with
useful context; the agent still owns implementation and verification.

Requires Node.js 22 or newer on macOS or Linux. Install and authenticate:

```sh
npm install --global @dzhng/jevgrep
jg auth
jg doctor
jg "How are telemetry events recorded and sent?" ./my-project
```

`auth` saves your Vercel AI Gateway key; `doctor` verifies it with synthetic input.
You can instead supply `AI_GATEWAY_API_KEY`. Searches send eligible source to Jev
through AI Gateway. Credentials use an owner-only config file. Evaluation answers
are cached locally; `jg --help` describes overrides and cache commands.

The summary comes first, followed by file and declaration locations and selected
source. Locations are reading leads, not a checklist. Omitted excerpts are marked;
`--max-source-bytes 0` includes all selected source. An incomplete result can still
be useful. Read what it supplies, then fill specific gaps with ordinary tools.
Application output goes to stdout; `jg` does not create a report file.

## Agent skill

**Installing the CLI is only half of agent setup: install the skill too.**

Install the canonical skill into the project where your coding agent works:

```sh
npx skills add dzhng/jevgrep --skill jevgrep --agent codex --agent claude-code
```

Select only the agent you use, or add `--global` for user-wide installation. These
options come from the [skills CLI](https://github.com/vercel-labs/skills#install-a-skill).
Installing the skill does not install the `jg` executable or configure its key.
The current repository skill installs a missing CLI when the agent first uses it;
0.1.0's bundled skill predates that setup step. Use the repository skill
installer above for the latest instructions.

`jg skill` is a shortcut to that same installer. It supports
`--agent NAME` (repeatable), `--global`, and `--yes`; without options, the installer
prompts for settings. It requires npm/npx and network access. Published 0.1.0's
`jg skill` still prints text, so use `npx skills` directly with that version.

Search does not install skills or edit agent configuration. Only an explicit
skill installation command invokes the installer. The skill directs the agent
to read returned excerpts before further discovery, skip redundant searches when
the needed context is already known, and handle incomplete results honestly.

There is no built-in upgrade command. Use `npm install --global @dzhng/jevgrep@latest`
to upgrade the CLI, then rerun your `npx skills add` command to update
the agent's copy too.

See the [repository](https://github.com/dzhng/jevgrep) for architecture, official
benchmark evidence and development. Jevgrep is MIT licensed.
