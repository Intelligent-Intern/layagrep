# README artwork

Generated with the built-in image generation tool for the public README.
The cover illustrates discovery; it is not a literal file tree or CLI screenshot.
The explainer's example code is illustrative. Its benchmark claim comes from the
[retained repeat](../specs/done/jevgrep/assets/variance-repeat.md): 40.70% lower full
Sol cost across ten tasks, including failures, excluding Jev; 7/10 solves versus
8/10 baseline. The image rounds the reduction down to 40%. It does not claim
unchanged quality, faster execution, or general savings.

## Cover prompt

Create a finished wide landscape GitHub README hero image for an open-source developer CLI called "jevgrep", executable "jg". Aspect ratio about 2.4:1. Editorial technical illustration, refined print-like graphic design, warm ivory background, near-black ink, vibrant vermilion and muted blue accents. Strong typographic hierarchy, generous whitespace. Left half large crisp title exactly "jevgrep", smaller subtitle exactly "Find the context. Start coding." and a small terminal pill exactly "jg". Right half an elegant illustrated branching file tree: many small paper/code cards, a few highlighted coral branches leading to a neat small stack of source excerpts. Communicate semantic research through source files, grounded and calm. Flat shapes with slight paper grain, precise thin connectors, no gradients, no robots, no generic AI sparkle, no photos, no fake UI or charts. All text spelled exactly as given. Keep safe margins and very legible at GitHub README width. This is a project header image, not a web page screenshot.

### Final cover edit

Edit this Jevgrep README header while preserving its warm ivory/black/vermilion editorial style, large title, exact subtitle "Find the context. Start coding.", jg terminal pill, and wide composition. Simplify the right-hand file tree into elegant folder and document icons with code represented ONLY by abstract horizontal lines. Remove ALL tiny filename labels, all Rust code and .rs extensions, and replace the three rightmost source cards with clean abstract code lines (no words). Remove the bottom footer "SOURCE CODE × SEMANTIC SEARCH × FASTER PROGRESS" and the bottom-right italic extra tagline entirely. Do not add text. The ONLY text anywhere in the final image must be "jevgrep", "Find the context. Start coding.", and "jg". Keep the core idea: coral highlighted paths through a tree of folders and files flow into selected source cards. Avoid malformed connecting strokes; keep connectors crisp. Beautiful clear header at GitHub README width, no speed claims.

## Explainer prompt

Create a finished landscape explainer graphic for the open-source developer CLI "jevgrep" / "jg", aspect ratio about 1.6:1. Match a premium editorial technical print aesthetic: warm ivory paper, near-black ink, vermilion highlights, muted blue file cards, thin clean connectors, ample whitespace, crisp highly readable typography. Top left small brand "jevgrep". Top main text exactly "40% lower coding-agent cost". Below it smaller exact text "One 10-task SWE-bench repeat". Middle: a clear left-to-right three-step illustrated flow with exact labels "Ask a repo question" then "Jev finds relevant code" then "Agent implements + tests". Use a speech card, branching folder/file tree highlighting qualifying files, then a compact source/code card and checkmark. Below flow a simple text comparison (not a misleading chart): "Baseline $7.62" then "With jg $4.52". Directly below, prominent readable disclosure: "Task solves: 8/10 baseline → 7/10 with jg". Bottom two lines readable, not tiny: "Full Sol task cost, including failed tasks. Jev cost excluded." and "Single repeat on a tuned Python subset. Savings are not guaranteed." Do not claim faster runtime or equal quality. Render all requested text exactly, with clear spacing. Numbers must not be changed. This standalone shareable graphic should explain both what jg does and the scope of its observed cost reduction. No extra logos, no decorative fake text, no gradients, no robot imagery.

### Final explainer edit

Make a small final refinement to this Jevgrep explainer, preserving the entire layout, colors, headline, numbers, solve-rate disclosure, footnotes and all three stage headings exactly. Replace only the question bubble text with "Where is connection pooling configured? I need to add retries." in the same large readable monospaced style. Remove the tiny stray dark speck at the lower-left inside that bubble. In the right-hand example code card, simplify the body to just three large legible monospaced lines: "create_engine(", " pool_size=10,", ")" with the middle line highlighted pale green; preserve its src/db/connection.py header. Increase readability of the central tree's filename labels modestly if possible without overlap. No changes to the benchmark claims or other text.

## Visual review

Final semantic correction prompt: Edit ONLY the text inside the left speech bubble in this image. Replace it with exactly "Where is pooling configured? I need a pool of 10 connections." Keep the font large, monospaced and readable, wrapped naturally within the existing bubble. Remove the stray speck inside the bottom-left of the bubble. Preserve EVERY other pixel as closely as possible: all headings, diagrams, code showing pool_size=10, numbers, benchmark disclosures, colors and layout must remain unchanged.

An independent visual pass checked typography, layout, and benchmark disclosure.
The final edits simplified the example code for readability and matched the
requested pool size to the illustrated implementation. Fine file labels remain secondary at README
width; open the image for detail. The cover is an abstract discovery illustration,
not a literal filesystem. A tiny mark inside the speech bubble is cosmetic.
