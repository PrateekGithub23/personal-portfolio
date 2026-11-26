/**
 * Chart data. Every value is a verified, recorded result (same sources as the case studies);
 * each chart carries the conditions it was measured under in `note`.
 */

export interface ChartRow {
  label: string;
  value: number;
  /** Text shown at the end of the bar, e.g. "55.4%". */
  display: string;
  /** "base" rows are drawn muted: the before / baseline side of a comparison. */
  tone?: "base" | "hi";
}

export interface Chart {
  title: string;
  max: number;
  rows: ChartRow[];
  note: string;
  /** If true, smaller is better (only changes the caption wording). */
  lowerIsBetter?: boolean;
}

/** TraceLayer: three before/after comparisons (docs/AI_EVALUATION.md). */
export const traceLayerCharts: Chart[] = [
  {
    title: "Unsafe claims per analysis",
    max: 60,
    lowerIsBetter: true,
    rows: [
      { label: "Free-form", value: 55.4, display: "55.4%", tone: "base" },
      { label: "Grounded", value: 2.9, display: "2.9%", tone: "hi" },
    ],
    note: "llama3.2:3b, 3 investigations × 5 runs per mode",
  },
  {
    title: "Held-out verdict accuracy",
    max: 100,
    rows: [
      { label: "v2 engine", value: 76.2, display: "76.2%", tone: "base" },
      { label: "v3 engine", value: 95.2, display: "95.2%", tone: "hi" },
    ],
    note: "Frozen 42-case adversarial set, single official run",
  },
  {
    title: "Fabricated citations per analysis",
    max: 8,
    lowerIsBetter: true,
    rows: [
      { label: "Free-form", value: 7.93, display: "7.9", tone: "base" },
      { label: "Grounded", value: 0, display: "0", tone: "hi" },
    ],
    note: "Same benchmark as above; mean per analysis",
  },
];

/** Passable: latency at each layer (README, docs/benchmarks/day8.md). All local. */
export const passableLatency: Chart = {
  title: "Latency by layer, milliseconds",
  max: 12.3,
  lowerIsBetter: true,
  rows: [
    { label: "A* search, p50", value: 0.5, display: "0.50 ms" },
    { label: "Cache hit, p95", value: 1.0, display: "1.0 ms" },
    { label: "A* search, p99", value: 2.7, display: "2.7 ms" },
    { label: "Cache miss, p95", value: 5.0, display: "5.0 ms" },
    { label: "HTTP at 1,000 req/s, p95", value: 5.6, display: "5.6 ms", tone: "hi" },
    { label: "HTTP at 1,000 req/s, p99", value: 12.3, display: "12.3 ms" },
  ],
  note: "Local: Apple M4, k6 on the same machine, Postgres + Redis in Docker. Not production numbers.",
};

/** MarketPulse: per-minute results on 9 held-out events (results/confusion_matrix.png). */
export const marketPulseScores: Chart = {
  title: "Held-out pump minutes",
  max: 100,
  rows: [
    { label: "Recall", value: 69.7, display: "69.7%", tone: "hi" },
    { label: "Precision", value: 48.9, display: "48.9%", tone: "hi" },
  ],
  note: "33 pump minutes among 781; original run, scikit-learn 1.0.1",
};
