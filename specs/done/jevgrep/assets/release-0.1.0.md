# 0.1.0 release evidence

The user explicitly authorized publishing `0.1.0` after the variance repeat and
closeout finish. Publication is pending; preparing an archive is not publication.

The final local release candidate is
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

The tag workflow still has to run its own full verification, pack and validate
its candidate, test those exact bytes, publish them, and verify the registry
archive's integrity and installed behavior. The local hash above is local proof;
the workflow's retained manifest owns the published artifact identity.
