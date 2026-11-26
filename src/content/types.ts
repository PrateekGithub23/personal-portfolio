/**
 * Content types.
 *
 * Everything the site says lives in `src/content/` (structured, typed) or `content/` (Markdown).
 * Components only render these shapes, so updating a project, a metric or a role never requires
 * touching layout code. If a field is optional here, the UI hides that part when it is missing.
 */

/** A domain tag used to group work and capabilities. */
export type Domain = "backend" | "data" | "ml" | "security" | "fullstack" | "infra";

export const DOMAIN_LABEL: Record<Domain, string> = {
  backend: "Backend systems",
  data: "Data engineering",
  ml: "Applied ML",
  security: "Security",
  fullstack: "Full-stack",
  infra: "Infrastructure",
};

/**
 * One measured result. `context` is mandatory on purpose: a number without its conditions
 * (local or production, synthetic or real, sample size) is not shown on this site.
 */
export interface Metric {
  value: string;
  label: string;
  context: string;
  /** Where the number comes from, e.g. a file in the project repository. */
  source?: string;
}

export interface Link {
  label: string;
  href: string;
}

export interface ImageRef {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
}

/* ---------- Architecture diagrams ---------- */

/**
 * A node in an architecture diagram. Coordinates are in the diagram's own viewBox units.
 * Only `label` and `role` are required; any other detail that is not verified is simply omitted.
 */
export interface ArchNode {
  id: string;
  label: string;
  /** Short secondary line under the label, e.g. the technology. */
  sub?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  role: string;
  tech?: string[];
  dataFlow?: string;
  failure?: string;
  tradeoff?: string;
}

export interface ArchEdge {
  from: string;
  to: string;
  label?: string;
  /** Dashed edges are optional or asynchronous paths. */
  dashed?: boolean;
}

export interface ArchDiagram {
  id: string;
  title: string;
  /** viewBox width/height. Height also fixes the aspect ratio on desktop. */
  width: number;
  height: number;
  nodes: ArchNode[];
  edges: ArchEdge[];
  /** Node selected when the diagram first renders. */
  initial: string;
  /** Text alternative describing the whole system for screen readers and the mobile list intro. */
  summary: string;
}

/* ---------- Case study blocks ---------- */

export type Block =
  | { type: "p"; text: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "image"; image: ImageRef; wide?: boolean }
  | { type: "architecture"; diagram: ArchDiagram }
  | { type: "code"; lang: string; file: string; href?: string; code: string; note?: string }
  | { type: "metrics"; metrics: Metric[]; note?: string }
  | { type: "decisions"; rows: { chose: string; rejected: string; why: string }[] }
  | { type: "aside"; title: string; text: string }
  | { type: "custom"; component: "confusion-matrix" | "claim-trace" | "lead-time" | "tl-charts" | "pa-latency" };

export interface Section {
  id: string;
  title: string;
  blocks: Block[];
}

/** How the top of a case study is composed. Each project uses a different one on purpose. */
export type HeroStyle = "evidence" | "screenshot" | "matrix" | "flow" | "brief";

export interface Project {
  slug: string;
  /** Display order and index number, e.g. "01". */
  index: string;
  title: string;
  /** One line: what it is. */
  kind: string;
  /** A few words for the homepage index, e.g. "Security investigation platform". */
  short: string;
  /** Two or three sentences for listings. */
  summary: string;
  domains: Domain[];
  period: string;
  status: string;
  stack: string[];
  links: Link[];
  /** Shown in the case-study header when the source is not public. */
  sourceNote?: string;
  /** The few numbers that best summarise the work. Each carries its context. */
  headline: Metric[];
  cover?: ImageRef;
  hero: HeroStyle;
  /** "At a glance" summary for recruiters, shown before the technical sections. */
  glance: { problem: string; built: string; result: string };
  sections: Section[];
  /** Shown only when true; lets a project exist in content before it is ready. */
  published: boolean;
}

/* ---------- Experience and capabilities ---------- */

export interface Role {
  org: string;
  title: string;
  /** Kept exactly as written on the résumé. */
  dates: string;
  location: string;
  kind: string;
  summary: string;
  points: string[];
  tools: string[];
}

export interface Capability {
  domain: string;
  items: { name: string; evidence?: { label: string; href: string } }[];
}
