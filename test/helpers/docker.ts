import { test } from "bun:test";
export const testIfDocker = process.env.JEVGREP_TEST_IN_DOCKER === "1" ? test : test.skip;
