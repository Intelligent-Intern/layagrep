import { chmod, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { bundledNotices, pythonRuntimeNotices } from "./package-notices.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const out = join(root, "apps/cli/dist");
const metadata = JSON.parse(await readFile(join(root, "apps/cli/package.json"), "utf8"));
await rm(out, { recursive: true, force: true });
await mkdir(join(out, "bin"), { recursive: true });
const build = await Bun.build({
  entrypoints: [join(root, "apps/cli/src/index.ts")],
  outdir: join(out, "bin"),
  target: "node",
  format: "esm",
  metafile: true,
  external: ["pyodide", "typescript"],
});
if (!build.success) throw new AggregateError(build.logs, "CLI build failed");
await chmod(join(out, "bin/index.js"), 0o755);
await writeFile(
  join(out, "THIRD_PARTY_NOTICES.txt"),
  (await bundledNotices(build.metafile!, process.cwd())) +
    (await pythonRuntimeNotices(metadata.dependencies.pyodide)),
);
await cp(join(root, "packages/core/src/python-worker.mjs"), join(out, "bin/python-worker.mjs"));
await cp(join(root, "LICENSE"), join(out, "LICENSE"));
await cp(join(root, "packages/core/assets"), join(out, "assets"), { recursive: true });
const skill = join(out, "skills/layagrep/SKILL.md");
await mkdir(dirname(skill), { recursive: true });
await cp(join(root, "skills/layagrep/SKILL.md"), skill);
