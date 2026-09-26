#!/usr/bin/env bash
set -euo pipefail
bun test apps/cli/test packages/core/test test/reference test/gateway.test.ts test/retrieval.test.ts
node --experimental-strip-types --test test/parser/source.test.ts
