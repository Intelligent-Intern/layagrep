import { expect } from "bun:test";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { testIfDocker } from "../helpers/docker";
import { retrieve } from "../../packages/core/src/retrieve";

testIfDocker(
  "Python cancellation retains acquired selections and the next query recovers",
  async () => {
    const root = await mkdtemp(join(tmpdir(), "jg-python-cancel-"));
    try {
      await writeFile(
        join(root, "events.py"),
        Array.from({ length: 20 }, (_, i) => `def event${i}():\n    return ${i}\n`).join(""),
      );
      const controller = new AbortController();
      let groups = 0;
      const evaluator = {
        requests: 0,
        async evaluate(request: Parameters<Parameters<typeof retrieve>[1]["evaluate"]>[0]) {
          if ((request.state as { declarations?: unknown[] }).declarations && ++groups === 1)
            controller.abort();
          return Object.fromEntries(Object.keys(request.questions).map((id) => [id, 0.9]));
        },
      };
      const result = await retrieve({ root, query: "event", signal: controller.signal }, evaluator);
      expect(result.status).toBe("interrupted");
      const text = result.files
        .flatMap((file) => file.excerpts.map((excerpt) => excerpt.source))
        .join("\n");
      expect(text).toContain("def event0");
      expect(text).not.toContain("def event19");
      const next = await retrieve(
        { root, query: "event", signal: new AbortController().signal },
        evaluator,
      );
      expect(next.status).toBe("complete");
      expect(
        next.files.flatMap((file) => file.excerpts.map((excerpt) => excerpt.source)).join("\n"),
      ).toContain("def event19");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  },
  120_000,
);
