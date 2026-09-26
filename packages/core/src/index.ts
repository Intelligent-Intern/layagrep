import { createGateway, experimental_evaluate as evaluate } from "ai";

// A synthetic probe verifies the evaluation endpoint without uploading repository files.
export async function checkGateway(apiKey: string) {
  const gateway = createGateway({ apiKey });
  const result = await evaluate({
    model: gateway.evaluationModel("typesafe-ai/jev"),
    state: "The file telemetry.ts exports a function that records application events.",
    questions: {
      relevant: { type: "boolean", instructions: "Does this file implement telemetry?" },
    },
    maxRetries: 0,
    abortSignal: AbortSignal.timeout(30_000),
  });
  return { model: "typesafe-ai/jev", answers: result.answers, usage: result.usage };
}
