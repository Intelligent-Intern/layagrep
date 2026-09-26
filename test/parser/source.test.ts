import { test } from "node:test";
import assert from "node:assert/strict";
import { inspect } from "../../packages/core/src/source.ts";

test("Python preserves decorators, class context and nested declarations", async () => {
  const source =
    '# module\n@decorator\nclass Café:\n    """docs"""\n    value = 1\n    @property\n    def first(self):\n        def nested():\n            return "é"\n        return nested()\n\n    class Inner:\n        def method(self):\n            pass\n    tail = 2\n';
  const result = await inspect({ path: "sample.py", contentHash: "fixture", source });
  assert.equal(result.mode, "python");
  assert.deepEqual(
    result.units.map(({ name, range }) => ({ name, ...range })),
    [
      { name: "Café.context", startLine: 2, endLine: 5 },
      { name: "Café.first", startLine: 6, endLine: 10 },
      { name: "Café.context", startLine: 11, endLine: 11 },
      { name: "Café.Inner.context", startLine: 12, endLine: 12 },
      { name: "Café.Inner.method", startLine: 13, endLine: 14 },
      { name: "Café.context", startLine: 15, endLine: 15 },
    ],
  );
  assert.deepEqual(result.comments, [{ startLine: 1, endLine: 1 }]);
});

test("syntax errors and unsupported source fall back without losing source lines", async () => {
  for (const [path, source, reason] of [
    ["bad.py", "def broken(:\n  return 2\n", "syntax"],
    ["bad.ts", "const = ;", "syntax"],
    ["readme.md", "éé\r\nnext\r\nlast", "unsupported"],
  ]) {
    const result = await inspect(
      { path: path!, source: source!, contentHash: "fixture" },
      { maxUnitBytes: 8 },
    );
    assert.equal(result.mode, "text");
    assert.equal(result.fallback, reason);
    assert.equal(result.units[0]!.range.startLine, 1);
    assert.equal(result.units.at(-1)!.range.endLine, source!.split("\n").length);
  }
});

test("oversized Unicode lines are losslessly split into bounded byte spans", async () => {
  const source = "é漢🙂".repeat(10) + "\r\nend";
  const result = await inspect(
    { path: "large.txt", source, contentHash: "fixture" },
    { maxUnitBytes: 16 },
  );
  const bytes = Buffer.from(source);
  const pieces = result.units.map((unit) =>
    bytes.subarray(unit.sourceByteStart, unit.sourceByteEnd),
  );
  assert.ok(pieces.every((piece) => piece.length <= 16));
  assert.equal(
    pieces.map((piece) => new TextDecoder("utf-8", { fatal: true }).decode(piece)).join(""),
    source,
  );
  assert.ok(result.units.every((unit) => unit.partial));
});

test("selected methods add only their class header and small immediate neighbors", async () => {
  const { pythonNeighborhood } = await import("../../packages/core/src/source.ts");
  const source =
    'class Example:\n    """context"""\n    def first(self):\n        pass\n    @decorator\n    def middle(self):\n        pass\n    def last(self):\n        pass\n';
  assert.deepEqual(
    await pythonNeighborhood({ path: "example.py", source, contentHash: "fixture" }, [
      { startLine: 6, endLine: 7 },
    ]),
    [
      { startLine: 1, endLine: 2 },
      { startLine: 3, endLine: 4 },
      { startLine: 8, endLine: 9 },
    ],
  );
});

test("query previews preserve frozen Python source windows and bytes", async () => {
  const { readFile } = await import("node:fs/promises");
  const { pythonPreview } = await import("../../packages/core/src/source.ts");
  const corpus = JSON.parse(
    await readFile(new URL("./fixtures/python-reference.json", import.meta.url), "utf8"),
  );
  for (const fixture of corpus.cases.filter((f) => f.name !== "python2")) {
    const preview = await pythonPreview(
      { path: fixture.path, source: fixture.source, contentHash: "fixture" },
      fixture.query,
      fixture.budget,
    );
    assert.deepEqual(preview, fixture.reference["content-handoff-v47-spike.py"], fixture.name);
  }
});

test("Python declaration and neighbor ranges agree with frozen helper corpus", async () => {
  const { readFile } = await import("node:fs/promises");
  const { pythonNeighborhood } = await import("../../packages/core/src/source.ts");
  const corpus = JSON.parse(
    await readFile(new URL("./fixtures/python-reference.json", import.meta.url), "utf8"),
  );
  for (const fixture of corpus.cases.filter((f) => !["python2", "invalid"].includes(f.name))) {
    const snapshot = { path: fixture.path, source: fixture.source, contentHash: "fixture" };
    const result = await inspect(snapshot);
    assert.deepEqual(
      result.units.map(({ name, range }) => ({ name, ...range })),
      fixture.reference["source-method-declarations-spike.py"],
      fixture.name,
    );
    assert.deepEqual(
      await pythonNeighborhood(snapshot, fixture.selected),
      fixture.reference["source-neighborhood-spike.py"],
      fixture.name,
    );
  }
});

test("TS/JS uses original source coordinates, comments, and decorator-bearing members", async () => {
  const source =
    '/** header */\r\nexport class Box {\r\n  // getter\r\n  @trace\r\n  get value() { return "🙂"; }\r\n}\r\n';
  const result = await inspect({ path: "box.ts", source, contentHash: "fixture" });
  assert.equal(result.mode, "typescript");
  assert.deepEqual(
    result.units.map(({ name, range }) => ({ name, ...range })),
    [
      { name: "Box.context", startLine: 2, endLine: 3 },
      { name: "Box.value", startLine: 4, endLine: 5 },
    ],
  );
  assert.deepEqual(result.comments, [
    { startLine: 1, endLine: 1 },
    { startLine: 3, endLine: 3 },
  ]);
});

test("Python 2 syntax accepted by the packaged grammar is an explicit parser difference", async () => {
  const source = 'def target():\n    print "old"\n';
  const result = await inspect({ path: "old.py", source, contentHash: "fixture" });
  assert.equal(result.mode, "python");
  assert.deepEqual(
    result.units.map(({ name, range }) => ({ name, ...range })),
    [{ name: "target", startLine: 1, endLine: 2 }],
  );
});

test("trailing Python comments stay separate from AST declaration ends", async () => {
  const source = "class A:\n    def x(self):\n        pass\n    # tail\n";
  const result = await inspect({ path: "a.py", source, contentHash: "fixture" });
  assert.deepEqual(
    result.units.map(({ name, range }) => ({ name, ...range })),
    [
      { name: "A.context", startLine: 1, endLine: 1 },
      { name: "A.x", startLine: 2, endLine: 3 },
    ],
  );
  assert.deepEqual(result.comments, [{ startLine: 4, endLine: 4 }]);
});

test("an f-string expression is implementation, not a Python docstring", async () => {
  const { pythonPreview } = await import("../../packages/core/src/source.ts");
  const source = 'def target():\n    f"compute {value}"\n    return 2\n' + "# filler\n".repeat(120);
  const preview = await pythonPreview(
    { path: "a.py", source, contentHash: "fixture" },
    "target",
    600,
  );
  assert.ok(
    preview.spans.some(
      (span) => span.basis === "query-named implementation" && span.startLine === 2,
    ),
  );
});

test("parse ceiling still returns complete bounded text without losing CRLF", async () => {
  const { sourceForUnit } = await import("../../packages/core/src/source.ts");
  const source = 'def example():\r\n    return "🙂"\r\n';
  const snapshot = { path: "big.py", source, contentHash: "fixture" };
  const result = await inspect(snapshot, { maxParseBytes: 12, maxUnitBytes: 8 });
  assert.equal(result.fallback, "size");
  assert.equal(result.mode, "text");
  assert.equal(result.units.map((unit) => sourceForUnit(snapshot, unit)).join(""), source);
  assert.ok(result.units.every((unit) => Buffer.byteLength(sourceForUnit(snapshot, unit)) <= 8));
});

test("query previews skip parenthesized Python docstrings", async () => {
  const { pythonPreview } = await import("../../packages/core/src/source.ts");
  const source =
    'def target():\n    ("""' +
    "docs ".repeat(250) +
    '""")\n    return "IMPORTANT"\n' +
    "# filler\n".repeat(400);
  const result = await pythonPreview(
    { path: "a.py", source, contentHash: "fixture" },
    "target",
    600,
  );
  assert.ok(
    result.spans.some(
      (span) =>
        span.basis === "query-named implementation" &&
        span.startLine === 3 &&
        span.text.includes("IMPORTANT"),
    ),
  );
});

test("Python identifiers match normalized query names without changing source", async () => {
  const { pythonPreview } = await import("../../packages/core/src/source.ts");
  const source =
    "# opening\n".repeat(40) + 'def K():\n    return "important"\n' + "# filler\n".repeat(100);
  const snapshot = { path: "a.py", source, contentHash: "fixture" };
  assert.equal((await inspect(snapshot)).units[0]!.name, "K");
  for (const query of ["K", "K"]) {
    const result = await pythonPreview(snapshot, query, 600);
    assert.equal(result.matchedDeclarations, 1);
    assert.ok(
      result.spans.some(
        (span) => span.basis === "query-named implementation" && span.text.includes("important"),
      ),
    );
  }
});

test("empty Python suites fall back instead of crashing query previews", async () => {
  const { pythonPreview } = await import("../../packages/core/src/source.ts");
  const source = "def f():\n" + "\n".repeat(700),
    snapshot = { path: "a.py", source, contentHash: "fixture" };
  const result = await pythonPreview(snapshot, "f", 600);
  assert.equal(result.parseUnavailable, true);
  assert.equal(result.matchedDeclarations, 0);
  assert.equal((await inspect(snapshot)).mode, "text");
});

test("TS comments survive token positions without treating string contents as comments", async () => {
  const source =
    'function x() {\n // end\n}\nconst x = /*important*/ 1;\nconst url="https://example.test";\nconst regexp=/https?:\\/\\//;\n';
  const result = await inspect({ path: "comments.ts", source, contentHash: "fixture" });
  assert.deepEqual(result.comments, [
    { startLine: 2, endLine: 2 },
    { startLine: 4, endLine: 4 },
  ]);
});
