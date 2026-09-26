import { test, expect } from "bun:test";
import { readFile } from "node:fs/promises";

test("production skill preserves accepted research instructions after the installation preflight", async () => {
  const accepted = await readFile("test/reference/accepted-skill.md", "utf8");
  const canonical = await readFile("skills/jevgrep/SKILL.md", "utf8");
  const [header, research] = accepted.split("# Jevgrep\n\n");
  const sections = canonical.split("## Research\n\n");
  expect(sections).toHaveLength(2);
  expect(sections[0]).toStartWith(`${header}# Jevgrep\n\n## Setup\n\n`);
  expect(sections[1]).toBe(
    research!.replace(
      'Run `jevgrep "your research question"`',
      'Run `jg "your research question"`',
    ),
  );
});
