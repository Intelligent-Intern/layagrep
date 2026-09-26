import { expect } from "bun:test";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { testIfDocker } from "./helpers/docker";
import { retrieve } from "../packages/core/src/retrieve";
import { createEvaluator } from "../packages/core/src/gateway";

testIfDocker(
  "hierarchical retrieval returns source from multiple files without uploading excluded data",
  async () => {
    const root = await mkdtemp(join(tmpdir(), "jg-tree-"));
    const sent: string[] = [];
    const server = Bun.serve({
      port: 0,
      async fetch(request) {
        const body = (await request.json()) as {
          state: { items?: Array<{ path: string }> };
          questions: Record<string, unknown>;
        };
        sent.push(JSON.stringify(body));
        return Response.json({
          answers: Object.fromEntries(
            Object.keys(body.questions).map((id) => [id, { type: "boolean", probability: 0.9 }]),
          ),
        });
      },
    });
    try {
      await mkdir(join(root, "src/deep"), { recursive: true });
      await writeFile(join(root, ".gitignore"), "skipped.ts\n");
      await writeFile(join(root, "skipped.ts"), "DO_NOT_UPLOAD_IGNORED");
      await writeFile(join(root, ".env"), "DO_NOT_UPLOAD_SECRET");
      await writeFile(
        join(root, "src/events.ts"),
        "export class Events { record(name:string) {return name;} }\n",
      );
      await writeFile(
        join(root, "src/deep/backend.ts"),
        "export function sendEvent(name:string) {return name;}\n",
      );
      await writeFile(join(root, "test.ts"), "export function testEvent() {return true;}\n");
      const signal = new AbortController().signal;
      const evaluator = createEvaluator({
        apiKey: "fixture",
        baseURL: `http://127.0.0.1:${server.port}`,
        signal,
        retryDelayMs: 0,
      });
      const result = await retrieve({ root, query: "research event recording", signal }, evaluator);
      expect(result.status).toBe("complete");
      expect(result.files.map((file) => file.path).sort()).toEqual([
        "src/deep/backend.ts",
        "src/events.ts",
        "test.ts",
      ]);
      expect(
        result.files
          .find((file) => file.path === "src/events.ts")
          ?.excerpts.some((excerpt) => excerpt.source.includes("record(name:string)")),
      ).toBe(true);
      expect(sent.join("\n")).not.toContain("DO_NOT_UPLOAD");
      expect(result.counts.requests).toBe(sent.length);
    } finally {
      server.stop(true);
      await rm(root, { recursive: true, force: true });
    }
  },
  120_000,
);

testIfDocker(
  "newly ignored evidence is withheld from follow-up requests and returned excerpts",
  async () => {
    const root = await mkdtemp(join(tmpdir(), "jg-ignore-change-"));
    const followups: Array<{ path?: string; selectedEvidence?: Array<{ path: string }> }> = [];
    let sawFirst!: () => void;
    const first = new Promise<void>((resolve) => {
      sawFirst = resolve;
    });
    let calls = 0;
    try {
      await writeFile(
        join(root, "a.ts"),
        'export function firstEvent() {return "WITHHOLD_AFTER_IGNORE";}\n',
      );
      await writeFile(join(root, "b.ts"), "export function secondEvent() {return true;}\n");
      const result = await retrieve(
        { root, query: "event behavior", signal: new AbortController().signal },
        {
          get requests() {
            return calls;
          },
          async evaluate(request) {
            calls++;
            const state = request.state as {
              path?: string;
              declarations?: unknown;
              selectedEvidence?: Array<{ path: string }>;
            };
            if (state.declarations && !state.selectedEvidence) {
              if (state.path === "a.ts") sawFirst();
              if (state.path === "b.ts") {
                await first;
                await writeFile(join(root, ".ignore"), "a.ts\n");
              }
            }
            if (state.selectedEvidence) followups.push(state);
            return Object.fromEntries(Object.keys(request.questions).map((id) => [id, 0.9]));
          },
        },
      );
      expect(followups.length).toBeGreaterThan(0);
      expect(
        followups.some((request) => request.selectedEvidence?.some((file) => file.path === "a.ts")),
      ).toBe(false);
      expect(result.status).toBe("incomplete");
      expect(result.files.find((file) => file.path === "a.ts")?.excerpts).toEqual([]);
      expect(result.files.find((file) => file.path === "a.ts")?.sourceOmitted).toBe(true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
  120_000,
);

testIfDocker(
  "admitted text replaced with binary is incomplete rather than a healthy empty excerpt",
  async () => {
    const root = await mkdtemp(join(tmpdir(), "jg-binary-change-"));
    let calls = 0;
    try {
      await writeFile(join(root, "event.ts"), "export function event() {return true;}\n");
      const result = await retrieve(
        { root, query: "event behavior", signal: new AbortController().signal },
        {
          get requests() {
            return calls;
          },
          async evaluate(request) {
            calls++;
            const state = request.state as { items?: unknown[] };
            if (state.items) await writeFile(join(root, "event.ts"), Buffer.from([0, 1, 2]));
            return Object.fromEntries(Object.keys(request.questions).map((id) => [id, 0.9]));
          },
        },
      );
      expect(result.status).toBe("incomplete");
      expect(result.issues.some((issue) => issue.kind === "changed")).toBe(true);
      expect(result.files[0]?.path).toBe("event.ts");
      expect(result.files[0]?.excerpts).toEqual([]);
      expect(result.files[0]?.sourceOmitted).toBe(true);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);

testIfDocker(
  "donors ignored during follow-up are absent from later evaluation requests",
  async () => {
    const root = await mkdtemp(join(tmpdir(), "jg-followup-change-"));
    let calls = 0;
    let changed = false;
    let staleUploads = 0;
    let followups = 0;
    try {
      for (let index = 0; index < 12; index++) {
        await writeFile(
          join(root, `${index}.ts`),
          `export function record${index}() {return true;}\n`,
        );
      }
      const result = await retrieve(
        { root, query: "record behavior", signal: new AbortController().signal },
        {
          get requests() {
            return calls;
          },
          async evaluate(request) {
            calls++;
            const state = request.state as { selectedEvidence?: Array<{ path: string }> };
            if (state.selectedEvidence) {
              followups++;
              if (followups > 8 && state.selectedEvidence.some((entry) => entry.path === "0.ts"))
                staleUploads++;
              if (!changed) {
                changed = true;
                await writeFile(join(root, ".ignore"), "0.ts\n");
              }
            }
            return Object.fromEntries(Object.keys(request.questions).map((id) => [id, 0.9]));
          },
        },
      );
      expect(changed).toBe(true);
      expect(staleUploads).toBe(0);
      expect(result.status).toBe("incomplete");
      expect(result.files.find((file) => file.path === "0.ts")?.excerpts).toEqual([]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);

testIfDocker("an aborted evaluator cannot return a previously cached answer", async () => {
  const { createEvaluationCache } = await import("../packages/core/src/cache");
  const directory = await mkdtemp(join(tmpdir(), "jg-cache-abort-"));
  const controller = new AbortController();
  let calls = 0;
  const server = Bun.serve({
    port: 0,
    fetch() {
      calls++;
      return Response.json({ answers: { q: { type: "boolean", probability: 0.8 } } });
    },
  });
  try {
    const evaluator = createEvaluator({
      apiKey: "fixture",
      baseURL: `http://127.0.0.1:${server.port}`,
      signal: controller.signal,
      cache: createEvaluationCache({ directory }),
    });
    const request = {
      state: "test",
      questions: { q: { type: "boolean" as const, instructions: "Relevant?" } },
    };
    expect(await evaluator.evaluate(request)).toEqual({ q: 0.8 });
    expect(await evaluator.evaluate(request)).toEqual({ q: 0.8 });
    expect(evaluator.cacheHits).toBe(1);
    controller.abort();
    await expect(evaluator.evaluate(request)).rejects.toMatchObject({ kind: "cancelled" });
    expect(calls).toBe(1);
  } finally {
    server.stop(true);
    await rm(directory, { recursive: true, force: true });
  }
});

testIfDocker(
  "a file excluded during declaration selection is not uploaded in later groups",
  async () => {
    const root = await mkdtemp(join(tmpdir(), "jg-group-change-"));
    let declarations = 0;
    try {
      await writeFile(
        join(root, "events.ts"),
        Array.from({ length: 20 }, (_, i) => `export function event${i}() {return true;}\n`).join(
          "",
        ),
      );
      const result = await retrieve(
        { root, query: "event behavior", signal: new AbortController().signal },
        {
          requests: 0,
          async evaluate(request) {
            const state = request.state as { declarations?: unknown[] };
            if (state.declarations) {
              declarations++;
              if (declarations === 1) await writeFile(join(root, ".ignore"), "events.ts\n");
            }
            return Object.fromEntries(Object.keys(request.questions).map((id) => [id, 0.9]));
          },
        },
      );
      expect(declarations).toBe(1);
      expect(result.status).toBe("incomplete");
      expect(result.files[0]?.excerpts).toEqual([]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
);
