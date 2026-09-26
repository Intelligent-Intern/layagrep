# Release identity and evidence

A release is selected by the version in `apps/cli/package.json` and an exactly
matching `vVERSION` tag. The development version `0.0.0` is not publishable through
this workflow. Stable versions publish to `latest`; prereleases publish to `next`.
The package is `@dzhng/jevgrep`, and its executable is `jg`.

Complete the official quality confirmation and supported-runtime evidence before
requesting a release. Ubuntu CI is not native macOS evidence and does not run paid
model evaluations. The root `bun run verify` command is the common deterministic
gate. Preparing a workflow or a candidate does not authorize creating a tag or
publishing a development checkpoint.

The [tag workflow](../.github/workflows/publish.yml) verifies, builds, packs, and
checks canonical package content before exercising that exact archive through the
installed Docker journeys. It retains the tarball and manifest as a workflow
artifact and dry-runs npm publication before publishing those same bytes.
Configure `NPM_TOKEN` as a repository Actions secret; only the publish step receives
it as `NODE_AUTH_TOKEN`. Credentials never belong in a committed file.

A separate job fetches the exact registry version, checks its integrity against
the verified archive, and installs it into a fresh Node-only runtime for the same
fixture-backed journeys. If registry availability or smoke verification fails
after publication, rerun the failed registry-verification job; a published version
is immutable and must not be replaced.

[Package validation](validate-release.mjs) owns the allowed payload and canonical
asset checks. [The build](build-cli.ts) copies the authored MIT license and
[collects third-party notices](package-notices.mjs) from emitted bundle inputs.
[Retained license sources](licenses/README.md) document upstream distribution gaps.
The archive excludes test fixtures, evaluation evidence, node_modules directories, source maps,
and repository source. Runtime parser dependencies install from exact npm pins.
