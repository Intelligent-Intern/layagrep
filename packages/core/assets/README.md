# Packaged Python helpers

The Python helpers in `python/` are the frozen reference scripts. The standalone
worker executes them with the pinned Pyodide CPython runtime, supplied by the
normal npm dependency. The installed package includes the worker and helpers;
Pyodide includes its interpreter WASM and standard library. Parsing requires no
Python executable or runtime download.

Helpers resolve relative to the worker module, independently of the working
directory. Runtime source provenance and component licenses are retained in the
package's `THIRD_PARTY_NOTICES.txt`; their source copies live in `scripts/licenses/`.
