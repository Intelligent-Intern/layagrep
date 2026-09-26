#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
docker build -q -f test/Dockerfile -t jevgrep-reference .
docker run --rm --network none jevgrep-reference "$@"
