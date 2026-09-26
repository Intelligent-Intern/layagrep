import { readFile, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

/** Use emitted inputs, so the notice follows the actual bundled dependency graph. */
export async function bundledNotices(metafile, root) {
  const packages = new Map();
  let needsApacheTerms = false;
  for (const output of Object.values(metafile.outputs)) {
    for (const [input, contribution] of Object.entries(output.inputs)) {
      if (!contribution.bytesInOutput || !input.split("/").includes("node_modules")) continue;
      let directory = dirname(resolve(root, input));
      while (directory.split("/").includes("node_modules")) {
        let metadata;
        try {
          metadata = JSON.parse(await readFile(resolve(directory, "package.json"), "utf8"));
        } catch (error) {
          if (error.code !== "ENOENT") throw error;
        }
        if (metadata?.name && metadata.version) {
          const key = `${metadata.name}@${metadata.version}`;
          if (!packages.has(key)) {
            const files = (await readdir(directory, { withFileTypes: true }))
              .filter(
                (entry) =>
                  entry.isFile() && /^(?:licen[sc]e|copying|notice)(?:[.-]|$)/i.test(entry.name),
              )
              .map((entry) => entry.name)
              .sort();
            if (!files.length && key !== "@ai-sdk/provider-utils@5.0.45")
              throw new Error(`Bundled dependency ${key} has no license file`);
            if (metadata.license === "Apache-2.0") needsApacheTerms = true;
            const texts = await Promise.all(
              files.map(async (file) => {
                const text = await readFile(resolve(directory, file), "utf8");
                if (!text.trim()) throw new Error(`Empty license file in ${key}`);
                return `--- ${file} ---\n${text.trimEnd()}\n`;
              }),
            );
            if (!files.length)
              texts.push(
                await readFile(
                  new URL("./licenses/provider-utils-5.0.45.LICENSE", import.meta.url),
                  "utf8",
                ),
              );
            packages.set(
              key,
              `=== ${key} (${metadata.license ?? "see license below"}) ===\n${texts.join("\n")}`,
            );
          }
          break;
        }
        directory = dirname(directory);
      }
      if (!directory.split("/").includes("node_modules"))
        throw new Error(`No package metadata for bundled input ${input}`);
    }
  }
  if (!packages.size) throw new Error("Bundle metadata contains no dependency licenses");
  if (needsApacheTerms)
    packages.set(
      "Apache License 2.0 terms",
      `=== Apache License 2.0 terms ===\n${await readFile(new URL("./licenses/Apache-2.0.txt", import.meta.url), "utf8")}`,
    );
  return `Third-party notices for bundled JavaScript dependencies\n\n${[...packages]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, text]) => text)
    .join("\n")}`;
}
