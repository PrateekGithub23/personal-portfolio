/**
 * Data for the homepage system map: one lane per project, listing its real pipeline stages in
 * order. Stage names are shortened versions of the nodes in each project's architecture diagram
 * (src/content/projects/*.ts). Only the moving packets are illustrative; the stages are not.
 */
export interface Lane {
  slug: string;
  stages: string[];
  /** Seconds for one packet to cross the lane. Varied so lanes don't move in lockstep. */
  speed: number;
}

export const lanes: Lane[] = [
  {
    slug: "tracelayer",
    stages: ["Telemetry", "Parse", "Ledger", "Detect", "LLM draft", "Verify", "Review"],
    speed: 6.4,
  },
  {
    slug: "passable",
    stages: ["OSM", "PostGIS", "Graph", "Hazards", "A*", "WebSocket", "Client"],
    speed: 4.8,
  },
  {
    slug: "marketpulse",
    stages: ["Events", "Candles", "Windows", "Features", "Split", "Forest", "Eval"],
    speed: 5.6,
  },
  {
    slug: "energy-analytics",
    stages: ["Sensors", "Kafka", "Writer", "Raw zone", "Spark", "Parquet", "Dashboard"],
    speed: 5.2,
  },
  {
    slug: "fit-letter",
    stages: ["Page", "Popup", "PDF.js", "Express", "Claude", "Schema", "Export"],
    speed: 6,
  },
];
