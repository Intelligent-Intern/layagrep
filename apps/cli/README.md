# Jevgrep (`jg`)

Ask a repository question and get relevant file locations plus verbatim source
excerpts. Jevgrep helps a coding agent begin unfamiliar multi-file work with
useful context; the agent still owns implementation and verification.

Requires Node.js 22 or newer on macOS or Linux. The development version is not
published yet. After a release is available:

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

Install the canonical skill into the project where your coding agent works:

```sh
npx skills add dzhng/jevgrep --skill jevgrep --agent codex --agent claude-code
```

Select only the agent you use, or add `--global` for user-wide installation. These
options come from the [skills CLI](https://github.com/vercel-labs/skills#install-a-skill).
Installing the skill does not install the `jg` executable or configure its key.

You can also export the exact skill bundled with your installed `jg` into your
chosen agent skill directory. For example, set `skill_root` to that directory:

```sh
skill_root=/absolute/path/to/your/agent/skills
mkdir -p "$skill_root/jevgrep"
jg skill > "$skill_root/jevgrep/SKILL.md"
```

Jevgrep never edits agent configuration automatically. The skill directs the agent
to read returned excerpts before further discovery, skip redundant searches when
the needed context is already known, and handle incomplete results honestly.

See the [repository](https://github.com/dzhng/jevgrep) for architecture, official
benchmark evidence and development. Jevgrep is MIT licensed.
