import { createGateway, experimental_evaluate as evaluate } from "ai";
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
  baseURL?: string;
  signal: AbortSignal;
  requestLimit?: number;
  timeoutMs?: number;
  retryDelayMs?: number;
}) {
  let requests = 0;
  let cooldownUntil = 0;
  const gateway = createGateway({
    apiKey: options.apiKey,
    baseURL: options.baseURL,
    fetch: async (input, init) => {
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
    get requests() {
      return requests;
    },
    async evaluate(request: EvaluationRequest): Promise<Record<string, number>> {
      for (let attempt = 0; attempt < 3; attempt++) {
        if (options.signal.aborted) throw new EvaluationFailure("cancelled");
        if (requests >= (options.requestLimit ?? 50_000))
          throw new EvaluationFailure("request-limit");
        const wait = Math.max(
          0,
          cooldownUntil - Date.now(),
          attempt ? (options.retryDelayMs ?? 500) * 2 ** (attempt - 1) * (0.5 + Math.random()) : 0,
        );
        if (wait) {
          try {
            await delay(wait, undefined, { signal: options.signal });
          } catch {
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
              AbortSignal.timeout(options.timeoutMs ?? 30_000),
            ]),
          });
          return Object.fromEntries(
            Object.entries(result.answers).map(([id, answer]) => [id, answer.probability]),
          );
        } catch (error) {
          if (options.signal.aborted) throw new EvaluationFailure("cancelled");
          if (requests >= (options.requestLimit ?? 50_000))
            throw new EvaluationFailure("request-limit");
          const status =
            error && typeof error === "object" && "statusCode" in error
              ? error.statusCode
              : undefined;
          if (status === 401 || status === 403) throw new EvaluationFailure("authentication");
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
