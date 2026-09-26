---
name: jevgrep
description: Find implementation context with semantic repository research. Use when locating unfamiliar behavior, tracing related code, or finding relevant implementation and tests before making a change.
---

# Jevgrep

1. In the directory to search, run the installed shell command with a question
   describing the behavior and the context you need. Include the reported
   symptom, expected behavior, and discriminating reproduction clues from the
   task (such as affected APIs, data types, or operating conditions). A symbol
   name alone can send hierarchical discovery down the wrong branch:
   ```sh
   jevgrep "How is telemetry collected, configured, and tested?"
   ```
   Jevgrep is an executable on PATH. Invoke it through the shell, not deferred
   model-tool search. Wait for the command to finish.
2. Read the leading summary: relevant paths, available excerpts, checked-negative
   areas, omissions, and failures. It remains useful when only the beginning of
   stdout fits. Use the saved report or direct local file reads for additional
   context you need; there is no need to load every returned byte.
3. Continue the coding task using the relevant context. Fill gaps with ordinary
   search or a more focused Jevgrep query. If retrieval fails, use local search.

A below-threshold score is a relevance estimate. Descendants of a pruned folder
were not checked individually. Failed, excluded, omitted, and unvisited items
are distinct from checked negatives; do not describe them as irrelevant.
