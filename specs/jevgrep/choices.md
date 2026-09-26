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
