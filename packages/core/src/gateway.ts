import { createGateway, experimental_evaluate as evaluate } from "ai";
import { type createEvaluationCache, type CacheInput } from "./cache";
import { setTimeout as delay } from "node:timers/promises";

export type EvaluationRequest = {
  state: Parameters<typeof evaluate>[0]["state"];
  questions: Record<string, { type: "boolean"; instructions: string }>;
};

export class EvaluationFailure extends Error {
  constructor(
    public readonly kind: "authentication" | "request-limit" | "provider" | "cancelled",
    public readonly splitEligible = false,
  ) {
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
        const date = raw === null ? NaN : Date.parse(raw);
        const wait =
          Number.isFinite(seconds) && seconds >= 0
            ? seconds * 1000
            : Number.isFinite(date)
              ? Math.max(0, date - Date.now())
              : 1000;
        cooldownUntil = Math.max(cooldownUntil, Date.now() + wait);
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
    async evaluate(
      request: EvaluationRequest,
      policy?: { navigation?: boolean },
    ): Promise<Record<string, number>> {
      assertActive();
      const cacheInput: CacheInput = {
        request,
        namespace: {
          model: "typesafe-ai/jev",
          provider: options.baseURL ?? "vercel-ai-gateway",
          policyVersion: options.policyVersion ?? "1",
          parserVersion: "cpython-3.11.3-pyodide-0.25.1-ts-5.9.3",
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
      const navigation = policy?.navigation === true;
      const multiple = Object.keys(request.questions).length > 1;
      let attemptLimit = navigation && multiple ? 1 : 2;
      for (let attempt = 0; attempt < attemptLimit; attempt++) {
        assertActive();
        if (requests >= (options.requestLimit ?? 50_000))
          throw new EvaluationFailure("request-limit");
        while (cooldownUntil > Date.now()) {
          try {
            await delay(Math.min(60_000, cooldownUntil - Date.now()), undefined, {
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
              AbortSignal.timeout(options.timeoutMs ?? 15_000),
            ]),
          });
          const scores = Object.fromEntries(
            Object.keys(request.questions).map((id) => {
              const answer = result.answers[id];
              if (
                !answer ||
                answer.type !== "boolean" ||
                !Number.isFinite(answer.probability) ||
                answer.probability < 0 ||
                answer.probability > 1
              )
                throw new Error("Invalid answer");
              return [id, answer.probability];
            }),
          );
          await options.cache?.put(cacheInput, scores);
          return scores;
        } catch (error) {
          assertActive();
          const status =
            error && typeof error === "object" && "statusCode" in error
              ? error.statusCode
              : undefined;
          if (status === 401 || status === 403) {
            authenticationFailure.abort();
            throw new EvaluationFailure("authentication");
          }
          if (requests >= (options.requestLimit ?? 50_000))
            throw new EvaluationFailure("request-limit");
          const name = error instanceof Error ? error.name : "unknown";
          const transient =
            status === 408 ||
            status === 429 ||
            (typeof status === "number" && status >= 500 && status <= 599) ||
            ["GatewayInternalServerError", "GatewayTimeoutError", "TimeoutError"].includes(name);
          if (navigation && status === 429) attemptLimit = Math.max(attemptLimit, 2);
          if ((navigation && !transient) || attempt + 1 === attemptLimit)
            throw new EvaluationFailure(
              "provider",
              navigation && multiple && transient && status !== 429,
            );
        }
      }
      throw new EvaluationFailure("provider");
    },
  };
}
