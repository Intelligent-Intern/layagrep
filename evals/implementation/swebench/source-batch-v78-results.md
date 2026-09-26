# Source batching diagnostic

Grouping adjacent chunks reduces requests, but this small-group experiment does not establish faster full-repository retrieval. Batched context also changes relevance decisions, so request savings must be judged alongside source quality and eventual coding-agent performance.

All eight saved native queries contribute two eligible source files selected by path hash without consulting outcomes. A path-derived offset selects a contiguous group of up to eight chunks from each file. The experiment scores the same 109 chunks individually and in groups, with two repetitions and alternating arm order. These are previously retrieved files, not an unbiased relevance corpus or held-out task set.

| Across both repetitions | Individual chunks | Batched chunks |
| --- | ---: | ---: |
| HTTP requests | 233 | 80 |
| Known / unknown judgments | 217 / 1 | 218 / 0 |
| Summed group completion seconds | 17.25 | 23.77 |

Batching is slower in 24 of 32 paired groups, with 37.8% higher summed completion latency. Each group runs in isolation: an individual-chunk arm can fill eight request slots while a successful batch initially occupies one. The result does not measure throughput across a full repository queue. The integrated follow-up allows eight active batches while keeping navigation, relevance thresholds and report policy unchanged.

Of 217 jointly known judgments, 31 change threshold admission: 24 are added by batching and seven removed. These are context-sensitive decisions, not accuracy labels. The SQLite `_alter_field` chunk implicated in earlier native failures remains admitted in both arms in both repetitions. Additional Sphinx rendering chunks are also admitted; their necessity for the constructor-return-type task is less clear. Neither observation establishes solve rate or precision.

## Recovery and accounting

Both arms share rate-limit recovery. Any outstanding cooldown drains between cells and is recorded separately from retrieval completion latency. HTTP requests and evaluation attempts are counted separately because local validation or authentication failures can occur before network activity.

Independent review of the pre-live revision identified those accounting issues and missing successful-batch coverage. The revised fixtures check reordered multi-unit answers, split recovery, intact rate-limit retry, exhausted cooldown isolation, and SDK failures without HTTP calls. Deliberately breaking answer assignment or cooldown isolation fails the fixture. No live experiment ran on the superseded revision.

Raw registration, inputs, requests, outcomes, fixtures and review resolutions are under `evals/runs/swebench/source-batch-v78/`. The integrated CLI candidate is under `source-batch-v79/`; its independent review found no actionable defects while noting gaps in direct integrated coverage of rate limits, concurrency and guard exhaustion. The complete-repository comparison is registered under `batch-retrieval-v80/`.

Jev tokens and cost are excluded. A useful result must ultimately preserve or improve official solve rate while reducing whole-task time and coding-agent cost.
