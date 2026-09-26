import { referenceTransport, wireResponse } from "./transport";
import { expect } from "bun:test";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { testIfDocker } from "../helpers/docker";

type RequestBody = {
  state: {
    path?: string;
    items?: Array<{ path: string }>;
    declarations?: unknown[];
    selectedEvidence?: Array<{ path: string; startLine: number; endLine: number; source: string }>;
  };
  questions: Record<string, unknown>;
};
const paths = ["a.ts", "b.ts", "c.ts"];
const completionOrder = [...paths].reverse();

async function run(root: string, production: boolean) {
  const requests: Record<string, RequestBody> = {};
  const pending = new Map<string, () => void>();
  const released: string[] = [];
  const transport = await referenceTransport();
  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      const body = transport.decode(request, await request.json(), production) as RequestBody;
      const phase = body.state.items
        ? "discovery"
        : body.state.declarations
          ? body.state.selectedEvidence
            ? "second"
            : "first"
          : "roles";
      const key = `${phase}:${body.state.path ?? "root"}`;
      expect(requests[key]).toBeUndefined();
      requests[key] = body;
      if (phase === "first") {
        await new Promise<void>((release) => {
          pending.set(body.state.path!, release);
          if (pending.size === paths.length) {
            // Release complete responses separately, letting each CLI consume the previous one.
            void (async () => {
              for (const path of completionOrder) {
                released.push(path);
                pending.get(path)!();
                await Bun.sleep(150);
              }
            })();
          }
        });
      }
      return Response.json(
        wireResponse(
          {
            answers: Object.fromEntries(
              Object.keys(body.questions).map((id) => [id, { type: "boolean", probability: 0.9 }]),
            ),
          },
          production,
        ),
      );
    },
  });
  try {
    const child = Bun.spawn(
      production
        ? [
            "node",
            resolve("apps/cli/dist/bin/index.js"),
            "trace event recording",
            root,
            "--no-cache",
          ]
        : [
            "node",
            "/opt/jevgrep-reference.mjs",
            "--root",
            root,
            "--query",
            "trace event recording",
          ],
      {
        env: transport.env(production, `http://127.0.0.1:${server.port}`),
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    const [code, stdout, stderr] = await Promise.all([
      child.exited,
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
    ]);
    expect(code).toBe(0);
    expect(stderr).toBe("");
    expect(released).toEqual(completionOrder);
    return { requests, stdout };
  } finally {
    server.stop(true);
    await transport.cleanup();
  }
}

testIfDocker(
  "full CLI preserves selection-completion order in native second-pass evidence",
  async () => {
    const root = await mkdtemp(join(tmpdir(), "jg-evidence-order-"));
    try {
      for (const [index, path] of paths.entries())
        await writeFile(
          join(root, path),
          `export function record${index}() { return ${index}; }\n`,
        );
      const expected = await run(root, false),
        actual = await run(root, true);
      expect(expected.requests["discovery:root"]!.state.items!.map((item) => item.path)).toEqual(
        paths,
      );
      for (const path of paths) {
        const evidence = expected.requests[`second:${path}`]!.state.selectedEvidence!;
        expect(evidence.map((entry) => entry.path)).toEqual(completionOrder);
        // Neither native evidence arrays nor request fields are normalized.
        expect(actual.requests[`second:${path}`]).toEqual(expected.requests[`second:${path}`]);
      }
      // Concurrent independent requests are indexed by phase/path; their payloads remain exact.
      expect(actual.requests).toEqual(expected.requests);
      expect(actual.stdout).toBe(expected.stdout);
      expect(actual.stdout).toContain("Source block");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
  30_000,
);
