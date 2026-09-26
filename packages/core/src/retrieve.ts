import { basename, extname } from "node:path";
import { createFilesystem } from "./filesystem";
import { EvaluationFailure } from "./gateway";
import { inspect, pythonPreview, sourceForUnit, splitSource } from "./source";
import {
  navigationRequest,
  roleRequest,
  type DirectoryPreview,
  type FilePreview,
  type NavigationItem,
  type Evidence,
} from "./requests";
import { selectFile } from "./selection";
import type { Evaluator, FileEvidence, RetrievalResult, SearchInput } from "./types";

/** Traversal owns admission; every stage reads through the same eligibility policy. */
export async function retrieve(input: SearchInput, evaluator: Evaluator): Promise<RetrievalResult> {
  const reader = await createFilesystem({
    root: input.root,
    policy: input.policy,
    signal: input.signal,
    protectedPaths: input.protectedPaths,
  });
  const issues = new Map<string, number>();
  const inspected = new Set<string>();
  const candidates = new Map<string, { path: string; contentHash: string; score: number }>();
  const files = new Map<string, FileEvidence>();
  const visited = new Set<string>();
  const pruned = new Set<string>();
  let stop = false;
  function issue(kind: string, count = 1) {
    issues.set(kind, (issues.get(kind) ?? 0) + count);
    if (["authentication", "request-limit", "cancelled", "interrupted"].includes(kind)) stop = true;
  }
  async function snapshot(path: string) {
    const result = await reader.readSnapshot(path);
    if (result.status === "issue") {
      issue(result.issue.kind);
      return;
    }
    if (result.status === "excluded") return;
    inspected.add(path);
    return result.snapshot;
  }
  async function score(items: NavigationItem[], anchor?: { path: string; classes: string[] }) {
    const results: Array<{ item: NavigationItem; score: number }> = [];
    let batch: NavigationItem[] = [];
    async function flush() {
      if (!batch.length || stop) {
        batch = [];
        return;
      }
      const group = batch;
      batch = [];
      try {
        const scores = await evaluator.evaluate(navigationRequest(input.query, group, anchor));
        group.forEach((item, index) => results.push({ item, score: scores[`q${index}`]! }));
      } catch (error) {
        issue(error instanceof EvaluationFailure ? error.kind : "provider");
      }
    }
    for (const item of items) {
      if (
        Buffer.byteLength(JSON.stringify(navigationRequest(input.query, [item], anchor))) > 38_000
      ) {
        issue("request-size");
        continue;
      }
      if (
        batch.length &&
        (batch.length >= 128 ||
          Buffer.byteLength(
            JSON.stringify(navigationRequest(input.query, [...batch, item], anchor)),
          ) > 38_000)
      )
        await flush();
      if (stop) break;
      batch.push(item);
    }
    await flush();
    return results;
  }
  async function previewDirectory(path: string): Promise<DirectoryPreview> {
    const preview: DirectoryPreview = {
      entries: [],
      truncated: false,
      sampledFiles: 0,
      sampledDirectories: 0,
      sampledExtensions: {},
      contentSamples: [],
    };
    let cursor: string | undefined;
    try {
      do {
        const page = await reader.listPage(path, cursor);
        cursor = page.nextCursor;
        for (const entry of page.issues) issue(entry.kind);
        for (const entry of page.entries) {
          const child = { name: basename(entry.path), kind: entry.kind };
          if (
            preview.entries.length >= 64 ||
            Buffer.byteLength(JSON.stringify([...preview.entries, child])) > 4096
          ) {
            preview.truncated = true;
            break;
          }
          preview.entries.push(child);
          if (entry.kind === "directory") preview.sampledDirectories++;
          else {
            preview.sampledFiles++;
            const extension = extname(entry.path) || "[no extension]";
            preview.sampledExtensions[extension] = (preview.sampledExtensions[extension] ?? 0) + 1;
          }
        }
        if (preview.truncated) break;
      } while (cursor && !stop);
      if (cursor) preview.truncated = true;
    } finally {
      if (cursor) await reader.closeCursor(cursor);
    }
    preview.entries.sort((a, b) => a.name.localeCompare(b.name));
    const allowance = Math.max(256, Math.floor(16000 / Math.max(1, preview.sampledFiles)));
    for (const child of preview.entries) {
      if (child.kind !== "file" || stop) continue;
      const source = await snapshot(`${path}/${child.name}`);
      if (!source) continue;
      const sample = await pythonPreview(source, input.query, allowance);
      preview.contentSamples!.push({
        name: child.name,
        source: sample.text,
        truncated: sample.truncated,
      });
    }
    while (Buffer.byteLength(JSON.stringify(preview)) > 28_000 && preview.contentSamples!.length) {
      preview.contentSamples!.pop();
      preview.truncated = true;
    }
    return preview;
  }
  async function discover(seeds: string[], anchor?: { path: string; classes: string[] }) {
    const queue = seeds.map((path) => ({ path, depth: 0 }));
    for (let position = 0; position < queue.length && !stop; position++) {
      const current = queue[position]!;
      if (visited.has(current.path)) continue;
      visited.add(current.path);
      let cursor: string | undefined;
      try {
        do {
          const page = await reader.listPage(current.path, cursor);
          cursor = page.nextCursor;
          for (const entry of page.issues) issue(entry.kind);
          const items: NavigationItem[] = [];
          const hashes = new Map<string, string>();
          let pendingBytes = 0;
          async function flushItems() {
            for (const decision of await score(items.splice(0), anchor)) {
              const { item } = decision;
              if (item.kind === "directory") {
                if (decision.score > 0.5) queue.push({ path: item.path, depth: 0 });
                else if (!anchor) pruned.add(item.path);
              } else if (decision.score > 0.25) {
                const prior = candidates.get(item.path);
                if (!prior || decision.score > prior.score)
                  candidates.set(item.path, {
                    path: item.path,
                    contentHash: hashes.get(item.path)!,
                    score: decision.score,
                  });
              }
            }
            pendingBytes = 0;
          }
          for (const entry of page.entries.sort((a, b) => a.path.localeCompare(b.path))) {
            if (stop) break;
            if (entry.kind === "directory") {
              if (current.depth === 0) queue.push({ path: entry.path, depth: 1 });
              else {
                items.push({
                  path: entry.path,
                  kind: "directory",
                  childPreview: await previewDirectory(entry.path),
                });
                await flushItems();
              }
            } else {
              const source = await snapshot(entry.path);
              if (!source) continue;
              hashes.set(entry.path, source.contentHash);
              const chunks = splitSource(source, 12_000);
              for (const chunk of chunks) {
                const text = sourceForUnit(source, chunk);
                items.push({
                  path: entry.path,
                  kind: "file",
                  filePreview: {
                    sizeBytes: Buffer.byteLength(source.source),
                    extension: extname(entry.path),
                    text,
                    previewBytes: Buffer.byteLength(text),
                    truncated: chunks.length > 1,
                    range: "sampled source ranges",
                  },
                });
                pendingBytes += Buffer.byteLength(text);
                if (pendingBytes >= 24000) await flushItems();
              }
            }
          }
          await flushItems();
        } while (cursor && !stop);
      } finally {
        if (cursor) await reader.closeCursor(cursor);
      }
    }
  }
  function sortedCandidates() {
    return [...candidates.values()].sort(
      (a, b) => b.score - a.score || a.path.localeCompare(b.path),
    );
  }
  async function unchanged(candidate: { path: string; contentHash: string }) {
    const result = await reader.readSnapshot(candidate.path);
    if (result.status === "ok" && result.snapshot.contentHash === candidate.contentHash) {
      inspected.add(candidate.path);
      return result.snapshot;
    }
    issue(result.status === "issue" ? result.issue.kind : "changed");
    const prior = files.get(candidate.path);
    if (prior)
      files.set(candidate.path, {
        ...prior,
        roles: [],
        leads: [],
        selected: [],
        rendered: [],
        excerpts: [],
        sourceOmitted: true,
      });
  }

  async function parallel<T>(items: T[], work: (item: T) => Promise<void>) {
    let next = 0;
    const results = await Promise.allSettled(
      Array.from({ length: Math.min(8, items.length) }, async () => {
        try {
          while (next < items.length && !stop) await work(items[next++]!);
        } catch (error) {
          stop = true;
          throw error;
        }
      }),
    );
    const failed = results.find((result) => result.status === "rejected");
    if (failed?.status === "rejected") throw failed.reason;
  }
  try {
    await discover(["."]);
    let anchor: { path: string; classes: string[] } | undefined;
    for (const candidate of sortedCandidates()) {
      if (candidate.score <= 0.5 || stop) break;
      const source = await unchanged(candidate);
      if (!source) continue;
      const units = (await inspect(source)).units;
      const classes = [
        ...new Set(
          units
            .filter((unit) => unit.name.endsWith(".context"))
            .map((unit) => unit.name.split(".")[0]!),
        ),
      ];
      if (classes.length && Buffer.byteLength(JSON.stringify(classes)) < 4000) {
        anchor = { path: candidate.path, classes };
        break;
      }
    }
    if (anchor && !stop) {
      // Only one relationship reconsideration, anchored before new candidates are admitted.
      for (const path of pruned) {
        if (stop) break;
        const decisions = await score(
          [{ path, kind: "directory", childPreview: await previewDirectory(path) }],
          anchor,
        );
        if (decisions.some((decision) => decision.score > 0.5)) await discover([path], anchor);
      }
    }
    const ordered = sortedCandidates();
    // All admitted paths survive even if subsequent source inspection is unavailable.
    for (const candidate of ordered)
      files.set(candidate.path, {
        ...candidate,
        roles: [],
        leads: [],
        selected: [],
        rendered: [],
        excerpts: [],
        sourceOmitted: false,
      });
    const select = async (evidence?: () => Promise<Evidence[] | undefined>) =>
      parallel(ordered, async (candidate) => {
        const source = await unchanged(candidate);
        if (!source) return;
        const selection = await selectFile(
          source,
          input.query,
          candidate.score,
          evaluator,
          async () => {
            if (!(await unchanged(candidate))) return null;
            return { evidence: await evidence?.() };
          },
          files.get(candidate.path),
        );
        files.set(candidate.path, selection.file);
        for (const entry of selection.issues) issue(entry.kind, entry.count);
      });
    await select();
    const evidence: Evidence[] = [];
    for (const candidate of ordered) {
      if (!files.get(candidate.path)!.excerpts.length) continue;
      // Context donors obey the same current eligibility/hash check as target files.
      if (!(await unchanged(candidate))) continue;
      evidence.push(
        ...files.get(candidate.path)!.excerpts.map((excerpt) => ({
          path: candidate.path,
          ...excerpt.range,
          source: excerpt.source,
        })),
      );
    }

    if (evidence.length && Buffer.byteLength(JSON.stringify(evidence)) <= 64_000 && !stop)
      await select(async () => {
        const current = new Set<string>();
        for (const path of new Set(evidence.map((entry) => entry.path))) {
          const candidate = candidates.get(path)!;
          if (await unchanged(candidate)) current.add(path);
        }
        const fresh = evidence.filter((entry) => current.has(entry.path));
        return fresh.length ? fresh : undefined;
      });
    await parallel(ordered, async (candidate) => {
      const source = await unchanged(candidate);
      if (!source) return;
      const sample = await pythonPreview(source, input.query, 16_000);
      const preview: FilePreview = {
        sizeBytes: Buffer.byteLength(source.source),
        extension: extname(source.path),
        text: sample.text,
        previewBytes: sample.previewBytes,
        truncated: sample.truncated,
        range: sample.truncated ? "semantic source windows" : "opening bytes",
        declarations: [],
        declarationIndexTruncated: false,
      };
      if (sample.truncated) {
        preview.declarations = (await inspect(source)).units.map((unit) => ({
          name: unit.name,
          ...unit.range,
        }));
        while (preview.declarations.length && Buffer.byteLength(JSON.stringify(preview)) > 32_000) {
          preview.declarations.pop();
          preview.declarationIndexTruncated = true;
        }
      }
      try {
        const scores = await evaluator.evaluate(roleRequest(input.query, candidate.path, preview));
        files.get(candidate.path)!.roles = Object.keys(scores).filter(
          (role) => scores[role]! > 0.5,
        );
      } catch (error) {
        issue(error instanceof EvaluationFailure ? error.kind : "provider");
      }
    });
    if (issues.has("authentication") && !files.size) throw new EvaluationFailure("authentication");
    return {
      root: reader.root,
      query: input.query,
      status: input.signal.aborted ? "interrupted" : issues.size ? "incomplete" : "complete",
      files: ordered.map((candidate) => files.get(candidate.path)!),
      issues: [...issues].map(([kind, count]) => ({ kind, count })),
      warnings: evaluator.cacheIssues,
      counts: {
        requests: evaluator.requests,
        cacheHits: evaluator.cacheHits ?? 0,
        inspectedFiles: inspected.size,
      },
    };
  } finally {
    await reader.close();
  }
}
