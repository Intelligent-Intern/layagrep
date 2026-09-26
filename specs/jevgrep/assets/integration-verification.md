# Installed integration verification

Verified 2026-09-25 against the working integration candidate (`@dzhng/jevgrep`
0.0.0). These are deterministic fixture checks, not live benchmark acceptance.

- `bun run check-types` and `bun run lint`: pass.
- `bun run test`: 46 Bun tests and 15 Node parser tests pass. Runs under
  non-root Docker, read-only root, isolated writable temporary storage, dropped
  capabilities and no external network. The npm install test uses a prewarmed
  dependency cache copied into its own temporary directory; it packs and installs
  the current artifact offline. It invokes the executable directly.
- `bun run test:installed`: six installed-process journeys pass in Node
  22.23.3 Linux/arm64, with no Python, Bun, compiler or checkout in the runtime.
  Real SDK HTTP transport exercises hierarchical Python retrieval, healthy empty
  results, malformed responses with retained evidence, fresh/default/no-cache
  behavior, and local commands/authentication errors.

The mutation regressions exercise the public retrieval seam. A newly ignored
source donor is removed before follow-up evaluation and from returned excerpts.
An admitted text file replaced with binary data retains its location but returns
incomplete status and omitted source. The first regression was observed failing
before the fix. The binary scenario had also been reproduced by the independent
reviewer; its automated regression passes after the same correction.

The Docker runner initially exposed harness problems: npm could not write to an
immutable cache, then the temporary mount prevented direct executable launch.
The final harness copies the prewarmed cache into each test's writable scratch
and permits execution on that isolated mount. Coverage was preserved.

Still unproven: live Requests/Sol checkpoint, final failure/cache requirements,
source-budget choice, ten-task frozen quality gate, Linux/amd64 and native macOS
release verification. Historical spike outcomes are not production outcomes.

## Independent review follow-up

`codex review --commit 3c8835f` reproduced stale donors during the follow-up pass
and successful cache hits after cancellation. Both were confirmed with failing
regressions. Selection now asks its caller to prepare each declaration request:
the filesystem owner refreshes donor eligibility/hashes and checks the target
snapshot before each group. This also fixes a separately reproduced case where a
file ignored after its first declaration group was uploaded twice more.
Cancellation is checked before and after asynchronous cache lookup.

Focused verification: 14 retrieval/selection tests pass in Docker; four HTTP
evaluator tests pass, including rate-limit cancellation and Retry-After recovery.
The installed suite passed eight journeys before these last retrieval fixes;
`bun run test:e2e -- --case failures` selects its three current failure cases
(malformed answers, authentication failure, transient recovery) and passed.
This is not the complete slice 05 matrix yet.

A live `jg doctor` completed successfully through AI Gateway with the authorized
Duet staging credential, loaded through its existing dotenvx mechanism. No secret
was printed. This verifies live connectivity only; the official task remains next.
