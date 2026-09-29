# Layagrep

Layagrep is a local code retrieval CLI for coding agents. It forks [jevgrep](https://github.com/dzhng/jevgrep) (MIT) and replaces its hosted relevance decisions with [Laya](https://github.com/NandhaKishorM/laya) running on your machine. Ask what code does; Layagrep returns relevant files, source excerpts, and line references. Source reads stay local when the Laya server is bound to loopback.

A separate project, [marksomething/layagrep](https://github.com/marksomething/layagrep), uses the same name for semantic line matching. This fork focuses on repository discovery and source context.

## Local setup

Requires Node.js 22+, Bun for building this checkout, Python 3.10+, and enough memory for a Laya checkpoint. A CUDA GPU is optional.

```sh
uv tool install 'laya[serve]'
LAYA_HOST=127.0.0.1 LAYA_DEVICE=cuda LAYA_PRELOAD=1 laya-serve
```

In another terminal:

```sh
bun install
bun run --cwd apps/cli build
npm install --global ./apps/cli
layagrep doctor
layagrep "Where is authentication checked before a request reaches a handler?" /path/to/repo
```

The default endpoint is `http://127.0.0.1:8000/v1`. If port 8000 is occupied, set `LAYAGREP_LAYA_URL=http://127.0.0.1:8765/v1` or save that URL in `~/.config/layagrep/server-url`; only loopback HTTP endpoints are accepted. No external API key is required. If you set `LAYA_API_KEY` on the Laya server, run `layagrep auth` to store the matching key locally. `layagrep skill` installs the bundled agent skill. `jg` remains an alias for existing scripts.

Laya's multilingual checkpoint is selected explicitly, with a 4096-token request budget. This fork has not reproduced jevgrep's published cost or retrieval benchmarks; those upstream measurements do not establish Layagrep's quality. If a search reports incomplete discovery, inspect the source directly. Exact symbols and paths are often faster with `rg`.

## Code graph

The CLI can use [CodeGraph](https://github.com/colbymchenry/codegraph) as an optional local structural index. CodeGraph has its own file watcher and incremental sync; Layagrep does not maintain a second graph database. Install CodeGraph with `npm install -g @colbymchenry/codegraph`, run `codegraph telemetry off` if you want usage telemetry disabled, and then run `codegraph init /path/to/repo`. Search with `layagrep "question" /path/to/repo --graph`. Layagrep runs CodeGraph's incremental sync before each graph search, so edits are picked up even if no watcher is active. CodeGraph's `serve --mcp` mode additionally watches files continuously. Graph results scope the Laya search; rerun without `--graph` when you need whole-tree discovery. Layagrep checks graph paths against the current files and its normal filesystem policy before returning excerpts.

## License

Layagrep is MIT licensed and retains jevgrep's copyright and history. [Laya is Apache-2.0 licensed](https://github.com/NandhaKishorM/laya/blob/main/LICENSE) and is installed and run separately; no Laya source, model, or binary is distributed with this repository or the Layagrep CLI. [CodeGraph](https://github.com/colbymchenry/codegraph) is also a separately installed tool. If a future distribution bundles Laya, it must include Laya's Apache-2.0 license and any applicable notices with that distribution.
