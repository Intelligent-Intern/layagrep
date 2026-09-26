import { expect } from "bun:test";
import { fileURLToPath } from "node:url";
import { version } from "../package.json";
import { testInDocker, withCli } from "./cli";

testInDocker("built commands expose usage and version without authentication", async () => {
  await withCli(async ({ run }) => {
    const help = await run(["--help"]);
    expect(help).toMatchObject({ code: 0, stderr: "" });
    expect(help.stdout).toContain('Usage: jg "question" [root]');
    expect(await run(["--version"])).toEqual({ code: 0, stderr: "", stdout: `${version}\n` });
    const invalid = await run(["--accidentally-pasted-secret"]);
    expect(invalid).toMatchObject({ code: 1, stderr: "" });
    expect(invalid.stdout).not.toContain("accidentally-pasted-secret");
  });
  const sourceHelp = Bun.spawn(
    ["bun", fileURLToPath(new URL("../src/index.ts", import.meta.url)), "--help"],
    {
      env: { ...process.env, AI_GATEWAY_API_KEY: "" },
      stdout: "pipe",
      stderr: "pipe",
    },
  );
  expect(await new Response(sourceHelp.stdout).text()).toContain('Usage: jg "question" [root]');
  expect(await new Response(sourceHelp.stderr).text()).toBe("");
  expect(await sourceHelp.exited).toBe(0);
});
