import { expect } from "bun:test";
import { readFile } from "node:fs/promises";
import { testIfDocker } from "../helpers/docker";
import { replay } from "./replay";
import { providers, type Provider } from "./transport";

for (const provider of Object.keys(providers) as Provider[]) {
  testIfDocker(
    `${provider} production preserves the frozen request multiset and complete packet`,
    async () => {
      const expected = JSON.parse(await readFile("test/reference/corpus.json", "utf8"));
      const result = await replay("healthy", true, provider);
      expect(result.code).toBe(0);
      expect(result.stderr).toBe("");
      expect(result.requests).toEqual(expected.requests);
      expect(result.stdout).toBe(expected.stdout);
    },
    120_000,
  );
  for (const mode of ["missing", "invalid"] as const) {
    testIfDocker(
      `${provider} ${mode} answers preserve incomplete discovery`,
      async () => {
        const result = await replay(mode, true, provider);
        expect(result.code).toBe(2);
        expect(result.stderr).toBe("");
        expect(result.stdout).toContain("Jevgrep: 0 relevant files; discovery incomplete.");
      },
      120_000,
    );
  }
}
