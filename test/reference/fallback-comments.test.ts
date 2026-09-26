import { referenceTransport, wireResponse } from "./transport";
import { expect } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { testIfDocker } from "../helpers/docker";

testIfDocker(
  "syntax fallback preserves frozen comment expansion through complete CLI requests and stdout",
  async () => {
    const root = await mkdtemp(join(tmpdir(), "jg-fallback-comments-"));
    const source =
      "/*\n" + ("comment " + "x".repeat(70) + "\n").repeat(100) + "*/\nconst broken = ;\n";
    const query = "Find source behavior";
    const requests: string[][] = [[], []];
    let arm = 0;
    const transport = await referenceTransport();
    const server = Bun.serve({
      port: 0,
      async fetch(request) {
        const body = transport.decode(request, await request.json(), arm !== 0) as {
          state: { declarations?: Array<{ startLine: number }>; selectedEvidence?: unknown };
          questions: Record<string, unknown>;
        };
        requests[arm]!.push(JSON.stringify(body));
        return Response.json(
          wireResponse(
            {
              answers: Object.fromEntries(
                Object.keys(body.questions).map((id, index) => [
                  id,
                  {
                    type: "boolean",
                    probability: body.state.declarations
                      ? !body.state.selectedEvidence &&
                        body.state.declarations[index]?.startLine === 1
                        ? 0.9
                        : 0
                      : 0.9,
                  },
                ]),
              ),
            },
            arm !== 0,
          ),
        );
      },
    });
    try {
      await writeFile(join(root, "source.ts"), source);
      const outputs: string[] = [];
      for (arm = 0; arm < 2; arm++) {
        const child = Bun.spawn(
          arm === 0
            ? ["node", "/opt/jevgrep-reference.mjs", "--root", root, "--query", query]
            : [
                "node",
                process.env.JEVGREP_PARITY_CLI ?? resolve("apps/cli/dist/bin/index.js"),
                query,
                root,
                "--no-cache",
              ],
          {
            env: transport.env(arm !== 0, `http://127.0.0.1:${server.port}`),
            stdout: "pipe",
            stderr: "pipe",
          },
        );
        const [code, stdout, stderr] = await Promise.all([
          child.exited,
          new Response(child.stdout).text(),
          new Response(child.stderr).text(),
        ]);
        expect(code, stdout).toBe(0);
        expect(stderr).toBe("");
        outputs.push(stdout);
      }
      expect(outputs[0]).toContain('Source block "source.ts" lines 1-104:');
      expect(outputs[0]).toContain("103: const broken = ;");
      expect(requests[1]!.sort()).toEqual(requests[0]!.sort());
      expect(outputs[1]).toBe(outputs[0]);
    } finally {
      server.stop(true);
      await transport.cleanup();
      await rm(root, { recursive: true, force: true });
    }
  },
  120_000,
);
