# Installed Requests checkpoint

[The runner](installed.py) compares one frozen installed `jg` package with the
retained Requests Sol baseline. It refuses changed model, source, runtime and
baseline-prompt identities. It never launches a baseline. A successful checkpoint
is integration evidence, not the ten-task quality gate.

Preparation installs the packed npm artifact and its dependencies in a disposable
copy of the retained Linux image. Registry access is confined to preparation;
the agent receives the archived installed prefix on an internal network. It runs
the real `jg` executable. The packaged skill is verified against the canonical
skill, and the benchmark explicitly requires initial retrieval even when the
production skill would consider it optional.

Use `python3 evals/implementation/swebench/installed.py --help` for commands.
The intended root script alias is `eval:swebench` pointing to that entry point.
A typical sequence is:

```sh
python3 evals/implementation/swebench/installed.py prepare \
  --package /absolute/path/to/package.tgz --output /absolute/path/to/new-study
python3 evals/implementation/swebench/installed.py run \
  --plan /absolute/path/to/new-study/plan.json --dry-run
```

Preparation and dry-run make no model calls. After reviewing the frozen plan,
`run` without `--dry-run` executes the paid treatment exactly once. Load the
Gateway credential through the authorized environment workflow; never place a
real key in the plan or command arguments. Each attempt uses fresh home/cache
state and the package's default retrieval policy.

Follow execution with `grade --plan ...` and `account --plan ...`. Grading uses
the existing pinned official environment and a unique run ID. Accounting reuses
saved generation metadata, fetches missing receipts, and leaves the full cost
unknown if any generation is unaccounted for. A missing required retrieval call
cannot count as a successful cost win.

The plan, installation archive, raw agent output, patch, official reports and
billing remain under ignored run storage. [The broker](gateway_broker.py) retains
raw Jev request/response bodies separately from transport metadata, only in the
non-agent container; authentication headers are never captured. These receipts
contain benchmark source and should stay local with the other study evidence.

Run [the focused validations](test_installed.py) inside an isolated Docker
container. They exercise frozen prompt identity, drift rejection, no-call dry-run,
partial billing and exact Jev body capture through a local synthetic provider.
