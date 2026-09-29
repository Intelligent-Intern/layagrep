import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { CliError } from "./errors";

const run = promisify(execFile);

/** CodeGraph owns indexing and watching; only validated, local file paths enter retrieval. */
export async function graphHints(root: string, query: string, signal: AbortSignal): Promise<string[]> {
  const project = resolve(root);
  const cancelled = AbortSignal.any([signal, AbortSignal.timeout(60_000)]);
  let output: string;
  try {
    await run("codegraph", ["sync", project, "--quiet"], { signal: cancelled, maxBuffer: 1_000_000 });
    const result = await run("codegraph", ["query", query, "--path", project, "--limit", "24", "--json"], {
      signal: cancelled,
      maxBuffer: 1_000_000,
    });
    output = result.stdout;
  } catch {
    throw new CliError("CodeGraph is unavailable. Install it, run `codegraph init ROOT`, then retry --graph.");
  }
  let values: unknown;
  try {
    values = JSON.parse(output);
  } catch {
    throw new CliError("CodeGraph returned invalid search results.");
  }
  if (!Array.isArray(values)) throw new CliError("CodeGraph returned invalid search results.");
  const paths = new Set<string>();
  for (const entry of values) {
    const path = entry && typeof entry === "object" && "node" in entry &&
      entry.node && typeof entry.node === "object" && "filePath" in entry.node
      ? entry.node.filePath : undefined;
    if (typeof path !== "string" || !path) continue;
    const name = relative(project, isAbsolute(path) ? path : resolve(project, path));
    if (!name || name === ".." || name.startsWith(`..${sep}`) || isAbsolute(name)) continue;
    paths.add(name);
  }
  return [...paths];
}
