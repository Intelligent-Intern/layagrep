import { routeProviderFetch } from "./fixtures/provider-route.mjs";
import { expect, test } from "bun:test";
import { createEvaluator } from "../packages/core/src/evaluator";

test("Jev uses native state and validated boolean probabilities through real HTTP", async () => {
  const state = {
    query: "find event recording",
    items: [{ path: "events.ts", source: "recordEvent()" }],
  };
  const server = Bun.serve({
    port: 0,
    async fetch(request) {
      expect(await request.json()).toEqual({
        model: "typesafe-ai/jev",
        state,
        questions: { useful: { type: "noul", instructions: "Is the source useful?" } },
      });
      return Response.json({ answers: { useful: { type: "noul", noul: 0.8 } } });
    },
  });
  try {
    const evaluator = createEvaluator({
      apiKey: "fixture",
      provider: "vercel",
      fetch: routeProviderFetch(fetch, `http://127.0.0.1:${server.port}`),
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
        : Response.json({ answers: { q: { type: "noul", noul: 0.2 } } });
    },
  });
  try {
    const evaluator = createEvaluator({
      apiKey: "fixture",
      provider: "vercel",
      fetch: routeProviderFetch(fetch, `http://127.0.0.1:${server.port}`),
      signal: new AbortController().signal,
      requestLimit: 2,
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
      provider: "vercel",
      fetch: routeProviderFetch(fetch, `http://127.0.0.1:${server.port}`),
      signal: controller.signal,
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
        : Response.json({ answers: { q: { type: "noul", noul: 0.8 } } });
    },
  });
  try {
    const evaluator = createEvaluator({
      apiKey: "fixture",
      provider: "vercel",
      fetch: routeProviderFetch(fetch, `http://127.0.0.1:${server.port}`),
      signal: new AbortController().signal,
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

test("stalled HTTP attempts time out without exceeding the evaluator attempt limit", async () => {
  let calls = 0;
  const server = Bun.serve({
    port: 0,
    fetch() {
      calls++;
      return new Promise<Response>(() => {});
    },
  });
  try {
    const evaluator = createEvaluator({
      apiKey: "fixture",
      provider: "vercel",
      fetch: routeProviderFetch(fetch, `http://127.0.0.1:${server.port}`),
      signal: new AbortController().signal,
      timeoutMs: 100,
    });
    await expect(
      evaluator.evaluate({
        state: "test",
        questions: { q: { type: "boolean", instructions: "Relevant?" } },
      }),
    ).rejects.toMatchObject({ kind: "provider" });
    expect(calls).toBe(2);
    expect(evaluator.requests).toBe(2);
  } finally {
    server.stop(true);
  }
}, 2000);

test("authentication failure stops other in-flight and subsequent query requests", async () => {
  let calls = 0;
  const server = Bun.serve({
    port: 0,
    fetch() {
      calls++;
      if (calls === 1) return new Promise<Response>(() => {});
      if (calls === 2) return Response.json({ error: "unauthorized" }, { status: 401 });
      return Response.json({ answers: { q: { type: "noul", noul: 0.8 } } });
    },
  });
  try {
    const evaluator = createEvaluator({
      apiKey: "fixture",
      provider: "vercel",
      fetch: routeProviderFetch(fetch, `http://127.0.0.1:${server.port}`),
      signal: new AbortController().signal,
      timeoutMs: 1000,
    });
    const request = {
      state: "test",
      questions: { q: { type: "boolean" as const, instructions: "Relevant?" } },
    };
    const outcomes = await Promise.allSettled([
      evaluator.evaluate(request),
      evaluator.evaluate(request),
    ]);
    expect(outcomes).toMatchObject([
      { status: "rejected", reason: { kind: "authentication" } },
      { status: "rejected", reason: { kind: "authentication" } },
    ]);
    await expect(evaluator.evaluate(request)).rejects.toMatchObject({ kind: "authentication" });
    expect(calls).toBe(2);
  } finally {
    server.stop(true);
  }
}, 2000);

test("authentication failure interrupts a sibling Retry-After wait", async () => {
  let calls = 0;
  let releaseAuthentication!: () => void;
  const authenticationReady = new Promise<void>((resolve) => {
    releaseAuthentication = resolve;
  });
  const server = Bun.serve({
    port: 0,
    async fetch() {
      calls++;
      if (calls === 1) {
        await authenticationReady;
        return Response.json({ error: "unauthorized" }, { status: 401 });
      }
      setTimeout(releaseAuthentication, 50);
      return Response.json({ error: "limited" }, { status: 429, headers: { "retry-after": "30" } });
    },
  });
  try {
    const evaluator = createEvaluator({
      apiKey: "fixture",
      provider: "vercel",
      fetch: routeProviderFetch(fetch, `http://127.0.0.1:${server.port}`),
      signal: new AbortController().signal,
    });
    const request = {
      state: "test",
      questions: { q: { type: "boolean" as const, instructions: "Relevant?" } },
    };
    const outcomes = await Promise.allSettled([
      evaluator.evaluate(request),
      evaluator.evaluate(request),
    ]);
    expect(outcomes).toMatchObject([
      { status: "rejected", reason: { kind: "authentication" } },
      { status: "rejected", reason: { kind: "authentication" } },
    ]);
    expect(calls).toBe(2);
  } finally {
    server.stop(true);
  }
}, 2000);

for (const status of [409, 422, 503]) {
  test(`navigation HTTP ${status} preserves retry and split policy`, async () => {
    let calls = 0;
    const server = Bun.serve({
      port: 0,
      fetch() {
        calls++;
        return Response.json({ message: "synthetic failure" }, { status });
      },
    });
    try {
      const evaluator = createEvaluator({
        provider: "openrouter",
        apiKey: "fixture",
        fetch: routeProviderFetch(fetch, `http://127.0.0.1:${server.port}`),
        signal: new AbortController().signal,
      });
      await expect(
        evaluator.evaluate(
          {
            state: { source: "code" },
            questions: {
              q0: { type: "boolean", instructions: "Relevant?" },
              q1: { type: "boolean", instructions: "Related?" },
            },
          },
          { navigation: true },
        ),
      ).rejects.toMatchObject({ kind: "provider", splitEligible: status === 503 });
      expect(calls).toBe(1);
      expect(evaluator.requests).toBe(1);
    } finally {
      server.stop(true);
    }
  });
}

test("native HTTP-date Retry-After is honored before another attempt", async () => {
  const retryAt = new Date(Math.ceil(Date.now() / 1000) * 1000 + 1000);
  const arrivals: number[] = [];
  const server = Bun.serve({
    port: 0,
    fetch() {
      arrivals.push(Date.now());
      return arrivals.length === 1
        ? Response.json(
            { message: "rate limited" },
            { status: 429, headers: { "retry-after": retryAt.toUTCString() } },
          )
        : Response.json({ answers: { q: { type: "noul", noul: 0.8 } } });
    },
  });
  try {
    const evaluator = createEvaluator({
      provider: "typesafe",
      apiKey: "fixture",
      fetch: routeProviderFetch(fetch, `http://127.0.0.1:${server.port}`),
      signal: new AbortController().signal,
    });
    expect(
      await evaluator.evaluate({
        state: "code",
        questions: { q: { type: "boolean", instructions: "Relevant?" } },
      }),
    ).toEqual({ q: 0.8 });
    expect(arrivals.length).toBe(2);
    expect(arrivals[1]!).toBeGreaterThanOrEqual(retryAt.getTime());
  } finally {
    server.stop(true);
  }
}, 5000);
