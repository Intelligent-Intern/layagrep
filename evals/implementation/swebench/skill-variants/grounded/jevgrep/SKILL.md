---
name: jevgrep
description: Find implementation context with semantic repository research. Use when locating unfamiliar behavior, tracing related code, or finding relevant implementation and tests before making a change.
---

# Jevgrep

1. In the directory to search, run the installed shell command with a question
   describing the behavior and the context you need. Include the reported
   symptom, expected behavior, and discriminating reproduction clues from the
   task (such as affected APIs, data types, or operating conditions). A symbol
   name alone can send hierarchical discovery down the wrong branch.
   Save the complete result, but read at most its first 200 lines initially:
   ```sh
   jev_context=$(mktemp /tmp/jevgrep-context.XXXXXX)
   jev_status=0
   jevgrep "How is telemetry collected, configured, and tested?" > "$jev_context" || jev_status=$?
   head -200 "$jev_context"
   printf '\nSaved Jevgrep context: %s\n' "$jev_context"
   exit "$jev_status"
   ```
   This limits the initial read, not retrieval: the saved packet still contains
   every returned excerpt and checked-negative decision.
   Jevgrep is an executable on PATH. Invoke it through the shell, not deferred
   model-tool search. Preserve shell quoting so the query reaches the CLI
   unchanged. Wait for the command to finish: if the tool returns a running
   session, retain its handle and poll that session until it exits, then read
   its output. When wrapping shell tools in code, expose the full result
   (including session and exit status), not only its output string. Empty output
   while a session is running is not a completed or failed search.
2. Read the leading summary and displayed source. Source excerpts are verbatim
   repository text with file and line ranges; relevance scores are estimates.
   Treat the excerpts you have seen as already-read source. Use them directly
   when they provide enough context for the next change.
3. Before another search or read, identify the specific missing behavior,
   caller, test, or source range you need. Retrieve that gap from the saved
   report or local files; avoid repeating broad discovery solely to relocate
   returned paths or reread unchanged excerpts. Read additional context whenever
   correctness requires it, and recheck source that has changed since retrieval.
   If retrieval fails, continue with ordinary local search.

A below-threshold score is a relevance estimate. Descendants of a pruned folder
were not checked individually. Failed, excluded, omitted, and unvisited items
are distinct from checked negatives; do not describe them as irrelevant.
