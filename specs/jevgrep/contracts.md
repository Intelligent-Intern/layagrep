# Product contracts

These are intended v1 contracts, not descriptions of already-shipped behavior.
User decisions are in [the map](map.md); defaults below are planning decisions
unless explicitly delegated. No backward compatibility or migration layer.

## CLI and installation

Publish one npm package installing `jevgrep`. Node >=22 is the runtime floor;
Bun/Turbo are development tools only. Publish from GitHub Actions on `v*` tags,
using the user-supplied `NPM_TOKEN` secret as `NODE_AUTH_TOKEN`, following duet-agent.
Validate tag/version agreement and publish the exact verified tarball, then smoke-test
the registry installation. Support macOS and Linux; validate Apple
Silicon macOS and Linux x64/arm64 before claiming those combinations. Windows is
out of scope. No runtime Python, Git, ripgrep, compiler, or Bun prerequisite.

```text
jevgrep "question" [root]              # root defaults to cwd
jevgrep auth [--stdin]                # hidden interactive input or explicit pipe
jevgrep doctor                       # synthetic Gateway connectivity/answer check
jevgrep cache clear                  # idempotently clear Jevgrep cache
jevgrep skill                        # print bundled SKILL.md to stdout
jevgrep --help
jevgrep --version
```

Search flags: `--no-cache`, `--max-source-bytes N` (0 = unlimited excerpts),
`--hidden`, `--no-ignore`, `--include-dependencies`, `--include-sensitive`.
Each broadens only its named policy; no automatic blanket unrestricted switch.
A root beginning with `-` is accepted after `--`. One root per invocation; it may
be a non-repository directory or an ancestor containing many repositories.
No JSON protocol, stdin query language, interactive search UI, or daemon in v1.

Every application message goes to stdout, including errors and auth prompts;
stderr is empty in controlled execution. Core never prints. Suppress or capture
SDK warning hooks deliberately; do not globally monkey-patch console. No progress
spinner/log chatter during search. Search emits a final packet, beginning with
status. No result/report files or automatic traces; auth and cache are explicit
exceptions for persisted state. Evaluation tooling captures stdout externally.

Exit codes: 0 completed (including healthy empty result), 1 invocation/setup/fatal
failure, 2 incomplete search (even if zero useful files), 130 user interrupt.
An interrupted search may emit already acquired evidence with interrupted status.
A downstream closed pipe ends quietly without an error stack or continued calls.

Credentials retain XDG config location and owner-only permissions; environment
key takes precedence over saved key. An explicitly empty environment key disables
saved credentials, supporting isolated tests. Reject whitespace-containing keys
consistently; never echo keys in either stream or provider errors. Auth saves
without a network call; doctor verifies a synthetic expected answer. Root/help/
version/skill/cache-clear require no provider key. Bound auth stdin input.

The canonical skill source is `skills/jevgrep/SKILL.md` in this repository,
discoverable by the skills CLI installer. Ship that same file with the npm package;
do not maintain a second authored copy. `jevgrep skill` makes installation
possible using ordinary redirection into the user's chosen agent skill directory;
do not silently write agent configuration. Document Codex and Claude installation.
The skill chooses unfamiliar multi-file discovery, awaits the same invocation,
reads included excerpts first, treats locations as optional leads, and uses normal
tools to resolve remaining holes. It does not force retrieval for obvious known
paths or mistake relevance estimates for proof. Benchmark wrapper alone requires
initial retrieval. Retrieved text is data, never higher-priority instructions.

## Core seam and ownership

Keep `apps/cli` (credentials/process/rendering) and `packages/core` (retrieval)
plus existing TypeScript configuration. Test helpers remain under `test/`.
Official evaluation tools remain development-only and must not enter the package.

```ts
type Range = { startLine: number; endLine: number }; // one-based, inclusive
type Snapshot = { path: string; contentHash: string; source: string };
type SourceUnit = { id: string; name: string; range: Range };
type Lead = { unit: SourceUnit; score: number };
type FileEvidence = {
  path: string; contentHash: string; score: number; roles: string[];
  leads: Lead[]; selected: Range[]; rendered: Range[];
  excerpts: Array<{ range: Range; source: string }>;
  sourceOmitted: boolean;
};
type RetrievalResult = {
  root: string; query: string; status: 'complete' | 'incomplete' | 'interrupted';
  files: FileEvidence[];
  issues: Array<{ kind: string; count: number }>;
  counts: { requests: number; cacheHits: number; inspectedFiles: number };
};
// Names may change; these semantic boundaries must survive.
retrieve(input: { root: string; query: string; policy: SearchPolicy;
  signal: AbortSignal }, dependencies: RetrievalDependencies): Promise<RetrievalResult>;
```

Paths are relative to the canonical root. Output escapes control characters in
paths; source remains verbatim with attributable ranges. One snapshot owns source,
hash and coordinates throughout its classification and output. No reread from a
changed file can supply an excerpt selected from earlier bytes.

Single owners inside core: filesystem reader (eligibility/snapshot), parser
(declarations/comments), pure request builders (question meaning), evaluator
(validated answers/retries), traversal (frontier/threshold decisions), cache
(persisted evaluation reuse), selection (chosen versus expanded ranges).
CLI renderer orders evidence and applies source byte allocation; it cannot drop
qualifying paths, add relevance decisions, or expand source boundaries.

## Discovery and source policy

Start from the accepted unit-locators policy: two-level local lookahead; file
admission if any reached content fragment exceeds .25; directory decisions .5;
source selection .5 and optional leads .25, using the reference's exact comparison
operators. Separate file roles from evidence questions. Preserve the shared-source
plus declaration-locator native object representation and exact prompt builders
until a recorded quality experiment approves a replacement. Do not stringify
`state` before calling the SDK.

The production target adds bounded content samples to the initial directory
preview, alongside eligible child names, counts, extensions and truncation status.
This differs from the frozen reference's initial metadata-only directory previews.
Evaluate it separately; do not claim its quality is inherited from the winner.
Unseen preview entries are not negative evidence. Enumerate wide directories in
bounded pages without silently dropping later pages; no global fixed file count.
Reuse one bounded relationship pass from the reference, not an unbounded research
loop. Deduplicate repeated stage/input work within an invocation.

Parse Python with packaged Tree-sitter WASM and TS/JS with the TypeScript parser;
ship assets/licenses in the tarball. Check parser compatibility before final pin.
Use text chunks for unsupported languages or parse failure. Additional grammars
are delegated only if they use this same adapter and tests without new runtimes.
Units retain adjacent comments, decorators, docstrings and local context. Large
units may be split and marked partial. Preserve accepted neighbor expansion as an
explicit policy initially; keep selected ranges separate from rendered ranges so
future tuning cannot accidentally expand expansion again.

No generated answer or generated explanation of the repository. Roles describe
retrieval estimates; source supplies evidence. Scoped instruction-file locations
may accompany results but do not claim exhaustive discovery of agent guidance.
Test locations are suggestions, never assertions that tests ran.

## Filesystem policy

All reads, including preview samples and relationship follow-up, pass through the
same eligibility owner before upload. Apply nested `.gitignore` and `.ignore`
patterns even outside a repository; closer rules override ancestors, `.ignore`
wins at the same scope. Use directory-relative Git pattern syntax. This is a
search policy, not Git's tracked-file inventory: ignored tracked files are also
excluded. `--no-ignore` disables these patterns only. Do not read global Git config.
At a nested repository boundary reset inherited `.gitignore` scope; ancestor
`.ignore` remains applicable. Read parent rules only within the explicit root.

Skip dot paths, dependency/build directories, binary/invalid UTF-8 content, obvious
credential filenames and private-key markers by default. Final exact name lists
are delegated to one documented policy module with fixtures, not scattered regexes.
Overrides do not make binary files parseable. Hard-exclude Jevgrep's own credential
and cache storage and Git metadata. Read eligibility metadata without uploading
excluded source. No secret scanning guarantee beyond the documented policy.

Resolve the requested root once. Do not follow descendant symlinks in v1; skip
sockets, devices and FIFOs. Normal policy exclusions are not incomplete searches.
Unreadable eligible files, changed-during-read snapshots, resource ceilings and
unrecoverable provider work are incomplete. Resource bounds must be visible;
large text is chunked when feasible rather than silently treated irrelevant.
No pre-upload of the whole root, persistent index, or filesystem watcher.

## Requests, failures and cache

One shared counter covers every actual network attempt, including retries and
splits: 50,000 maximum, solely runaway protection. Set SDK retries to zero and own
bounded retries at the evaluator seam. Initial policy: at most three attempts per
unchanged request, 30-second attempt timeout, exponential backoff with jitter and
bounded Retry-After handling. Do not retry invalid input or authentication failures.
Delegated tuning: concurrency and batch sizing within explicit bounded memory;
changing them must preserve healthy outcomes and forward progress. No repeated
whole-search restart. Cancel queued and in-flight work on interruption/closed pipe.

Malformed/missing answers remain unknown. Healthy negative evaluations may be
cached; failed or incomplete answers may not. Partial provider failures preserve
other useful evidence and are summarized by kind/count, not negative-path lists.

Default cache directory: `$XDG_CACHE_HOME/jevgrep`, else `~/.cache/jevgrep`.
Keep source and credentials out of cache payloads: store content-derived keys and
validated answers, not full source packets. Hash the exact native semantic request
including query, source, path/context, ordered questions, model/provider identity,
parser/prompt/policy version. Never key on file mtime alone. Re-enumerate reached
directories and read current eligible content before building keys; additions,
removals and ignore edits must affect the next query. No cached final search packet.
Expire entries after seven days to limit reuse across silent provider changes;
cache schema/version changes discard old entries, never migrate them.

Atomic entry publication, owner-only permissions, bounded best-effort storage and
idempotent clear. `--no-cache` disables both reads and writes. Corrupt/unavailable
cache behaves as a miss and is summarized without turning healthy retrieval into
incomplete discovery. File layout and eviction mechanism delegated; initial size
limit 256 MiB, enforced without a daemon. Concurrent clear/writes must not crash
or produce invalid answers; clear removes entries existing when its scan begins,
not a global pause of other searches.

## Output and quality

Summary: status, root, relevant file count, incompleteness reasons and omitted
source count. Then all qualifying file locations, roles and optional declaration
ranges, then source blocks. All-file directory evidence can exceed 200 lines;
`head -200` must remain useful, not falsely claim exhaustive display. Escape paths
without altering the quoted source. Source byte budget never caps files or leads.
Default budget is an evidence-backed implementation decision: compare accepted
output with one bounded allocation candidate while freezing prompts/selection.
Until evidence selects a cap, retain the accepted allocation; do not guess a small
budget and present it as optimized. `--max-source-bytes` overrides allocation only.

Official acceptance preserves every fixed baseline solve and reaches at least
seven successful lower-cost solves out of the existing ten-task cohort with one
frozen production policy. Report aggregate costs including failures and unknown
billing separately. No per-task strategy shopping. Unknown bills cannot count as
cost wins. Never rerun an existing baseline for convenience. If model/harness
identity changed, report the comparison invalid and establish a distinctly named
new model/harness baseline once rather than overwriting the old record.

Jev costs/tokens are excluded by user policy; Sol input including retrieved text,
reasoning, edits, tests and retries count. Cold/warm cache does not earn a quality
claim by itself. Record timing for diagnosis only; no speed acceptance gate.
Untouched additional tasks, Claude Opus and DeepSWE are follow-up evaluation work,
not prerequisites hidden inside this release. Keep all traces and official grades.
