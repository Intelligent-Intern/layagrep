import { expect, test } from "bun:test";
import { selectFile } from "../../packages/core/src/selection";
import type { EvaluationRequest } from "../../packages/core/src/gateway";
import type { Declaration } from "../../packages/core/src/requests";
import { replaySelection } from "./selection-replay";

async function expectParity(
  path: string,
  source: string,
  score: (d: Declaration, pass: number) => number,
) {
  const snapshot = { path, source, contentHash: "same source" },
    query = "target behavior";
  const expected = await replaySelection(path, source, query, score);
  const requests: EvaluationRequest[] = [];
  const evaluator = {
    requests: 0,
    async evaluate(request: EvaluationRequest) {
      requests.push(request);
      const state = request.state as { declarations: Declaration[]; selectedEvidence?: unknown };
      return Object.fromEntries(
        state.declarations.map((d, i) => [`q${i}`, score(d, state.selectedEvidence ? 1 : 0)]),
      );
    },
  };
  const first = await selectFile(snapshot, query, 0.9, evaluator);
  const evidence = first.file.excerpts.map((excerpt) => ({
    path,
    ...excerpt.range,
    source: excerpt.source,
  }));
  const second = await selectFile(
    snapshot,
    query,
    0.9,
    evaluator,
    async () => ({ evidence }),
    first.file,
  );
  expect(expected.partial).toBe(false);
  expect(second.file.rendered).toEqual(expected.ranges);
  expect(second.file.excerpts.map(({ range, source }) => ({ range, source }))).toEqual(
    expected.excerpts,
  );
  expect(requests).toEqual(expected.requests);
  expect(second.file.leads.map((lead) => ({ name: lead.name, ...lead.range }))).toEqual(
    expected.leads,
  );
  return { first, second };
}

test("two-pass Python selection matches the frozen requests, expansion and source bytes", async () => {
  const method = (name: string) =>
    `    def ${name}(self):\n        a = 1\n        b = 2\n        c = 3\n        d = 4\n        e = 5\n        return a + b + c + d + e\n\n`;
  const source =
    "class Example:\n" + ["before", "target", "after", "unrelated", "later"].map(method).join("");
  const { second } = await expectParity("example.py", source, (d, pass) =>
    pass === 0 && d.name === "Example.target" ? 0.9 : 0,
  );
  expect(second.file.selected).toEqual([{ startLine: 10, endLine: 16 }]);
});

test("text fallback preserves the frozen source fragment questions and follow-up evidence", async () => {
  const source = Array.from(
    { length: 180 },
    (_, i) => `document line ${i}: ${"x".repeat(70)}\n`,
  ).join("");
  await expectParity("guide.txt", source, () => 0.9);
});

test("oversized declarations preserve sixteen-line questions and native context groups", async () => {
  const source =
    "def target():\n" +
    Array.from({ length: 80 }, (_, i) => `    value${i} = '${"x".repeat(400)}'\n`).join("");
  await expectParity("large.py", source, (_d, pass) => (pass === 0 ? 0.9 : 0));
});

test("Python context keeps the frozen conservative comment windows", async () => {
  const source =
    "def target():\n    return 1\n\ntext = '''\nnot a Python comment:\n# retained by the source window policy\n# the next line belongs to that same window\n'''\n";
  await expectParity("comments.py", source, (_d, pass) => (pass === 0 ? 0.9 : 0));
});

test("follow-up reading leads retain first-seen order across passes", async () => {
  const source =
    "def earlier():\n    return 1\n\n" + "\n".repeat(10) + "def target():\n    return earlier()\n";
  await expectParity("leads.py", source, (d, pass) =>
    d.name === "target" ? 0.9 : pass === 1 ? 0.4 : 0,
  );
});

test("Python 2 source preserves frozen fallback questions instead of named declarations", async () => {
  const source = 'def target():\n    print "old"\n' + "# padding\n".repeat(600);
  await expectParity("old.py", source, () => 0.9);
});
