# Saved-provider verification

2026-09-26. Installed Docker journeys cover Vercel, TypeSafe and OpenRouter:
auth from stdin, provider-specific doctor, search, cache reuse, replacement and
no fallback. They check private storage, ignored environment keys/URLs, invalid
providers/keys, legacy bytes and file identity remaining unchanged. The Docker
PTY test selects OpenRouter, checks hidden entry, and cancels at both prompts;
prior credentials survive and no temporary credential file remains.

All 32 installed Docker tests and all 10 native macOS smoke journeys passed on
the same candidate archive. The native run used Node v24.14.0, darwin/arm64 25.6.0.

## Live check

The actual built CLI ran this sequence with isolated config/cache directories:

```text
jg auth --provider vercel --stdin  [key supplied privately; exit 0]
jg doctor
Jev connection verified through Vercel AI Gateway.
```

Doctor exited 0 with empty stderr. The key came from the authorized local Duet
environment, was never printed, and the temporary credentials were removed.
TypeSafe/OpenRouter keys were unavailable there; live service access for those
providers remains unverified. No repository source was used in the live check.

A fresh smaller-model skill check correctly directed a missing-credential user
to terminal `jg auth`, ignored an OpenRouter environment key, avoided asking for
secrets, and continued ordinary discovery. The initial consultation was invalid:
its instruction prohibited shell commands needed to read the skill. That was
corrected before the fresh check; no product behavior was changed to fit it.

## Exact verified reference packet

This is the complete frozen packet matched byte-for-byte by each provider's
production replay; it is not a sample invented for documentation.

```text
Jevgrep: 3 relevant files.
AGENTS.md lookup (root and returned-file ancestors): none found.
- "src/backend/events.ts" — implementation, caller, test, fixture, helper; selected source and structural context below
  Reading lead source: lines 1-1
  Reading lead BackendTelemetry.recordEvent: lines 4-6
- "src/telemetry.ts" — implementation, caller, test, fixture, helper; selected source and structural context below
  Reading lead Telemetry.recordEvent: lines 3-5
- "tests/telemetry.test.ts" — implementation, caller, test, fixture, helper; selected source and structural context below
  Reading lead source: lines 1-1
  Reading lead testEventName: lines 3-5
End file list.

Source block "src/backend/events.ts" lines 1-8:
1: import { Telemetry } from '../telemetry';
2: // Backends preserve the same event contract.
3: export class BackendTelemetry extends Telemetry {
4:   recordEvent(name: string) {
5:     return super.recordEvent(name);
6:   }
7: }
8:

Source block "src/telemetry.ts" lines 1-7:
1: // Events preserve the caller's name.
2: export class Telemetry {
3:   recordEvent(name: string) {
4:     return { name, recorded: true };
5:   }
6: }
7:

Source block "tests/telemetry.test.ts" lines 1-6:
1: import { Telemetry } from '../src/telemetry';
2: // Regression example: do not rename the caller's event.
3: export function testEventName() {
4:   return new Telemetry().recordEvent('opened').name === 'opened';
5: }
6:

End context.
```
