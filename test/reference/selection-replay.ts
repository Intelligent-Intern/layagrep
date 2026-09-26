import { spawnSync } from "node:child_process";
import { extname } from "node:path";
import frozen from "../../evals/implementation/swebench/hierarchy-unit-locators-spike.ts" with { type: "text" };
import neighborhoodParser from "../../evals/implementation/swebench/source-neighborhood-spike.py" with { type: "text" };
import {
  inspectSource,
  contextWindows,
} from "../../evals/implementation/swebench/source-method-windows-spike";
import { completeSourceFragments } from "../../evals/implementation/swebench/complete-source-v64-spike";
import type { EvaluationRequest } from "../../packages/core/src/gateway";
import type { Declaration } from "../../packages/core/src/requests";
import type { Range } from "../../packages/core/src/source";

/** Execute the frozen selection block itself; only its filesystem and provider boundaries are replaced. */
export async function replaySelection(
  path: string,
  source: string,
  query: string,
  score: (declaration: Declaration, pass: number) => number,
) {
  const requests: EvaluationRequest[] = [];
  const block = frozen.slice(
    frozen.indexOf("const sourceLines="),
    frozen.indexOf("// Role labels"),
  );
  if (!block.includes("for(let evidencePass=0;evidencePass<2;evidencePass++)"))
    throw new Error("Frozen selection block was not found");
  const transpiler = new Bun.Transpiler({ loader: "ts" });
  const run = new Function(
    "dependencies",
    transpiler.transformSync(`
    const {open,contained,inspectSource,contextWindows,completeSourceFragments,spawnSync,extname,
      neighborhoodParser,evaluate,path,source,query}=dependencies;
    return (async()=>{
      const candidates=[{path}], values={query};
      let requests=0, partial=false;
      const requestBudget=50000, waitForRateLimit=async()=>{};
      const gateway={evaluationModel:()=>null};
      ${block}
      return {ranges:locations.get(path)||[],leads:[...(readingLeads.get(path)?.values()||[])],partial};
    })();
  `),
  );
  const bytes = Buffer.from(source);
  const result = (await run({
    path,
    source,
    query,
    inspectSource,
    contextWindows,
    completeSourceFragments,
    spawnSync,
    extname,
    neighborhoodParser,
    contained: async (name: string) => name,
    open: async () => ({
      stat: async () => ({ isFile: () => true, size: bytes.length, mtimeMs: 0 }),
      readFile: async () => bytes,
      close: async () => {},
    }),
    evaluate: async ({ state, questions }: EvaluationRequest) => {
      requests.push({ state, questions });
      const input = state as { declarations: Declaration[]; selectedEvidence?: unknown };
      return {
        answers: Object.fromEntries(
          input.declarations.map((declaration, index) => [
            `q${index}`,
            { type: "boolean", probability: score(declaration, input.selectedEvidence ? 1 : 0) },
          ]),
        ),
      };
    },
  })) as { ranges: Range[]; leads: Declaration[]; partial: boolean };
  return {
    ...result,
    requests,
    excerpts: result.ranges.map((range) => ({
      range,
      source: source
        .split("\n")
        .slice(range.startLine - 1, range.endLine)
        .join("\n"),
    })),
  };
}
