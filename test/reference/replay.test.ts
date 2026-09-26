import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { replay } from "./replay";

test("frozen retrieval reproduces native requests and source packet through Gateway HTTP", async () => {
  expect(
    createHash("sha256")
      .update(await readFile("evals/implementation/swebench/hierarchy-unit-locators-spike.ts"))
      .digest("hex"),
  ).toBe("6ca9dcf92d5dfe062ec1169de066273897589cc16f6c8e7055cd4b3854739bcc");
  const expected = JSON.parse(await readFile("test/reference/corpus.json", "utf8"));
  const result = await replay();
  expect(result.code).toBe(0);
  expect(result.stderr).toBe("");
  expect(result.requests).toEqual(expected.requests);
  expect(result.stdout).toBe(expected.stdout);
}, 120_000);

for (const mode of ["missing", "invalid"] as const) {
  test(`Gateway ${mode} answers remain incomplete instead of negative evidence`, async () => {
    const result = await replay(mode);
    expect(result.stdout).toContain("Jevgrep: 0 relevant files; discovery incomplete.");
    expect(result.stderr).toBe("");
    // Historical spike exits zero for partial output; production intentionally changes this.
    expect(result.code).toBe(0);
  }, 120_000);
}

test("reference source closure and historical skill retain their recorded identity", async () => {
  const manifest: Record<string, string> = JSON.parse(
    await readFile("test/reference/manifest.json", "utf8"),
  );
  for (const [path, digest] of Object.entries(manifest)) {
    expect(
      createHash("sha256")
        .update(await readFile(path))
        .digest("hex"),
      path,
    ).toBe(digest);
  }
});

test("production CLI matches the frozen complete requests and stdout corpus", async () => {
  const expected = JSON.parse(await readFile("test/reference/corpus.json", "utf8"));
  const result = await replay("healthy", true);
  expect(result.code).toBe(0);
  expect(result.stderr).toBe("");
  expect(result.requests).toEqual(expected.requests);
  expect(result.stdout).toBe(expected.stdout);
}, 120_000);
