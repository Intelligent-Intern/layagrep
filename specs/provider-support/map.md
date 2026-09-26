# TypeSafe and OpenRouter support: decision map

Completed explore-unknowns walk, 2026-09-26. Territory inspected at `3cd6dc8`.
This preserves the exploration decisions. The [implementation spec](README.md)
now owns sequencing and verification; no provider implementation or live testing
is claimed here.

## Known knowns

Add native TypeSafe and OpenRouter while retaining Vercel AI Gateway. Use one
TypeSafe-compatible AI SDK adapter for all three, selected through fixed provider
presets. Keep structured state, question wording, thresholds, hierarchy, source
selection and stdout behavior unchanged.

The current [evaluator](../../packages/core/src/gateway.ts) owns requests, retries,
timeouts, cooldown and validation; [retrieval](../../packages/core/src/retrieve.ts)
owns source-freshness hooks. [Cache identity](../../packages/core/src/cache.ts)
already has provider/model fields. [Authentication](../../apps/cli/src/auth.ts)
currently saves one `{apiKey}` record, and [CLI wiring](../../apps/cli/src/index.ts)
passes its key into both search and doctor.

The official [AI SDK TypeSafe adapter](https://github.com/vercel/ai/blob/main/packages/typesafe-ai/src/typesafe-ai-evaluation-model.ts)
maps boolean questions to native `noul` questions and maps answers back to
probabilities. It appends `/systemone`. Documented compatible base URLs for that
adapter are:

| Provider   | Base URL                                   |
| ---------- | ------------------------------------------ |
| Vercel     | `https://ai-gateway.vercel.sh/typesafe/v1` |
| TypeSafe   | `https://api.typesafe.ai/v1`               |
| OpenRouter | `https://openrouter.ai/api/v1`             |

Sources: [Vercel compatibility](https://vercel.com/changelog/ai-gateway-now-supports-typesafe-clients-and-http-api-for-jev),
[TypeSafe API](https://docs.typesafe.ai/api), and
[OpenRouter compatibility](https://openrouter.ai/blog/insights/what-is-jev/).
These are documented contracts, not results from live calls in this walk.

## Known unknowns resolved

| Question                        | Decision and why                                                                                                                                                                 | Closed by                        |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| One or two adapters?            | One TypeSafe-compatible adapter for all providers; configuration selects the service. Verify Vercel parity before replacement.                                                   | User                             |
| Where is the provider selected? | `jg auth` asks for provider first, then key. Searches and doctor always use the saved provider.                                                                                  | User                             |
| Store several accounts?         | One record only. Re-running auth replaces provider and key; no logout or provider-switch command.                                                                                | User                             |
| Invocation overrides?           | No provider, endpoint or model options on search/doctor. Use fixed presets.                                                                                                      | User's simplicity constraint     |
| Environment keys?               | Saved credentials only; do not implicitly read provider key or endpoint environment variables. XDG storage paths remain supported.                                               | User                             |
| Automation?                     | `jg auth --provider <vercel\|typesafe\|openrouter> --stdin` explicitly selects the provider and reads the key without prompting. Require provider for stdin setup.               | Shown workflow                   |
| Legacy credentials?             | If the provider field is absent, interpret the saved key as Vercel without requiring re-authentication or rewriting the file during a search. Invalid present values are errors. | User correction                  |
| Validate during auth?           | Retain save-only auth and separate synthetic `jg doctor`; preserve the previous setup on cancellation or invalid input.                                                          | Existing contract                |
| Automatic fallback?             | Never change providers after failure; retry the selected service under the existing bounded policy, then return honest failure/partial results.                                  | User's fixed-provider constraint |
| Credential storage?             | Retain the same config location, atomic replacement and owner-only permissions; never echo keys.                                                                                 | Existing contract                |

New saved data has this shape (the key below is a placeholder):

```json
{ "provider": "openrouter", "apiKey": "<secret>" }
```

Legacy `{ "apiKey": "<secret>" }` means Vercel. No format-version field, stored
model/URL, multi-account registry or credential migration command is needed.

## Unknown knowns extracted

The intended consumer is a coding agent after a human performs one simple setup
on macOS or Linux. Provider flexibility belongs in setup, not every invocation.
Existing authenticated users should keep working. The user explicitly narrowed
the earlier no-backward-compatibility preference for providerless credentials.

The reviewed interaction is: choose provider, enter a hidden key, save, optionally
run doctor, then use ordinary `jg "question"` commands. Doctor identifies the
saved provider in its result. Missing credentials should direct agents to human
authentication or explicit stdin setup; the skill must stop recommending implicit
`AI_GATEWAY_API_KEY` configuration. Agents continue ordinary discovery when setup
is unavailable rather than collecting secrets in chat.

## Unknown unknowns: findings and verification gates

The sweep covered auth/parser/CLI wiring, evaluator/cache/retrieval, auth and HTTP
tests, installed and reference fixtures, native smoke setup, benchmark runner and
broker, package metadata, and README/skill onboarding.

- **Protocol parity — sharp edge.** [Reference tests](../../test/reference/replay.test.ts)
  pin the old Gateway envelope and exact output. The new wire format moves the
  model into the body and uses `noul`. Normalize only these intentional transport
  differences; preserve state, instructions, question IDs/order, decisions and
  complete stdout. Keep frozen reference files and past results immutable.
- **Retry/freshness coupling — sharp edge.** [Gateway orchestration](../../packages/core/src/gateway.ts)
  classifies some failures by Gateway-specific exception names. Verify equivalent
  handling for the new adapter's errors. SDK retries stay disabled, actual HTTP
  attempts count toward the 50,000 guard, and every retry still revalidates source.
  Preserve shared rate-limit cooldown, cancellation and sibling auth-failure abort.
- **Cache crossover — decided.** Cache identity must include selected provider,
  effective endpoint, model and protocol/policy identity. Do not reuse old-wire
  Vercel answers as proof of new-wire behavior or mix providers' answers.
- **Test and eval routing — sharp edge.** [Installed tests](../../test/installed.test.mjs),
  [native smoke](../../scripts/test-native.mjs), and the maintained
  [benchmark runner](../../evals/implementation/swebench/installed.py)/
  [broker](../../evals/implementation/swebench/gateway_broker.py) rely on Gateway
  environment credentials and its old HTTP path. Adapt their credential setup and
  controlled transport routing without adding public search overrides. Exercise
  all three presets and legacy credentials through the installed CLI. Never rerun
  baselines or edit old frozen study artifacts to make the new harness pass.
- **Observed Jev billing — sharp edge.** The benchmark decoder currently reads
  `providerMetadata.gateway.cost`. A native response may have different or missing
  billing metadata. Preserve available raw observations and report unavailable
  totals as unknown, never zero. Jev remains excluded from scored agent task cost.
- **Model identity and live behavior — OPEN verification.** Provider model names
  and aliases differ, and aliases can change their backing model. The subsequent [research record](research.md) resolves documented model IDs;
  slice 1 still verifies the published adapter response/error contract. Before claiming live support, run bounded synthetic doctor checks
  with each provider's credentials when available. No keys were read and no live
  model calls were made during this walk. Missing access must be reported, not
  replaced with a claim that fixtures prove service access or equal solve quality.

## Superseded implementation handoff

The earlier request to implement directly from this map is superseded by the
[spec README and Next Agent Prompt](README.md#next-agent-prompt). Follow its slice
order and preservation gates. Keep this map as user-decision rationale, not a
competing build plan. No paid benchmark repeat or release version was selected.
