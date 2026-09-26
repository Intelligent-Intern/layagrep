import { test } from "node:test";
import assert from "node:assert/strict";
import { releaseIdentity } from "../scripts/validate-release.mjs";
const metadata = {
  name: "@dzhng/jevgrep",
  version: "1.2.3",
  bin: { jg: "./dist/bin/index.js" },
  publishConfig: { access: "public" },
  license: "MIT",
  engines: { node: ">=22" },
  dependencies: { typescript: "5.9.3", "web-tree-sitter": "0.25.10" },
};
test("release tags select the authored version and keep prereleases off latest", () => {
  assert.deepEqual(releaseIdentity(metadata, "v1.2.3"), {
    name: "@dzhng/jevgrep",
    version: "1.2.3",
    distTag: "latest",
  });
  assert.equal(
    releaseIdentity({ ...metadata, version: "1.3.0-rc.1" }, "v1.3.0-rc.1").distTag,
    "next",
  );
  for (const [value, tag] of [
    [metadata, "v1.2.4"],
    [{ ...metadata, version: "0.0.0" }, "v0.0.0"],
    [{ ...metadata, version: "1.2.3-01" }, "v1.2.3-01"],
    [{ ...metadata, name: "jevgrep" }, "v1.2.3"],
    [{ ...metadata, bin: { jevgrep: "./dist/bin/index.js" } }, "v1.2.3"],
  ])
    assert.throws(() => releaseIdentity(value, tag));
});

test("bundled notices retain emitted dependency licenses and exclude unbundled modules", async (t) => {
  const { mkdtemp, mkdir, writeFile, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const root = await mkdtemp(join(tmpdir(), "jg-notices-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const dependency = join(root, "node_modules/example");
  await mkdir(dependency, { recursive: true });
  await writeFile(
    join(dependency, "package.json"),
    JSON.stringify({ name: "example", version: "1.0.0", license: "MIT" }),
  );
  await writeFile(join(dependency, "LICENSE"), "MIT license fixture: preserve this copyright.\n");
  const { bundledNotices } = await import("../scripts/package-notices.mjs");
  const text = await bundledNotices(
    {
      outputs: {
        "index.js": {
          inputs: {
            "node_modules/example/index.js": { bytesInOutput: 10 },
            "node_modules/removed/index.js": { bytesInOutput: 0 },
            "src/index.ts": { bytesInOutput: 50 },
          },
        },
      },
    },
    root,
  );
  assert.ok(text.includes("example@1.0.0"));
  assert.ok(text.includes("MIT license fixture: preserve this copyright.\n"));
  assert.ok(!text.includes("removed"));
  await rm(join(dependency, "LICENSE"));
  await assert.rejects(
    bundledNotices(
      {
        outputs: {
          "index.js": { inputs: { "node_modules/example/index.js": { bytesInOutput: 10 } } },
        },
      },
      root,
    ),
    /license/i,
  );
});

test("archive validation rejects changed skill bytes and accidental source payloads", async (t) => {
  const { mkdtemp, mkdir, writeFile, rm, cp, chmod } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const execute = promisify(execFile),
    root = await mkdtemp(join(tmpdir(), "jg-release-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const files = {
    "apps/cli/package.json": JSON.stringify(metadata),
    LICENSE: "MIT canonical copyright\n",
    "skills/jevgrep/SKILL.md": "Use jg for unfamiliar code.\n",
    "packages/core/assets/tree-sitter-python.wasm": "fixture wasm",
    "packages/core/assets/tree-sitter-python.LICENSE": "fixture grammar license",
  };
  for (const [path, text] of Object.entries(files)) {
    await mkdir(join(root, path, ".."), { recursive: true });
    await writeFile(join(root, path), text);
  }
  const archiveRoot = join(root, "archive"),
    pkg = join(archiveRoot, "package");
  await mkdir(join(pkg, "dist/bin"), { recursive: true });
  await mkdir(join(pkg, "dist/skills/jevgrep"), { recursive: true });
  await mkdir(join(pkg, "dist/assets"), { recursive: true });
  for (const [from, to] of [
    ["apps/cli/package.json", "package.json"],
    ["LICENSE", "dist/LICENSE"],
    ["skills/jevgrep/SKILL.md", "dist/skills/jevgrep/SKILL.md"],
    ["packages/core/assets/tree-sitter-python.wasm", "dist/assets/tree-sitter-python.wasm"],
    ["packages/core/assets/tree-sitter-python.LICENSE", "dist/assets/tree-sitter-python.LICENSE"],
  ])
    await cp(join(root, from), join(pkg, to));
  await writeFile(join(pkg, "dist/bin/index.js"), '#!/usr/bin/env node\nconsole.log("jg");\n');
  await chmod(join(pkg, "dist/bin/index.js"), 0o755);
  await writeFile(
    join(pkg, "dist/THIRD_PARTY_NOTICES.txt"),
    "Third-party notices for bundled JavaScript dependencies\n\n=== example@1.0.0 (MIT) ===\nFixture license\n",
  );
  const tarball = join(root, "package.tgz"),
    pack = () => execute("tar", ["-czf", tarball, "-C", archiveRoot, "package"]);
  const { validateRelease } = await import("../scripts/validate-release.mjs");
  await pack();
  assert.equal((await validateRelease(tarball, "v1.2.3", root)).version, "1.2.3");
  await writeFile(join(pkg, "dist/skills/jevgrep/SKILL.md"), "Changed skill");
  await pack();
  await assert.rejects(validateRelease(tarball, "v1.2.3", root), /canonical source/);
  await cp(join(root, "skills/jevgrep/SKILL.md"), join(pkg, "dist/skills/jevgrep/SKILL.md"));
  await writeFile(join(pkg, "dist/assets/customer-data.json"), "Do not publish");
  await pack();
  await assert.rejects(validateRelease(tarball, "v1.2.3", root), /Unexpected published file/);
  await rm(join(pkg, "dist/assets/customer-data.json"));
  await mkdir(join(pkg, "evals"));
  await writeFile(join(pkg, "evals/personal.txt"), "Do not publish");
  await pack();
  await assert.rejects(validateRelease(tarball, "v1.2.3", root), /Unexpected published file/);
});
