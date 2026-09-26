import { test, expect } from "bun:test";
import { readFile } from "node:fs/promises";

test("production skill preserves the accepted instructions with only the executable renamed", async () => {
  const accepted = await readFile("test/reference/accepted-skill.md", "utf8");
  const canonical = await readFile("skills/jevgrep/SKILL.md", "utf8");
  expect(canonical).toBe(
    accepted.replace('Run `jevgrep "your research question"`', 'Run `jg "your research question"`'),
  );
});
