# Reuse healthy evaluations without stale context

Status: planned. Depends on: 05. Read [contracts](../contracts.md) first.

## Contract and owner

Core cache owns `get(key)/put(key, validatedAnswer)/clear()`, constructed by CLI with XDG location. Enable by default; exact semantic request hashes and seven-day TTL, answer-only payloads, atomic publication, permissions and 256 MiB bound as specified. Do not persist final packets or source. All live filesystem policy/snapshot work precedes lookup; no traversal shortcut based on old directory decisions.

Cache failures degrade to misses. `--no-cache` bypasses reads and writes. Keep cache policy out of prompt builders and provider transport. An expired schema is disposable, not a migration target.

## Human-runnable artifact

Cold/warm/edit/clear installed journey.

`bun run test:e2e -- --case cache` reports captured request counts and output comparison.

Commands are implementation targets. Add them in this slice; do not imply they
already exist. CLI transcripts replace visual/screenshot gates for this product.

## Verification and verdict

Warm packet matches cold packet under deterministic answers with fewer HTTP requests; edit/add/delete/ignore/query/model/prompt changes invalidate affected requests. Same-size same-mtime edit must not reuse an old answer. Fault recovery must contact provider after failed calls. Cover corrupt files, permissions, concurrent writers, expiry, no-cache and idempotent clear. Check cache contains no source or keys.

## Delegated decisions

On-disk layout and bounded eviction mechanics, not key semantics or failure caching.

## Keep green

All healthy/fault/installed behavior. No daemon or background indexing introduced.

## Review

Show the artifact and summarize deviations. This is a non-blocking review checkpoint:
continue on the evidence if the user does not respond. Feedback that changes the
public contract or acceptance measure requires updating this slice before broadening
implementation. Record new choices and update the README handoff before ending.
