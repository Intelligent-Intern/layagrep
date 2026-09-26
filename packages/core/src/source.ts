import { fileURLToPath } from "node:url";
import { readFile } from "node:fs/promises";
import { Parser, Language, type Node as SyntaxNode } from "web-tree-sitter";
import ts from "typescript";

export type Range = { startLine: number; endLine: number };
export type Snapshot = { path: string; contentHash: string; source: string };
export type SourceUnit = {
  id: string;
  name: string;
  range: Range;
  sourceByteStart: number;
  sourceByteEnd: number;
  partial?: boolean;
};
export type Inspection = {
  units: SourceUnit[];
  comments: Range[];
  mode: "python" | "typescript" | "text";
  fallback?: "unsupported" | "syntax" | "size";
};

function children(node: SyntaxNode): SyntaxNode[] {
  return node.namedChildren.filter((child): child is SyntaxNode => child !== null);
}

type Declaration = {
  direct: boolean;
  name: string;
  kind: string;
  range: Range;
  headerLine: number;
  body: Range[];
  bodyColumns: number[];
  docstring: boolean;
  children: Declaration[];
  parent?: Declaration;
};
let pythonLanguage: Promise<Language> | undefined;
async function parsePython(source: string) {
  pythonLanguage ??= (async () => {
    await Parser.init({
      wasmBinary: await readFile(
        fileURLToPath(import.meta.resolve("web-tree-sitter/tree-sitter.wasm")),
      ),
    });
    return Language.load(
      fileURLToPath(new URL("../assets/tree-sitter-python.wasm", import.meta.url)),
    );
  })();
  const language = await pythonLanguage;
  const parser = new Parser();
  parser.setLanguage(language);
  try {
    const tree = parser.parse(source);
    if (!tree) return null;
    let invalid = tree.rootNode.hasError;
    const pending = [tree.rootNode];
    while (!invalid && pending.length) {
      const node = pending.pop()!;
      const nodes = children(node);
      if (node.type === "block" && !nodes.some((child) => child.type !== "comment")) invalid = true;
      else pending.push(...nodes);
    }
    if (invalid) {
      tree.delete();
      return null;
    }
    return tree;
  } finally {
    parser.delete();
  }
}
function nodeRange(node: SyntaxNode): Range {
  let last = node;
  while (last.type !== "comment") {
    const child = last.children.findLast((child) => child !== null && child.type !== "comment");
    if (!child) break;
    last = child;
  }
  return {
    startLine: node.startPosition.row + 1,
    endLine: last.endPosition.row + (last.endPosition.column === 0 ? 0 : 1),
  };
}
function isDocstring(node: SyntaxNode | undefined): boolean {
  if (!node) return false;
  if (node.type === "parenthesized_expression") return isDocstring(children(node)[0]);
  if (node.type === "concatenated_string") return children(node).every(isDocstring);
  return node.type === "string" && /^[rRuU]*['"]/.test(node.text);
}
function declarations(root: SyntaxNode, source: string): Declaration[] {
  const result: Declaration[] = [];
  const walk = (node: SyntaxNode, parent?: Declaration, direct = false) => {
    let declaration = node;
    if (node.type === "decorated_definition") declaration = node.childForFieldName("definition")!;
    if (declaration.type === "class_definition" || declaration.type === "function_definition") {
      const rawBody = children(declaration.childForFieldName("body")!).filter(
        (n) => n.type !== "comment",
      );
      const body = rawBody.map((n) =>
        n.type === "decorated_definition" ? n.childForFieldName("definition")! : n,
      );
      const first = body[0];
      const value: Declaration = {
        direct,
        name: declaration.childForFieldName("name")!.text.normalize("NFKC"),
        kind: declaration.type,
        range: nodeRange(node),
        headerLine: declaration.startPosition.row + 1,
        body: body.map(nodeRange),
        bodyColumns: body.map((n) =>
          Buffer.byteLength(source.slice(n.startIndex - n.startPosition.column, n.startIndex)),
        ),
        docstring:
          first?.type === "expression_statement" &&
          isDocstring(first.namedChildren[0] ?? undefined),
        children: [],
        parent,
      };
      result.push(value);
      if (parent && direct) parent.children.push(value);
      for (const child of rawBody) walk(child, value, true);
      return;
    }
    for (const child of children(node)) walk(child, parent);
  };
  for (const child of children(root)) walk(child, undefined, true);
  return result;
}
function pythonUnits(root: SyntaxNode, source: string) {
  const all = declarations(root, source);
  const units: { name: string; range: Range }[] = [];
  const visit = (declaration: Declaration, prefix = "") => {
    const name = prefix + declaration.name;
    if (declaration.kind === "class_definition" && declaration.children.length) {
      let cursor = declaration.range.startLine;
      for (const child of declaration.children) {
        if (cursor < child.range.startLine)
          units.push({
            name: name + ".context",
            range: { startLine: cursor, endLine: child.range.startLine - 1 },
          });
        visit(child, name + ".");
        cursor = child.range.endLine + 1;
      }
      if (cursor <= declaration.range.endLine)
        units.push({
          name: name + ".context",
          range: { startLine: cursor, endLine: declaration.range.endLine },
        });
    } else units.push({ name, range: declaration.range });
  };
  // The reference only promotes direct module and class body declarations.
  for (const declaration of all) if (!declaration.parent && declaration.direct) visit(declaration);
  return units;
}
type SourceText = { bytes: Buffer; offsets: number[]; lineCount: number };
function sourceText(source: string): SourceText {
  const lines = source.split("\n"),
    offsets = [0];
  for (const line of lines) offsets.push(offsets.at(-1)! + Buffer.byteLength(line) + 1);
  return { bytes: Buffer.from(source), offsets, lineCount: lines.length };
}
function textUnits(
  text: SourceText,
  range: Range,
  name: string,
  maxBytes: number,
  partial: boolean,
): SourceUnit[] {
  const { bytes: raw, offsets, lineCount } = text;
  const units: SourceUnit[] = [];
  const first = offsets[range.startLine - 1]!;
  const end = Math.min(raw.length, offsets[range.endLine]!);
  let start = first,
    line = range.startLine;
  while (start < end) {
    let finish = Math.min(end, start + maxBytes);
    if (finish < end) {
      while (finish > start && (raw[finish]! & 0xc0) === 0x80) finish--;
      const newline = raw.subarray(start, finish).lastIndexOf(10);
      if (newline >= 0) finish = start + newline + 1;
    }
    const part = raw.subarray(start, finish).toString("utf8");
    const newlines = part.split("\n").length - 1;
    const endLine = line + newlines - (part.endsWith("\n") ? 1 : 0);
    units.push({
      id: `${name}:${start}:${finish}`,
      name,
      range: { startLine: line, endLine },
      sourceByteStart: start,
      sourceByteEnd: finish,
      ...(partial || first !== start || finish !== end ? { partial: true } : {}),
    });
    line += newlines;
    start = finish;
  }
  // The final empty line has no bytes but still belongs to the snapshot coordinates.
  if (raw.at(-1) === 10 && range.endLine === lineCount && units.length)
    units.at(-1)!.range.endLine = lineCount;
  return units;
}

export async function inspect(
  snapshot: Snapshot,
  options: { maxUnitBytes?: number; maxParseBytes?: number } = {},
): Promise<Inspection> {
  const maxUnitBytes = options.maxUnitBytes ?? 24_000;
  const maxParseBytes = options.maxParseBytes ?? 1_000_000;
  if (
    !Number.isSafeInteger(maxUnitBytes) ||
    maxUnitBytes < 4 ||
    !Number.isSafeInteger(maxParseBytes) ||
    maxParseBytes < 1
  )
    throw new Error(
      "Source bounds must be integers; unit bytes at least 4 and parse bytes positive",
    );
  const { source, path } = snapshot;
  const text = sourceText(source);
  const fallback = (reason: Inspection["fallback"]): Inspection => ({
    mode: "text",
    fallback: reason,
    comments: [],
    units: source
      ? textUnits(text, { startLine: 1, endLine: text.lineCount }, "source", maxUnitBytes, true)
      : [],
  });
  if (Buffer.byteLength(source) > maxParseBytes) return fallback("size");
  let units: { name: string; range: Range }[] = [],
    comments: Range[] = [],
    mode: Inspection["mode"];
  if (/\.pyi?$/.test(path)) {
    // A missing/incompatible packaged parser is a setup failure, never syntax fallback.
    const tree = await parsePython(source);
    if (!tree) return fallback("syntax");
    try {
      units = pythonUnits(tree.rootNode, source);
      const stack = [tree.rootNode];
      while (stack.length) {
        const node = stack.pop()!;
        if (node.type === "comment") comments.push(nodeRange(node));
        else stack.push(...children(node));
      }
      mode = "python";
    } finally {
      tree.delete();
    }
  } else if (/\.(?:[cm]?[jt]s|[jt]sx)$/.test(path)) {
    const kind = path.endsWith(".tsx")
      ? ts.ScriptKind.TSX
      : path.endsWith(".jsx")
        ? ts.ScriptKind.JSX
        : /\.[cm]?js$/.test(path)
          ? ts.ScriptKind.JS
          : ts.ScriptKind.TS;
    const file = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, kind);
    if ((file as ts.SourceFile & { parseDiagnostics?: unknown[] }).parseDiagnostics?.length)
      return fallback("syntax");
    const line = (position: number) => file.getLineAndCharacterOfPosition(position).line + 1;
    const add = (node: ts.Node, prefix = "") => {
      const named = node as ts.Node & { name?: ts.Node };
      const name =
        prefix +
        (named.name?.getText(file) ||
          (ts.isVariableStatement(node)
            ? node.declarationList.declarations.map((d) => d.name.getText(file)).join(", ")
            : "source"));
      if (ts.isClassDeclaration(node) && node.members.length) {
        const start = line(node.getStart(file)),
          first = line(node.members[0]!.getStart(file));
        if (first > start)
          units.push({ name: name + ".context", range: { startLine: start, endLine: first - 1 } });
        for (const member of node.members) add(member, name + ".");
      } else
        units.push({
          name,
          range: {
            startLine: line(node.getStart(file)),
            endLine: line(Math.max(node.getStart(file), node.end - 1)),
          },
        });
    };
    for (const statement of file.statements) add(statement);
    const visit = (node: ts.Node) => {
      for (const comment of [
        ...(ts.getLeadingCommentRanges(source, node.getFullStart()) ?? []),
        ...(ts.getTrailingCommentRanges(source, node.end) ?? []),
      ])
        comments.push({ startLine: line(comment.pos), endLine: line(comment.end - 1) });
      for (const child of node.getChildren(file)) visit(child);
    };
    visit(file);
    mode = "typescript";
  } else return fallback("unsupported");
  comments = [...new Map(comments.map((r) => [`${r.startLine}:${r.endLine}`, r])).values()].sort(
    (a, b) => a.startLine - b.startLine,
  );
  if (!units.length && source)
    return {
      units: textUnits(
        text,
        { startLine: 1, endLine: text.lineCount },
        "source",
        maxUnitBytes,
        true,
      ),
      comments,
      mode,
    };
  return {
    mode,
    comments,
    units: units.flatMap((unit) => {
      const bytes =
        Math.min(text.bytes.length, text.offsets[unit.range.endLine]!) -
        text.offsets[unit.range.startLine - 1]!;
      return textUnits(text, unit.range, unit.name, maxUnitBytes, bytes > maxUnitBytes);
    }),
  };
}

/** Additive policy only: callers retain selected ranges separately. */
export async function pythonNeighborhood(snapshot: Snapshot, selected: Range[]): Promise<Range[]> {
  if (!/\.pyi?$/.test(snapshot.path) || Buffer.byteLength(snapshot.source) > 1_000_000) return [];
  const tree = await parsePython(snapshot.source);
  if (!tree) return [];
  try {
    const extra: Range[] = [];
    for (const declaration of declarations(tree.rootNode, snapshot.source)) {
      const owner = declaration.parent;
      if (
        !declaration.direct ||
        declaration.kind !== "function_definition" ||
        owner?.kind !== "class_definition"
      )
        continue;
      if (
        !selected.some(
          (range) =>
            range.startLine <= declaration.range.endLine &&
            range.endLine >= declaration.range.startLine,
        )
      )
        continue;
      const siblings = owner.children;
      const headerEnd = Math.min(...siblings.map((child) => child.range.startLine - 1));
      if (owner.range.startLine <= headerEnd)
        extra.push({
          startLine: owner.range.startLine,
          endLine: Math.min(headerEnd, owner.range.startLine + 39),
        });
      const index = siblings.indexOf(declaration);
      for (const neighbor of siblings.slice(Math.max(0, index - 1), index + 2))
        if (neighbor !== declaration && neighbor.range.endLine - neighbor.range.startLine + 1 <= 40)
          extra.push(neighbor.range);
    }
    return extra;
  } finally {
    tree.delete();
  }
}

export type PreviewSpan = Range & {
  text: string;
  basis: string;
  sourceByteStart: number;
  sourceByteEnd: number;
  partialLine?: boolean;
  columnStartByte?: number;
  columnEndByte?: number;
};
export type SourcePreview = {
  text: string;
  spans: PreviewSpan[];
  truncated: boolean;
  sourceBytes: number;
  previewBytes: number;
  method: string;
  matchedDeclarations: number;
  unrepresentedMatches: number;
  parseUnavailable?: boolean;
  scope?: string;
};
function utf8Slice(raw: Buffer, start: number, end: number) {
  while (start < end && (raw[start]! & 0xc0) === 0x80) start++;
  while (end > start && end < raw.length && (raw[end]! & 0xc0) === 0x80) end--;
  return raw.subarray(start, end).toString("utf8");
}

/** Query terms prioritize preview windows; they never exclude a file. */
export async function pythonPreview(
  snapshot: Snapshot,
  query: string,
  budget = 16_384,
): Promise<SourcePreview> {
  if (!Number.isSafeInteger(budget) || budget < 256)
    throw new Error("Preview allowance must be at least 256 bytes");
  const { source, path } = snapshot,
    lines = source.split("\n"),
    sourceBytes = Buffer.byteLength(source);
  const offsets: number[] = [];
  let offset = 0;
  for (const line of lines) {
    offsets.push(offset);
    offset += Buffer.byteLength(line) + 1;
  }
  if (sourceBytes <= budget)
    return {
      text: source,
      spans: [
        {
          startLine: 1,
          endLine: lines.length,
          text: source,
          basis: "complete source",
          sourceByteStart: 0,
          sourceByteEnd: sourceBytes,
        },
      ],
      truncated: false,
      sourceBytes,
      previewBytes: sourceBytes,
      method: "complete source",
      matchedDeclarations: 0,
      unrepresentedMatches: 0,
    };
  const tokens = new Set(
    (query.normalize("NFKC").match(/[\p{ID_Continue}]+/gu) ?? []).filter((token) =>
      /^[_\p{ID_Start}][_\p{ID_Continue}]*$/u.test(token),
    ),
  );
  let matches: Declaration[] = [],
    parseUnavailable = false;
  if (/\.pyi?$/.test(path)) {
    if (sourceBytes > 1_000_000) parseUnavailable = true;
    else {
      const tree = await parsePython(source);
      try {
        if (!tree) parseUnavailable = true;
        else matches = declarations(tree.rootNode, source).filter((d) => tokens.has(d.name));
      } finally {
        tree?.delete();
      }
    }
  }
  matches.sort(
    (a, b) => a.range.startLine - b.range.startLine || a.range.endLine - b.range.endLine,
  );
  const spans: PreviewSpan[] = [],
    parts: string[] = [],
    seen = new Set<string>();
  let used = 0;
  const add = (first: number, last: number, allowance: number, basis: string, fromEnd = false) => {
    if (first > last) return false;
    let start = Math.max(1, first);
    const end = Math.min(last, lines.length);
    allowance = Math.min(allowance, budget - used);
    const room =
      allowance -
      Buffer.byteLength(`--- source lines ${start}-${end}; ${basis}; may be clipped ---\n`) -
      1;
    if (room <= 0) return false;
    const selected: string[] = [];
    let size = 0,
      partial = false;
    const candidates = lines.slice(start - 1, end);
    if (fromEnd) candidates.reverse();
    for (let line of candidates) {
      const cost = Buffer.byteLength(line) + (selected.length ? 1 : 0);
      if (size + cost > room) {
        if (!selected.length) {
          const raw = Buffer.from(line);
          line = utf8Slice(
            raw,
            fromEnd ? Math.max(0, raw.length - room) : 0,
            fromEnd ? raw.length : Math.min(room, raw.length),
          );
          if (line) {
            selected.push(line);
            partial = true;
          }
        }
        break;
      }
      selected.push(line);
      size += cost;
    }
    if (!selected.length) return false;
    if (fromEnd) {
      selected.reverse();
      start = end - selected.length + 1;
    }
    const actualEnd = start + selected.length - 1,
      text = selected.join("\n"),
      identity = JSON.stringify([start, actualEnd, text]);
    if (seen.has(identity)) return true;
    const rendered = `--- source lines ${start}-${actualEnd}; ${basis}${partial ? "; partial line" : ""} ---\n${text}\n`;
    if (Buffer.byteLength(rendered) > allowance) return false;
    const sourceByteStart =
      offsets[start - 1]! +
      (partial && fromEnd ? Buffer.byteLength(lines[start - 1]!) - Buffer.byteLength(text) : 0);
    spans.push({
      sourceByteStart,
      sourceByteEnd: sourceByteStart + Buffer.byteLength(text),
      startLine: start,
      endLine: actualEnd,
      text,
      basis,
      partialLine: partial,
    });
    parts.push(rendered);
    seen.add(identity);
    used += Buffer.byteLength(rendered);
    return true;
  };
  const addInline = (
    line: number,
    start: number,
    end: number,
    allowance: number,
    basis: string,
  ) => {
    const raw = Buffer.from(lines[line - 1]!);
    end = Math.min(end, raw.length);
    allowance = Math.min(allowance, budget - used);
    const room =
      allowance -
      Buffer.byteLength(
        `--- source line ${line}, bytes ${start}-${end}; ${basis}; partial line ---\n`,
      ) -
      1;
    if (room <= 0) return false;
    const text = utf8Slice(raw, start, Math.min(end, start + room));
    if (!text) return false;
    const actualEnd = start + Buffer.byteLength(text),
      identity = JSON.stringify([line, start, actualEnd, text]);
    if (seen.has(identity)) return true;
    const rendered = `--- source line ${line}, bytes ${start}-${actualEnd}; ${basis}; partial line ---\n${text}\n`;
    spans.push({
      sourceByteStart: offsets[line - 1]! + start,
      sourceByteEnd: offsets[line - 1]! + actualEnd,
      startLine: line,
      endLine: line,
      columnStartByte: start,
      columnEndByte: actualEnd,
      text,
      basis,
      partialLine: true,
    });
    parts.push(rendered);
    seen.add(identity);
    used += Buffer.byteLength(rendered);
    return true;
  };
  add(1, lines.length, Math.floor(budget / 4), "opening context");
  let unrepresented = 0;
  if (matches.length) {
    const perMatch = Math.max(1, (Math.floor((budget - used) * 0.75) / matches.length) | 0);
    for (const match of matches) {
      let owner = match.parent;
      while (owner && owner.kind !== "class_definition") owner = owner.parent;
      let contextCost = 0;
      if (owner) {
        const before = used;
        add(
          owner.range.startLine,
          owner.body[0]!.startLine - 1,
          Math.min(Math.floor(perMatch / 3), 512),
          "enclosing class context",
        );
        contextCost = used - before;
      }
      const before = used,
        first = match.body[0]!;
      add(
        match.range.startLine,
        first.startLine - 1,
        Math.min(Math.floor((perMatch - contextCost) / 3), 512),
        "query-named declaration header",
      );
      if (first.startLine === match.headerLine)
        addInline(
          match.headerLine,
          0,
          match.bodyColumns[0]!,
          Math.min(Math.floor((perMatch - contextCost) / 3), 512),
          "query-named declaration header",
        );
      const remaining = perMatch - contextCost - (used - before),
        bodyIndex = match.docstring && match.body.length > 1 ? 1 : 0,
        body = match.body[bodyIndex]!;
      const bodyColumn =
        bodyIndex === 1 && body.startLine === first.startLine ? match.bodyColumns[1]! : 0;
      let represented: boolean;
      if (bodyColumn) {
        const before = used;
        represented = addInline(
          body.startLine,
          bodyColumn,
          Buffer.byteLength(lines[body.startLine - 1]!),
          remaining,
          "query-named implementation",
        );
        if (match.range.endLine > body.startLine)
          add(
            body.startLine + 1,
            match.range.endLine,
            remaining - (used - before),
            "query-named implementation continuation",
          );
      } else
        represented = add(
          body.startLine,
          match.range.endLine,
          remaining,
          "query-named implementation",
        );
      if (!represented) unrepresented++;
    }
  }
  const positions = [
    ...new Set([
      Math.floor(lines.length / 3) + 1,
      Math.floor((2 * lines.length) / 3) + 1,
      Math.max(1, lines.length - 31),
    ]),
  ].sort((a, b) => a - b);
  for (const [index, start] of positions.entries())
    add(
      start,
      Math.min(start + 31, lines.length),
      Math.floor((budget - used) / (positions.length - index)),
      "distributed context",
      index === positions.length - 1,
    );
  return {
    text: parts.join(""),
    spans,
    truncated: true,
    sourceBytes,
    previewBytes: used,
    method: "query-assisted source windows",
    matchedDeclarations: matches.length,
    unrepresentedMatches: unrepresented,
    parseUnavailable,
    scope:
      "Sampled content only; missing terms or unseen ranges do not establish irrelevance. No additional source files read.",
  };
}

/** Byte spans include original line endings; never widen a partial unit to whole lines. */
export function sourceForUnit(snapshot: Snapshot, unit: SourceUnit): string {
  return Buffer.from(snapshot.source)
    .subarray(unit.sourceByteStart, unit.sourceByteEnd)
    .toString("utf8");
}
