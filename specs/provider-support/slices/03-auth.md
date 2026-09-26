# 3. Save a provider and complete the installed journey

**Unlock:** users can choose any supported service once and use ordinary `jg`.
Depends on slice 2. Status: not started.

## API and interaction

The auth module owns `Credentials = {provider: ProviderId; apiKey: string}` and a
single saved-credentials loader replacing `loadApiKey`. Core owns provider IDs and
labels; auth owns config path/key validation and filesystem effects. Search and
doctor pass the loaded record to the same evaluator. No separate resolution tree.

Interactive `jg auth` uses the existing prompt library: select Vercel AI Gateway,
TypeSafe or OpenRouter, then enter the provider's hidden key. Noninteractive auth
requires `--provider` and `--stdin` together; reject unknown IDs, bare `--stdin`,
bare `--provider`, and provider flags on every other command. Errors direct users
to the right setup without printing a key. Both prompt and result use stdout.

Retain the current config location and private atomic replacement. Save only
`{provider, apiKey}` after both inputs validate; cancel/invalid input leaves the
previous record untouched. Preserve the 8 KiB key/input bound, whitespace rules,
0700 directory and 0600 file permissions. Check cancellation before replacement.
No network during auth; successful text names the provider and points to doctor.

Absent provider property normalizes in memory to Vercel. A present invalid value
errors. Reads never rewrite bytes. Remove production API-key/endpoint/model env
overrides and missing-key guidance recommending them. XDG paths continue working.

Doctor retains its synthetic question, identifies the saved provider on success
and actionable failure, and never uploads the user's repository. Search stdout
and research policy remain unchanged. Reauth is the only supported way to replace
the selected service; no per-query switching or failure fallback.

## Installed acceptance

Use real installed npm tarball binaries in the existing Node-only, network-isolated
Docker harness. The preload redirects approved destinations to actual local HTTP;
it does not fake the evaluator. All cases live in normal test entry points:

- For each provider: stdin auth → inspect exact private record → doctor → search
  → repeated cache hit; replace auth with another provider and prove a new call
  using that provider/key. Auth itself makes zero calls.
- Providerless legacy record: doctor/search use Vercel and file bytes stay intact.
  Invalid present provider fails before HTTP, including null and empty string.
- Conflicting environment keys/URLs/models cannot override a valid record;
  environment-only setup cannot authenticate. Missing-credential fixtures use an
  empty isolated config directory, not an empty environment key. No saved key leaks in diagnostics.
- Invalid key/provider, stdin overflow, prompt cancel and SIGINT preserve previous
  bytes and clean temporary credential files. Use a PTY for interactive provider
  ordering, hidden entry and cancellation; it is test tooling, not a runtime
  dependency. Exercise the noninteractive cases through the installed CLI too.
- Retain existing filesystem, source freshness, partial failure, signal/EPIPE,
  stdout/stderr and skill-installer coverage; no alternate provider traffic after
  authentication/network failure.

Expand the native smoke selector and asserted pass count so all new provider
journeys actually execute. Copy the preload in normal/prebuilt Docker paths and
native setup; keep it outside packaged files. The existing package must still run
with Node alone, no host Python/Bun/rg/compiler requirement.

## Onboarding and review

Update root/packaged README, `docs/architecture.md`, help, `.env.example` if obsolete, and the shipped
`skills/jevgrep/SKILL.md` setup section together. Explain provider-first auth,
replacement, legacy saved-key behavior and removal of environment-only setup.
Keep `jg skill` / `npx skills add dzhng/jevgrep --skill jevgrep` installation easy
to find and CLI installation guidance intact. Never ask an agent to request a key
in chat. Preserve the frozen research body, not merely its meaning.

Human review surface: short auth/doctor transcript with fixture keys redacted and
the complete search packet. Save verification in `assets/auth-verification.md`.
Run auth/parser tests, `bun run verify`, format check and native packaged smoke.
For live doctor use isolated saved records and authorized local credentials only;
record provider/date/model when present and success/error without secrets. Clearly
separate unavailable credentials from offline pass results. Missing live access
does not block remaining implementation or authorize a provider fallback.

## Decision budget

Delegated: prompt wording, test PTY tooling and helper layout. Picker order is
Vercel, TypeSafe, OpenRouter; no additional account UX. The documented automation
grammar and saved-data compatibility are fixed. Human feedback can adjust wording
or report a service incompatibility; passing offline evidence permits proceeding
without waiting for approval.
