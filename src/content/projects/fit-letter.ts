/**
 * Fit Letter: a short project note rather than a full case study.
 *
 * Sources (github.com/PrateekGithub23/fit-letter): README.md, extension/manifest.json,
 * extension/content.js, backend/index.js. There are no tests, metrics or screenshots, so the page
 * is deliberately brief. "Evidence-grounded" here means prompt rules plus a schema check on the
 * model's answer; it is NOT a verification of the evidence against the résumé, and the page says so.
 */
import type { ArchDiagram, Project } from "../types";

const flow: ArchDiagram = {
  id: "fitletter-flow",
  title: "Fit Letter architecture",
  width: 1000,
  height: 260,
  initial: "validate",
  summary:
    "A Chrome extension reads the job posting from the current page and parses a PDF résumé locally. It sends both to a small Express backend, which asks the Claude API for a structured analysis, validates the shape of the answer, and returns requirements, evidence, gaps and a draft letter.",
  nodes: [
    {
      id: "content",
      label: "Content script",
      sub: "page extraction",
      x: 10,
      y: 30,
      w: 160,
      h: 64,
      role: "Extracts the job title and description from the open careers page.",
      dataFlow:
        "Tries site-specific selectors first, then a generic fallback based on the page's text structure. Manual entry covers pages where both fail.",
    },
    {
      id: "popup",
      label: "Extension popup",
      sub: "MV3 · chrome.storage",
      x: 220,
      y: 30,
      w: 170,
      h: 64,
      role: "The whole workflow UI: read posting, upload résumé, set tone and length, review the analysis, edit and export.",
      tech: ["Chrome Manifest V3", "JavaScript"],
      dataFlow: "State is persisted to chrome.storage so closing the popup does not lose work.",
    },
    {
      id: "pdf",
      label: "PDF.js",
      sub: "local parsing",
      x: 220,
      y: 170,
      w: 170,
      h: 64,
      role: "Parses the résumé PDF in the browser.",
      tradeoff:
        "Parsing locally means the PDF file itself never leaves the machine; only extracted text is sent for analysis.",
    },
    {
      id: "backend",
      label: "Express backend",
      sub: "Node.js",
      x: 440,
      y: 100,
      w: 160,
      h: 64,
      role: "Holds the API key, builds the prompt and calls the model. Keeping the key server-side keeps it out of the extension bundle.",
      tech: ["Node.js", "Express"],
    },
    {
      id: "claude",
      label: "Claude API",
      sub: "structured JSON",
      x: 650,
      y: 30,
      w: 160,
      h: 64,
      role: "Returns requirements with a match or gap status, the résumé evidence for each match, and a draft letter that uses only matched evidence.",
    },
    {
      id: "validate",
      label: "Schema check",
      sub: "reject malformed",
      x: 650,
      y: 170,
      w: 160,
      h: 64,
      role: 'Rejects any answer where a "match" has no evidence string, a "gap" has evidence, or required fields are missing.',
      tradeoff:
        "This checks the shape of the answer, not whether the evidence text really appears in the résumé. A deterministic check against the résumé text, like the one in TraceLayer, would be the next step.",
    },
    {
      id: "export",
      label: "Edit + export",
      sub: "jsPDF",
      x: 860,
      y: 100,
      w: 130,
      h: 64,
      role: "The letter is editable, can be regenerated, copied, or exported as a PDF named after the candidate and job title.",
    },
  ],
  edges: [
    { from: "content", to: "popup" },
    { from: "pdf", to: "popup" },
    { from: "popup", to: "backend" },
    { from: "backend", to: "claude" },
    { from: "claude", to: "validate" },
    { from: "validate", to: "export" },
  ],
};

export const fitLetter: Project = {
  slug: "fit-letter",
  index: "05",
  title: "Fit Letter",
  kind: "Chrome extension that maps job requirements to résumé evidence before drafting a letter",
  short: "Evidence-first job application extension",
  summary:
    "Reads a job posting from the page, parses a résumé locally, and has a model list each requirement as a match (with the supporting résumé line) or a gap before it writes anything. The letter is only allowed to use matched evidence.",
  domains: ["fullstack"],
  period: "2026",
  status: "Prototype",
  stack: ["JavaScript", "Chrome MV3", "Node.js", "Express", "PDF.js", "Claude API"],
  links: [{ label: "Source", href: "https://github.com/PrateekGithub23/fit-letter" }],
  headline: [],
  hero: "brief",
  glance: {
    problem: "Generated cover letters tend to claim experience the applicant does not have.",
    built:
      "An MV3 extension with page extraction and local PDF parsing, an Express backend, and a structured requirement-to-evidence step that the letter must draw from.",
    result:
      "A working prototype. No tests or measurements yet, and the evidence step relies on the model plus a schema check.",
  },
  published: true,
  sections: [
    {
      id: "architecture",
      title: "How it works",
      blocks: [{ type: "architecture", diagram: flow }],
    },
    {
      id: "guardrail",
      title: "The guardrail, and its limit",
      blocks: [
        {
          type: "p",
          text: "The model must return each requirement as a match or a gap. A match without evidence, or a gap with evidence, is rejected before the user sees it, and the letter prompt only receives matched requirements.",
        },
        {
          type: "code",
          lang: "javascript",
          file: "backend/index.js",
          href: "https://github.com/PrateekGithub23/fit-letter/blob/main/backend/index.js",
          code: `for (const item of analysis.requirements) {
  if (item.status !== "match" && item.status !== "gap") return false;
  if (item.status === "match" &&
      (typeof item.evidence !== "string" || !item.evidence.trim())) return false;
  if (item.status === "gap" && item.evidence !== null) return false;
}`,
          note: "Excerpt, condensed.",
        },
        {
          type: "p",
          text: "That enforces structure, not truth. Nothing yet checks that the quoted evidence actually appears in the résumé. TraceLayer is where I worked on that harder problem.",
        },
      ],
    },
    {
      id: "limitations",
      title: "Known limitations",
      blocks: [
        {
          type: "list",
          items: [
            "No automated tests.",
            "Evidence is not verified against the résumé text.",
            "Site-specific selectors break when job boards change their markup; the generic fallback and manual entry cover that.",
          ],
        },
      ],
    },
  ],
};
