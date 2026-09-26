type Evidence = {
  contentSamples?: unknown[];
  contentSampling?: {
    visitedDirectories: string[];
    unavailable: string[];
    omittedSamples?: number;
    omittedVisitedDirectories?: number;
    omittedUnavailablePaths?: number;
  };
};

// Keep original child metadata; omit optional lookahead evidence until the
// complete serialized request fits. Omission is never a relevance judgment.
export function fitFolderEvidence(preview: Evidence, measure: () => number) {
  const sampling = preview.contentSampling;
  if (!sampling) return;
  while (measure() > 38000) {
    if (preview.contentSamples?.length) {
      preview.contentSamples.pop();
      sampling.omittedSamples = (sampling.omittedSamples ?? 0) + 1;
    } else if (sampling.visitedDirectories.length) {
      sampling.visitedDirectories.pop();
      sampling.omittedVisitedDirectories = (sampling.omittedVisitedDirectories ?? 0) + 1;
    } else if (sampling.unavailable.length) {
      sampling.unavailable.pop();
      sampling.omittedUnavailablePaths = (sampling.omittedUnavailablePaths ?? 0) + 1;
    } else {
      // The inherited base item guard handles a path that cannot fit by itself.
      break;
    }
  }
}
