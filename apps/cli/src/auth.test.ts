import { expect, test } from "bun:test";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

test("auth accepts a piped key, stores it privately, and never echoes it", async () => {
  const home = await mkdtemp(join(tmpdir(), "jevgrep-auth-"));
  try {
    const child = Bun.spawn(
      [process.execPath, join(import.meta.dir, "index.ts"), "auth", "--stdin"],
      {
        env: { ...process.env, XDG_CONFIG_HOME: home, AI_GATEWAY_API_KEY: "" },
        stdin: new Blob(["test-gateway-secret\n"]),
        stdout: "pipe",
        stderr: "pipe",
      },
    );
    const output =
      (await new Response(child.stdout).text()) + (await new Response(child.stderr).text());
    expect(await child.exited).toBe(0);
    expect(output).not.toContain("test-gateway-secret");
    const file = join(home, "jevgrep", "credentials.json");
    expect(JSON.parse(await readFile(file, "utf8")).apiKey).toBe("test-gateway-secret");
    expect((await stat(file)).mode & 0o777).toBe(0o600);
  } finally {
    await rm(home, { recursive: true, force: true });
  }
});
