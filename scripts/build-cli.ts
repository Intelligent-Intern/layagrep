import { chmod, cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const out = join(root, "apps/cli/dist");
await rm(out, { recursive: true, force: true });
await mkdir(join(out, "bin"), { recursive: true });
const build = await Bun.build({
  entrypoints: [join(root, "apps/cli/src/index.ts")],
  outdir: join(out, "bin"),
  target: "node",
  format: "esm",
  external: ["web-tree-sitter", "typescript"],
});
if (!build.success) throw new AggregateError(build.logs, "CLI build failed");
await chmod(join(out, "bin/index.js"), 0o755);
await cp(join(root, "packages/core/assets"), join(out, "assets"), { recursive: true });
const skill = join(out, "skills/jevgrep/SKILL.md");
await mkdir(dirname(skill), { recursive: true });
await cp(join(root, "skills/jevgrep/SKILL.md"), skill);
