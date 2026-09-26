# License sources omitted or abbreviated upstream

`provider-utils-5.0.45.LICENSE` is the Vercel AI repository license at
[the exact provider-utils 5.0.45 tag revision](https://github.com/vercel/ai/blob/08ae5ad05bc12496dd1ffcf64e34419e0831300d/LICENSE).
That npm package declares Apache-2.0 but omits its license file. The override is
version-specific so an upgrade cannot silently reuse an unchecked notice.

`Apache-2.0.txt` contains the [Apache Software Foundation's full license terms](https://www.apache.org/licenses/LICENSE-2.0.txt).
The notice generator retains package copyright notices and includes these terms
when emitted dependencies use Apache-2.0. Builds read these retained sources;
there is no build-time or runtime license download.

## External Python runtime

Pyodide's npm package omits license files and labels itself Apache-2.0, while its
[tagged upstream license](https://github.com/pyodide/pyodide/blob/0.25.1/LICENSE)
is MPL-2.0. The notice generator preserves both records and the actual component
texts; it does not relabel the whole distribution Apache-only. Corresponding
source links are included for the unmodified runtime and its build/CPython patches.

The pinned [build configuration](https://github.com/pyodide/pyodide/blob/0.25.1/Makefile.envs)
identifies CPython 3.11.3 and Emscripten 3.1.46; the
[CPython makefile](https://github.com/pyodide/pyodide/blob/0.25.1/cpython/Makefile)
pins libffi and hiwire. Retained license files come from those exact source
versions. CPython's license documentation preserves its bundled-component
notices; Emscripten's license and system-library notices preserve the runtime
terms. The source URLs are maintained with the notice generator. The separately
installed `base-64` and `ws` packages already carry their own licenses.

Changing the runtime version requires checking these source versions and notices
again. No license text is downloaded during build or execution.
