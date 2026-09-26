import { EvaluationFailure } from "./gateway";
import { evidenceRequest, type Evidence } from "./requests";
import {
  inspect,
  pythonNeighborhood,
  sourceForUnit,
  type Range,
  type Snapshot,
  type SourceUnit,
} from "./source";
import type { Evaluator, FileEvidence, ReadingLead } from "./types";

type EvidenceRange = Range & { sourceByteStart?: number; sourceByteEnd?: number };
type Span = { start: number; end: number };
const sourceUnitBytes = 24_000;
export type SelectionResult = {
  file: FileEvidence;
  issues: Array<{ kind: string; count: number }>;
};

function mergeSpans(spans: Span[]): Span[] {
  const merged: Span[] = [];
  for (const span of spans
    .filter((span) => span.end > span.start)
    .sort((a, b) => a.start - b.start || a.end - b.end)) {
    const last = merged.at(-1);
    if (last && span.start <= last.end) last.end = Math.max(last.end, span.end);
    else merged.push({ ...span });
  }
  return merged;
}

/** Classify declarations once per pass; rendering always expands selected evidence, never prior rendering. */
export async function selectFile(
  snapshot: Snapshot,
  query: string,
  score: number,
  evaluator: Evaluator,
  selectedEvidence?: Evidence[],
  previous?: FileEvidence,
): Promise<SelectionResult> {
  const issues = new Map<string, number>();
  const warn = (kind: string) => issues.set(kind, (issues.get(kind) ?? 0) + 1);
  if (
    previous &&
    (previous.path !== snapshot.path || previous.contentHash !== snapshot.contentHash)
  ) {
    warn("changed");
    previous = undefined;
  }
  const lines = snapshot.source.split("\n"),
    bytes = Buffer.from(snapshot.source),
    offsets = [0];
  for (const line of lines)
    offsets.push(Math.min(bytes.length, offsets.at(-1)! + Buffer.byteLength(line) + 1));
  function spanForRange(range: EvidenceRange): Span {
    return {
      start: range.sourceByteStart ?? offsets[range.startLine - 1]!,
      end: range.sourceByteEnd ?? offsets[range.endLine]!,
    };
  }
  function lineAt(byte: number) {
    let low = 0,
      high = lines.length;
    while (low + 1 < high) {
      const middle = Math.floor((low + high) / 2);
      if (offsets[middle]! <= byte) low = middle;
      else high = middle;
    }
    return low + 1;
  }
  function rangeForSpan(span: Span): EvidenceRange {
    const startLine = lineAt(span.start),
      endLine = lineAt(Math.max(span.start, span.end - 1));
    return {
      startLine,
      endLine,
      ...(span.start !== offsets[startLine - 1] || span.end !== offsets[endLine]
        ? { sourceByteStart: span.start, sourceByteEnd: span.end }
        : {}),
    };
  }
  function partialLine(unit: SourceUnit) {
    return (
      unit.sourceByteStart !== offsets[unit.range.startLine - 1] ||
      unit.sourceByteEnd !== offsets[unit.range.endLine]
    );
  }
  const syntax = await inspect(snapshot, { maxUnitBytes: sourceUnitBytes });
  const selected: Span[] = (previous?.selected ?? []).map(spanForRange);
  const leads = new Map<string, ReadingLead>();
  function addLead(lead: ReadingLead) {
    const key = JSON.stringify([lead.name, lead.range]);
    const old = leads.get(key);
    if (!old || lead.score > old.score) leads.set(key, lead);
  }
  for (const lead of previous?.leads ?? []) addLead({ ...lead, range: { ...lead.range } });
  const groups: SourceUnit[][] = [];
  let pending: SourceUnit[] = [];
  for (const unit of syntax.units) {
    if (
      pending.length &&
      (pending.length >= 8 || unit.sourceByteEnd - pending[0]!.sourceByteStart > 14000)
    ) {
      groups.push(pending);
      pending = [];
    }
    pending.push(unit);
  }
  if (pending.length) groups.push(pending);
  for (const group of groups) {
    const first = Math.max(1, group[0]!.range.startLine - 8),
      last = Math.min(lines.length, group.at(-1)!.range.endLine + 8);
    const oversizedContext = [...lines.slice(0, 20), ...lines.slice(first - 1, last)].some(
      (line) => Buffer.byteLength(line) > sourceUnitBytes,
    );
    // Line-only windows cannot describe a partial giant line; send only the parser's bounded byte spans.
    const context =
      group.some(partialLine) || oversizedContext
        ? group
            .map(
              (unit) =>
                `Source lines ${unit.range.startLine}-${unit.range.endLine}; source bytes ${unit.sourceByteStart}-${unit.sourceByteEnd}:\n${sourceForUnit(snapshot, unit)}`,
            )
            .join("\n")
        : bytes.length <= 16000
          ? snapshot.source
          : `Opening context:\n${lines.slice(0, 20).join("\n")}\nSource lines ${first}-${last}:\n${lines.slice(first - 1, last).join("\n")}`;
    const request = evidenceRequest(
      query,
      snapshot.path,
      context,
      group.map((unit) => ({ name: unit.name, ...unit.range })),
      selectedEvidence,
    );
    try {
      const answers = await evaluator.evaluate(request);
      const values = group.map((unit, index) => {
        const value = answers[`q${index}`];
        if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1)
          throw new EvaluationFailure("provider");
        return { unit, value };
      });
      for (const { unit, value } of values) {
        if (value > 0.5) selected.push({ start: unit.sourceByteStart, end: unit.sourceByteEnd });
        if (value > 0.25 && !unit.name.endsWith(".context"))
          addLead({
            name: unit.name,
            range: rangeForSpan({ start: unit.sourceByteStart, end: unit.sourceByteEnd }),
            score: value,
          });
      }
    } catch (error) {
      if (!(error instanceof EvaluationFailure)) throw error;
      warn(error.kind);
      if (error.kind !== "provider") break;
    }
  }
  const chosen = mergeSpans(selected),
    wholeRanges: Range[] = [],
    rendered: Span[] = [];
  for (const span of chosen) {
    const range = rangeForSpan(span);
    if (range.sourceByteStart !== undefined) rendered.push(span);
    else wholeRanges.push(range);
  }
  const neighborhood = wholeRanges.length ? await pythonNeighborhood(snapshot, wholeRanges) : [];
  const windows = [...wholeRanges, ...neighborhood].map((range) => ({
    startLine: Math.max(1, range.startLine - 3),
    endLine: Math.min(lines.length, range.endLine + 3),
  }));
  for (const window of windows) {
    let changed = true;
    while (changed) {
      changed = false;
      for (const comment of syntax.comments) {
        const before =
          comment.endLine < window.startLine &&
          lines.slice(comment.endLine, window.startLine - 1).every((line) => !line.trim());
        const after =
          comment.startLine > window.endLine &&
          lines.slice(window.endLine, comment.startLine - 1).every((line) => !line.trim());
        if (
          (comment.startLine <= window.endLine && comment.endLine >= window.startLine) ||
          before ||
          after
        ) {
          const start = Math.min(window.startLine, comment.startLine),
            end = Math.max(window.endLine, comment.endLine);
          if (start !== window.startLine || end !== window.endLine) {
            window.startLine = start;
            window.endLine = end;
            changed = true;
          }
        }
      }
    }
    let segmentStart = offsets[window.startLine - 1]!;
    for (let line = window.startLine; line <= window.endLine; line++) {
      const start = offsets[line - 1]!,
        end = offsets[line]!;
      // An adjacent selected declaration must not accidentally include an unselected giant line.
      if (end - start > sourceUnitBytes) {
        rendered.push({ start: segmentStart, end: start });
        for (const span of chosen)
          if (span.start < end && span.end > start)
            rendered.push({ start: Math.max(span.start, start), end: Math.min(span.end, end) });
        segmentStart = end;
      }
    }
    rendered.push({ start: segmentStart, end: offsets[window.endLine]! });
  }
  const output = mergeSpans(rendered);
  const file: FileEvidence = {
    path: snapshot.path,
    contentHash: snapshot.contentHash,
    score,
    roles: [...(previous?.roles ?? [])],
    leads: [...leads.values()].sort(
      (a, b) =>
        a.range.startLine - b.range.startLine ||
        a.range.endLine - b.range.endLine ||
        a.name.localeCompare(b.name),
    ),
    selected: chosen.map(rangeForSpan),
    rendered: output.map(rangeForSpan),
    excerpts: output.map((span) => {
      const range = rangeForSpan(span),
        partial = range.sourceByteStart !== undefined;
      return {
        range,
        source: bytes.subarray(span.start, span.end).toString("utf8"),
        ...(partial ? { sourceByteStart: span.start, sourceByteEnd: span.end, partial: true } : {}),
      };
    }),
    sourceOmitted: false,
  };
  return { file, issues: [...issues].map(([kind, count]) => ({ kind, count })) };
}
