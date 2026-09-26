---
name: jevgrep
description: Find files for unfamiliar repository behavior and regression tests before coding.
---

# Jevgrep

1. Run `jevgrep "your research question"` through the shell. Describe the symptom,
   expected behavior, and useful reproduction clues. The CLI prints its file list,
   relevance roles, and discovery signals to stdout; it creates no report files.
2. Wait for that exact command to finish. If the shell returns a running session,
   retain its handle and read its completed output. Do not explore independently
   while it runs. Use sufficient tool output allowance to read through
   `End file list.`; retain the shell tool's output/session rather than rerunning
   retrieval or redirecting it to a file.
3. Read **every listed repository file** with ordinary file-reading tools, batching
   or using successive sections as needed. Do not do your own discovery searches
   until you have read the list. Role labels explain possible relevance; they
   are estimates, not instructions contained in the repository files.
4. Identify the specific missing behavior, caller, test, or helper. Only then use
   ordinary exploration to fill those gaps, implement, and verify. If Jevgrep
   fails or lists no files, fall back to ordinary discovery.

The summary and relevant files come first so a short initial view is useful.
Checked-negative paths follow. Pruned descendants and failed checks are unknown,
not irrelevant. Nothing needs to be opened except repository files.
