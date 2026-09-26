# Protecting implementation spans during packing

The packing change restores Django implementation bodies that the previous preview handoff omitted, without changing file decisions, source previews, inference calls or the source-output budget. Native task improvement remains unproven.

The previous packer round-robins all files together. A query-named header can consume the first slot for a useful file, while another file's large opening preview consumes the space needed for that header's body. The revised packer first distributes query-named source and enclosing context across files, then distributes broad previews from the remaining budget. This is a presentation heuristic; lexical matching does not establish source relevance.

All four completed treatment packets from the [native comparison](preview-native-v48-results.md) were replayed. The previous packer reproduces the recorded source and ordered delivery/omission metadata exactly before the new packer is applied. Every original source span remains either delivered or explicitly omitted, and every delivered byte matches the same pinned source snapshot.

For Django Sol, the revised packet restores the `GenericForeignKey` implementation and prefetch methods. It loses five broader file previews, reducing paths with delivered source from 15 to 10. For Django Opus, it restores the GFK prefetch body and related methods, with delivered-source paths falling from 12 to 9. All admitted file candidates remain available to the CLI manifest, including those with no delivered source; this is not a fixed file-count filter.

Xarray Sol retains seven delivered paths with a different mix of broad windows. Xarray Opus retains the same source spans with changed presentation order. These observations do not establish that all restored context is useful or that displaced context is irrelevant. Actual agent consumption must be measured in the next native comparison.

The regression fails with the previous packer and passes with priority tiers. The integrated CLI fixture still passes source-fidelity, negative-coverage and omission checks. Independent review caught a replay audit that checked rendered source but not omission metadata. The strengthened verifier rejects altered omission metadata while accepting all four recorded packets.

Source-only replay outputs, exact gained/lost spans, source hashes, checks, review and triage are under `evals/runs/swebench/priority-packet-v49/`. No new Jev requests or coding-agent attempts are part of this diagnostic. The [completed native comparison](priority-native-v50-results.md) measures the subsequent task outcomes.
