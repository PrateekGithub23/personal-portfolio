/**
 * Technical capabilities, grouped by engineering domain.
 *
 * Only technologies backed by a project or a role are listed, and each links to where it was used.
 * No ratings or percentages. C++ and MongoDB were deliberately removed (not really used).
 */
import type { Capability } from "./types";

const tl = (anchor = "") => ({ label: "TraceLayer", href: `/work/tracelayer${anchor}` });
const pa = (anchor = "") => ({ label: "Passable", href: `/work/passable${anchor}` });
const mp = { label: "MarketPulse", href: "/work/marketpulse" };
const en = { label: "Energy pipeline", href: "/work/energy-analytics" };
const fl = { label: "Fit Letter", href: "/work/fit-letter" };
const td = { label: "TD co-op", href: "/experience#td-bank" };
const bl = { label: "Blakes co-op", href: "/experience#blake-cassels-graydon-llp" };
const ct = { label: "Colortech co-op", href: "/experience#colortech-incorporated" };

export const capabilities: Capability[] = [
  {
    domain: "Languages",
    items: [
      { name: "Go", evidence: pa() },
      { name: "Python", evidence: tl() },
      { name: "TypeScript", evidence: tl() },
      { name: "JavaScript", evidence: fl },
      { name: "SQL", evidence: pa() },
      { name: "Shell", evidence: td },
    ],
  },
  {
    domain: "Backend and APIs",
    items: [
      { name: "FastAPI", evidence: tl() },
      { name: "Go net/http + WebSockets", evidence: pa() },
      { name: "Node.js / Express", evidence: fl },
      { name: "SQLAlchemy, Alembic", evidence: tl() },
    ],
  },
  {
    domain: "Frontend",
    items: [
      { name: "React", evidence: tl() },
      { name: "Next.js", evidence: pa() },
      { name: "MapLibre", evidence: pa() },
      { name: "Chrome extensions (MV3)", evidence: fl },
    ],
  },
  {
    domain: "Data engineering",
    items: [
      { name: "Kafka", evidence: en },
      { name: "Spark (PySpark)", evidence: en },
      { name: "Parquet, partitioned data lake", evidence: en },
      { name: "pandas, NumPy", evidence: mp },
    ],
  },
  {
    domain: "Databases and caching",
    items: [
      { name: "PostgreSQL", evidence: tl() },
      { name: "PostGIS", evidence: pa() },
      { name: "Redis", evidence: pa() },
      { name: "SQLite", evidence: tl() },
    ],
  },
  {
    domain: "Infrastructure and cloud",
    items: [
      { name: "Docker, Docker Compose", evidence: pa() },
      { name: "Kubernetes (kind, Kustomize)", evidence: pa() },
      { name: "GitHub Actions", evidence: tl() },
      { name: "Azure Container Apps, Vercel", evidence: pa() },
    ],
  },
  {
    domain: "Applied ML",
    items: [
      { name: "scikit-learn", evidence: mp },
      { name: "Group-aware evaluation", evidence: mp },
      { name: "Local LLMs (Ollama)", evidence: tl() },
      { name: "LLM output verification", evidence: tl() },
    ],
  },
  {
    domain: "Testing and reliability",
    items: [
      { name: "pytest, Vitest", evidence: tl() },
      { name: "Playwright", evidence: tl() },
      { name: "Go race detector, property tests", evidence: pa() },
      { name: "k6 load testing", evidence: pa() },
    ],
  },
  {
    domain: "Security engineering",
    items: [
      { name: "AuthN/AuthZ (Argon2id, RBAC, CSRF)", evidence: tl() },
      { name: "Trivy, gitleaks, pip-audit", evidence: tl() },
      { name: "KQL, Defender, Azure AD", evidence: bl },
      { name: "Vulnerability remediation", evidence: td },
    ],
  },
  {
    domain: "Internal tooling",
    items: [{ name: "React + Material UI", evidence: ct }],
  },
];
