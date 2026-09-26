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

test("cancellation of a rate-limited request prevents further attempts", async () => {
  const controller = new AbortController();
  let calls = 0;
  let firstResponse!: () => void;
  const received = new Promise<void>((resolve) => {
    firstResponse = resolve;
  });
  const server = Bun.serve({
    port: 0,
    fetch() {
      calls++;
      firstResponse();
      return Response.json(
        { error: "rate limited" },
        { status: 429, headers: { "retry-after": "30" } },
      );
    },
  });
  try {
    const evaluator = createEvaluator({
      apiKey: "fixture",
      baseURL: `http://127.0.0.1:${server.port}`,
      signal: controller.signal,
      retryDelayMs: 0,
    });
    const result = evaluator.evaluate({
      state: "test",
      questions: { q: { type: "boolean", instructions: "Relevant?" } },
    });
    await received;
    controller.abort();
    await expect(result).rejects.toMatchObject({ kind: "cancelled" });
    expect(calls).toBe(1);
    expect(evaluator.requests).toBe(1);
  } finally {
    controller.abort();
    server.stop(true);
  }
}, 2000);

test("Retry-After delays a retry before the provider can recover", async () => {
  const received: number[] = [];
  const server = Bun.serve({
    port: 0,
    fetch() {
      received.push(performance.now());
      return received.length === 1
        ? Response.json(
            { error: "rate limited" },
            { status: 429, headers: { "retry-after": "0.1" } },
          )
        : Response.json({ answers: { q: { type: "boolean", probability: 0.8 } } });
    },
  });
  try {
    const evaluator = createEvaluator({
      apiKey: "fixture",
      baseURL: `http://127.0.0.1:${server.port}`,
      signal: new AbortController().signal,
      retryDelayMs: 0,
    });
    expect(
      await evaluator.evaluate({
        state: "test",
        questions: { q: { type: "boolean", instructions: "Relevant?" } },
      }),
    ).toEqual({ q: 0.8 });
    expect(received.length).toBe(2);
    expect(received[1]! - received[0]!).toBeGreaterThanOrEqual(95);
    expect(evaluator.requests).toBe(2);
  } finally {
    server.stop(true);
  }
});
