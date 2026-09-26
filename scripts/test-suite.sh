#!/usr/bin/env bash
set -euo pipefail
bun test apps/cli/test packages/core/test test/reference test/evaluator.test.ts test/retrieval.test.ts test/retrieval-freshness.test.ts
node --test packages/core/test-node/provider-protocol.mjs
node --experimental-strip-types --test test/parser/*.test.ts
node --test test/release.test.mjs
python3 -B -m unittest discover -s evals/implementation/swebench -p test_installed.py
