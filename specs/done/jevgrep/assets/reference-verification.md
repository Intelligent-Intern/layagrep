# Reference verification

2026-09-25: `bun run test:reference` passes four Docker cases, 47 assertions.
The image builds the hash-verified frozen source closure using the pinned SDK,
then replays its Gateway HTTP requests against a loopback responder with external
network disabled. No production credentials are forwarded.

Red evidence: initially missing corpus failed; a subsequent exact-request
comparison failed on the spike's parallel evidence ordering. The fixture was
changed deliberately to one initial excerpt plus a reading lead, preserving all
ordering inside requests. Stable replay now compares exact requests and stdout.
Missing and invalid Gateway answers produce incomplete output instead of healthy
negative evidence. Source-closure and retained skill hashes match their manifest.

Review: one test responder owns HTTP fixtures; the product does not import it.
The historical source closure stays unchanged; parser implementation remains
separate. No personal-repository eval files staged. Lint and formatting pass for
the new harness. Live Jev behavior is a later installed-workflow gate, not proven
by this deterministic responder.
