# Installed package cohort

[The runner](installed.py) evaluates one frozen installed `jg` package against
[the ten fixed Sol baselines](fixed-baselines.json). Baseline receipts, prompts,
grades and billing are checked by hash; there is no baseline execution command.
The two recorded baseline nonpasses remain nonpasses, including the retained
Pylint test-collection limitation.

Preparation installs the packed npm artifact and dependencies once, then checks
that same installation offline in every selected runtime image. Each check
verifies the original source, agent versions and canonical packaged skill.
The coding agent receives the archived prefix and runs the real `jg` executable
on an internal network. The unchanged benchmark prompt requires initial retrieval,
even when the production skill would consider it optional. Retrieval limits come
from the frozen package's default policy.

The plan binds one package, installed prefix, skill, safe task export, evaluator
dataset and archived runner/broker/registry sources before any treatment runs.
Existing studies remain unchanged; their archived source records the procedure used.
A fresh full-cohort plan prevents combining the cheapest outcomes from different
packages or experiments. A single-task plan is useful for diagnostics but cannot
satisfy the cohort gate.

```sh
python3 evals/implementation/swebench/installed.py prepare \
  --package /absolute/path/to/package.tgz --output /absolute/path/to/new-study
python3 evals/implementation/swebench/installed.py run \
  --plan /absolute/path/to/new-study/plan.json --all --dry-run
```

Preparation and dry-run make no model calls. `prepare` defaults to all ten tasks;
`--task` selects one registered task. `--evidence-root` locates the retained
baseline and evaluator files when preparing from another checkout. The root
`eval:swebench` alias points to this entry point; `--help` lists its arguments.

After reviewing the frozen plan, `run --all` without `--dry-run` executes the paid
treatments sequentially. Load the Gateway credential through the authorized
environment workflow. Real keys stay out of plans and command arguments. Every
attempt has fresh home/cache state and a durable lifecycle receipt. Failed or
completed attempts are retained; they are never replaced. Active processes stop
continuation. An abandoned attempt whose runner and containers are gone becomes
an interrupted result, preserving its evidence.

Follow execution with `grade --plan ... --all` and `account --plan ... --all`.
Use `--task` instead of `--all` for an individual cell. Grading uses the pinned
official harness and unique run IDs. Accounting reuses saved generation metadata,
fetches missing receipts, and leaves full cost unknown if any request is missing.
Neither operation reruns the coding agent.

`aggregate --plan ...` requires ten terminal attempts with official grading receipts,
all eight baseline solves preserved by valid solved treatments, and at least seven
valid solved results with complete billing and strictly lower cost. Failed or
invalid treatments remain recorded as nonpasses and nonwins. Unknown costs cannot win and
prevent reporting a full cohort cost total; the known subtotal remains explicit. The aggregate reports individual
outcomes so failures remain visible.

Run storage holds the frozen artifacts, agent output, patches, official reports
and billing. [The broker](gateway_broker.py) retains exact Jev request/response
bodies in the non-agent container without authentication headers. These contain
benchmark source and remain local with the ignored study evidence.

[Focused tests](test_installed.py) run in an isolated Docker container. They cover
prompt identity, drift rejection, no-call validation, retained attempts, incomplete
billing, cohort acceptance and exact body capture through a synthetic provider.
