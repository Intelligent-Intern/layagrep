import { expect } from "bun:test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { version } from "../package.json";
import { testInDocker, withCli } from "./cli";

testInDocker(
  "built commands expose usage, version, and the canonical skill without authentication",
  async () => {
    await withCli(async ({ run }) => {
      const help = await run(["--help"]);
      expect(help).toMatchObject({ code: 0, stderr: "" });
      expect(help.stdout).toContain('Usage: jg "question" [root]');
      expect(await run(["--version"])).toEqual({ code: 0, stderr: "", stdout: `${version}\n` });
      expect(await run(["skill"])).toEqual({
        code: 0,
        stderr: "",
        stdout: await readFile(
          new URL("../../../skills/jevgrep/SKILL.md", import.meta.url),
          "utf8",
        ),
      });
      const invalid = await run(["--accidentally-pasted-secret"]);
      expect(invalid).toMatchObject({ code: 1, stderr: "" });
      expect(invalid.stdout).not.toContain("accidentally-pasted-secret");
    });
    const sourceSkill = Bun.spawn(
      ["bun", fileURLToPath(new URL("../src/index.ts", import.meta.url)), "skill"],
      {
        env: { ...process.env, AI_GATEWAY_API_KEY: "" },
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    expect(await new Response(sourceSkill.stdout).text()).toBe(
      await readFile(new URL("../../../skills/jevgrep/SKILL.md", import.meta.url), "utf8"),
    );
    expect(await new Response(sourceSkill.stderr).text()).toBe("");
    expect(await sourceSkill.exited).toBe(0);
  },
);
