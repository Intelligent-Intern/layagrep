import { expect } from "bun:test";
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { testInDocker, withCli } from "./cli";

testInDocker("installed auth saves privately, bounds stdin, and never echoes keys", async () => {
  await withCli(async ({ home, run }) => {
    const saved = await run(["auth", "--stdin"], "test-gateway-secret\n");
    expect(saved.code).toBe(0);
    expect(saved.stderr).toBe("");
    expect(saved.stdout).toContain("key saved");
    expect(saved.stdout).not.toContain("test-gateway-secret");
    const file = join(home, "jevgrep", "credentials.json");
    expect(JSON.parse(await readFile(file, "utf8")).apiKey).toBe("test-gateway-secret");
    expect((await stat(file)).mode & 0o777).toBe(0o600);
    expect((await stat(join(home, "jevgrep"))).mode & 0o777).toBe(0o700);
    const disabled = await run(["doctor"]);
    expect(disabled.code).toBe(1);
    expect(disabled.stderr).toBe("");
    expect(disabled.stdout).toContain("saved credentials are disabled");
    const whitespace = await run(["auth", "--stdin"], "two secrets\n");
    expect(whitespace.code).toBe(1);
    expect(whitespace.stderr).toBe("");
    expect(whitespace.stdout).not.toContain("two secrets");
    const huge = await run(["auth", "--stdin"], "x".repeat(8193));
    expect(huge.code).toBe(1);
    expect(huge.stderr).toBe("");
    expect(huge.stdout).toContain("exceeds");
    expect(JSON.parse(await readFile(file, "utf8")).apiKey).toBe("test-gateway-secret");
  });
});
