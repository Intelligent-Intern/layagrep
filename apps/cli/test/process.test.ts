import { expect } from "bun:test";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { testInDocker, withCli } from "./cli";

const execute = promisify(execFile);
const cli =
  process.env.JEVGREP_TEST_CLI ?? fileURLToPath(new URL("../dist/bin/index.js", import.meta.url));

testInDocker("a closed stdout pipe exits quietly", async () => {
  await withCli(async ({ home }) => {
    const { stdout } = await execute(
      "python3",
      [
        "-c",
        `
import json, os, subprocess, sys
reader, writer = os.pipe()
os.close(reader)
process = subprocess.Popen(["node", sys.argv[1], "--help"], stdout=writer, stderr=subprocess.PIPE)
os.close(writer)
try:
    _, errors = process.communicate(timeout=5)
    print(json.dumps({"code": process.returncode, "stderr": errors.decode()}))
finally:
    if process.poll() is None:
        process.kill()
        process.wait()
`,
        cli,
      ],
      { env: { ...process.env, HOME: home, AI_GATEWAY_API_KEY: "" } },
    );
    expect(JSON.parse(stdout)).toEqual({ code: 0, stderr: "" });
  });
});

testInDocker("interactive auth hides input and exits 130 on interruption", async () => {
  await withCli(async ({ home }) => {
    for (const mode of ["save", "interrupt"]) {
      const { stdout } = await execute(
        "python3",
        [
          "-c",
          `
import json, os, pty, select, signal, subprocess, sys, time
master, slave = pty.openpty()
process = subprocess.Popen(["node", sys.argv[1], "auth"], stdin=slave, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
os.close(slave)
output = b""
try:
    deadline = time.monotonic() + 5
    while b"API key" not in output:
        if time.monotonic() >= deadline:
            raise RuntimeError("Auth prompt did not appear")
        if select.select([process.stdout], [], [], 0.1)[0]:
            output += os.read(process.stdout.fileno(), 4096)
    if sys.argv[2] == "save":
        os.write(master, b"pty-fixture-secret\\r")
    else:
        process.send_signal(signal.SIGINT)
    rest, errors = process.communicate(timeout=5)
    output += rest
    echo = b""
    while select.select([master], [], [], 0)[0]:
        try:
            part = os.read(master, 4096)
            if not part: break
            echo += part
        except OSError: break
    print(json.dumps({"code": process.returncode, "stdout": output.decode(), "stderr": errors.decode(), "echo": echo.decode()}))
finally:
    if process.poll() is None:
        process.kill()
        process.wait()
    os.close(master)
`,
          cli,
          mode,
        ],
        { env: { ...process.env, HOME: home, XDG_CONFIG_HOME: home, AI_GATEWAY_API_KEY: "" } },
      );
      const result = JSON.parse(stdout);
      expect(result.code).toBe(mode === "save" ? 0 : 130);
      expect(result.stderr).toBe("");
      expect(result.stdout + result.echo).not.toContain("pty-fixture-secret");
      expect(result.stdout).toContain(mode === "save" ? "key saved" : "Interrupted");
    }
  });
});
