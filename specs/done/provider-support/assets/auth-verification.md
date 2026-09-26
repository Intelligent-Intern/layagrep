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

jg auth --provider typesafe --stdin  [key supplied privately; exit 0]
jg doctor
Jev connection verified through TypeSafe.
```

Both doctor commands exited 0 with empty stderr. The live probe used an authorized local key, never printed it, and removed its
temporary saved credentials.
The user supplied the two keys in `.env.local`. No OpenRouter key was available;
its live service access remains unverified. No repository source was used in the live check.

## Exact verified reference packet

This is the complete frozen packet matched byte-for-byte by each provider's
production replay; it is not a sample invented for documentation.

[Read the exact stdout bytes](provider-stdout.txt). The text artifact preserves
trailing spaces on numbered blank source lines that Markdown formatters remove.
