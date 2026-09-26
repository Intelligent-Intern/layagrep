# Retrieval reference

This fixture captures the accepted spike through the actual Gateway HTTP adapter,
using only synthetic source and fixture credentials. Python is present in this
reference container to execute the historical oracle; it is not a product runtime
prerequisite. The eventual packed-product test must use a separate Node-only image.

The corpus owns exact request contents and source output. Its arrays preserve
ordering within each request; independent HTTP request arrival order is irrelevant.
The responder admits implementation/test files, rejects unrelated text, and offers
the test declaration as a lead before exact-reference follow-up. One initial source
excerpt avoids the historical parallel-reader evidence-order race. This fixture
does not claim the old spike is deterministic on arbitrary trees.

Run `bun run test:reference`. All filesystem and child-process activity occurs in
Docker with isolated home/config/cache and no external network. The source tree is
original synthetic test data, dedicated to this project under CC0-1.0.

`record.ts` exists only to reproduce the oracle corpus deliberately; tests never
update their own expectations. A changed corpus needs an explained oracle or
fixture change, not an instruction to accept whatever production now emits.
Production must consume the same data contract, not import the spike.
