# Gateway failure detail

The captured Jev failures are upstream service-unavailable responses. This diagnostic does not find an explicit context-limit or schema rejection, and every tested payload succeeds at least once. It therefore does not justify treating the observed failures as deterministic invalid requests.

The sample deliberately includes previously failed and successful navigation and source requests from one saved native trace. It is a failure-reproduction sample, not an unbiased performance estimate. Three sequential repetitions of each of eight fixed requests produce twenty successes and four HTTP 503 responses. Gateway routing metadata identifies TypeSafe as the failed provider, with one provider attempt and no fallback. The same previously failing requests also succeed unchanged.

This does not rule out size-sensitive availability or an effect of concurrency. The replay runs directly from the host; it does not measure native proxy overhead. The next architectural experiment should retain explicit unknowns and error details rather than infer relevance from transport failure.

## Integrity

All 24 registered calls completed with valid timing and one HTTP attempt each. The SDK fixture checks error-body capture, successful answers, disabled retries, and secret redaction. Independent review found two logging paths outside the redaction helper: SDK warnings and the raw retry header. Both are fixed, and the expanded fixture fails before the fixes and passes afterward. A separate disabled-body-capture mutation also fails.

The input selection, frozen plan, sanitized error chains, routing evidence, and review records live under `evals/runs/swebench/gateway-errors-v84/`. This experiment makes no task solve-rate, agent-cost, or production error-rate claim.
