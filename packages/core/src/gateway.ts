import { createGateway, experimental_evaluate as evaluate } from "ai";
import { type createEvaluationCache, type CacheInput } from "./cache";
import { setTimeout as delay } from "node:timers/promises";

export type EvaluationRequest = {
  state: Parameters<typeof evaluate>[0]["state"];
  questions: Record<string, { type: "boolean"; instructions: string }>;
};

export class EvaluationFailure extends Error {
  constructor(public readonly kind: "authentication" | "request-limit" | "provider" | "cancelled") {
    super(`Jev evaluation failed: ${kind}`);
    this.name = "EvaluationFailure";
  }
}

export function createEvaluator(options: {
  apiKey: string;
  cache?: ReturnType<typeof createEvaluationCache>;
  policyVersion?: string;
  baseURL?: string;
  signal: AbortSignal;
  requestLimit?: number;
  timeoutMs?: number;
  retryDelayMs?: number;
}) {
  let requests = 0;
  let cacheHits = 0;
  let cooldownUntil = 0;
  const authenticationFailure = new AbortController();
  function assertActive() {
    if (options.signal.aborted) throw new EvaluationFailure("cancelled");
    if (authenticationFailure.signal.aborted) throw new EvaluationFailure("authentication");
  }
  const gateway = createGateway({
    apiKey: options.apiKey,
    baseURL: options.baseURL,
    fetch: async (input, init) => {
      assertActive();
      if (requests >= (options.requestLimit ?? 50_000))
        throw new EvaluationFailure("request-limit");
      requests++;
      const response = await fetch(input, init);
      if (response.status === 429) {
        const raw = response.headers.get("retry-after");
        const seconds = raw === null ? NaN : Number(raw);
        const wait = Number.isFinite(seconds)
          ? seconds * 1000
          : raw
            ? Date.parse(raw) - Date.now()
            : 1000;
        cooldownUntil = Math.max(
          cooldownUntil,
          Date.now() + Math.min(30_000, Math.max(0, Number.isFinite(wait) ? wait : 1000)),
        );
      }
      return response;
    },
  });
  return {
    get cacheHits() {
      return cacheHits;
    },
    get cacheIssues() {
      return options.cache?.stats().issues ?? [];
    },
    get requests() {
      return requests;
    },
    async evaluate(request: EvaluationRequest): Promise<Record<string, number>> {
      assertActive();
      const cacheInput: CacheInput = {
        request,
        namespace: {
          model: "typesafe-ai/jev",
          provider: options.baseURL ?? "vercel-ai-gateway",
          policyVersion: options.policyVersion ?? "1",
          parserVersion: "python-0.25.0-ts-5.9.3",
          promptVersion: "unit-locators-1",
        },
      };
      const cached = await options.cache?.get(cacheInput);
      assertActive();
      if (
        cached &&
        Object.keys(cached).length === Object.keys(request.questions).length &&
        Object.keys(request.questions).every(
          (id) => typeof cached[id] === "number" && cached[id]! >= 0 && cached[id]! <= 1,
        )
      ) {
        cacheHits++;
        return cached;
      }
      for (let attempt = 0; attempt < 3; attempt++) {
        assertActive();
        if (requests >= (options.requestLimit ?? 50_000))
          throw new EvaluationFailure("request-limit");
        const wait = Math.max(
          0,
          cooldownUntil - Date.now(),
          attempt ? (options.retryDelayMs ?? 500) * 2 ** (attempt - 1) * (0.5 + Math.random()) : 0,
        );
        if (wait) {
          try {
            await delay(wait, undefined, {
              signal: AbortSignal.any([options.signal, authenticationFailure.signal]),
            });
          } catch {
            assertActive();
            throw new EvaluationFailure("cancelled");
          }
        }
        try {
          const result = await evaluate({
            model: gateway.evaluationModel("typesafe-ai/jev"),
            ...request,
            maxRetries: 0,
            abortSignal: AbortSignal.any([
              options.signal,
              authenticationFailure.signal,
              AbortSignal.timeout(options.timeoutMs ?? 30_000),
            ]),
          });
          const scores = Object.fromEntries(
            Object.entries(result.answers).map(([id, answer]) => [id, answer.probability]),
          );
          await options.cache?.put(cacheInput, scores);
          return scores;
        } catch (error) {
          assertActive();
          if (requests >= (options.requestLimit ?? 50_000))
            throw new EvaluationFailure("request-limit");
          const status =
            error && typeof error === "object" && "statusCode" in error
              ? error.statusCode
              : undefined;
          if (status === 401 || status === 403) {
            authenticationFailure.abort();
            throw new EvaluationFailure("authentication");
          }
          if (
            typeof status === "number" &&
            status >= 400 &&
            status < 500 &&
            status !== 408 &&
            status !== 429
          )
            throw new EvaluationFailure("provider");
          if (attempt === 2) throw new EvaluationFailure("provider");
        }
      }
      throw new EvaluationFailure("provider");
    },
  };
}
