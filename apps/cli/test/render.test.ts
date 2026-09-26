import { expect, test } from "bun:test";
import type { RetrievalResult } from "@repo/core";
import { renderResult } from "../src/render";

test("a source budget preserves every location and marks omitted source in the summary", () => {
  const result: RetrievalResult = {
    root: "/project",
    query: "behavior",
    status: "incomplete",
    issues: [{ kind: "provider", count: 1 }],
    counts: { requests: 2, cacheHits: 0, inspectedFiles: 2 },
    files: ["first.py", "odd\nname.py"].map((path, i) => ({
      path,
      contentHash: "hash",
      score: 1 - i / 2,
      roles: ["implementation"],
      leads: [{ name: "behavior", range: { startLine: 3, endLine: 3 }, score: 1 }],
      selected: [{ startLine: 3, endLine: 3 }],
      rendered: [{ startLine: 3, endLine: 3 }],
      excerpts: [{ range: { startLine: 3, endLine: 3 }, source: i ? "second()" : "first()" }],
      sourceOmitted: false,
    })),
  };
  const output = renderResult(result, 7);
  expect(output.startsWith("Status: incomplete\n")).toBe(true);
  expect(output).toContain("Source omitted: 1 file");
  expect(output).toContain('"provider": 1');
  expect(output).toContain('"odd\\nname.py"');
  expect(output).not.toContain("odd\nname.py");
  expect(output).toContain('"first.py":3-3\nfirst()\n');
  expect(output).not.toContain("second()");
  expect(output.indexOf('"odd\\nname.py"')).toBeLessThan(output.indexOf("first()"));
  expect(result.files[1]?.sourceOmitted).toBe(false);
});

test("partial source carries byte coordinates without changing its bytes", () => {
  const output = renderResult(
    {
      root: "/root",
      query: "q",
      status: "complete",
      issues: [],
      counts: { requests: 1, cacheHits: 0, inspectedFiles: 1 },
      files: [
        {
          path: "one.ts",
          contentHash: "hash",
          score: 1,
          roles: [],
          leads: [],
          selected: [],
          rendered: [],
          sourceOmitted: false,
          excerpts: [
            {
              range: { startLine: 1, endLine: 1 },
              source: "é",
              partial: true,
              sourceByteStart: 5,
              sourceByteEnd: 7,
            },
          ],
        },
      ],
    },
    0,
  );
  expect(output).toContain("partial excerpt; UTF-8 bytes [5, 7)");
  expect(output).toContain("\né\n");
});
