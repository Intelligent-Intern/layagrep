import { expect } from "bun:test";
import { resolve } from "node:path";
export async function replay(mode: "healthy" | "missing" | "invalid" = "healthy") {
  const requests: unknown[] = [];
  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      expect(new URL(request.url).pathname).toBe("/v4/ai/evaluation-model");
      expect(request.headers.get("ai-model-id")).toBe("typesafe-ai/jev");
      expect(request.headers.get("authorization")).toBe("Bearer reference-fixture");
      const body = (await request.json()) as {
        state: {
          items?: Array<{ path: string }>;
          path?: string;
          declarations?: unknown[];
          selectedEvidence?: unknown[];
          relationAnchor?: unknown;
        };
        questions: Record<string, unknown>;
      };
      requests.push(body);
      if (mode === "missing") return Response.json({ answers: {} });
      if (mode === "invalid")
        return Response.json({
          answers: Object.fromEntries(
            Object.keys(body.questions).map((id) => [id, { type: "boolean", probability: 2 }]),
          ),
        });
      return Response.json({
        answers: Object.fromEntries(
          Object.keys(body.questions).map((id, i) => [
            id,
            {
              type: "boolean",
              probability:
                body.state.items?.[i]?.path === "unrelated.md"
                  ? 0.05
                  : body.state.items?.[i]?.path === "src/backend" && !body.state.relationAnchor
                    ? 0.1
                    : body.state.declarations &&
                        !body.state.selectedEvidence &&
                        body.state.path !== "src/telemetry.ts"
                      ? 0.4
                      : 0.9,
            },
          ]),
        ),
        warnings: [{ type: "other", message: "fixture warning" }],
      });
    },
  });
  try {
    const child = Bun.spawn(
      [
        "node",
        "/opt/jevgrep-reference.mjs",
        "--root",
        resolve("test/reference/tree"),
        "--query",
        "research how telemetry records event names",
      ],
      {
        env: {
          PATH: process.env.PATH,
          AI_GATEWAY_API_KEY: "reference-fixture",
          AI_GATEWAY_BASE_URL: `http://127.0.0.1:${server.port}/v4/ai`,
        },
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    const [stdout, stderr, code] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    return {
      requests: requests.map((value) => JSON.stringify(value)).sort(),
      stdout,
      stderr,
      code,
    };
  } finally {
    server.stop(true);
  }
}
