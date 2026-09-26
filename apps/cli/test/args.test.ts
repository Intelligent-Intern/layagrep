import { expect, test } from "bun:test";
import { parseCommand } from "../src/args";

test("search accepts independent policy flags and a dash-prefixed root after --", () => {
  expect(
    parseCommand([
      "find behavior",
      "--hidden",
      "--no-cache",
      "--max-source-bytes",
      "12",
      "--",
      "-tree",
    ]),
  ).toEqual({
    kind: "search",
    query: "find behavior",
    root: "-tree",
    noCache: true,
    maxSourceBytes: 12,
    policy: { hidden: true },
  });
  expect(() => parseCommand(["question", "a", "b"])).toThrow();
  expect(() => parseCommand(["question", "--max-source-bytes", "-1"])).toThrow();
  expect(() => parseCommand(["question", "--secret-mistake"])).toThrow("Unknown option");
});
