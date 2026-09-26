import type { FileEvidence, RetrievalResult } from "@repo/core";

function quote(value: string): string {
  return JSON.stringify(value).replace(
    /[\u007f-\u009f\u2028-\u202e\u2066-\u2069]/g,
    (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );
}

export const DEFAULT_MAX_SOURCE_BYTES = 0;

type Excerpt = FileEvidence["excerpts"][number];
function containsLead(excerpt: Excerpt, range: FileEvidence["leads"][number]["range"]): boolean {
  if (range.startLine < excerpt.range.startLine || range.endLine > excerpt.range.endLine)
    return false;
  const start = excerpt.sourceByteStart ?? excerpt.range.sourceByteStart;
  const end = excerpt.sourceByteEnd ?? excerpt.range.sourceByteEnd;
  if (start !== undefined && range.sourceByteStart !== undefined && range.sourceByteStart < start)
    return false;
  if (end !== undefined && range.sourceByteEnd !== undefined && range.sourceByteEnd > end)
    return false;
  return true;
}

/** Whole excerpts keep coordinates truthful; unlimited rendering retains its original ordering. */
export function renderResult(
  result: RetrievalResult,
  maxSourceBytes = DEFAULT_MAX_SOURCE_BYTES,
): string {
  const files = [...result.files]
    .sort((a, b) => b.score - a.score || (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
    .map((file) => ({ file, excerpts: file.excerpts, omitted: file.sourceOmitted }));
  if (maxSourceBytes > 0) {
    let remaining = maxSourceBytes;
    const kept = files.map(() => new Set<number>());
    const ranked = files.flatMap(({ file }, fileIndex) =>
      file.excerpts.map((excerpt, excerptIndex) => ({
        fileIndex,
        excerptIndex,
        bytes: Buffer.byteLength(excerpt.source),
        // Context snippets have no reading-lead score: this prioritizes available evidence,
        // not a complete confidence estimate for every selected or expanded source range.
        score: file.leads.reduce(
          (score, lead) =>
            lead.score > 0.5 && containsLead(excerpt, lead.range)
              ? Math.max(score, lead.score)
              : score,
          0,
        ),
      })),
    );
    // Stable sorting uses original file/excerpt order for equal or absent lead scores.
    ranked.sort((a, b) => b.score - a.score);
    for (const candidate of ranked)
      if (candidate.bytes <= remaining) {
        kept[candidate.fileIndex]!.add(candidate.excerptIndex);
        remaining -= candidate.bytes;
      }
    for (const [index, entry] of files.entries()) {
      entry.excerpts = entry.file.excerpts.filter((_, excerptIndex) =>
        kept[index]!.has(excerptIndex),
      );
      entry.omitted ||= entry.excerpts.length !== entry.file.excerpts.length;
    }
  }
  const lines = [
    `Status: ${result.status}`,
    `Root: ${quote(result.root)}`,
    `Relevant files: ${files.length}`,
    `Source omitted: ${files.filter(({ omitted }) => omitted).length} file(s)`,
    ...(result.warnings ?? []).map(({ kind, count }) => `Warning: ${quote(kind)}: ${count}`),
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
