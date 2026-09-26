import type { FilesystemPolicy } from "./filesystem";
import type { EvaluationRequest } from "./gateway";

export type SourceRange = { startLine: number; endLine: number };
export type ReadingLead = {
  name: string;
  range: SourceRange;
  score: number;
};
export type FileEvidence = {
  path: string;
  contentHash: string;
  score: number;
  roles: string[];
  leads: ReadingLead[];
  selected: SourceRange[];
  rendered: SourceRange[];
  excerpts: Array<{ range: SourceRange; source: string }>;
  sourceOmitted: boolean;
};
export type RetrievalResult = {
  root: string;
  query: string;
  status: "complete" | "incomplete" | "interrupted";
  files: FileEvidence[];
  issues: Array<{ kind: string; count: number }>;
  counts: { requests: number; cacheHits: number; inspectedFiles: number };
};
export type SearchInput = {
  root: string;
  query: string;
  policy?: FilesystemPolicy & { maxSourceBytes?: number };
  signal: AbortSignal;
  protectedPaths?: string[];
};
export type Evaluator = {
  readonly requests: number;
  readonly cacheHits?: number;
  evaluate(request: EvaluationRequest): Promise<Record<string, number>>;
};
