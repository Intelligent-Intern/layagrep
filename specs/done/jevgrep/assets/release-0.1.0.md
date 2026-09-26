# 0.1.0 release evidence

Published `@dzhng/jevgrep@0.1.0` to npm as `latest`, with provenance, on
2026-09-26 under the user's explicit authorization. Both jobs in the
[release workflow](https://github.com/dzhng/jevgrep/actions/runs/36253715874)
passed: publication and independent registry verification. The
[GitHub release](https://github.com/dzhng/jevgrep/releases/tag/v0.1.0)
links the tag at commit `c6842af31d4442791c0769b5b65899693e114a6c`.

Published tarball SHA-256:
`0909f05dbabf74feaa6358e182b6e7743e8f5f16a791ebfd53367b3974d01f6d`.
Registry and candidate integrity:
`sha512-ISmf+ujNstQ5spvxkwJ43Dk3ZTjAfEvEPsY67IUoWpR/t06Fuqn/W+xHTYKKny8xok5jVLjEtVZ0BvkkjdCXNw==`.
The workflow artifact `jevgrep-0.1.0` retains the archive and manifest. Registry
metadata confirms version `0.1.0`, `latest`, and an SLSA provenance attestation.

The locally verified release candidate is
`/tmp/jg-010-final-release/dzhng-jevgrep-0.1.0.tgz`, SHA-256
`447cdeb88695b6851efb7fbe4bfd628a69e1c83b2f1651e7ed3f3453fe747523`.
It passed the release identity/content/license validator. Compared with the
frozen benchmark archive, only package metadata and the bundled executable
changed; the executable difference is exactly `0.0.0` to `0.1.0`. All other
archive members are byte-identical. Proofs: `/tmp/jg-010-version-parity.json`
and `/tmp/jg-010-final-parity.json`. Final formatting changed dependency-key
order only; package metadata values and all runtime bytes are unchanged from
the preceding local `0.1.0` candidate.

The preceding local `0.1.0` candidate passed both native macOS arm64 journeys on
Node 24.14.0 and all 24 Linux arm64 installed tests. The final metadata-formatted
archive passed native smoke again and three focused Linux installed journeys.
Logs: `/tmp/jg-010-{native,installed}.log` and
`/tmp/jg-010-final-{native,installed}.log`. Repository formatting now passes.
Full deterministic verification of the unchanged
implementation is retained in [freshness verification](source-freshness.md).

A final documentation-only commit removes stale pre-publication wording from
the packaged README. It does not change executable or runtime assets. The first
workflow was canceled before packing or publication (publish step skipped), then
the unpublished tag was moved to that documentation commit. The canceled run
is retained at https://github.com/dzhng/jevgrep/actions/runs/36253611769.

The successful workflow ran full deterministic verification, release validation,
exact-tarball Docker journeys, dry-run publication, and provenance publication.
Its separate registry job fetched `@dzhng/jevgrep@0.1.0`, verified identical
integrity and passed all 24 installed journeys from those public bytes. Full log:
`/tmp/jg-010-ci.log` and the linked workflow.

The downloaded CI archive also passed both native macOS arm64 smoke journeys on
Node 24.14.0 (`/tmp/jg-010-ci-native.log`). A member-by-member comparison with the
locally verified candidate found only the expected README wording difference;
all executable and runtime assets are byte-identical (`/tmp/jg-010-ci-parity.json`).
No further paid model evaluations or baseline executions accompanied publication.
