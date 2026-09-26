import { expect } from "bun:test";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { testIfDocker } from "../helpers/docker";
import { retrieve } from "../../packages/core/src/retrieve";
import { createEvaluator } from "../../packages/core/src/gateway";

type Body = {
  state: {
    items?: Array<{ path: string; kind: string }>;
    relationAnchor?: unknown;
    preview?: unknown;
  };
  questions: Record<string, unknown>;
};
function equalTrajectory(actual: unknown, expected: unknown, path = "requests"): void {
  if (JSON.stringify(actual) === JSON.stringify(expected)) return;
  if (actual && expected && typeof actual === "object" && typeof expected === "object") {
    const a = actual as Record<string, unknown>,
      b = expected as Record<string, unknown>;
    expect(Object.keys(a).sort(), path + " keys").toEqual(Object.keys(b).sort());
    for (const key of Object.keys(b)) equalTrajectory(a[key], b[key], `${path}.${key}`);
    return;
  }
  throw new Error(
    `${path}: actual ${JSON.stringify(actual)?.slice(0, 400)} expected ${JSON.stringify(expected)?.slice(0, 400)}`,
  );
}
const query = "Find Anchor implementations and related backends";
async function trajectory(root: string, reference: boolean, reverseRelationCompletion = false) {
  const held: Array<{ path: string; response: Response; release: (response: Response) => void }> =
    [];
  const requests: Body[] = [];
  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      expect(request.headers.get("ai-model-id")).toBe("typesafe-ai/jev");
      const body = (await request.json()) as Body;
      if (body.state.items || body.state.preview) requests.push(body);
      const response = Response.json({
        answers: Object.fromEntries(
          Object.keys(body.questions).map((id, i) => {
            const item = body.state.items?.[i];
            const probability =
              item?.kind === "directory"
                ? body.state.relationAnchor &&
                  item.path.split("/").some((segment) => segment.startsWith("related")) &&
                  !item.path.includes("-cap") &&
                  !item.path.includes("-escaped")
                  ? 0.9
                  : 0.5
                : item?.path.startsWith("Anchor.")
                  ? 0.9
                  : 0.25;
            return [id, { type: "boolean", probability }];
          }),
        ),
      });
      if (
        reverseRelationCompletion &&
        body.state.relationAnchor &&
        body.state.items?.every((item) => item.kind === "directory")
      ) {
        return await new Promise<Response>((release) => {
          held.push({ path: body.state.items![0]!.path, response, release });
          if (held.length === 2) {
            const ordered = [...held].sort((a, b) => b.path.localeCompare(a.path));
            ordered[0]!.release(ordered[0]!.response);
            // Deliberately complete the later branch first, as an asynchronous provider can.
            setTimeout(() => ordered[1]!.release(ordered[1]!.response), 100);
          }
        });
      }
      return response;
    },
  });
  try {
    if (reference) {
      const child = Bun.spawn(
        ["node", "/opt/jevgrep-reference.mjs", "--root", root, "--query", query],
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
      const [code, , stderr] = await Promise.all([
        child.exited,
        new Response(child.stdout).text(),
        new Response(child.stderr).text(),
      ]);
      expect(stderr).toBe("");
      expect(code).toBe(0);
    } else {
      const signal = new AbortController().signal;
      await retrieve(
        { root, query, signal },
        createEvaluator({ apiKey: "fixture", baseURL: `http://127.0.0.1:${server.port}`, signal }),
      );
    }
    return requests;
  } finally {
    server.stop(true);
  }
}

testIfDocker(
  "computed discovery HTTP trajectory matches frozen frontiers, previews, samples and batches",
  async () => {
    const root = await mkdtemp(join(tmpdir(), "jg-discovery-parity-"));
    try {
      await writeFile(
        join(root, "Anchor.py"),
        "class Anchor:\n    def event(self):\n        return True\n",
      );
      // More than a filesystem page: batching must cross page and directory boundaries.
      for (let i = 0; i < 132; i++)
        await writeFile(join(root, `f${String(i).padStart(3, "0")}.txt`), `entry ${i}\n`);
      await writeFile(join(root, "long.txt"), "unicode 🙂 and newline\n".repeat(1600));
      for (const dir of [
        "src/related",
        "src/unrelated",
        "tests/unrelated",
        "src/related/deeper/related",
      ]) {
        await mkdir(join(root, dir), { recursive: true });
        await writeFile(
          join(root, dir, "a.py"),
          'class Other(Anchor):\n    label = "opening"\n' +
            "# middle marker 🙂\n".repeat(1100) +
            "# ending marker\n",
        );
        await writeFile(join(root, dir, "b.txt"), "ordinary content\n");
      }
      const expected = await trajectory(root, true);
      const actual = await trajectory(root, false);
      equalTrajectory(actual, expected);
      expect(actual.some((body) => body.state.relationAnchor)).toBe(true);
      const initial = actual.filter((body) => body.state.items && !body.state.relationAnchor);
      expect(initial.length).toBeGreaterThan(1);
      expect(JSON.stringify(initial)).not.toContain("contentSamples");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
  120_000,
);

testIfDocker(
  "computed discovery preserves directory entry, metadata and escaped-sample caps",
  async () => {
    const root = await mkdtemp(join(tmpdir(), "jg-preview-caps-"));
    try {
      await writeFile(
        join(root, "Anchor.py"),
        "class Anchor:\n    def event(self):\n        return True\n",
      );
      for (const dir of ["src/related-entry-cap", "src/related-name-cap", "src/related-escaped"]) {
        await mkdir(join(root, dir), { recursive: true });
        for (let i = 0; i < 66; i++) {
          const stem = `f${String(i).padStart(3, "0")}`;
          const name = dir.endsWith("name-cap") ? stem + "x".repeat(110) + ".txt" : stem + ".txt";
          await writeFile(
            join(root, dir, name),
            dir.endsWith("escaped") ? '\"\\'.repeat(1000) : `entry ${i}\n`,
          );
        }
      }
      const expected = await trajectory(root, true);
      equalTrajectory(await trajectory(root, false), expected);
      const serialized = JSON.stringify(expected);
      expect(serialized).toContain('"truncated":true');
      expect(serialized).toContain('"contentSamples"');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
  120_000,
);

testIfDocker(
  "computed role previews retain frozen opening limit and Python semantic sampling",
  async () => {
    const root = await mkdtemp(join(tmpdir(), "jg-role-preview-"));
    try {
      const header = "class Anchor:\n    def event(self):\n        return True\n";
      for (const [name, source] of [
        ["Anchor.py", header + "# padding\n".repeat(2100)],
        [
          "Anchor.ts",
          "export class Anchor { event() {return true;} }\n" + "// padding\n".repeat(1600),
        ],
        ["Anchor.py", header + "# padding\n".repeat(1610)],
      ]) {
        await writeFile(join(root, name!), source!);
        equalTrajectory(await trajectory(root, false), await trajectory(root, true));
        await rm(join(root, name!));
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
  120_000,
);

testIfDocker(
  "relationship discovery follows controlled provider completion order",
  async () => {
    const root = await mkdtemp(join(tmpdir(), "jg-completion-order-"));
    try {
      await writeFile(
        join(root, "Anchor.py"),
        "class Anchor:\n    def event(self):\n        return True\n",
      );
      for (const dir of ["src/relatedA", "src/relatedZ"]) {
        await mkdir(join(root, dir), { recursive: true });
        for (let i = 0; i < 30; i++)
          await writeFile(join(root, dir, `f${i}.txt`), '\"'.repeat(2000));
      }
      const expected = await trajectory(root, true, true);
      const actual = await trajectory(root, false, true);
      equalTrajectory(actual, expected);
      const descendant = actual.find((body) =>
        body.state.items?.[0]?.path.startsWith("src/relatedZ/"),
      );
      expect(descendant).toBeDefined();
      const firstDescendant = actual.find(
        (body) => body.state.relationAnchor && body.state.items?.[0]?.kind === "file",
      );
      expect(firstDescendant?.state.items?.[0]?.path.startsWith("src/relatedZ/")).toBe(true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
  120_000,
);
