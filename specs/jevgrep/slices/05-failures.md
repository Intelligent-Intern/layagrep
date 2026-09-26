# Preserve honest results under service and process failures

Status: verified. Depends on: 04. Read [contracts](../contracts.md) first.

## Contract and owner

Evaluator is the only retry/request owner: `evaluate(request, signal) -> validated answers | classified failure`. SDK retries zero; count all actual attempts, including any split. Implement contracts.md defaults and bounded progress. Continue independent useful work after a batch failure, stop on global auth failure, preserve evidence. Distinguish healthy empty results from incomplete zero-result output.

CLI maps complete/incomplete/fatal/interrupted to their specified exit codes. Closed stdout pipe cancels work quietly. No per-request logs or SDK diagnostics leak to stderr. Scope finite resource ceilings and show incompleteness when reached; 50k remains the sole large request runaway guard.

## Human-runnable artifact

Deterministic installed failure matrix.

`bun run test:e2e -- --case failures` prints TAP case/status results; each case asserts its exit code and stdout/stderr contract.

Commands are implementation targets. Add them in this slice; do not imply they
already exist. CLI transcripts replace visual/screenshot gates for this product.

## Verification and verdict

HTTP fixture injects 429, Retry-After, 500, hangs, disconnects, invalid JSON, missing answers and auth failure. Verify eventual completion or bounded incomplete result, no retry multiplication, useful evidence retained, cancellation stops requests, no failed classification becomes false, and `head -200` does not leave the process running. Use a test-injected small counter limit to exercise the same 50k code path.

## Delegated decisions

Concurrency, backoff jitter implementation and bounded splitting only where provider limits require it; no infinite global retry.

## Keep green

Installed checkpoint and all prior seam tests; errors never masquerade as negative evidence.

## Review

Show the artifact and summarize deviations. This is a non-blocking review checkpoint:
continue on the evidence if the user does not respond. Feedback that changes the
public contract or acceptance measure requires updating this slice before broadening
implementation. Record new choices and update the README handoff before ending.

The installed failure gate passed ten journeys. Focused Docker HTTP and retrieval tests cover the small request guard, concurrent authentication failure, interrupted retry waits and retained partial source; the corrected process-group head test passes. See [integration evidence](../assets/integration-verification.md).
