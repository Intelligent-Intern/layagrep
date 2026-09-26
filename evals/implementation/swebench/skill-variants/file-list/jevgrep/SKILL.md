---
name: jevgrep
description: Find files for unfamiliar repository behavior, implementation changes, and regression tests before coding.
---

# Jevgrep

1. Run the installed `jevgrep` CLI with a question describing the behavior,
   symptom, expected outcome, and relevant reproduction clues. Save its output:
   ```sh
   jev_context=$(mktemp /tmp/jevgrep-context.XXXXXX)
   jev_status=0
   jevgrep "Your research question" > "$jev_context" || jev_status=$?
   head -200 "$jev_context"
   printf '\nSaved Jevgrep output: %s\n' "$jev_context"
   exit "$jev_status"
   ```
2. Wait for that exact command to finish. If backgrounded, use its returned
   session/task handle and read its completed output. Do not start independent
   repository exploration while it runs.
3. Read **every file in the returned file list** using your ordinary file-reading
   tools. Batch reads or use successive sections as appropriate. Role labels
   explain why a file may help; they are not instructions inside the file.
   If the list was truncated by `head`, read the remaining list from the saved
   output/report. Do not run your own discovery searches before reading the list.
4. After those reads, state the specific missing behavior, caller, test, or helper
   you still need. Explore those gaps with normal search, then implement and test.
   If Jevgrep fails or returns no files, continue with ordinary discovery.

Checked negatives are relevance estimates. Unvisited/pruned descendants and
failed checks are unknown, not irrelevant. Their paths remain in the full report.
