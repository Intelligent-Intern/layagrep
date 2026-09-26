# Single-admission related declarations

A retrospective replay now delivers the previously missing `Mod` declaration in all three repetitions. This is a candidate handoff policy, not evidence of improved task solve rate, coding-agent cost, or elapsed time.

The related-file branch asks whether inspecting a file would help explain the automatically collected caller evidence for the query. When that probability exceeds 0.5, it returns the matching declarations without a second semantic excerpt gate. This differs explicitly from the ordinary source threshold of 0.7. It has no fixed number of selected files.

The selector uses only source already encountered in the recorded SymPy run. It does not enumerate new files or use the known patch. Query-named declarations seed possible name and operator relationships, with at most two hops. These are uncertain source links, not a verified call graph. Absolute module aliases and explicit constructor receivers have limited support; dynamic binding, shadowing and relative imports are not fully resolved. This disposable selector currently handles Python only.

Before the live replay, an independent Sol review found short identifiers being excluded, unrelated methods matching bare names, missed explicit constructor receivers, decorator evidence excluding the call, and unsupported absolute from-import module receivers. Those findings were addressed and exercised with generic fixtures. Because those fixes change candidate selection, this is not a controlled estimate of removing the source gate alone.

The corrected selector examined 93,180 possible edges and produced a 632,499-byte artifact. The prior raw diagnostic graph was 106,904,310 bytes. Caller evidence and declarations are bounded during accumulation, with explicit omissions; no giant graph is serialized first. It selected all 11 linked previously rejected or unscored files for reconsideration. The 100,000-edge diagnostic guard was not reached. The Jev request guard remains 50,000 for runaway prevention; finite traversal and retries are separate controls.

| Related file | Probabilities across three repetitions | Delivered declarations |
| --- | --- | --- |
| `sympy/core/mod.py` | 0.65, 0.63, 0.63 | Complete `Mod` class |
| `sympy/core/logic.py` | 0.59, 0.59, 0.61 | Six logic declarations |
| `sympy/core/decorators.py` | 0.58, 0.55, 0.61 | Three decorator declarations |

Each handoff adds 32,644 bytes of declarations and caller evidence, before its summary and coverage footer. The logic helpers and decorators have not been established as necessary context. Their inclusion is a concrete risk to coding-agent efficiency and must be tested rather than declared useful from the scores alone. Detailed artifacts distinguish previously negative decisions, newly accepted files, checked negatives, unavailable checks and omitted evidence. Unvisited source remains unknown.

Of 33 planned file judgments, 32 completed. There were 12 failed request attempts; `sympy/core/tests/test_containers.py` remained unavailable in the third repetition after its retry. That failure is preserved and is not treated as a negative. No outcome-selected reruns were performed. The result uses the same query as the recorded diagnostic, so it is retrospective rather than held-out evidence.

Raw inputs, registered hashes, review, checks, attempts, output and summaries are under `evals/runs/swebench/related-handoff-v37/`. A reporting-only follow-up adds checked negatives and unavailable checks to the text footer; the originally registered renderer is preserved. No provider scoring or selector inputs changed after inference.

Jev tokens and cost remain excluded from coding-agent cost accounting by user policy. This diagnostic has no coding-agent implementation attempt to price. The next step is integration into the hierarchical spike followed by fresh paired Sol/Opus task runs, with official grading and full Gateway accounting. The existing v31 native results remain the latest task-level evidence; there is still no demonstrated speed-and-cost win on both models at equal or better solve rate.
