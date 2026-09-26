# Historical integration verification

This records earlier integration candidates, including retry and parser policies
subsequently replaced during reference restoration. Counts and outstanding items
below describe those checkpoints, not the current product. The
[final merged verification](python-runtime.md) owns current gate evidence; the
[cohort confirmation](cpython-confirmation.md) owns current task outcomes.

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

Further focused installed checks pass: in-flight SIGINT exits 130 and stops
requests; invalid JSON exhausts three attempts for each independent request and
returns incomplete; a disconnected socket retries the same request and retains
source after recovery. The malformed-JSON test initially assumed the entire
search made one request. The fixture actually creates independent hierarchy
batches, so the assertion now verifies the specified three-attempt bound per
exact request body rather than imposing a global three-request search limit.
A stalled-HTTP evaluator test uses the same timeout mechanism with a short injected
duration and confirms three attempts, then a classified provider failure.

`bun run test:parser` is now the combined named gate: conformance in Node plus
pack/install and actual Python units in a runtime without development prerequisites.
It passed all 15 conformance tests and both selected installed journeys.

## Installed failure and cache checkpoint

The installed failure selector passed all ten selected journeys, including the
actual three 30-second stalled HTTP attempts, malformed answers/JSON, retry
recovery, rate limits, SIGINT, and `head -200`. Separate installed journeys cover
cold/warm identical output, no-cache, changed query, add/delete/ignore changes,
same-size edits with restored mtime, failed-answer recovery and cache clear.
The named filesystem gate also passed the installed wide/deep plain-root and
nested-repository fixture with excluded sentinels and unreadable source.

Independent Codex review found two confirmed remaining failure-path defects:
authentication did not abort a sibling retry delay, and a timeout of the shell
pipeline could leave descendants holding pipes. The evaluator now interrupts both
HTTP work and retry sleeps with the shared authentication signal. Test processes
have their own process group, so bounded cleanup covers the whole pipeline.
A subprocess probe verified descendant pipes close on group termination.
The reviewer could not bind localhost in its sandbox; its in-memory/subprocess
probes were reproduced by the parent, whose Docker HTTP gate passed.

The focused Docker gateway/retrieval/selection gate passes 22 tests and 118
assertions, including preserving already-selected source when cancellation occurs
between declaration groups. Typecheck and lint pass. These failure fixes preserve
the healthy request construction used by the retained Requests checkpoint.

The corrected `head -200` installed journey passes after process-group cleanup.
The named cache gate passes all four selected journeys; the core cache gate passes
eight tests and 45 assertions. The named output gate passes both whole-budget
location preservation and actual head truncation. The exact 1,500-byte candidate
tarball additionally passes installed runtime, source-budget and head checks.
Maintained cohort accounting passes 14 Docker tests, including retained response
costs when transport logs are missing. Missing coverage leaves total Jev cost
unknown while preserving its known subtotal; Sol scoring is unchanged.

## Full deterministic closeout gate

`bun run verify` passed on the integrated source-budget/native-harness branch:
62 Bun tests (402 assertions), 15 Node parser tests, three release-validator tests,
14 maintained runner tests, and all 20 installed journeys. Typecheck and lint also
passed. Installed containers now have CPU/memory/process ceilings and dropped
capabilities, matching the spec's bounded test-isolation requirement. The native
smoke uses the same portable journeys; the parser selector retains the split
local-command case so its earlier coverage is not lost.

This is deterministic correctness evidence. It does not resolve the known
spike-versus-production context-expansion difference or substitute for the live
cohort quality gate. See [runtime evidence](runtime-verification.md).
