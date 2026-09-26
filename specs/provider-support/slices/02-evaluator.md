# 2. Replace the evaluator and prove production parity

**Unlock:** one provider-neutral evaluator preserves the existing search contract.
Depends on slice 1. Status: not started.

## API seam and ownership

Add one core preset owner exposing a `ProviderId` union (`vercel`, `typesafe`,
`openrouter`) and immutable label/baseURL/model/protocol records from research.
Rename `gateway.ts` to `evaluator.ts` and update consumers directly. Keep
`EvaluationRequest`, the retrieval `Evaluator` interface and failure kinds stable.

`createEvaluator` takes explicit `provider: ProviderId`, validated `apiKey`, and
the existing cache/policy/signal/attempt settings. Resolve URL/model internally;
remove the old general baseURL option. A fetch dependency may exist for core
testing, but CLI users get no transport override. Always pass the key to
`createTypeSafeAi`; never depend on SDK environment discovery.

At this checkpoint CLI search/doctor pass Vercel explicitly: public setup remains
Vercel-only until slice 3. Remove `AI_GATEWAY_BASE_URL` wiring now, and move
production test routing to slice 1's preload. Slice 3 removes the explicit Vercel
selection when saved credentials become the shared input. Do not add a temporary
provider flag, dual evaluator, wrapper module, or dispatcher registry.

Keep one owner of actual attempts and retries. Cache identity includes provider
ID, effective endpoint, requested model, a native protocol identity and existing
policy/parser/prompt identities. Cache storage/schema/TTL stay unchanged. Old-wire
entries naturally miss; no deletion or migration is necessary.

## Gates and review surface

Implement the failure mapping from the published SDK evidence, preserving the
existing application's behavior rather than copying only old error names:

- SDK `maxRetries: 0`; one fetch increments one request. Guard remains 50,000.
- Existing normal/navigation retry limits, navigation transient split eligibility,
  special 429 handling and shared cooldown. Do not broaden retry policy incidentally.
- Preserve the Node disconnect recovery checked by
  `test/reference/disconnect.test.ts`. Distinguish transport failures from invalid
  JSON/answers; do not classify every status-less exception as transient. Do not
  inherit SDK `isRetryable` wholesale (for example, navigation 409 must not gain
  a new retry/split merely because the adapter marks it retryable).
- 401/403 abort in-flight siblings, cooldown waits and future attempts. User
  cancellation/pipe closure stops work. Retry-time source validation still runs
  after cooldown and before HTTP; invalid source never uploads again.
- Missing/malformed/nonfinite/out-of-range answers remain failure/incomplete,
  never negative evidence. Only validated answers enter cache.
- Prove same-identity cache reuse and misses across provider, endpoint, model and
  protocol identities without making those fields public CLI options.

Apply [the parity contract](../parity.md) through the built production CLI as soon
as the adapter is wired. Keep historical replay on its existing Gateway protocol;
adapt only production setup and strict transport normalization. Keep the manifest,
corpus, historical source and existing `replay.test.ts` assertions unchanged.
Add provider-parameterized production parity cases without replacing the original
Vercel comparison. Every provider must reproduce the same packet under identical
controlled probabilities. Retain selection, source-order, comment and parser gates.

Keep the package build green with the new adapter's actual bundled dependency
notices. If a new upstream package omits a license, use a verified matching
upstream license and record its provenance under the existing notices mechanism;
never disable validation or apply the old version's exception indiscriminately.

Run `bun run test:reference` plus the ordinary evaluator/cache/freshness tests and
`bun run check-types`. Adapt installed Vercel fixture routing in this slice so
`bun run test:installed` remains green; native fixtures share the same transport.
Review the complete stdout packet and a request diff with only allowed transport
changes. Record results in `assets/evaluator-verification.md`.

## Decision budget

Delegated: preset/type naming, error-inspection helper placement and cache protocol
token spelling. Error classification must be justified by slice 1's observations;
the retry policy itself is not delegated. No concurrency serialization, new
retrieval logic or response truncation to pass parity. User feedback could change
the chosen provider architecture; absent that, proceed on the frozen gates.
