#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../../.."
mkdir -p evals/runs/tooling/swebench evals/runs/swebench/dataset
repo=evals/runs/tooling/swebench/repo
if [[ ! -d "$repo/.git" ]]; then git clone https://github.com/SWE-bench/SWE-bench.git "$repo"; fi
git -C "$repo" checkout --detach 02e7a74ffd0b707aab73d203fe87bdc7c76afc8e
hf download SWE-bench/SWE-bench_Verified data/test-00000-of-00001.parquet eval.yaml --type dataset --revision 78f471bf655a3137b2e8a75af1501690ec009ec3 --local-dir evals/runs/swebench/dataset --max-workers 1
uv venv --python 3.12 evals/runs/tooling/swebench/venv
uv pip install --python evals/runs/tooling/swebench/venv/bin/python -r evals/implementation/swebench/requirements-frozen.txt
# select_subset.py refuses overwrite. Existing selection is immutable, not resampled.
if [[ ! -f evals/implementation/swebench/selection.json ]]; then
 evals/runs/tooling/swebench/venv/bin/python evals/implementation/swebench/select_subset.py
fi
