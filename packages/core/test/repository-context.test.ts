import { expect } from "bun:test";
import { mkdtemp, mkdir, writeFile, rm, symlink } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { testIfDocker as test } from "../../../test/helpers/docker";
import { createFilesystem } from "../src/filesystem";
import { repositoryContext } from "../src/repository-context";
import type { FileEvidence } from "../src/types";

test("reference repository context reports scoped guidance and only selected pytest test entries", async () => {
  const root = await mkdtemp(join(tmpdir(), "jg-context-"));
  await mkdir(join(root, "a/b"), { recursive: true });
  await mkdir(join(root, "unrelated"));
  for (const path of ["AGENTS.md", "a/AGENTS.md", "a/b/AGENTS.md", "unrelated/AGENTS.md"])
    await writeFile(join(root, path), "Instructions are not source evidence.");
  const source = "import pytest\n\ndef test_behavior():\n    assert True\n";
  await writeFile(join(root, "a/b/test_behavior.py"), source);
  const reader = await createFilesystem({ root });
  const file: FileEvidence = {
    path: "a/b/test_behavior.py",
    contentHash: "unused",
    score: 0.9,
    roles: ["test"],
    leads: [],
    selected: [{ startLine: 3, endLine: 4 }],
    rendered: [{ startLine: 3, endLine: 4 }],
    excerpts: [
      { range: { startLine: 3, endLine: 4 }, source: "def test_behavior():\n    assert True" },
    ],
    sourceOmitted: false,
  };
  const declarations = new Map([
    [file.path, [{ name: "test_behavior", range: { startLine: 3, endLine: 4 } }]],
  ]);
  try {
    const readCurrent = async (path: string) => {
      const value = await reader.readSnapshot(path);
      return value.status === "ok" ? value.snapshot : undefined;
    };
    expect(await repositoryContext(reader, [file], declarations, readCurrent)).toEqual({
      instructionFiles: ["AGENTS.md", "a/b/AGENTS.md", "a/AGENTS.md"],
      instructionLookupIncomplete: false,
      pytestFiles: [file.path],
    });
    file.rendered = [{ startLine: 1, endLine: 1 }];
    expect(
      (await repositoryContext(reader, [file], declarations, readCurrent)).pytestFiles,
    ).toEqual([]);
    await rm(join(root, "a/b/AGENTS.md"));
    await symlink(join(root, "unrelated/AGENTS.md"), join(root, "a/b/AGENTS.md"));
    const unsafe = await repositoryContext(reader, [file], declarations, readCurrent);
    expect(unsafe.instructionFiles).toEqual(["AGENTS.md", "a/AGENTS.md"]);
    expect(unsafe.instructionLookupIncomplete).toBe(true);
    expect(await reader.lookupFile("missing.md")).toEqual({
      status: "excluded",
      reason: "missing",
    });
    expect((await reader.readSnapshot("missing.md")).status).toBe("issue");
  } finally {
    await reader.close();
    await rm(root, { recursive: true, force: true });
  }
});
