// Frozen experiment entry point: same v27 search, fixed 0.7 source admission.
// Native agents supply only a research query through the registered shell wrapper.
process.argv.push('--source-threshold', '0.7');
await import('./hierarchy-code-first-v27-spike');
