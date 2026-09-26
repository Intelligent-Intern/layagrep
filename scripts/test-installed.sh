#!/usr/bin/env bash
set -eo pipefail
repo_root="$(cd "$(dirname "$0")/.." && pwd)"
context_dir="$repo_root"
scratch=""
image="jevgrep-installed-test:$(id -u)-$$"
cleanup() {
  if [[ -n "$scratch" ]]; then rm -rf "$scratch"; fi
  docker image rm "$image" >/dev/null 2>&1 || true
}
trap cleanup EXIT
platform=()
if [[ -n "${JEVGREP_TEST_PLATFORM:-}" ]]; then platform=(--platform "$JEVGREP_TEST_PLATFORM"); fi
build_args=()
package_input=""
pattern=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --prebuilt)
      [[ $# -ge 2 && -f "$2" ]] || { echo "--prebuilt requires a package tarball"; exit 1; }
      package_input="$2"; shift 2 ;;
    --case)
      [[ $# -ge 2 ]] || { echo "--case requires checkpoint, failures, cache, or output"; exit 1; }
      case "$2" in
        checkpoint) pattern="" ;;
        failures) pattern="provider|malformed|invalid JSON|cancellation|interrupt|stdout pipe" ;;
        cache) pattern="cache" ;;
        output) pattern="source budget|head -200" ;;
        *) echo "Unknown installed test case: $2"; exit 1 ;;
      esac
      shift 2 ;;
    --test-name-pattern)
      [[ $# -ge 2 ]] || { echo "--test-name-pattern requires a pattern"; exit 1; }
      pattern="$2"; shift 2 ;;
    *) echo "Usage: $0 [--prebuilt package.tgz] [--case checkpoint|failures|cache|output] [--test-name-pattern regex]"; exit 1 ;;
  esac
done
if [[ -n "$package_input" ]]; then
  scratch="$(mktemp -d "${TMPDIR:-/tmp}/jevgrep-installed.XXXXXX")"
  mkdir -p "$scratch/.package-input" "$scratch/test"
  cp "$package_input" "$scratch/.package-input/jevgrep.tgz"
  cp "${JEVGREP_CANONICAL_SKILL:-$repo_root/skills/jevgrep/SKILL.md}" "$scratch/.package-input/canonical-skill.md"
  cp "$repo_root/test/installed.test.mjs" "$repo_root/test/runtime.Dockerfile" "$scratch/test/"
  context_dir="$scratch"
  build_args=(--build-arg PACKAGE_STAGE=prebuilt)
fi
node_args=(node --test --test-concurrency=1)
if [[ -n "$pattern" ]]; then node_args+=(--test-name-pattern "$pattern"); fi
node_args+=(/test/installed.test.mjs)
docker build "${platform[@]}" "${build_args[@]}" -f "$context_dir/test/runtime.Dockerfile" -t "$image" "$context_dir"
docker run --rm --network none --read-only --cpus 2 --memory 2g --pids-limit 256 \
  --cap-drop ALL --security-opt no-new-privileges \
  --tmpfs /tmp:rw,nosuid,nodev,size=256m "${platform[@]}" "$image" "${node_args[@]}"
