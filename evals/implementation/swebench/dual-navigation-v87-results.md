# Independent related-implementation questions

Adding a separate question about other implementations of the same behavior does not recover the observed SQLite navigation miss. It changes a small number of admissions in the main sample while adding requests and latency. This question variant remains separate from the registered lookahead native benchmark.

Both arms receive identical saved navigation state. The treatment retains the original question and adds an independent related-implementation question for each item. Either valid score above the existing threshold admits the item; rejection requires both scores to be available and below threshold. Missing or invalid answers remain unknown unless the other valid answer already establishes admission. These are independent judgments, not a combined calibrated probability.

The main cohort reuses sixteen previously hash-selected requests from the eight saved queries, with three counterbalanced repetitions. Both arms resolve all 477 item decisions. The original admits 36 items and the dual-question version 39; the difference is not a precision or recall measurement. None of the treatment admissions relies solely on the related-implementation answer: admission changes accompany changes in the original score. Summed case latency rises from 50.42 to 68.41 seconds, and HTTP requests from 114 to 209.

The known failure is reported separately. SQLite remains below threshold in all three repetitions: original direct scores are 0.34, 0.37 and 0.32; treatment direct scores are 0.43, 0.46 and 0.43, and related-implementation scores are 0.26, 0.27 and 0.27. This does not establish irrelevance. It shows that this question formulation does not overcome the gap on these saved inputs.

## Verification boundaries

All 102 registered cases completed with valid clock measurements. The fixtures exercise reordered and noncontiguous identifiers, independent admission decisions, split recovery, rate-limit retries, and local SDK failures without HTTP requests. Valid siblings survive both incomplete answer maps and schema-invalid neighboring answers. Independent review found a missing schema-error recovery path and a weak partial-answer fixture; both were corrected before live calls. Disabling retention now fails the strengthened fixture because re-requested answers change.

Raw inputs, frozen registration, call records, separate-cohort results, mutation checks, and review evidence live under `evals/runs/swebench/dual-navigation-v87/`. This is an adaptive-trace diagnostic, not a holdout or task-level cost/solve-rate comparison. Jev cost and tokens remain excluded under the evaluation policy.
