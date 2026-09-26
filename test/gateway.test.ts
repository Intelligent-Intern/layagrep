import { expect, test } from "bun:test";
import { createEvaluator } from "../packages/core/src/gateway";

test("Jev uses native state and validated boolean probabilities through real HTTP", async () => {
  const state = {
    query: "find event recording",
    items: [{ path: "events.ts", source: "recordEvent()" }],
  };
  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      expect(await request.json()).toEqual({
        state,
        questions: { useful: { type: "boolean", instructions: "Is the source useful?" } },
        providerOptions: {},
      });
      return Response.json({ answers: { useful: { type: "boolean", probability: 0.8 } } });
    },
  });
  try {
    const evaluator = createEvaluator({
      apiKey: "fixture",
      baseURL: `http://127.0.0.1:${server.port}`,
      signal: new AbortController().signal,
    });
    const result = await evaluator.evaluate({
      state,
      questions: { useful: { type: "boolean", instructions: "Is the source useful?" } },
    });
    expect(result).toEqual({ useful: 0.8 });
    expect(evaluator.requests).toBe(1);
  } finally {
    server.stop(true);
  }
});

test("transient failures retry within the shared request guard and never become scores", async () => {
  let calls = 0;
  const server = Bun.serve({
    port: 0,
    fetch() {
      calls++;
      return calls === 1
        ? Response.json({ error: "retry" }, { status: 503 })
        : Response.json({ answers: { q: { type: "boolean", probability: 0.2 } } });
    },
  });
  try {
    const evaluator = createEvaluator({
      apiKey: "fixture",
      baseURL: `http://127.0.0.1:${server.port}`,
      signal: new AbortController().signal,
      requestLimit: 2,
      retryDelayMs: 0,
    });
    const request = {
      state: "test",
      questions: { q: { type: "boolean" as const, instructions: "Relevant?" } },
    };
    expect(await evaluator.evaluate(request)).toEqual({ q: 0.2 });
    await expect(evaluator.evaluate(request)).rejects.toMatchObject({ kind: "request-limit" });
    expect(calls).toBe(2);
    expect(evaluator.requests).toBe(2);
  } finally {
    server.stop(true);
  }
});
