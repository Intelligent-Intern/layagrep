# Installed runtime verification

The frozen cohort archive has SHA-256
`98bcf47e7de30ad82c8b452a86b958505c3befe6512d00f98486101c6a9fc802`.
It contains the 1,500-byte source policy and canonical skill used by every
prospective treatment. Its production source and skill were byte-compared with
the committed implementation before removing the candidate worktree.

Native macOS Apple Silicon: Darwin arm64 25.6.0, Node 24.14.0. The exact archive
passed the two reused installed journeys: help/version/skill without credentials,
and a real Python search over three hierarchy branches through a loopback HTTP
Gateway fixture. npm installed outside the checkout with temporary HOME/XDG and
only Node available on the runtime PATH. Removing the packaged grammar made search
fail with exit 1 while local commands still passed. Independent Codex review found
no actionable issue. This proves the printed Node/macOS combination, not every
Node version on macOS.

Linux amd64: the exact same archive passed runtime isolation/keyless commands,
Python search and bounded-source preservation in the Node 22 Docker runtime.
The installed image has no checkout or Python/Bun/compiler prerequisites. The
corresponding Linux arm64 candidate journeys also passed during slice 07.

Reproduce native evidence with `node scripts/test-native.mjs --prebuilt PACKAGE`.
For Linux, set `JEVGREP_TEST_PLATFORM=linux/amd64` or `linux/arm64` and run
`scripts/test-installed.sh --prebuilt PACKAGE`. The default installed suite is
broader than this focused architecture check; its full closeout remains separate.

The npm-facing README was added after the cohort archive was frozen. It documents
setup and explicit skill installation; it does not change executable, grammar,
dependencies or skill. Final packaging validation must include this documentation
and exercise its exact archive before a later user-requested publication.
