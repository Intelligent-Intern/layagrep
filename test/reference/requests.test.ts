import { expect, test } from "bun:test";
import { evidenceRequest } from "../../packages/core/src/requests";
import corpus from "./corpus.json";

test("declaration questions preserve the accepted first and reference passes", () => {
  const passes = new Set<string>();
  for (const serialized of corpus.requests) {
    const request = JSON.parse(serialized);
    const state = request.state;
    if (!state.declarations) continue;
    passes.add(state.selectedEvidence ? "reference" : "evidence");
    const actual = evidenceRequest(
      state.query,
      state.path,
      state.source,
      state.declarations,
      state.selectedEvidence,
    );
    expect(actual).toEqual({ state: request.state, questions: request.questions });
  }
  expect([...passes].sort()).toEqual(["evidence", "reference"]);
});
