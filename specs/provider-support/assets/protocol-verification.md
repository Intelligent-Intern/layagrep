# Adapter protocol reproduction

2026-09-26, slice 1 complete. Protocol suite: 18/18 passing on local Node and
Node 22 in network-isolated Docker. Frozen reference replay: 5/5 passing with
all recorded digests, exact requests and complete stdout unchanged. Type checks
pass. Independent Codex review found a possible timeout-test hang; the deadline
now starts after request arrival and the test has a finite outer timeout. The
corrected suite passed in both environments. Shape, diff and documentation review
found no remaining issue.

The published `@ai-sdk/typesafe-ai@3.0.8` implementation matches the request and
answer conversion documented in the research record. `ai@7.0.107` remains fixed;
its provider 4.0.17/provider-utils 5.0.45 dependencies remain separately resolved.
The new adapter uses provider 4.0.18/provider-utils 5.0.49. Their differing versions
do not require upgrading the historical oracle.

Observed through Node HTTP, SDK retries disabled:

| Scenario                                            | Observation                                                                        |
| --------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Each preset, nested state and two ordered questions | One POST, exact state/instructions, `noul` wire types and unchanged probabilities  |
| 401/403/408/409/429/500/503                         | `AI_APICallError`, original HTTP status and response headers retained; one attempt |
| Malformed JSON                                      | `AI_APICallError`, status 200, non-retryable                                       |
| Missing or out-of-range answer                      | `AI_InvalidResponseDataError`; rejected, not clamped                               |
| Socket disconnect                                   | `AI_APICallError`, no HTTP status, `UND_ERR_SOCKET` cause, retryable               |
| Deadline / external abort                           | `TimeoutError` / `AbortError`, no additional attempt                               |
| Unknown destination                                 | Harness rejects before HTTP                                                        |
| Real Node preload                                   | SDK-shaped fetch redirected with original body; unexpected host rejected           |

The test-only redirection preserves SDK URL/init/body rather than rebuilding its
body as a Request stream. A streamed-body prototype failed the 401 probe with
Node's `expected non-null body source` error, obscuring authentication failure;
that prototype was removed. No product transport workaround is needed.

The adapter archive includes its license. Its provider-utils 5.0.49 dependency
omits a license, like 5.0.45. The upstream repository LICENSE at tag revision
`ee3169b3c4880e2abe4d0d7c781243bb81822ec4` is byte-identical to the existing retained
5.0.45 license. Slice 2 must extend the exact-version notice mapping before the
adapter becomes part of the product bundle.

Reproduce with `node --test packages/core/test-node/provider-protocol.mjs`;
the same command runs inside `scripts/test-reference.sh`, and the normal suite
now includes it. No credentials or live model calls were used.

Docker dependency downloads required explicit build proxy arguments using the
existing Docker Desktop proxy (`http.docker.internal:3128`); direct registry
connections timed out. The completed image was then exercised by the unmodified
network-isolated test script. No product configuration was changed.
