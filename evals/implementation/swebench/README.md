# Official SWE-bench subset

For the current Sol-only architecture spike, start with [retrieval lessons](architecture-lessons.md) and its linked research ledger. The setup and initial study descriptions below predate that narrower scope.

This directory is independent of prior repository-specific evaluations. The benchmark compares Codex `gpt-5.6-sol` and Claude `opus`, with and without hierarchical Jev retrieval. Speed and monetary cost per task matter only with the same or better independently graded solve rate. Jev costs zero under the user's evaluation policy; its tokens are retrieval diagnostics, while returned context contributes to agent usage.

`selection.json` is the immutable ten-task registration. `select_subset.py` read only instance IDs and repository names from the pinned Verified parquet before any solution or test columns were materialized. SHA256-seeded repository round-robin determines ten tasks and a separate eleventh calibration task. Never replace infrastructure failures with easier tasks. This is a repository-diverse subset, not an unbiased sample of all500 tasks.

Development evidence is in [architecture calibration](calibration-results.md); the registered comparison is in [subset results](subset-results.md).

## Setup and controls

`setup.sh` obtains the pinned official harness and dataset. The initial installation's exact Python package versions and runtime hashes are recorded in `setup-receipt.json` and `requirements-frozen.txt`. Run setup from an environment with Docker, hf and uv. On this host Docker29.4.1 runs aarch64; official amd64 images run through emulation. Official docs call ARM support experimental and recommend120GB free; only one calibration image was admitted under the smaller local disk budget.

Run `evals/runs/tooling/swebench/venv/bin/python evals/implementation/swebench/controls.py` only once per registered control run ID. It runs serial official no-op/gold evaluation on the separate calibration task, writing logs under `evals/runs/tooling/swebench/`. It refuses to reuse existing reports. The no-op adds a harmless non-code dotfile because the official batch harness skips literally empty patches. Gold predictions and evaluator-only dataset rows are written programmatically with restrictive permissions and must never be exposed to implementation agents.

Each candidate requires a unique run ID: official result caching is keyed by run ID and instance ID, not patch contents. Do not rerun with a different patch under the same ID.

## Native agent seam

Each dataset row names an official image. Provision one task at a time and record the pulled immutable image digest. The repository lives at `/testbed`, normally with the test environment Python at `/opt/miniconda3/envs/testbed/bin/python`. Run both treatment and baseline from identical fresh image state. Host-native agent checkouts may be exported from that state; execute tests in the matching container. Keep agent execution and evaluation containers separate, and never mount evaluator dataset rows, solution patches, held-out test patches, or control logs into an agent workspace.

The calibration image contains a clean environment-setup commit differing from dataset `base_commit` only in `setup.py`/`tox.ini`. Preserve and record the actual image checkout used; blindly resetting it may remove compatibility setup. Candidate patch generation must be relative to the same starting checkout the official evaluator uses. Image checkout metadata is in the setup receipt.

Supply only `problem_statement`, public repository metadata and the pristine repository to agents. `hints_text`, `patch`, `test_patch`, `FAIL_TO_PASS`, `PASS_TO_PASS`, and `eval_script` stay evaluator-side. Retrieval must see only the same agent checkout. Export these inputs programmatically without printing hidden fields.

Grade a recorded prediction with the pinned Python environment:

```
python -m swebench.harness.run_evaluation \
  --dataset_name /absolute/path/to/pinned/test-00000-of-00001.parquet \
  --predictions_path /absolute/path/to/predictions.jsonl \
  --instance_ids INSTANCE_ID --max_workers 1 --timeout 1800 \
  --run_id UNIQUE_RUN_ID
```

Prediction records contain `instance_id`, `model_name_or_path` and `model_patch`. Official evaluation applies the patch inside a fresh image and executes the dataset's evaluator. Preserve full reports and distinguish unresolved implementations from infrastructure failures. A calibration success validates this one environment, not all ten images or a solve-rate claim.

Official references: [pinned harness README](https://github.com/SWE-bench/SWE-bench/blob/02e7a74ffd0b707aab73d203fe87bdc7c76afc8e/README.md), [Docker guide](https://github.com/SWE-bench/SWE-bench/blob/02e7a74ffd0b707aab73d203fe87bdc7c76afc8e/docs/guides/docker_setup.md).
