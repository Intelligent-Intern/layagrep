import {expect, test} from 'bun:test';
import {fitFolderEvidence} from './folder-evidence-bound-v85-spike';

test('long descendant paths fit without turning omitted evidence into negatives', () => {
  const path = 'directory/'.repeat(100);
  const samples = Array.from({length: 8}, (_, i) => ({
    path: `${path}${'child/'.repeat(100)}${i}.py`, text: 'x'.repeat(2000),
  }));
  const preview = {
    entries: [{name: 'child', kind: 'directory'}],
    contentSamples: [...samples],
    contentSampling: {
      exhaustive: false, visitedDirectories: samples.map(s => s.path),
      unavailable: [] as string[], omittedSamples: 0,
    },
  };
  const request = {state: {items: [{path, childPreview: preview}]}, questions: {q0: {instructions: path}}};
  const measure = () => Buffer.byteLength(JSON.stringify(request));
  expect(measure()).toBeGreaterThan(38000);
  fitFolderEvidence(preview, measure);
  expect(measure()).toBeLessThanOrEqual(38000);
  expect(preview.contentSamples).toEqual(samples.slice(0, samples.length-preview.contentSampling.omittedSamples));
  expect(preview.contentSampling.omittedSamples).toBeGreaterThan(0);
  expect(preview.entries).toEqual([{name: 'child', kind: 'directory'}]);
  expect(preview.contentSampling.exhaustive).toBe(false);
});
