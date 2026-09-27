import { test } from "node:test";
import assert from "node:assert/strict";
import { inspect } from "../../packages/core/src/source.ts";

test("CPython decorator coordinates and invalid AST syntax retain Python language semantics", async () => {
  const snapshot = (source: string) => ({ path: "sample.py", source, contentHash: "fixture" });
  const decorated = await inspect(snapshot("@(\n    decorator\n)\ndef target():\n    return 1\n"));
  assert.deepEqual(
    decorated.units.map(({ name, range }) => ({ name, ...range })),
    [{ name: "target", startLine: 2, endLine: 5 }],
  );
  for (const source of [
    "def target():\n    del 1\n",
    "value = [x for x in y, z]\n",
    'value = u"a" b"b"\n',
  ]) {
    assert.equal((await inspect(snapshot(source))).fallback, "syntax", source);
  }
});

test("cancelled Python startup and active work recover without losing the next request", async () => {
  const { runPython } = await import("../../packages/core/src/python.ts");
  const first = new AbortController();
  const pending = runPython("inspect", "def first():\n    pass\n", first.signal);
  first.abort();
  await assert.rejects(pending, { name: "AbortError" });
  assert.deepEqual(await runPython("inspect", "def recovered():\n    pass\n"), [
    { name: "recovered", startLine: 1, endLine: 2, ownerHeaders: [] },
  ]);
  const active = new AbortController();
  const parsing = runPython("inspect", "value = 1\n".repeat(500_000), active.signal);
  const timer = setTimeout(() => active.abort(), 20);
  try {
    await assert.rejects(parsing, { name: "AbortError" });
  } finally {
    clearTimeout(timer);
  }
  assert.equal(await runPython("inspect", "def broken():\n    del 1\n"), null);
  assert.deepEqual(await runPython("inspect", "def healthy():\n    pass\n"), [
    { name: "healthy", startLine: 1, endLine: 2, ownerHeaders: [] },
  ]);
});

test("a completed Python helper does not keep the Node process alive", async () => {
  const { spawn } = await import("node:child_process");
  const child = spawn(
    process.execPath,
    [
      "--experimental-strip-types",
      "--input-type=module",
      "-e",
      `import { runPython } from ${JSON.stringify(new URL("../../packages/core/src/python.ts", import.meta.url).href)}; console.log(JSON.stringify(await runPython('inspect', 'def done():\\n    pass\\n')));`,
    ],
    { stdio: ["ignore", "pipe", "pipe"] },
  );
  let output = "",
    errors = "";
  child.stdout.on("data", (chunk) => {
    output += chunk;
  });
  child.stderr.on("data", (chunk) => {
    errors += chunk;
  });
  const timer = setTimeout(() => child.kill("SIGKILL"), 15_000);
  try {
    const code = await new Promise<number | null>((resolve, reject) => {
      child.on("error", reject);
      child.on("exit", resolve);
    });
    assert.equal(code, 0, errors);
    assert.deepEqual(JSON.parse(output), [
      { name: "done", startLine: 1, endLine: 2, ownerHeaders: [] },
    ]);
  } finally {
    clearTimeout(timer);
    child.kill();
  }
});

test("cancelling one query preserves unrelated concurrent Python work", async () => {
  const { runPython } = await import("../../packages/core/src/python.ts");
  const controller = new AbortController();
  const cancelled = runPython("inspect", "value = 1\n".repeat(100_000), controller.signal);
  const independent = runPython(
    "inspect",
    "def retained():\n    pass\n",
    new AbortController().signal,
  );
  controller.abort();
  await assert.rejects(cancelled, { name: "AbortError" });
  assert.deepEqual(await independent, [
    { name: "retained", startLine: 1, endLine: 2, ownerHeaders: [] },
  ]);
});

test("oversized CR-only declarations retain every source byte in bounded units", async () => {
  const { sourceForUnit } = await import("../../packages/core/src/source.ts");
  const source = 'def target():\r    return "' + "x".repeat(25_000) + '"\r';
  const snapshot = { path: "source.py", source, contentHash: "fixture" };
  const result = await inspect(snapshot);
  assert.equal(result.units.map((unit) => sourceForUnit(snapshot, unit)).join(""), source);
  assert.ok(
    result.units.every((unit) => Buffer.byteLength(sourceForUnit(snapshot, unit)) <= 24_000),
  );
});

test(
  "repeated diamond inheritance resolves the same helper without exponential traversal",
  { timeout: 120_000 },
  async () => {
    const { runPython } = await import("../../packages/core/src/python.ts");
    let source = "class Root:\n    def helper(self):\n        return 1\n";
    let parent = "Root";
    for (let i = 0; i < 24; i++) {
      source += `class Left${i}(${parent}): pass\nclass Right${i}(${parent}): pass\nclass Join${i}(Left${i}, Right${i}): pass\n`;
      parent = `Join${i}`;
    }
    source += `class Leaf(${parent}):\n    def target(self):\n        return self.helper()\n`;
    const end = source.trimEnd().split("\n").length;
    const actual = await runPython(
      "calls",
      JSON.stringify({ source, ranges: [{ startLine: end - 1, endLine: end }] }),
    );
    assert.deepEqual(actual, [
      {
        caller: "Leaf.target",
        name: "Root.helper",
        startLine: 2,
        endLine: 3,
        unknownEarlierBases: [],
        ownerHeader: { startLine: 1, endLine: 1 },
      },
    ]);
  },
);
