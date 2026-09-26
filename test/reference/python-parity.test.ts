import { referenceTransport, wireResponse } from "./transport";
import { expect } from "bun:test";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { testIfDocker } from "../helpers/docker";

for (const [name, source] of [
  [
    "parenthesized decorator",
    "@(\n    decorator\n)\ndef target():\n    return 1\n" + "# padding\n".repeat(2100),
  ],
  [
    "backslash decorator",
    "@\\\n    decorator\ndef target():\n    return 1\n" + "# padding\n".repeat(2100),
  ],
  ["CR preview helper failure", "x=1\rdef target(): return 1\r#" + "x".repeat(17_000)],
  ["mixed CR/LF source", "class Target:\r    def target(self):\r        return 1\n# tail\n"],
  ["CR-only method selected", "class Target:\r    def target(self):\r        return 1\r"],
  ["CR-only source", "class Target:\r    def target(self):\r        return 1\r"],
  ["invalid deletion", "def target():\n    del 1\n" + "# padding\n".repeat(2100)],
  ["invalid comprehension", "value = [x for x in y, z]\n" + "# padding\n".repeat(2100)],
  ["invalid mixed strings", 'value = u"a" b"b"\n' + "# padding\n".repeat(2100)],
  ["Python 2 fallback", 'def target():\n    print "old"\n' + "# padding\n".repeat(2100)],
  ["Python 3.12 type alias fallback", "type Alias = int\n" + "# padding\n".repeat(2100)],
  [
    "Python 3.12 generic fallback",
    "def target[T](value: T):\n    return value\n" + "# padding\n".repeat(2100),
  ],
  ["Python 3.12 f-string fallback", 'value = f"{mapping["key"]}"\n' + "# padding\n".repeat(2100)],
  [
    "oversized Python declaration",
    "def target():\n" +
      Array.from({ length: 80 }, (_, i) => `    value${i} = '${"x".repeat(400)}'\n`).join(""),
  ],
])
  testIfDocker(
    `${name} matches the frozen whole-CLI HTTP requests and stdout`,
    async () => {
      const root = await mkdtemp(join(tmpdir(), "jg-python2-parity-"));
      const query = "Find target behavior";
      const requests: string[][] = [[], []];
      let arm = 0;
      const transport = await referenceTransport();
      const server = Bun.serve({
        port: 0,
        async fetch(request) {
          const body = transport.decode(request, await request.json(), arm !== 0) as {
            questions: Record<string, unknown>;
            state?: { declarations?: { name: string }[] };
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
                      probability:
                        name === "CR-only method selected" &&
                        body.state?.declarations?.[index]?.name.endsWith(".context")
                          ? 0.1
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
        await writeFile(join(root, "source.py"), source!);
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
