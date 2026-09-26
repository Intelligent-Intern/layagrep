import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:http";
import {
  access,
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  stat,
  symlink,
  utimes,
  writeFile,
} from "node:fs/promises";
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
  let expectedQuery = query;
  const scratch = await mkdtemp(join(tmpdir(), "jg-installed-"));
  const tree = join(scratch, "repository");
  const home = join(scratch, "home");
  const config = join(scratch, "config");
  const cache = join(scratch, "cache");
  const children = new Set();
  const signalChild = (child, signal) => {
    if (!child.pid) return;
    try {
      process.kill(-child.pid, signal);
    } catch (error) {
      if (error.code !== "ESRCH") throw error;
    }
  };
  const requests = [];
  const protocolErrors = [];
  let malformedResponses = 0;
  let server;
  t.after(async () => {
    for (const child of children) signalChild(child, "SIGKILL");
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
      requests.push({ body, raw, receivedAt: performance.now() });
      if (mode === "rate-limit" && requests.length === 1) {
        response.writeHead(429, { "content-type": "application/json", "retry-after": "1" });
        response.end(JSON.stringify({ error: "fixture rate limit" }));
        return;
      }
      if (mode === "disconnect" && requests.length === 1) {
        response.destroy();
        return;
      }
      if (mode === "invalid-json") {
        response.writeHead(200, { "content-type": "application/json" });
        response.end("{broken");
        return;
      }
      if (mode === "stalled") return;
      if (mode === "interrupt") {
        for (const child of children) signalChild(child, "SIGINT");
        return;
      }
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
        assert.equal(body.state.query, expectedQuery);
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
    PATH: process.env.JEVGREP_TEST_PATH ?? "/opt/jevgrep/bin:/usr/local/bin:/usr/bin:/bin",
    HOME: home,
    XDG_CONFIG_HOME: config,
    XDG_CACHE_HOME: cache,
    TMPDIR: scratch,
    AI_GATEWAY_API_KEY: fixtureKey,
    AI_GATEWAY_BASE_URL: `http://127.0.0.1:${server.address().port}/v4/ai`,
  };
  const run = async (args, overrides = {}, head = false) => {
    const result = await new Promise((resolve, reject) => {
      const child = spawn(
        head ? "bash" : binary,
        head ? ["-o", "pipefail", "-c", '"$@" | head -200', "jg-pipe", binary, ...args] : args,
        {
          cwd: tree,
          detached: true,
          env: { ...env, ...overrides },
          stdio: ["ignore", "pipe", "pipe"],
        },
      );
      children.add(child);
      const stdout = [],
        stderr = [];
      let outputBytes = 0;
      const timer = setTimeout(
        () => signalChild(child, "SIGKILL"),
        mode === "stalled" ? 120_000 : 45_000,
      );
      for (const [stream, chunks] of [
        [child.stdout, stdout],
        [child.stderr, stderr],
      ])
        stream.on("data", (chunk) => {
          outputBytes += chunk.length;
          if (outputBytes > 2_000_000) signalChild(child, "SIGKILL");
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
    set query(value) {
      expectedQuery = value;
    },
    set mode(value) {
      mode = value;
    },
    get malformedResponses() {
      return malformedResponses;
    },
  };
}

function complete(result) {
  assert.equal(result.code, 0, result.stdout);
  assert.match(result.stdout, /^Jevgrep: \d+ relevant files\.\n/);
  assert.match(result.stdout, /^Jevgrep: 3 relevant files\.\n/);
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

function assertCachedRequestsAreReused(requests, before) {
  const previous = requests.slice(0, before);
  const seen = new Set(previous.map(({ raw }) => raw));
  const withoutEvidence = ({ state, ...rest }) =>
    JSON.stringify({ ...rest, state: { ...state, selectedEvidence: undefined } });
  for (const { raw, body } of requests.slice(before)) {
    assert.ok(!seen.has(raw), "An identical successful native request bypassed the cache");
    seen.add(raw);
    // Completion order is part of the frozen input; warm reads can create a genuinely new order.
    assert.ok(Array.isArray(body.state.selectedEvidence));
    const evidenceContents = (value) =>
      JSON.stringify(value.state.selectedEvidence.map((item) => JSON.stringify(item)).sort());
    assert.ok(
      previous.some(
        ({ body: value }) =>
          withoutEvidence(value) === withoutEvidence(body) &&
          Array.isArray(value.state.selectedEvidence) &&
          evidenceContents(value) === evidenceContents(body),
      ),
      "Warm retrieval changed more than the selected-evidence order",
    );
  }
}

function assertCachedRequestIsResent(requests, before) {
  const previous = new Set(requests.slice(0, before).map(({ raw }) => raw));
  assert.ok(
    requests.slice(before).some(({ raw }) => previous.has(raw)),
    "Bypassing or clearing cache must resend a previously cached exact request",
  );
}

test("installed runtime has no checkout or Python/Bun/compiler prerequisites", async () => {
  for (const executable of ["python3", "bun", "cc", "gcc", "clang", "make"]) {
    const result = spawnSync(executable, ["--version"], { encoding: "utf8" });
    assert.equal(result.error?.code, "ENOENT", `${executable} must be absent from final runtime`);
  }
  await assert.rejects(access("/checkout"), { code: "ENOENT" });
  assert.ok((await realpath(binary)).startsWith(`${packageDirectory}/`));
});

test("installed local commands match the package without credentials", async (t) => {
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
  assert.match(result.stdout, /^Jevgrep: \d+ relevant files\.\n/);
  assert.match(result.stdout, /^Jevgrep: 0 relevant files\.\n/);
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
  assert.match(result.stdout, /^Jevgrep: \d+ relevant files; discovery incomplete\.\n/);
  assert.ok(result.stdout.includes("py-evidence-alpha:"));
  assert.ok(result.stdout.includes("py-evidence-gamma:"));
  assert.match(result.stdout, /^Issue: /m);
});

test("warm cache reuses identical requests, no-cache bypasses reuse, and edits invalidate answers", async (t) => {
  const fixture = await context(t);
  const first = await fixture.run([query, fixture.tree]);
  complete(first);
  assert.ok(fixture.requests.length > 0);
  let before = fixture.requests.length;
  const warm = await fixture.run([query, fixture.tree]);
  complete(warm);
  assert.equal(warm.stdout, first.stdout);
  assertCachedRequestsAreReused(fixture.requests, before);
  t.diagnostic(
    `Cold HTTP requests: ${before}; novel warm evidence orders: ${fixture.requests.length - before}; identical requests reused and stdout identical.`,
  );
  const beforeBypass = fixture.requests.length;
  complete(await fixture.run([query, fixture.tree, "--no-cache"]));
  assertCachedRequestIsResent(fixture.requests, beforeBypass);
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
  assertCachedRequestsAreReused(fixture.requests, before);
  const cleared = await fixture.run(["cache", "clear"], { AI_GATEWAY_API_KEY: "" });
  assert.equal(cleared.code, 0, cleared.stdout);
  before = fixture.requests.length;
  assert.equal((await fixture.run([query, fixture.tree])).code, 0);
  assertCachedRequestIsResent(fixture.requests, before);
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
  assert.ok(!/^Jevgrep: \d+ relevant files\.\n/.test(result.stdout));
  assert.ok(!result.stdout.includes("py-evidence-"));
});

test("a transient navigation failure splits the batch and recovers installed retrieval", async (t) => {
  const fixture = await context(t, "transient");
  const result = await fixture.run([query]);
  assert.equal(result.code, 0);
  assert.match(result.stdout, /^Jevgrep: \d+ relevant files\.\n/);
  const original = fixture.requests[0].body.state.items;
  assert.ok(original.length > 1);
  const recovered = fixture.requests.slice(1, 3).flatMap(({ body }) => body.state.items);
  const withoutIds = (items) => items.map(({ id, ...item }) => JSON.stringify(item)).sort();
  assert.deepEqual(withoutIds(recovered), withoutIds(original));
  for (const [branch] of branches) assert.ok(result.stdout.includes(`py-evidence-${branch}:`));
});

test("interrupting an in-flight installed search exits 130 and stops requests", async (t) => {
  const fixture = await context(t, "interrupt");
  const result = await fixture.run([query]);
  assert.equal(result.code, 130);
  assert.match(result.stdout, /Interrupted\./);
  assert.equal(fixture.requests.length, 1);
});

test("invalid navigation JSON remains incomplete without retrying or splitting", async (t) => {
  const fixture = await context(t, "invalid-json");
  const result = await fixture.run([query]);
  assert.equal(result.code, 2);
  assert.match(result.stdout, /^Jevgrep: \d+ relevant files; discovery incomplete\.\n/);
  const attempts = new Map();
  for (const { raw } of fixture.requests) attempts.set(raw, (attempts.get(raw) ?? 0) + 1);
  assert.ok(attempts.size > 0);
  for (const count of attempts.values()) assert.equal(count, 1);
  assert.ok(!result.stdout.includes("py-evidence-"));
});

test("a disconnected navigation request recovers through reference-compatible splitting", async (t) => {
  const fixture = await context(t, "disconnect");
  const result = await fixture.run([query]);
  complete(result);
  const original = fixture.requests[0].body.state.items;
  assert.ok(original.length > 1);
  const recovered = fixture.requests.slice(1, 3).flatMap(({ body }) => body.state.items);
  const withoutIds = (items) => items.map(({ id, ...item }) => JSON.stringify(item)).sort();
  assert.deepEqual(withoutIds(recovered), withoutIds(original));
});

test("failed provider answers are retried after recovery rather than reused from cache", async (t) => {
  const fixture = await context(t, "invalid-json");
  assert.equal((await fixture.run([query])).code, 2);
  const failedRequests = fixture.requests.length;
  fixture.mode = "healthy";
  const recovered = await fixture.run([query]);
  assert.equal(recovered.code, 0);
  assert.ok(fixture.requests.length > failedRequests);
  for (const [branch] of branches) assert.ok(recovered.stdout.includes(`py-evidence-${branch}:`));
});

test("cache observes additions, deletions, ignore changes, and same-size edits with restored mtime", async (t) => {
  const fixture = await context(t);
  complete(await fixture.run([query]));
  const added = "delta/nested/fourth.py";
  await mkdir(join(fixture.tree, "delta/nested"), { recursive: true });
  await writeFile(join(fixture.tree, added), source("delta", "CollectorDelta"));
  let before = fixture.requests.length;
  const addition = await fixture.run([query]);
  assert.equal(addition.code, 0);
  assert.ok(addition.stdout.includes("py-evidence-delta:"));
  assert.ok(fixture.requests.slice(before).some(({ raw }) => raw.includes("py-evidence-delta:")));

  await rm(join(fixture.tree, "alpha/nested/first.py"));
  const deletion = await fixture.run([query]);
  assert.equal(deletion.code, 0);
  assert.ok(!deletion.stdout.includes("alpha/nested/first.py"));
  assert.ok(!deletion.stdout.includes("py-evidence-alpha:"));

  await writeFile(join(fixture.tree, ".ignore"), "ignored/\n*.skip.py\nbeta/\n");
  before = fixture.requests.length;
  const ignored = await fixture.run([query]);
  assert.equal(ignored.code, 0);
  assert.ok(!ignored.stdout.includes("py-evidence-beta:"));
  assert.ok(!fixture.requests.slice(before).some(({ raw }) => raw.includes("py-evidence-beta:")));

  const path = join(fixture.tree, "gamma/nested/third.py");
  const original = await stat(path);
  await writeFile(
    path,
    source("gamma", "CollectorGamma").replace("py-evidence-gamma:", "py-evidence-GAMMA:"),
  );
  await utimes(path, original.atime, original.mtime);
  before = fixture.requests.length;
  const edited = await fixture.run([query]);
  assert.equal(edited.code, 0);
  assert.ok(edited.stdout.includes("py-evidence-GAMMA:"));
  assert.ok(!edited.stdout.includes("py-evidence-gamma:"));
  assert.ok(fixture.requests.slice(before).some(({ raw }) => raw.includes("py-evidence-GAMMA:")));
});

test("filesystem policy survives wide and deep installed traversal with excluded sentinels", async (t) => {
  const fixture = await context(t);
  const wide = join(fixture.tree, "wide");
  await mkdir(wide);
  for (let index = 0; index < 129; index++) {
    await writeFile(join(wide, `${index}.skip.py`), forbidden);
  }
  const relative = ["wide", ...Array.from({ length: 12 }, (_, i) => `d${i}`), "odd\nname.py"].join(
    "/",
  );
  const parent = join(fixture.tree, relative.slice(0, relative.lastIndexOf("/")));
  await mkdir(parent, { recursive: true });
  await writeFile(join(fixture.tree, relative), source("wide", "CollectorWide"));
  await writeFile(join(wide, ".hidden.py"), forbidden);
  await writeFile(join(wide, "binary.py"), Buffer.from(`\0${forbidden}`));
  await writeFile(join(wide, "key.txt"), `-----BEGIN PRIVATE KEY-----\n${forbidden}`);
  const outside = join(fixture.tree, "..", "outside.py");
  await writeFile(outside, forbidden);
  await symlink(outside, join(wide, "escape.py"));
  await symlink(wide, join(wide, "cycle"));
  assert.equal(spawnSync("mkfifo", [join(wide, "pipe")]).status, 0);
  await writeFile(join(wide, "unreadable.py"), forbidden);
  await chmod(join(wide, "unreadable.py"), 0);

  const nested = join(fixture.tree, "nested-repo");
  await mkdir(nested);
  await writeFile(join(fixture.tree, ".gitignore"), "nested-repo/*.py\n");
  await writeFile(join(nested, ".git"), "gitdir: elsewhere\n");
  await writeFile(join(nested, ".gitignore"), "blocked_local.py\n");
  await writeFile(
    join(fixture.tree, ".ignore"),
    "ignored/\n*.skip.py\nnested-repo/blocked_parent.py\n",
  );
  await writeFile(join(nested, "allowed.py"), source("nested", "CollectorNested"));
  await writeFile(join(nested, "blocked_local.py"), forbidden);
  await writeFile(join(nested, "blocked_parent.py"), forbidden);

  const result = await fixture.run([query]);
  assert.equal(result.code, 2);
  assert.match(result.stdout, /Issue: "unreadable"/);
  assert.ok(result.stdout.includes("py-evidence-nested:"));
  assert.ok(result.stdout.includes(JSON.stringify(relative)));
  assert.ok(result.stdout.includes("py-evidence-wide:"));
  for (const [branch] of branches) assert.ok(result.stdout.includes(`py-evidence-${branch}:`));
  assert.ok(fixture.requests.some(({ raw }) => raw.includes("py-evidence-wide:")));
});

test("a changed query cannot reuse another query's cached evaluations", async (t) => {
  const fixture = await context(t);
  complete(await fixture.run([query]));
  const before = fixture.requests.length;
  const changedQuery = "Find recording methods and their event return values.";
  fixture.query = changedQuery;
  complete(await fixture.run([changedQuery]));
  assert.ok(fixture.requests.length > before);
  assert.ok(fixture.requests.slice(before).every(({ body }) => body.state.query === changedQuery));
});

test(
  "a stalled provider response exhausts bounded installed timeouts",
  { timeout: 130_000 },
  async (t) => {
    const fixture = await context(t, "stalled");
    await rm(fixture.tree, { recursive: true });
    await mkdir(fixture.tree);
    await writeFile(join(fixture.tree, "only.py"), source("only", "CollectorOnly"));
    const result = await fixture.run([query]);
    assert.equal(result.code, 2);
    assert.match(result.stdout, /^Jevgrep: \d+ relevant files; discovery incomplete\.\n/);
    assert.equal(fixture.requests.length, 2);
  },
);

test("a head -200 consumer closes the stdout pipe without leaving jg running", async (t) => {
  const fixture = await context(t);
  await rm(fixture.tree, { recursive: true });
  await mkdir(fixture.tree);
  const large = Array.from(
    { length: 500 },
    (_, i) =>
      `class Collector${i}${"A".repeat(96)}:\n    def record_event(self):\n        return "py-evidence-pipe"\n`,
  ).join("\n");
  await writeFile(join(fixture.tree, "only.py"), large);
  const result = await fixture.run([query], {}, true);
  assert.equal(result.code, 0);
  assert.match(result.stdout, /^Jevgrep: \d+ relevant files\.\n/);
  assert.equal(result.stdout.trimEnd().split("\n").length, 200);
  assert.ok(!result.stdout.includes("End context."));
});

test("a rate-limited provider retry waits and recovers the installed evidence", async (t) => {
  const fixture = await context(t, "rate-limit");
  const result = await fixture.run([query]);
  complete(result);
  assert.deepEqual(fixture.requests[0].body, fixture.requests[1].body);
  assert.ok(fixture.requests[1].receivedAt - fixture.requests[0].receivedAt >= 950);
  assert.equal(fixture.requests.filter(({ raw }) => raw === fixture.requests[0].raw).length, 2);
});

test("source budget preserves every file and lead while explicitly omitting source", async (t) => {
  const fixture = await context(t);
  const unlimited = await fixture.run([query, "--max-source-bytes", "0"]);
  complete(unlimited);
  const before = fixture.requests.length;
  const bounded = await fixture.run([query, "--max-source-bytes", "1"]);
  assert.equal(bounded.code, 0);
  assert.match(bounded.stdout, /Source omitted: [1-9]/);
  assert.ok(!bounded.stdout.includes("py-evidence-"));
  const locations = (stdout) =>
    stdout.split("\n").flatMap((line) => {
      const file = /^- ("(?:[^"\\]|\\.)*") —/.exec(line);
      if (file) return [file[1]];
      return line.startsWith("  Reading lead ") ? [line] : [];
    });
  const expectedLocations = locations(unlimited.stdout);
  assert.equal(expectedLocations.filter((line) => line.startsWith('"')).length, branches.length);
  assert.ok(expectedLocations.some((line) => line.startsWith("  Reading lead ")));
  assert.deepEqual(locations(bounded.stdout), expectedLocations);
  assertCachedRequestsAreReused(fixture.requests, before);
});
