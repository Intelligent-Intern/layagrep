# 0.1.0 release evidence

The user explicitly authorized publishing `0.1.0` after the variance repeat and
closeout finish. Publication is pending; preparing an archive is not publication.

The local release candidate is
`/tmp/jg-010-release/dzhng-jevgrep-0.1.0.tgz`, SHA-256
`a6c9061c1a7102bd192df8f1d0c2c954b470f86db3ed279818bf167660332f00`.
It passed the release identity/content/license validator. Compared with the
frozen benchmark archive, only package metadata and the bundled executable
changed; the executable difference is exactly `0.0.0` to `0.1.0`. All other
archive members are byte-identical. Proof: `/tmp/jg-010-version-parity.json`.

This candidate passed both native macOS arm64 installed journeys on Node 24.14.0
and all 24 Linux arm64 installed tests. Logs: `/tmp/jg-010-native.log` and
`/tmp/jg-010-installed.log`. Full deterministic verification of the unchanged
implementation is retained in [freshness verification](source-freshness.md).

The tag workflow still has to run its own full verification, pack and validate
its candidate, test those exact bytes, publish them, and verify the registry
archive's integrity and installed behavior. The local hash above is local proof;
the workflow's retained manifest owns the published artifact identity.
