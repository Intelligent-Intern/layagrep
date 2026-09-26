import { referenceTransport, wireResponse } from "./transport";
import { routeProviderFetch } from "../fixtures/provider-route.mjs";
import { expect } from "bun:test";
import { mkdtemp, mkdir, writeFile, rm, chmod } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { testIfDocker } from "../helpers/docker";
import { retrieve } from "../../packages/core/src/retrieve";
import { createEvaluator, EvaluationFailure } from "../../packages/core/src/evaluator";

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
async function trajectory(
  root: string,
  reference: boolean,
  reverseRelationCompletion = false,
  fault?: "split-once" | "split-exhausted" | "rate-limit",
) {
  const held: Array<{ path: string; response: Response; release: (response: Response) => void }> =
    [];
  const requests: Body[] = [];
  let failedGroup = false;
  const transport = await referenceTransport();
  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      const body = transport.decode(request, await request.json(), !reference) as Body;
      if (body.state.items || body.state.preview) requests.push(body);
      if (body.state.items && fault) {
        if (fault === "rate-limit")
          return Response.json(
            { error: { message: "fixture cooldown" } },
            { status: 429, headers: { "retry-after": "0" } },
          );
        if (
          (!failedGroup && body.state.items.length > 1) ||
          (fault === "split-exhausted" && body.state.items[0]?.path === "other.txt")
        ) {
          failedGroup = true;
          return Response.json(
            { error: { message: "fixture transient failure" } },
            { status: 503 },
          );
        }
      }
      const response = Response.json(
        wireResponse(
          {
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
          },
          !reference,
        ),
      );
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
          env: transport.env(!reference, `http://127.0.0.1:${server.port}`),
          stdout: "pipe",
          stderr: "pipe",
        },
      );
      const [code, stdout, stderr] = await Promise.all([
        child.exited,
        new Response(child.stdout).text(),
        new Response(child.stderr).text(),
      ]);
      expect(stderr).toBe("");
      expect(code).toBe(0);
      if (fault) expect(stdout.includes("discovery incomplete")).toBe(fault !== "split-once");
    } else {
      const signal = new AbortController().signal;
      const result = await retrieve(
        { root, query, signal },
        createEvaluator({
          provider: "vercel",
          apiKey: "fixture",
          fetch: routeProviderFetch(fetch, `http://127.0.0.1:${server.port}`),
          signal,
        }),
      );
      if (fault) expect(result.status).toBe(fault === "split-once" ? "complete" : "incomplete");
    }
    return requests;
  } finally {
    server.stop(true);
    await transport.cleanup();
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

for (const fault of ["split-once", "split-exhausted", "rate-limit"] as const) {
  testIfDocker(
    `navigation ${fault} recovery matches frozen HTTP trajectory`,
    async () => {
      const root = await mkdtemp(join(tmpdir(), "jg-navigation-fault-"));
      try {
        await writeFile(
          join(root, "Anchor.py"),
          "class Anchor:\n    def event(self):\n        return True\n",
        );
        await writeFile(join(root, "other.txt"), "ordinary source\n");
        equalTrajectory(
          await trajectory(root, false, false, fault),
          await trajectory(root, true, false, fault),
        );
      } finally {
        await rm(root, { recursive: true, force: true });
      }
    },
    120_000,
  );
}

testIfDocker(
  "split halves append to the same queue and recovered parents do not mark incomplete",
  async () => {
    const root = await mkdtemp(join(tmpdir(), "jg-split-queue-"));
    try {
      for (const name of ["a", "b", "c", "d", "e"])
        await writeFile(join(root, `${name}.txt`), `${name} source\n`);
      for (const exhaustedLeaf of [false, true]) {
        const groups: string[][] = [];
        let requests = 0;
        const result = await retrieve(
          { root, query, signal: new AbortController().signal },
          {
            get requests() {
              return requests;
            },
            async evaluate(request, options) {
              requests++;
              const items = (request as unknown as Body).state.items;
              if (items) {
                expect(options?.navigation).toBe(true);
                groups.push(items.map((item) => item.path));
                if (items.length > 1) throw new EvaluationFailure("provider", true);
                if (exhaustedLeaf && items[0]!.path === "c.txt")
                  throw new EvaluationFailure("provider");
              }
              return Object.fromEntries(
                Object.keys(request.questions).map((id) => [id, items ? 0.9 : 0.25]),
              );
            },
          },
        );
        expect(groups).toEqual([
          ["a.txt", "b.txt", "c.txt", "d.txt", "e.txt"],
          ["a.txt", "b.txt", "c.txt"],
          ["d.txt", "e.txt"],
          ["a.txt", "b.txt"],
          ["c.txt"],
          ["d.txt"],
          ["e.txt"],
          ["a.txt"],
          ["b.txt"],
        ]);
        expect(result.status).toBe(exhaustedLeaf ? "incomplete" : "complete");
        expect(result.issues).toEqual(exhaustedLeaf ? [{ kind: "provider", count: 1 }] : []);
        expect(result.files.map((file) => file.path)).toEqual(
          exhaustedLeaf
            ? ["a.txt", "b.txt", "d.txt", "e.txt"]
            : ["a.txt", "b.txt", "c.txt", "d.txt", "e.txt"],
        );
      }
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
  120_000,
);

testIfDocker(
  "unavailable directory previews are skipped rather than classified as empty metadata",
  async () => {
    const root = await mkdtemp(join(tmpdir(), "jg-preview-unavailable-"));
    const blocked = join(root, "src/blocked");
    try {
      await writeFile(
        join(root, "Anchor.py"),
        "class Anchor:\n    def event(self):\n        return True\n",
      );
      await mkdir(blocked, { recursive: true });
      await writeFile(join(blocked, "implementation.py"), "def event(): return True\n");
      await chmod(blocked, 0);
      const expected = await trajectory(root, true);
      const actual = await trajectory(root, false);
      equalTrajectory(actual, expected);
      expect(JSON.stringify(actual)).not.toContain("src/blocked");
    } finally {
      await chmod(blocked, 0o700);
      await rm(root, { recursive: true, force: true });
    }
  },
  120_000,
);
