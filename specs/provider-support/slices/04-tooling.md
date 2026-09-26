# 4. Preserve maintained eval routing and close verification

**Unlock:** the maintained harness can observe the actual installed product after
environment-based auth is removed. Depends on slice 3. Status: complete; see [verification](../assets/final-verification.md).

## Seam and scope

Update only the maintained `evals/implementation/swebench/installed.py`, broker
and their tests/supporting fixtures. Historical frozen runners, traces, result
files, baseline records and studies are immutable. Do not run an agent benchmark.
The coding-agent inference path remains unchanged; this slice concerns Jev calls.

The existing harness remains Vercel-backed; adding a benchmark provider matrix is
out of scope. Prepare an ordinary saved `{provider: "vercel", apiKey: brokerToken}`
record in the isolated treatment container instead of API-key environment auth.
Reuse the externally injected Node routing seam to send the exact Vercel native
endpoint to model-egress. The broker keeps the real key, validates the permitted
path/model and forwards to Vercel's documented TypeSafe-compatible route. It must
not allow an agent-selected origin or leak real credentials into the container.

Keep the preload/routing configuration harness-owned and include its bytes in
the maintained candidate's freeze/identity inputs. It must not affect unrelated
Codex inference requests. Runtime source bytes, skill and packed artifact remain
the actual candidate; no patched CLI or hidden public env override. Frozen old
studies retain their original broker code rather than adding runtime legacy paths
to the new broker for hypothetical compatibility.

Raw request/response observations remain external to the CLI and exclude auth
headers. Decode available native billing/usage from retained bodies with explicit
schema fixtures. Preserve support in the analysis decoder for historical Gateway
observations, because reading old results is a real consumer. Do not rewrite them.
Count missing/unmatched responses honestly: known subtotal can coexist with an
unknown full total. Zero is valid only when explicitly observed, not a default.
Jev cost/tokens never enter scored coding-agent cost; keep reporting available Jev
observations separately. There is no token-count or timing optimization here.

## Offline verification and final artifact

- Extend maintained Python tests for saved credentials, preload freezing, accepted
  route/model, rejection of wrong targets/tokens, raw capture and billing decode.
  Use local fake upstreams; no paid calls or baseline reruns.
- Check Vercel native `provider_metadata.gateway.cost`/generation ID, historical
  `providerMetadata.gateway.cost`, snake-case usage, missing/invalid billing and
  incomplete request logs. OpenRouter billing fixtures may cover `usage.cost`
  without expanding the benchmark runner to additional providers.
- Run the Python suite through `bun run test`; all normal regression suites must
  still pass. Run `bun run verify` and `bun run format:check` after final changes.
- Pack one final candidate using existing release tooling and record SHA-256.
  Run `bash scripts/test-installed.sh --prebuilt <tarball>` and
  `node scripts/test-native.mjs --prebuilt <tarball>` against those same bytes.
  These are verification operations, not a release/tag/npm publish.
- Review the full change with the repo review workflow and an independent Codex
  review. Record actual gate results and per-provider live-check status in
  `assets/final-verification.md`, then update the README handoff/checklist.

Human review surface: small synthetic receipt showing agent cost and separate
known/unknown Jev observations, plus the final verification record. No newly
measured savings or success-rate claim. Report any live-provider access still
unverified in final delivery.

## Decision budget

Delegated: fixture organization, exact preload mount location and decoder helper
names. Credential replacement and network routing remain external harness
operations; the product API cannot grow to simplify tests. A route requiring a
new product setting is a plan violation to resolve, not an implicit permission.
User feedback could authorize a future benchmark/release, but silence does not.
