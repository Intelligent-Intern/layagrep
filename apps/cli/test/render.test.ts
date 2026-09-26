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

function allocationFixture(): RetrievalResult {
  return {
    root: "/root",
    query: "q",
    status: "complete",
    issues: [],
    counts: { requests: 1, cacheHits: 0, inspectedFiles: 1 },
    files: [
      {
        path: "model.py",
        contentHash: "hash",
        score: 1,
        roles: [],
        leads: [
          { name: "first", range: { startLine: 5, endLine: 5 }, score: 0.7 },
          { name: "second", range: { startLine: 9, endLine: 9 }, score: 0.9 },
        ],
        selected: [
          { startLine: 5, endLine: 5 },
          { startLine: 9, endLine: 9 },
        ],
        rendered: [
          { startLine: 1, endLine: 1 },
          { startLine: 5, endLine: 5 },
          { startLine: 9, endLine: 9 },
        ],
        excerpts: [
          { range: { startLine: 1, endLine: 1 }, source: "context\n" },
          { range: { startLine: 5, endLine: 5 }, source: "method_a\n" },
          { range: { startLine: 9, endLine: 9 }, source: "method_b\n" },
        ],
        sourceOmitted: false,
      },
    ],
  };
}

test("a bounded packet favors confident declarations but renders retained excerpts in source order", () => {
  const result = allocationFixture();
  const before = structuredClone(result);
  const output = renderResult(result, 18);
  expect(output).not.toContain("\ncontext\n");
  expect(output).toContain("\nmethod_a\n");
  expect(output).toContain("\nmethod_b\n");
  expect(output.indexOf("method_a")).toBeLessThan(output.indexOf("method_b"));
  expect(output).toContain("Source omitted: 1 file(s)");
  expect(output).toContain('"first": 5-5');
  expect(output).toContain('"second": 9-9');
  expect(result).toEqual(before);
});

test("unlimited output retains the complete original packet byte for byte", () => {
  expect(renderResult(allocationFixture(), 0)).toBe(
    'Status: complete\nRoot: "/root"\nRelevant files: 1\nSource omitted: 0 file(s)\n\nReading leads (estimates; source below is evidence):\n- "model.py" — relevant; role uncertain\n  "first": 5-5\n  "second": 9-9\n\nSource (verbatim; ranges may end within declarations):\n\n"model.py":1-1\ncontext\n\n\n"model.py":5-5\nmethod_a\n\n\n"model.py":9-9\nmethod_b\n\n\nEnd context.\n',
  );
});

test("confidence ranking crosses file boundaries without dropping any file or lead", () => {
  const result = allocationFixture();
  result.files.push({
    ...result.files[0]!,
    path: "lower.py",
    score: 0.6,
    leads: [{ name: "decisive", range: { startLine: 20, endLine: 20 }, score: 0.95 }],
    excerpts: [{ range: { startLine: 20, endLine: 20 }, source: "decisive\n" }],
  });
  const output = renderResult(result, 9);
  expect(output).toContain('"lower.py":20-20\ndecisive\n');
  expect(output).not.toContain("\nmethod_b\n");
  expect(output).toContain('"first": 5-5');
  expect(output).toContain('"second": 9-9');
  expect(output).toContain('"decisive": 20-20');
  expect(output.indexOf('- "model.py"')).toBeLessThan(output.indexOf('- "lower.py"'));
  expect(output).toContain("Relevant files: 2");
});

test("optional or partially overlapping leads do not outrank a contained confident declaration", () => {
  const result = allocationFixture();
  result.files[0]!.leads = [
    { name: "optional_context", range: { startLine: 1, endLine: 1 }, score: 0.5 },
    { name: "overlaps_context", range: { startLine: 1, endLine: 4 }, score: 0.99 },
    { name: "first", range: { startLine: 5, endLine: 5 }, score: 0.6 },
  ];
  expect(renderResult(result, 9)).toContain('"model.py":5-5\nmethod_a\n');
});

test("partial-line ranking uses actual byte containment and counts UTF-8 bytes", () => {
  const result = allocationFixture();
  result.files[0]!.excerpts = [
    {
      range: { startLine: 1, endLine: 1 },
      source: "é",
      sourceByteStart: 0,
      sourceByteEnd: 2,
      partial: true,
    },
    {
      range: { startLine: 1, endLine: 1 },
      source: "ß",
      sourceByteStart: 2,
      sourceByteEnd: 4,
      partial: true,
    },
  ];
  result.files[0]!.leads = [
    {
      name: "first_fragment",
      range: { startLine: 1, endLine: 1, sourceByteStart: 0, sourceByteEnd: 2 },
      score: 0.6,
    },
    {
      name: "selected_fragment",
      range: { startLine: 1, endLine: 1, sourceByteStart: 2, sourceByteEnd: 4 },
      score: 0.8,
    },
  ];
  const output = renderResult(result, 2);
  expect(output).toContain("partial excerpt; UTF-8 bytes [2, 4)");
  expect(output).toContain("\nß\n");
  expect(output).not.toContain("\né\n");
  expect(renderResult(result, 1)).not.toContain("\nß\n");
});

test("a partial opposite endpoint does not demote a fully selected whole-line declaration", () => {
  for (const [source, sourceByteStart, range] of [
    ["high()\npart", 0, { startLine: 1, endLine: 1 }],
    ["part\nhigh()\n", 4, { startLine: 2, endLine: 2 }],
  ] as const) {
    const result = allocationFixture();
    result.files[0]!.excerpts = [
      {
        range: { startLine: 1, endLine: 2 },
        source,
        sourceByteStart,
        sourceByteEnd: sourceByteStart + Buffer.byteLength(source),
        partial: true,
      },
      { range: { startLine: 5, endLine: 5 }, source: "low\n" },
    ];
    result.files[0]!.leads = [
      { name: "high", range, score: 0.9 },
      { name: "low", range: { startLine: 5, endLine: 5 }, score: 0.8 },
    ];
    const output = renderResult(result, Buffer.byteLength(source));
    expect(output).toContain(source);
    expect(output).not.toContain("\nlow\n");
  }
});
