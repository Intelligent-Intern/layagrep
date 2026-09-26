# Provider support choices

## Sound — high confidence

### New benchmark plans use schema 4

When a new benchmark cohort is frozen, its plan now includes the exact routing
preload used by the installed CLI. A plan without that file cannot reproduce the
new transport. The plan did not specify how to version this required addition.
New plans use schema 4 so a reader can distinguish them from old schema-3 plans;
old studies continue using their original frozen runners and are never rewritten.
The alternative was to reuse schema 3 while changing its required fields, which
would conceal a real format change. Future tooling must honor this distinction.

This is a benchmark-harness format decision, not a credential migration: existing
saved providerless keys still work as Vercel, exactly as requested.

## Within the specification

Provider presets, single-record authentication, environment removal, legacy-key
handling, cache isolation, retry policy and the external test transport were
already decided by the spec. Internal names and probe layout were delegated.
The shared Node routing fixture preserves the SDK's original body after testing
showed that converting it to a stream obscures 401 errors; that implements the
specified transport contract rather than adding product behavior.
