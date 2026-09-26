import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { referenceTransport, providers, type Provider } from "./transport";

test("wire normalization retains every corpus field and rejects unknown envelope and question fields", async () => {
  const corpus = JSON.parse(await readFile("test/reference/corpus.json", "utf8"));
  for (const provider of Object.keys(providers) as Provider[]) {
    const transport = await referenceTransport(provider);
    try {
      const preset = providers[provider];
      const request = new Request(preset.url, {
        method: "POST",
        headers: {
          authorization: "Bearer fixture",
          "x-jevgrep-original-url": preset.url,
        },
      });
      for (const serialized of corpus.requests) {
        const original = JSON.parse(serialized);
        const historical = new Request("http://localhost/v4/ai/evaluation-model", {
          method: "POST",
          headers: { authorization: "Bearer fixture", "ai-model-id": "typesafe-ai/jev" },
        });
        expect(JSON.stringify(transport.decode(historical, original, false))).toBe(serialized);
        const wire = {
          model: preset.model,
          state: original.state,
          questions: Object.fromEntries(
            Object.entries(original.questions).map(([id, question]) => [
              id,
              { ...(question as object), type: "noul" },
            ]),
          ),
        };
        expect(JSON.stringify(transport.decode(request, wire, true))).toBe(serialized);
        expect(() => transport.decode(request, { ...wire, extra: true }, true)).toThrow();
        const id = Object.keys(wire.questions)[0]!;
        expect(() =>
          transport.decode(
            request,
            {
              ...wire,
              questions: { ...wire.questions, [id]: { ...wire.questions[id], extra: true } },
            },
            true,
          ),
        ).toThrow();
        expect(() => transport.decode(request, { ...wire, model: "wrong-model" }, true)).toThrow();
      }
    } finally {
      await transport.cleanup();
    }
  }
});
