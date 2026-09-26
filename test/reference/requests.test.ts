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

import { navigationRequest, roleRequest } from "../../packages/core/src/requests";
test("navigation and role questions retain exact native request objects", () => {
  const kinds = new Set<string>();
  for (const serialized of corpus.requests) {
    const { state, questions } = JSON.parse(serialized);
    if (state.items) {
      kinds.add("navigation");
      const items = state.items.map(
        ({ id, ...item }: { id: string; path: string; kind: "file" | "directory" }) => item,
      );
      expect(navigationRequest(state.query, items, state.relationAnchor)).toEqual({
        state,
        questions,
      });
    } else if (state.preview) {
      kinds.add("roles");
      expect(roleRequest(state.query, state.path, state.preview)).toEqual({ state, questions });
    }
  }
  expect([...kinds].sort()).toEqual(["navigation", "roles"]);
});
