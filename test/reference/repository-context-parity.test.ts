import { expect } from "bun:test";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { testIfDocker } from "../helpers/docker";
async function run(
  root: string,
  production: boolean,
  name = "test_big",
  startLine = 2,
  largeAnchor = false,
) {
  const requests: unknown[] = [];
  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      expect(new URL(request.url).pathname).toBe("/v4/ai/evaluation-model");
      const body = (await request.json()) as {
        state: {
          items?: Array<{ path: string; kind: string }>;
          relationAnchor?: unknown;
          declarations?: Array<{ name: string; startLine: number }>;
          selectedEvidence?: unknown;
        };
        questions: Record<string, unknown>;
      };
      requests.push(body);
      return Response.json({
        answers: Object.fromEntries(
          Object.keys(body.questions).map((id, i) => [
            id,
            {
              type: "boolean",
              probability: body.state.items
                ? largeAnchor
                  ? body.state.items[i]?.kind === "directory"
                    ? body.state.relationAnchor
                      ? 0.9
                      : 0.1
                    : body.state.items[i]?.path === "Anchor.ts"
                      ? 0.9
                      : 0.1
                  : 0.9
                : body.state.declarations
                  ? !body.state.selectedEvidence &&
                    body.state.declarations[i]?.name === name &&
                    body.state.declarations[i]?.startLine === startLine
                    ? 0.9
                    : 0.1
                  : id === "test"
                    ? 0.9
                    : 0.1,
            },
          ]),
        ),
      });
    },
  });
  try {
    const child = Bun.spawn(
      production
        ? ["node", resolve("apps/cli/dist/bin/index.js"), "large regression", root, "--no-cache"]
        : ["node", "/opt/jevgrep-reference.mjs", "--root", root, "--query", "large regression"],
      {
        env: {
          PATH: process.env.PATH,
          AI_GATEWAY_API_KEY: "fixture",
          AI_GATEWAY_BASE_URL: `http://127.0.0.1:${server.port}/v4/ai`,
        },
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    const [code, stdout, stderr] = await Promise.all([
      child.exited,
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
    ]);
    expect(code).toBe(production && largeAnchor ? 2 : 0);
    expect(stderr).toBe("");
    return { requests, stdout };
  } finally {
    server.stop(true);
  }
}
testIfDocker(
  "pytest suggestions use evaluated 16-line blocks in the full CLI packet",
  async () => {
    const root = await mkdtemp(join(tmpdir(), "jg-pytest-declarations-"));
    try {
      await writeFile(
        join(root, "test_big.py"),
        "import pytest\ndef test_big():\n" +
          Array.from({ length: 30 }, (_, i) => `    value_${i} = "${"x".repeat(1000)}"\n`).join(""),
      );
      const expected = await run(root, false),
        actual = await run(root, true);
      expect(expected.stdout).toContain(
        "Suggested test entry point (not executed): python -m pytest -q 'test_big.py'",
      );
      expect(actual.requests).toEqual(expected.requests);
      expect(actual.stdout).toBe(expected.stdout);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
  120_000,
);

testIfDocker(
  "closing-brace comments preserve frozen source context and follow-up requests",
  async () => {
    const root = await mkdtemp(join(tmpdir(), "jg-closing-comments-"));
    try {
      await writeFile(
        join(root, "target.ts"),
        "export function target() {\n" +
          Array.from({ length: 15 }, (_, i) => ` const value${i} = "${"x".repeat(2000)}";\n`).join(
            "",
          ) +
          Array.from({ length: 20 }, (_, i) => ` // closing comment ${i}\n`).join("") +
          "}\n",
      );
      const expected = await run(root, false, "target", 1),
        actual = await run(root, true, "target", 1);
      expect(expected.stdout).toContain('Source block "target.ts" lines 1-22:');
      expect(actual.requests).toEqual(expected.requests);
      expect(actual.stdout).toBe(expected.stdout);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
  120_000,
);

testIfDocker(
  "large admitted files retain class-anchor discovery but skip bounded source inspection",
  async () => {
    const root = await mkdtemp(join(tmpdir(), "jg-large-anchor-"));
    try {
      await mkdir(join(root, "src/related"), { recursive: true });
      await writeFile(
        join(root, "Anchor.ts"),
        "export class Anchor {\n event() {return true;}\n}\n" +
          ("//" + "x".repeat(1000) + "\n").repeat(1000),
      );
      await writeFile(
        join(root, "src/related/other.ts"),
        "export class Other extends Anchor {\n event(){return false;}\n}\n",
      );
      const expected = await run(root, false, "test_big", 2, true),
        actual = await run(root, true, "test_big", 2, true);
      expect(actual.requests).toEqual(expected.requests);
      expect(actual.requests).toHaveLength(4);
      // Explicit product diagnostics/exit status are the only allowed bound differences.
      const resource = 'Issue: "resource_limit": 1\n',
        inspection = 'Issue: "source_inspection_limit": 1\n';
      expect(actual.stdout).toContain(resource);
      expect(actual.stdout).toContain(inspection);
      expect(actual.stdout.replace(resource, "").replace(inspection, "")).toBe(expected.stdout);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
  120_000,
);
