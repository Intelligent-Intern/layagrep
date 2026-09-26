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
