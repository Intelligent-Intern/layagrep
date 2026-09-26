# Packaged Python parser

The grammar is the unmodified `tree-sitter-python.wasm` from the official
[`tree-sitter-python@0.25.0` npm tarball](https://registry.npmjs.org/tree-sitter-python/-/tree-sitter-python-0.25.0.tgz).
Its SHA-256 is `16108b50df4ee9a30168794252ab55e7c93bfc5765d7fa0aa3e335752c515f47`.
The adjacent MIT license comes from that same archive.

Keep this directory beside the compiled source module's parent. The parser resolves
its grammar from the module location, so installing or running from another working
directory does not change asset lookup. The Web Tree-sitter runtime is an exact npm
dependency with its own WASM and MIT license; it must remain available in the packed
installation. Neither grammar nor runtime is downloaded while inspecting source.
