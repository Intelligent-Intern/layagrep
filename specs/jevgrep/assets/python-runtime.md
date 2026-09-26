# Preserve Python behavior through the original interpreter

The spike's Python helpers define declaration, preview and neighboring-method
behavior through CPython's AST. A different grammar plus hand-written corrections
passed initial examples but failed later review on decorators, invalid syntax and
line endings. These differences change evidence sent to Jev. The selected remedy
is to execute the unchanged helpers with bundled CPython, retaining Node as the
only user prerequisite. Packaging and process isolation may change; extraction
algorithms may not silently change.

## Bounded adoption evidence — 2026-09-26

The offline probe pinned Pyodide 0.25.1, which reports CPython 3.11.3. It compared
all three unchanged helpers against the retained Requests task image's CPython
3.11.5: 162 of 162 outputs matched across 54 inputs. Inputs covered six frozen
corpus cases, 42 existing valid/invalid controls, and six additional decorator,
line-ending and invalid-AST cases. Comparisons did not sort, normalize or adjust
source coordinates. This is finite conformance evidence, not proof that every
input behaves identically across those patch versions.

The probe ran under Node 22.23.3 in a read-only, non-root Docker container with
network disabled and no Python executable. Required standard-library modules
loaded locally without extra packages. Pyodide and its direct dependency files
occupied 12,989,709 bytes. One run measured 2.49 seconds initialization, 0.66 seconds
for all helper calls and about 197 MiB final RSS. These measurements are diagnostic,
not performance promises or limits. Original probe inputs, oracle and replay are
retained locally at `/tmp/jg-pyodide-spike.NPvgLD/`; durable production coverage
belongs in the parser and full-CLI reference tests.

## Runtime boundary and remaining work

Repository source is data supplied to trusted AST helpers, never executed as
Python. Interpreter streams and globals are shared state, so one owner serializes
helper calls. A Node child process is being integrated to isolate synchronous
execution, permit cancellation, and support both the Node product and Bun-hosted
development. The attempted Bun worker-thread loader normalization did not work
and must not ship. Unrelated pending pure helper requests must survive another
query's cancellation; no interpreter pool or second parser is introduced.

Integration is unfinished until merged tests prove unchanged computed requests,
full stdout, cancellation, process exit and offline installed asset loading.
Missing or corrupt runtime assets must fail truthfully without fabricated
excerpts or stderr leakage. Helper conformance alone cannot close those gates,
and none of these checks replaces the frozen downstream quality comparison.

## Upstream provenance

The npm metadata's Apache label does not describe all bundled components. Tagged
Pyodide source uses MPL-2.0; CPython and compiled dependencies carry their own
notices. The package must retain component provenance rather than describe the
whole runtime as Apache-only. Packaging owns those notices and their verification.

- [Pyodide 0.25.1 license](https://github.com/pyodide/pyodide/blob/0.25.1/LICENSE)
- [Pyodide runtime API](https://pyodide.org/en/0.25.1/usage/api/js-api.html)
- [Interruption semantics](https://pyodide.org/en/0.25.1/usage/keyboard-interrupts.html)
