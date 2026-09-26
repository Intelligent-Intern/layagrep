# Implementation choices

Current decisions, ordered by confidence. Superseded experiments belong in the
[restoration evidence](assets/parity-restoration.md). Final closeout must re-audit
this ledger against the shipped state; benchmark acceptance is still open.

## Sound — medium confidence

### Charge benchmark work time separately from waiting for retrieval

When: prospective timing-protocol correction. A search can spend twelve minutes
waiting for Jev, followed by five minutes of coding and tests. The new benchmark
charges five minutes against the agent's fifteen-minute work allowance. A baseline
without Jevgrep still receives fifteen minutes of work. All Sol requests, including
waiting-related messages, remain in the dollar bill. The timer watches the agent's
command-start and command-finish messages; it does not measure exact CPU or provider
time. Other commands running alongside a search count as work, and ambiguous shell
programs receive no waiting credit.

Gap: the user's target excludes timing, but the original wall-clock guard could
make the agent cancel a valid search. Reach: future studies freeze this different
timing instruction and measurement rule explicitly, retain the original baselines,
and never reinterpret old attempts. A separate twenty-four-hour guard stops a
stuck attempt. The task container stays alive until the runner captures evidence
and removes it, so a second container timer cannot cut that process short; a host
crash can still leave an owned container requiring cleanup.

Verdict: sound for the cost/quality objective. Confidence: medium; host-observed
events are a practical measurement boundary, and the changed timing instruction
must remain visible when interpreting comparisons.

### Pin request contents without pretending network arrival order is meaningful

When: reference harness pass. Two file reads can finish in either order in the
accepted spike. The fixture now supplies one initial source excerpt and a separate
reading lead so its follow-up request has stable evidence ordering. The harness
sorts whole independent HTTP requests for comparison, while preserving every field
and every ordered item inside them. The alternative—sorting evidence inside each
request—would hide an input change that could change Jev's answer.

Gap: the spec did not define how to control historical concurrency in the fixture.
Reach: this fixture proves exact request construction, not determinism on every
repository. Production deliberately preserves selection-completion order inside
cross-file evidence: whichever file finishes first contributes its evidence first.
A warm cache can change that order and therefore produce a genuinely new request.
Verdict: sound. Confidence: medium; preserving the measured behavior takes priority
over making requests deterministic.

### Stream directory entries in native order

When: filesystem component integration. A directory can contain more entries than
fit in one page. Its open cursor retains the unread entries instead of loading the
whole directory just to alphabetize it. The caller must keep reading even when a
page contains only excluded names, and must close a cursor when pruning a branch.

Gap: the plan required bounded pages but did not prescribe reader ordering.
Reach: this streaming behavior belongs to the filesystem reader. Retrieval gathers
the pages and alphabetizes entries before constructing requests, preserving the
frozen strategy. It may not treat a page boundary as the end of a directory.
Verdict: sound. Confidence: medium; this does not claim bounded total retrieval
memory for an arbitrarily wide directory.

### Preserve the winner while deferring throughput changes

When: reference restoration. Earlier unverified source-budget changes are
[superseded experiments](assets/parity-restoration.md), not active product choices. A minified file can contain several declarations on
one line; the winning strategy may ask about that line repeatedly under different
declaration names. Combining those questions could change Jev's answers, so this
port keeps them. Separately, saving a cache answer scans existing entries to
enforce the disk limit. A large cache therefore has repeated scanning overhead.

Gap: review found performance costs that are outside the user's current solve-rate
and task-cost acceptance priorities. Reach: the confirmation does not establish
whole-computer throughput or optimal cache maintenance. Verdict: sound for this
confirmation, with medium confidence: retain measured retrieval behavior and
report the cache limitation; test any later optimization as a separately identified
artifact rather than silently changing the candidate being confirmed.

### Isolate bundled CPython in one Node child process

When: Python parity restoration. If query A is parsing source when its caller
cancels, terminate the interpreter process. If query B also has a pending helper
request, replay B's pure parsing request in a replacement process rather than
failing B along with A. The helpers have no repository side effects, so repeating
that parsing does not repeat a user action. An idle interpreter does not keep the
CLI alive and exits when its parent disconnects.

Gap: the spec requires no system Python and cancelable inspection but leaves the
interpreter isolation mechanism open. One Node child process owns the bundled
interpreter in production and Bun-hosted development, avoiding a dependency patch
or separate parser for the development runner.

A helper failure caused by source preserves the reference fallback; a missing
runtime or failed child process remains fatal. Child diagnostics cannot escape the
CLI's output handling. Python counts carriage-return-only line endings as lines, while the reference
caller splits excerpts only at newline characters. Keep those two coordinate
rules distinct on such files; normalizing them would change reference behavior.

Reach: the package gains runtime assets and a child process, but still requires
only Node. Verdict: sound. Confidence: medium. Interpreter version boundaries and footprint
measurements live in [runtime rationale](assets/python-runtime.md).

## Sound — high confidence

### Keep deprecated tooling outside workspace discovery

When: initial implementation checkpoint. The root workspace glob included the old
personal-repository eval package. An ordinary workspace test or install could
therefore discover that package even though its evals are deprecated. The active
workspace now names core and TypeScript config explicitly, and old root eval
commands are removed; historical local files remain available.

Gap: the plan required a cutover but did not specify when workspace discovery
changed. Reach: future packages must be added deliberately. Verdict: sound,
because ordinary development should not invoke deprecated workflows.

### Fix eligibility policy for one reader

When: filesystem component integration. The same reader checks initial previews
and follow-up source reads with one policy. If ignore files change while content
is being read, it checks eligibility again before returning that content. Creating
another reader is required to intentionally change policy.

Gap: method notation in the plan did not settle where policy lived. Reach: callers
cannot accidentally broaden a follow-up upload. Verdict: sound. Confidence: high.

### Revalidate selected evidence before sharing it across files

When: installed retrieval integration. Files can change or become ignored while
Jev evaluates other files. Before each declaration evaluation, check that the target and every cross-file
donor are still eligible and have the same content hash. Remove stale
excerpts and report incomplete results while retaining admitted file locations.

Gap: the spec required fresh snapshots but did not prescribe the per-request
validation point. Reach: an answer can contain fewer excerpts after a concurrent
edit; it will not silently present the saved bytes as current. Verdict: sound.
Confidence: high. This is a bounded snapshot check, not an atomic filesystem lock.

### Keep cache trouble separate from missing retrieval evidence

When: cache integration. An unreadable cache should fall back to the provider.
Report the cache problem as a warning; mark the search incomplete only when an
actual retrieval step fails. Cached entries contain only validated numeric answers.

Gap: the result schema did not distinguish cache warnings from evidence failures.
Reach: callers can trust a complete search even if it ran without persistence.
Verdict: sound. Confidence: high.

### Rebuild the CLI whenever build is requested

When: packaging integration. The bundled CLI includes core source and the canonical
skill outside its package directory. Disable its build cache so a changed skill or
core module cannot yield a stale executable through incomplete cache inputs.

Gap: the spec did not prescribe development build caching. Reach: local builds do
more work; package verification always receives current source. Verdict: sound.
Confidence: high; build caching can be reintroduced with complete input tracking.

### Publish one validated archive and verify it separately after publication

When: release workflow. Match the requested tag to the package version, build and
validate one tarball, then test, dry-run and publish those same bytes. Fetch that
exact registry version in a separate job and compare its integrity before testing
it again. Stable releases use `latest`; prereleases use `next`.

Gap: tag publishing was specified, but artifact identity, prerelease channel and
post-publication retry layout were delegated. Reach: a failed registry check can
be retried without trying to republish an immutable version. Verdict: sound.
Confidence: high. Actual publication still requires a later user-triggered tag.

### Derive dependency notices from the code actually bundled

When: release packaging. Use Bun's emitted-input metadata to collect installed
license notices. Retain a version-specific upstream license for the SDK package
whose npm archive omits it; an unknown missing license fails the build. The user
selected MIT for Jevgrep itself. The externally installed Pyodide distribution
uses separately pinned component notices because emitted JavaScript metadata
cannot discover licenses for its compiled runtime. An upgrade requires reviewing
those notices; it does not inherit the old notice set automatically.

Gap: the spec required licenses but left collection mechanics open. Reach: a
new dependency can require a verified notice update, while ordinary builds need
no network license lookup. Verdict: sound. Confidence: high.

### Share fatal authentication cancellation across a search

When: installed failure acceptance. If one request is rejected for its API key,
other requests using the same key stop, including requests sleeping before a retry.
The evaluator owns one shared cancellation signal; the caller's cancellation
remains distinguishable. Otherwise a sibling could spend its entire retry delay
waiting after the search already knows the key cannot work.

Gap: stopping on global authentication failure was required; the shared signal
and its scope were implementation choices. Reach: future retry paths must obey
the same evaluator cancellation. Verdict: sound. Confidence: high.

### Keep verified partial source when the caller interrupts selection

When: installed failure acceptance. A user can interrupt after some declaration
groups have returned useful source. That interruption ends further work and marks
the result `interrupted`; it does not itself mean the source changed. Actual changed
or newly excluded snapshots still discard their evidence.

Gap: the filesystem interruption and invalidation paths shared a preparation
boundary, so the implementation had to distinguish their effect on retained data.
Reach: partial output remains useful without claiming complete discovery or a
filesystem lock. Verdict: sound. Confidence: high.

### Freeze one installed package across the official cohort

When: maintained benchmark runner. Prepare all ten cells before execution, binding
package, skill, agent inputs, dataset and harness sources. Each cell can execute
once; an abandoned attempt is retained as interrupted. A smaller diagnostic study
cannot satisfy the cohort gate, and the runner has no baseline execution path.

Gap: artifact layout and execution mechanics were delegated. Reach: results from
different candidates cannot be pooled into acceptance; failed attempts and unknown
bills remain visible. Verdict: sound. Confidence: high.

### Reuse installed command journeys for native macOS verification

When: supported-runtime verification. Install a tarball into a temporary npm
prefix, give its process a PATH containing only Node, and drive the same keyless
commands and Python HTTP search used in Docker. Filesystem and failure suites
remain Docker-only. The native result records its actual Node/macOS version.

Gap: the native smoke mechanism was delegated. Reach: portable assertions stay
shared while Linux tool-absence assertions retain their own Docker scope; a Mac
with Python installed cannot accidentally satisfy a runtime dependency through
PATH. Verdict: sound. Confidence: high.
