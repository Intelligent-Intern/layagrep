import { execFile } from "node:child_process";
import { appendFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { promisify } from "node:util";
import { releaseIdentity, repository, validateRelease } from "./validate-release.mjs";
const execute = promisify(execFile);
try {
  const [tag, destination] = process.argv.slice(2);
  if (!tag || !destination)
    throw new Error("Usage: node scripts/prepare-release.mjs vVERSION output-directory");
  releaseIdentity(
    JSON.parse(await readFile(resolve(repository, "apps/cli/package.json"), "utf8")),
    tag,
  );
  const directory = resolve(destination);
  await mkdir(directory, { recursive: true });
  const packed = await execute(
    "npm",
    ["pack", "./apps/cli", "--json", "--ignore-scripts", "--pack-destination", directory],
    { cwd: repository, maxBuffer: 8_000_000 },
  );
  const entries = JSON.parse(packed.stdout);
  if (entries.length !== 1 || basename(entries[0].filename) !== entries[0].filename)
    throw new Error("Expected one package tarball");
  const result = await validateRelease(resolve(directory, entries[0].filename), tag);
  await writeFile(
    resolve(directory, "release-manifest.json"),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  if (process.env.GITHUB_OUTPUT)
    await appendFile(
      process.env.GITHUB_OUTPUT,
      `tarball=${result.tarball}\nversion=${result.version}\ndist_tag=${result.distTag}\nintegrity=${result.integrity}\n`,
    );
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.log(`Release preparation failed: ${error.message}`);
  process.exitCode = 1;
}
