# 1. Reproduce the provider protocol

**Unlock:** prove the chosen SDK and controlled routing before touching retrieval.
No dependency on another slice. Status: complete; see [verification](../assets/protocol-verification.md).

## Seam and artifact

Pin the adapter identified in [research](../research.md), inspect its published
artifact, and use `experimental_evaluate` with structured synthetic state and two
boolean questions. Send through the actual adapter to local HTTP fixtures for
each documented preset. Keep the probe test-owned and add it to the ordinary test
entry point; do not add a user-facing probe command or another native client.

Keep `ai@7.0.107` and the historical oracle's resolved dependency closure fixed.
Adding the adapter may add its own provider-utils version; it must not silently
upgrade the oracle through lockfile deduplication. Inspect the new dependencies'
license files too: `scripts/package-notices.mjs` currently has an exact-version
exception for `@ai-sdk/provider-utils@5.0.45`. Record whether the new artifact
supplies its own license before changing that exception.

The test transport seam is a Node `--import` preload outside the npm package.
It observes the original fetch URL, allows only the three exact preset endpoints,
then redirects to a local fixture preserving method, headers, body and abort
signal. Unknown destinations fail closed. No production environment override,
TLS bypass, or user config extension. For core tests the same narrow fetch
redirection can be passed as a dependency. Test expectations remain independent
of the production preset table so a wrong URL/model cannot validate itself.

Save a concise `assets/protocol-verification.md` with package integrity, tested
request/answer/error shapes and reproduction command. It contains synthetic data
only. This is the first human review surface; no live credential is needed.

## Verification and verdict

- Assert exact endpoint suffix, model, bearer key, structured nested state,
  question IDs/order/instructions, boolean-to-noul conversion, and finite answer
  probability conversion. Inspect the pinned SDK's real response schema; provide
  required response fields rather than bypassing its validator.
- Reproduce 401/403, 408, 409, 429 with both Retry-After forms, 5xx, timeout, socket
  disconnect, malformed JSON, missing and out-of-range answers. Record actual
  error status/name/cause available to the application. No assumption that old
  Gateway exception names survive.
- Run through the current Node Docker reference harness. Prove cancellation
  reaches real HTTP and no hidden SDK retries occur when `maxRetries: 0`.
- Prove the preload rejects a wrong original destination and that fixture
  redirects are not baked into the packed product. Keep original reference tests
  green. No live calls or benchmark execution is required for this verdict.

Acceptance: a reproducible adapter contract for all presets and observed error
classification inputs. If the pinned package disagrees with its docs, resolve
that concrete mismatch and update the research record before slice 2. Do not
redesign transport around an assumption or change prompts/thresholds.

## Decision budget

Delegated: probe/fixture filenames, internal helper names, concise transcript
format, and the smallest compatible package pin correction if the inspected
artifact fails the stated API contract (record exact reason/integrity). Presets
are the documented choices, not an invitation to pick newer aliases. Human
feedback can change presentation of the transcript; an API contradiction changes
the plan. Proceed on passing evidence without waiting for sign-off.

An adapter requiring an `ai` upgrade, clamping invalid probabilities, or changing
request meaning fails this slice. Reslice that concrete conflict before proceeding;
do not hide it with a permissive fixture or silently alter the frozen oracle.
