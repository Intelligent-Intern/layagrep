import { dirname } from "node:path";
import type { FilesystemReader, Snapshot } from "./filesystem";
import type { SelectionResult } from "./selection";
import type { FileEvidence } from "./types";

/** Locate scoped guidance and test entry points without executing either. */
export async function repositoryContext(
  reader: FilesystemReader,
  files: FileEvidence[],
  declarations: ReadonlyMap<string, SelectionResult["declarations"]>,
  readCurrent: (path: string) => Promise<Snapshot | undefined>,
) {
  const directories = new Set(["."]);
  for (const file of files)
    for (let directory = dirname(file.path); directory !== "."; directory = dirname(directory))
      directories.add(directory);
  const instructionFiles: string[] = [];
  let instructionLookupIncomplete = false;
  for (const directory of directories) {
    const path = directory === "." ? "AGENTS.md" : `${directory}/AGENTS.md`;
    const result = await reader.lookupFile(path);
    if (result.status === "file") instructionFiles.push(path);
    else if (result.status !== "excluded" || result.reason !== "missing")
      instructionLookupIncomplete = true;
  }
  const pytestFiles: string[] = [];
  for (const file of files) {
    if (!file.path.endsWith(".py") || !file.excerpts.length) continue;
    const snapshot = await readCurrent(file.path);
    if (!snapshot || !/(^|\n)\s*(import pytest\b|from pytest\b)/.test(snapshot.source)) continue;
    if (
      declarations
        .get(file.path)
        ?.some(
          (unit) =>
            unit.name.split(".").at(-1)!.startsWith("test_") &&
            file.rendered.some(
              (range) =>
                unit.range.startLine >= range.startLine && unit.range.endLine <= range.endLine,
            ),
        )
    )
      pytestFiles.push(file.path);
  }
  return { instructionFiles, instructionLookupIncomplete, pytestFiles };
}
