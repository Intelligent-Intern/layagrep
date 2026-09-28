// Restated from evals/results/relevance-threshold-2026-09-27.md. Keep exact; do not round
// past the source. Sol cost per task, candidate (jg v0.4 archive) vs saved no-Jev baseline.
export const TASKS = [
  { id: "django-15629", jg: 1.2286, base: 1.5055, solved: true },
  { id: "scikit-learn-13124", jg: 0.2641, base: 0.2944, solved: true },
  { id: "pytest-6197", jg: 0.8281, base: 2.3445, solved: true },
  { id: "requests-1142", jg: 0.2915, base: 0.2685, solved: true },
  { id: "astropy-13579", jg: 0.4586, base: 0.4286, solved: true },
  { id: "xarray-3305", jg: 0.3529, base: 0.4937, solved: true },
  { id: "sympy-16792", jg: 0.5613, base: 0.548, solved: true },
  { id: "sphinx-8638", jg: 0.7049, base: 1.0595, solved: true },
  { id: "matplotlib-26466", jg: 0.2637, base: 0.3957, solved: false },
  { id: "pylint-4604", jg: 0.486, base: 0.2836, solved: false },
];
// Measured reduction is 28.6%; the video states it rounded, as the README does.
export const TOTAL = { jg: 5.44, base: 7.62, reduction: "28.6%", rounded: "30%" };
// Django task under the old >0.25 file bar vs the new >0.5 bar (same results file).
export const DJANGO_FILES = { before: 51, after: 10 };
