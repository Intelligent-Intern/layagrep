import type { FilesystemPolicy } from "./filesystem";
import type { EvaluationRequest } from "./gateway";

import type { Range } from "./source";
export type { Range } from "./source";
export type EvidenceRange = Range & { sourceByteStart?: number; sourceByteEnd?: number };
export type ReadingLead = {
  name: string;
  range: EvidenceRange;
  score: number;
};
export type FileEvidence = {
  path: string;
  contentHash: string;
  score: number;
  roles: string[];
  leads: ReadingLead[];
  selected: EvidenceRange[];
  rendered: EvidenceRange[];
  excerpts: Array<{
    range: EvidenceRange;
    source: string;
    sourceByteStart?: number;
    sourceByteEnd?: number;
    partial?: boolean;
  }>;
  sourceOmitted: boolean;
};
export type RetrievalResult = {
  root: string;
  query: string;
  status: "complete" | "incomplete" | "interrupted";
  files: FileEvidence[];
  issues: Array<{ kind: string; count: number }>;
  warnings?: Array<{ kind: string; count: number }>;
  repositoryContext: {
    instructionFiles: string[];
    instructionLookupIncomplete: boolean;
    pytestFiles: string[];
  };
  counts: { requests: number; cacheHits: number; inspectedFiles: number };
};
export type SearchInput = {
  root: string;
  query: string;
  policy?: FilesystemPolicy;
  signal: AbortSignal;
  protectedPaths?: string[];
};
export type Evaluator = {
  readonly requests: number;
  readonly cacheHits?: number;
  readonly cacheIssues?: Array<{ kind: string; count: number }>;
  evaluate(
    request: EvaluationRequest,
    policy?: { navigation?: boolean },
  ): Promise<Record<string, number>>;
};
