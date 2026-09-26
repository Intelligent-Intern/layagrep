import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import { access, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

// This suite intentionally cannot fall back to a checkout-local executable.
const binary = process.env.JEVGREP_INSTALLED_BINARY;
const packageDirectory = process.env.JEVGREP_INSTALLED_PACKAGE;
const expectedSkill = process.env.JEVGREP_EXPECTED_SKILL;
assert.ok(
  binary && packageDirectory && expectedSkill,
  "Run scripts/test-installed.sh in the Node-only container",
);
const fixtureKey = "installed-http-fixture-key";
const forbidden = "INSTALLED_FIXTURE_IGNORED_CONTENT_MUST_NEVER_UPLOAD";
const query = "Find event recording implementations across the nested packages.";
const branches = [
  ["alpha", "first.py", "CollectorAlpha"],
  ["beta", "second.py", "CollectorBeta"],
  ["gamma", "third.py", "CollectorGamma"],
];
const source = (branch, name) =>
  `# Synthetic installed-package fixture\nclass ${name}:\n    """Records an event in the ${branch} package."""\n    @staticmethod\n    def record_event(value):\n        return "py-evidence-${branch}:" + value\n\n    def unrelated():\n        return "unrelated"\n`;

async function context(t, mode = "healthy") {
  const scratch = await mkdtemp(join(tmpdir(), "jg-installed-"));
  const tree = join(scratch, "repository");
  const home = join(scratch, "home");
  const config = join(scratch, "config");
  const cache = join(scratch, "cache");
  const children = new Set();
  const requests = [];
  const protocolErrors = [];
  let malformedResponses = 0;
  let server;
  t.after(async () => {
    for (const child of children) child.kill("SIGKILL");
    if (server) {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
    await rm(scratch, { recursive: true, force: true });
    assert.deepEqual(
      protocolErrors,
      [],
      "The installed SDK must satisfy the HTTP fixture contract",
    );
  });
  await Promise.all([tree, home, config, cache].map((path) => mkdir(path, { recursive: true })));
  for (const [branch, file, name] of branches) {
    const directory = join(tree, branch, "nested");
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, file), source(branch, name));
  }
  await mkdir(join(tree, "ignored"));
  await writeFile(join(tree, ".ignore"), "ignored/\n*.skip.py\n");
  await writeFile(join(tree, "ignored", "should-not-upload.py"), `value = "${forbidden}"\n`);
  await writeFile(join(tree, "hidden.skip.py"), `value = "${forbidden}"\n`);
  await writeFile(join(tree, ".env"), `PRIVATE_VALUE=${forbidden}\n`);
  await writeFile(join(tree, "unrelated.md"), "This is an unrelated gardening document.\n");
  server = createServer((request, response) => {
    void (async () => {
      assert.equal(request.method, "POST");
      assert.equal(request.url, "/v4/ai/evaluation-model");
      assert.equal(request.headers.authorization, `Bearer ${fixtureKey}`);
      assert.equal(request.headers["ai-model-id"], "typesafe-ai/jev");
      assert.equal(request.headers["ai-evaluation-model-specification-version"], "4");
      assert.equal(request.headers["ai-gateway-protocol-version"], "0.0.1");
      assert.match(request.headers["content-type"] ?? "", /^application\/json/);
      const chunks = [];
      let bytes = 0;
      for await (const chunk of request) {
        bytes += chunk.length;
        assert.ok(bytes <= 1_000_000, "The synthetic fixture must use bounded requests");
        chunks.push(chunk);
      }
      const raw = Buffer.concat(chunks).toString("utf8");
      assert.ok(!raw.includes(forbidden), "Ignored/hidden source reached the provider");
      const body = JSON.parse(raw);
      assert.deepEqual(Object.keys(body), ["state", "questions", "providerOptions"]);
      assert.equal(
        typeof body.state,
        "object",
        "state must remain native JSON, not a serialized string",
      );
      assert.ok(body.state !== null && !Array.isArray(body.state));
      assert.ok(Object.keys(body.questions).length > 0);
      for (const question of Object.values(body.questions)) {
        assert.equal(question.type, "boolean");
        assert.ok(typeof question.instructions === "string" && question.instructions.length > 0);
      }
      assert.ok(requests.length < 256, "Synthetic search stopped making bounded forward progress");
      requests.push({ body, raw });
      if (mode === "transient" && requests.length === 1) {
        response.writeHead(500, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "temporary fixture failure" }));
        return;
      }
      if (mode === "unauthorized") {
        response.writeHead(401, { "content-type": "application/json" });
        response.end(JSON.stringify({ error: "fixture credential rejected" }));
        return;
      }
      let probabilities;
      if (Array.isArray(body.state.items)) {
        assert.equal(body.state.query, query);
        probabilities = body.state.items.map((item) =>
          mode === "negative"
            ? 0.05
            : item.kind === "directory" || item.path.endsWith(".py")
              ? 0.95
              : 0.05,
        );
      } else if (Array.isArray(body.state.declarations)) {
        assert.equal(typeof body.state.source, "string");
        if (mode === "partial" && body.state.path === "beta/nested/second.py") {
          malformedResponses++;
          response.writeHead(200, { "content-type": "application/json" });
          response.end(JSON.stringify({ answers: {} }));
          return;
        }
        probabilities = body.state.declarations.map((declaration) => {
          assert.ok(Number.isInteger(declaration.startLine) && declaration.startLine >= 1);
          assert.ok(declaration.endLine >= declaration.startLine);
          return declaration.name.endsWith(".record_event") ? 0.95 : 0.05;
        });
      } else if (Object.hasOwn(body.questions, "implementation")) {
        probabilities = Object.keys(body.questions).map((name) =>
          name === "implementation" ? 0.95 : 0.05,
        );
      } else if (
        Object.keys(body.questions).join() === "relevant" &&
        typeof body.state.source === "string"
      ) {
        probabilities = [0.95];
      } else {
        assert.fail(`Unknown request stage: ${Object.keys(body.state).join(",")}`);
      }
      const ids = Object.keys(body.questions);
      assert.equal(probabilities.length, ids.length);
      response.writeHead(200, { "content-type": "application/json" });
      response.end(
        JSON.stringify({
          answers: Object.fromEntries(
            ids.map((id, index) => [id, { type: "boolean", probability: probabilities[index] }]),
          ),
          usage: { inputTokens: 1, outputTokens: 1 },
          warnings: [{ type: "other", message: "installed-fixture-warning" }],
        }),
      );
    })().catch((error) => {
      protocolErrors.push(error.message);
      response.writeHead(400, { "content-type": "application/json" });
      response.end(JSON.stringify({ error: "Installed fixture contract rejected the request" }));
    });
  });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const env = {
    PATH: "/opt/jevgrep/bin:/usr/local/bin:/usr/bin:/bin",
    HOME: home,
    XDG_CONFIG_HOME: config,
    XDG_CACHE_HOME: cache,
    TMPDIR: scratch,
    AI_GATEWAY_API_KEY: fixtureKey,
    AI_GATEWAY_BASE_URL: `http://127.0.0.1:${server.address().port}/v4/ai`,
  };
  const run = async (args, overrides = {}) => {
    const result = await new Promise((resolve, reject) => {
      const child = spawn(binary, args, {
        cwd: tree,
        env: { ...env, ...overrides },
        stdio: ["ignore", "pipe", "pipe"],
      });
      children.add(child);
      const stdout = [],
        stderr = [];
      let outputBytes = 0;
      const timer = setTimeout(() => child.kill("SIGKILL"), 45_000);
      for (const [stream, chunks] of [
        [child.stdout, stdout],
        [child.stderr, stderr],
      ])
        stream.on("data", (chunk) => {
          outputBytes += chunk.length;
          if (outputBytes > 2_000_000) child.kill("SIGKILL");
          else chunks.push(chunk);
        });
      child.once("error", (error) => {
        clearTimeout(timer);
        children.delete(child);
        reject(error);
      });
      child.once("close", (code, signal) => {
        clearTimeout(timer);
        children.delete(child);
        resolve({
          code,
          signal,
          stdout: Buffer.concat(stdout).toString("utf8"),
          stderr: Buffer.concat(stderr).toString("utf8"),
        });
      });
    });
    assert.equal(result.signal, null, "Installed command timed out or exceeded its output bound");
    assert.equal(
      result.stderr,
      "",
      "All application output, including SDK warnings, belongs on stdout",
    );
    assert.ok(!result.stdout.includes(fixtureKey));
    assert.ok(!result.stdout.includes("installed-fixture-warning"));
    assert.ok(!result.stdout.includes(forbidden));
    return result;
  };
  return {
    run,
    tree,
    requests,
    get malformedResponses() {
      return malformedResponses;
    },
  };
}

function complete(result) {
  assert.equal(result.code, 0, result.stdout);
  assert.match(result.stdout, /^Status: complete\n/);
  assert.match(result.stdout, /Relevant files: 3\n/);
  for (const [branch, file] of branches) {
    assert.ok(
      result.stdout.includes(`"${branch}/nested/${file}"`),
      `Missing ${branch} file location`,
    );
    assert.ok(
      result.stdout.includes(`py-evidence-${branch}:`),
      `Missing ${branch} implementation source`,
    );
  }
}

test("installed runtime has no checkout or Python/Bun/compiler prerequisites", async (t) => {
  for (const executable of ["python3", "bun", "cc", "gcc", "clang", "make"]) {
    const result = spawnSync(executable, ["--version"], { encoding: "utf8" });
    assert.equal(result.error?.code, "ENOENT", `${executable} must be absent from final runtime`);
  }
  await assert.rejects(access("/checkout"), { code: "ENOENT" });
  assert.ok((await realpath(binary)).startsWith(`${packageDirectory}/`));
  const fixture = await context(t);
  const metadata = JSON.parse(await readFile(join(packageDirectory, "package.json"), "utf8"));
  assert.equal(metadata.name, "@dzhng/jevgrep");
  t.diagnostic(
    `Runtime ${process.version} ${process.platform}/${process.arch}; installed ${metadata.name}@${metadata.version}`,
  );
  const noCredentials = { AI_GATEWAY_API_KEY: "" };
  const help = await fixture.run(["--help"], noCredentials);
  assert.equal(help.code, 0, help.stdout);
  assert.match(help.stdout, /Usage: jg /);
  const version = await fixture.run(["--version"], noCredentials);
  assert.equal(version.code, 0, version.stdout);
  assert.equal(version.stdout, `${metadata.version}\n`);
  const skill = await fixture.run(["skill"], noCredentials);
  assert.equal(skill.code, 0, skill.stdout);
  assert.equal(skill.stdout, await readFile(expectedSkill, "utf8"));
  assert.equal(
    await readFile(join(packageDirectory, "dist/skills/jevgrep/SKILL.md"), "utf8"),
    skill.stdout,
  );
  assert.equal(fixture.requests.length, 0, "Local commands must not contact Gateway");
});

test("actual installed search parses Python and returns every relevant hierarchy branch", async (t) => {
  const fixture = await context(t);
  const result = await fixture.run([query, fixture.tree, "--no-cache"]);
  complete(result);
  const items = fixture.requests.flatMap(({ body }) => body.state.items ?? []);
  assert.ok(
    items.some((item) => item.kind === "directory"),
    "The test must cross a classified directory frontier",
  );
  const declarations = fixture.requests.flatMap(({ body }) => body.state.declarations ?? []);
  for (const [, , name] of branches)
    assert.ok(
      declarations.some(
        (d) => d.name === `${name}.record_event` && d.startLine === 4 && d.endLine === 6,
      ),
      "Packaged Python parser must produce decorated method coordinates",
    );
  t.diagnostic(
    `Parsed Python methods: ${JSON.stringify(declarations.filter((declaration) => declaration.name.endsWith(".record_event")))}`,
  );
  assert.ok(!result.stdout.includes("unrelated.md"));
  const before = fixture.requests.length;
  complete(await fixture.run([query, fixture.tree]));
  assert.ok(
    fixture.requests.length > before,
    "A preceding --no-cache search must not populate reusable answers",
  );
});

test("healthy negative evaluations produce a complete empty result", async (t) => {
  const fixture = await context(t, "negative");
  const result = await fixture.run([query, fixture.tree, "--no-cache"]);
  assert.equal(result.code, 0, result.stdout);
  assert.match(result.stdout, /^Status: complete\n/);
  assert.match(result.stdout, /Relevant files: 0\n/);
  assert.ok(fixture.requests.length > 0);
});

test("malformed provider answers preserve useful source and return incomplete exit 2", async (t) => {
  const fixture = await context(t, "partial");
  const result = await fixture.run([query, fixture.tree, "--no-cache"]);
  assert.ok(
    fixture.malformedResponses > 0,
    "The installed SDK must actually receive malformed answers",
  );
  assert.equal(result.code, 2, result.stdout);
  assert.match(result.stdout, /^Status: incomplete\n/);
  assert.ok(result.stdout.includes("py-evidence-alpha:"));
  assert.ok(result.stdout.includes("py-evidence-gamma:"));
  assert.match(result.stdout, /^Issue: /m);
});

test("warm cache avoids HTTP, no-cache bypasses reuse, and edited content invalidates answers", async (t) => {
  const fixture = await context(t);
  const first = await fixture.run([query, fixture.tree]);
  complete(first);
  assert.ok(fixture.requests.length > 0);
  let before = fixture.requests.length;
  const warm = await fixture.run([query, fixture.tree]);
  complete(warm);
  assert.equal(warm.stdout, first.stdout);
  assert.equal(
    fixture.requests.length,
    before,
    "Warm search must reuse every identical successful evaluation",
  );
  complete(await fixture.run([query, fixture.tree, "--no-cache"]));
  assert.ok(fixture.requests.length > before, "--no-cache must reach the HTTP fixture");
  const edited = join(fixture.tree, "alpha/nested/first.py");
  await writeFile(
    edited,
    source("alpha", "CollectorAlpha").replace("py-evidence-alpha:", "edited-alpha-evidence:"),
  );
  before = fixture.requests.length;
  const changed = await fixture.run([query, fixture.tree]);
  assert.equal(changed.code, 0, changed.stdout);
  assert.ok(changed.stdout.includes("edited-alpha-evidence:"));
  assert.ok(!changed.stdout.includes("py-evidence-alpha:"));
  assert.ok(
    fixture.requests.slice(before).some(({ raw }) => raw.includes("edited-alpha-evidence:")),
    "Changed source must reach Gateway instead of stale cache evidence",
  );
  before = fixture.requests.length;
  assert.equal((await fixture.run([query, fixture.tree])).stdout, changed.stdout);
  assert.equal(fixture.requests.length, before);
  const cleared = await fixture.run(["cache", "clear"], { AI_GATEWAY_API_KEY: "" });
  assert.equal(cleared.code, 0, cleared.stdout);
  before = fixture.requests.length;
  assert.equal((await fixture.run([query, fixture.tree])).code, 0);
  assert.ok(fixture.requests.length > before, "Clearing the cache must remove the prior answers");
});

test("doctor uses the installed SDK while missing credentials fail cleanly", async (t) => {
  const fixture = await context(t);
  const doctor = await fixture.run(["doctor"]);
  assert.equal(doctor.code, 0, doctor.stdout);
  assert.ok(fixture.requests.length > 0);
  const before = fixture.requests.length;
  const missing = await fixture.run([query, fixture.tree], { AI_GATEWAY_API_KEY: "" });
  assert.equal(missing.code, 1, missing.stdout);
  assert.ok(missing.stdout.trim().length > 0);
  assert.equal(fixture.requests.length, before);
});

test("provider authentication failure stops immediately with fatal exit 1", async (t) => {
  const fixture = await context(t, "unauthorized");
  const result = await fixture.run([query]);
  assert.equal(result.code, 1);
  assert.equal(fixture.requests.length, 1);
  assert.ok(!result.stdout.includes("Status: complete"));
  assert.ok(!result.stdout.includes("py-evidence-"));
});

test("a transient provider failure retries the same request and completes installed retrieval", async (t) => {
  const fixture = await context(t, "transient");
  const result = await fixture.run([query]);
  assert.equal(result.code, 0);
  assert.match(result.stdout, /Status: complete/);
  assert.deepEqual(fixture.requests[0].body, fixture.requests[1].body);
  for (const [branch] of branches) assert.ok(result.stdout.includes(`py-evidence-${branch}:`));
});
