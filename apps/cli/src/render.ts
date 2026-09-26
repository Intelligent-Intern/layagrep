import type { RetrievalResult } from "@repo/core";

function quote(value: string): string {
  return JSON.stringify(value).replace(
    /[\u007f-\u009f\u2028-\u202e\u2066-\u2069]/g,
    (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
}

/** Allocate whole excerpts so a byte limit cannot invalidate their source coordinates. */
export function renderResult(result: RetrievalResult, maxSourceBytes = 0): string {
  let remaining = maxSourceBytes || Infinity;
  const files = [...result.files]
    .sort((a, b) => b.score - a.score || (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
    .map((file) => {
      let omitted = file.sourceOmitted;
      const excerpts = file.excerpts.filter(({ source }) => {
        const bytes = Buffer.byteLength(source);
        if (bytes > remaining) {
          omitted = true;
          return false;
        }
        remaining -= bytes;
        return true;
      });
      return { file, excerpts, omitted };
    });
  const lines = [
    `Status: ${result.status}`,
    `Root: ${quote(result.root)}`,
    `Relevant files: ${files.length}`,
    `Source omitted: ${files.filter(({ omitted }) => omitted).length} file(s)`,
    ...result.issues.map(({ kind, count }) => `Issue: ${quote(kind)}: ${count}`),
    "",
    "Reading leads (estimates; source below is evidence):",
  ];
  for (const { file, excerpts, omitted } of files) {
    lines.push(
      `- ${quote(file.path)} — ${file.roles.map(quote).join(", ") || "relevant; role uncertain"}`,
    );
    for (const lead of file.leads) {
      lines.push(`  ${quote(lead.name)}: ${lead.range.startLine}-${lead.range.endLine}`);
    }
    if (omitted) lines.push("  Some source omitted; locations remain available.");
    else if (!excerpts.length)
      lines.push("  No confident excerpt selected; inspect this file if needed.");
  }
  lines.push("", "Source (verbatim; ranges may end within declarations):");
  for (const { file, excerpts } of files) {
    for (const { range, source, partial, sourceByteStart, sourceByteEnd } of excerpts) {
      const location = `${quote(file.path)}:${range.startLine}-${range.endLine}`;
      const bytes =
        sourceByteStart === undefined ? "" : `; UTF-8 bytes [${sourceByteStart}, ${sourceByteEnd})`;
      const annotation =
        partial || sourceByteStart !== undefined ? ` (partial excerpt${bytes})` : "";
      lines.push("", `${location}${annotation}`, source);
    }
  }
  lines.push("", "End context.", "");
  return lines.join("\n");
}
