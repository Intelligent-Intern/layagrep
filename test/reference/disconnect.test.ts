import { expect } from "bun:test";
import { createServer } from "node:http";
import { resolve } from "node:path";
import { testIfDocker as test } from "../helpers/docker";

async function disconnected(reference: boolean) {
  const bodies: string[] = [];
  const server = createServer(async (request, response) => {
    const chunks: Buffer[] = [];
    for await (const chunk of request) chunks.push(Buffer.from(chunk));
    const body = JSON.parse(Buffer.concat(chunks).toString());
    bodies.push(JSON.stringify(body));
    if (bodies.length === 1) {
      response.destroy();
      return;
    }
    response.writeHead(200, { "content-type": "application/json" });
    response.end(
      JSON.stringify({
        answers: Object.fromEntries(
          Object.keys(body.questions).map((id) => [id, { type: "boolean", probability: 0.05 }]),
        ),
      }),
    );
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Expected fixture port");
  try {
    const query = "research how telemetry records event names",
      root = resolve("test/reference/tree");
    const child = Bun.spawn(
      reference
        ? ["node", "/opt/jevgrep-reference.mjs", "--query", query, "--root", root]
        : ["node", resolve("apps/cli/dist/bin/index.js"), query, root, "--no-cache"],
      {
        env: {
          PATH: process.env.PATH,
          AI_GATEWAY_API_KEY: "fixture",
          AI_GATEWAY_BASE_URL: `http://127.0.0.1:${address.port}/v4/ai`,
        },
        stdout: "pipe",
        stderr: "pipe",
        timeout: 20000,
      },
    );
    const [code, stdout, stderr] = await Promise.all([
      child.exited,
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
    ]);
    return { code, stdout, stderr, bodies: bodies.sort() };
  } finally {
    server.closeAllConnections();
    await new Promise<void>((done) => server.close(() => done()));
  }
}

test("Node HTTP disconnect recovery matches the actual reference transport and packet", async () => {
  const reference = await disconnected(true);
  const production = await disconnected(false);
  expect(reference.code).toBe(0);
  expect(reference.bodies.length).toBeGreaterThan(1);
  expect(production).toEqual(reference);
}, 60000);
