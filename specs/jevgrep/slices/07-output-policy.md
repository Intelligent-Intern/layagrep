# Preserve the accepted retrieval packet

Status: verified after preservation fixes and whole-product review
(2026-09-26); live quality belongs to 08.
Depends on: 04–06.

The default is the accepted spike's uncapped source packet: ranked file locations,
reading leads, numbered verbatim source blocks, scoped instruction lookup and
unexecuted pytest suggestions. Source selection includes the reference's bounded
second context expansion. Keep original positive selections separately for
provenance without changing what the reference renders.

The user rejected architecture changes during implementation. The 1,500-byte
experiment and its stopped cohort are [superseded evidence](../assets/parity-restoration.md),
not justification for changing the winning strategy. Explicit user-supplied
`--max-source-bytes` remains a whole-excerpt override; it must preserve file/lead
locations and mark omissions. Do not introduce a new allocation heuristic.

The gate compares production's actual computed native requests and complete
stdout with the frozen reference under identical source, query and model answers.
Template equality alone is insufficient. Compare healthy and recoverable-failure
trajectories; keep request-internal array order and control concurrent completion
where it affects later requests. Verify the canonical skill differs from the
accepted skill only in the executable name, and use the accepted benchmark prompt.

Run the reference/production HTTP corpus and installed `--case output` journeys.
The installed command must still handle `head -200`, byte-bounded partial units,
stdout-only failures and all admitted locations. A green deterministic parity gate
allows a new frozen official cohort; it does not itself prove cost or solve rate.

The restored production HTTP comparisons and all 21 installed journeys pass
in the final default `bun run verify` gate. The preserved output contract passes
both `head -200` and explicit byte-budget checks. The
[preservation matrix](../assets/parity-restoration.md) records the tested behavior
and deliberate product differences.
