# Make all retrieval reads eligible and consistent

Status: verified. Depends on: 01. Read [contracts](../contracts.md) first.

## Contract and owner

Core filesystem seam: `listPage(directory, cursor, policy)` and `readSnapshot(path, policy)`. It owns root normalization, nested ignore scopes, exclusion checks, regular-file handling, chunked reads and mutation detection. Preview, follow-up and source-selection readers must use this seam. Implement the exact policy in contracts.md, including non-repository roots and no descendant symlink following.

Bound wide-directory enumeration and content reads without turning omitted work into negative answers. Avoid full-tree preloading. Before uploading snapshots, detect unstable reads; skip unstable input and mark incomplete rather than mix bytes. Normal ignored paths remain exclusions, not service failures.

## Human-runnable artifact

Installed filesystem fixture journey.

`bun run test:filesystem` drives a synthetic plain root and nested repos inside Docker.

Commands are implementation targets. Add them in this slice; do not imply they
already exist. CLI transcripts replace visual/screenshot gates for this product.

## Verification and verdict

Prove ignored/hidden/credential/binary contents never reach the provider fixture, including via directory sampling. Cover negate rules, excluded parents, nested .gitignore reset, .ignore precedence, same-size edits, unreadable files, symlink cycles/outside-root targets, FIFOs, newlines in names and wide/deep trees. Run as non-root or drop DAC override capabilities for permission tests.

## Delegated decisions

Ignore matching library, concrete documented exclusion lists, page size and memory bounds. No new runtime executable requirement.

## Keep green

Parser ranges remain tied to the original snapshot. No personal repository becomes an eval fixture.

## Review

Show the artifact and summarize deviations. This is a non-blocking review checkpoint:
continue on the evidence if the user does not respond. Feedback that changes the
public contract or acceptance measure requires updating this slice before broadening
implementation. Record new choices and update the README handoff before ending.

The named Docker filesystem gate passed, including the installed wide/deep plain-root and nested-repository journey. See [integration evidence](../assets/integration-verification.md).
