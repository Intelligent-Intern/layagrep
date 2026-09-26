# Implementation choices

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

### Pin request contents without pretending network arrival order is meaningful

When: reference harness pass. Two file reads can finish in either order in the
accepted spike. The fixture now supplies one initial source excerpt and a separate
reading lead so its follow-up request has stable evidence ordering. The harness
sorts whole independent HTTP requests for comparison, while preserving every field
and every ordered item inside them. The alternative—sorting evidence inside each
request—would hide an input change that could change Jev's answer.

Gap: the spec did not define how to control historical concurrency in the fixture.
Reach: this fixture proves exact request construction, not determinism on every
repository. Verdict: sound. Confidence: high. The ordering race remains documented
for the production port to resolve deliberately.

### Stream directory entries in native order

When: filesystem component integration. A directory can contain more entries than
fit in one page. Its open cursor retains the unread entries instead of loading the
whole directory just to alphabetize it. The caller must keep reading even when a
page contains only excluded names, and must close a cursor when pruning a branch.

Gap: the plan required bounded pages but did not prescribe order. Reach: traversal
must sort candidate output separately and may not treat a page boundary as the end
of a directory. Verdict: sound. Confidence: medium; the quality effect of request
ordering remains part of the installed benchmark confirmation.

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

### Bound pending source batches without limiting admitted file counts

When: traversal integration. Flush accumulated source fragments by bytes before
many large files can pile up in memory. Keep candidate metadata for every file
passing the threshold, and revisit snapshots when selecting source.

Gap: the plan delegated batching details. Reach: request grouping differs from the
reference under large inputs and therefore needs the production quality gate.
Verdict: provisional until the frozen task comparison. Confidence: medium.

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
selected MIT for Jevgrep itself.

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
the result incomplete; it does not itself mean the source changed. Actual changed
or newly excluded snapshots still discard their evidence.

Gap: the filesystem interruption and invalidation paths shared a preparation
boundary, so the implementation had to distinguish their effect on retained data.
Reach: partial output remains useful without claiming complete discovery or a
filesystem lock. Verdict: sound. Confidence: high.


### Use available declaration scores to allocate limited source

When: source-budget trial. If a byte cap cannot fit every selected excerpt,
prefer an excerpt containing a declaration Jev scored above 0.5, starting with
the strongest score. Keep all file locations and reading leads, and explicitly
mark source omissions. Equal scores preserve original ordering. A class-context
snippet can be useful despite lacking such a score; this heuristic does not
claim to measure the value of all context.

Gap: numerical source allocation and tie breaks were delegated. Reach: finite
budgets may omit useful surrounding context, so the default stays uncapped until
the official task and complete Sol bill support the candidate. Verdict: sound
as a reversible trial, not an accepted default. Confidence: medium.

### Freeze one installed package across the official cohort

When: maintained benchmark runner. Prepare all ten cells before execution, binding
package, skill, agent inputs, dataset and harness sources. Each cell can execute
once; an abandoned attempt is retained as interrupted. A smaller diagnostic study
cannot satisfy the cohort gate, and the runner has no baseline execution path.

Gap: artifact layout and execution mechanics were delegated. Reach: results from
different candidates cannot be pooled into acceptance; failed attempts and unknown
bills remain visible. Verdict: sound. Confidence: high.
