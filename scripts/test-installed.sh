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
if [[ "${1:-}" == "--prebuilt" ]]; then
  if [[ $# -ne 2 || ! -f "$2" ]]; then echo "Usage: $0 [--prebuilt package.tgz]"; exit 1; fi
  scratch="$(mktemp -d "${TMPDIR:-/tmp}/jevgrep-installed.XXXXXX")"
  mkdir -p "$scratch/.package-input" "$scratch/test"
  cp "$2" "$scratch/.package-input/jevgrep.tgz"
  cp "${JEVGREP_CANONICAL_SKILL:-$repo_root/skills/jevgrep/SKILL.md}" "$scratch/.package-input/canonical-skill.md"
  cp "$repo_root/test/installed.test.mjs" "$repo_root/test/runtime.Dockerfile" "$scratch/test/"
  context_dir="$scratch"
  build_args=(--build-arg PACKAGE_STAGE=prebuilt)
elif [[ $# -ne 0 ]]; then
  echo "Usage: $0 [--prebuilt package.tgz]"
  exit 1
fi
docker build "${platform[@]}" "${build_args[@]}" -f "$context_dir/test/runtime.Dockerfile" -t "$image" "$context_dir"
docker run --rm --network none --read-only --tmpfs /tmp:rw,nosuid,nodev,size=256m "${platform[@]}" "$image"
