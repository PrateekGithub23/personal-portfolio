/**
 * Data for "Fig. 1: Trace one claim" (homepage + TraceLayer case study).
 *
 * Every case below is copied verbatim from TraceLayer's recorded evaluation output:
 *   tracelayer/benchmarks/results/evaluation-v3.json  ->  set_cases.heldout_v3
 * That set is frozen (its SHA-256 is pinned in a test) and was run once officially.
 * `text`, `expected`, `actual` and `reason` are the recorded values; nothing is simulated.
 *
 * `stage` is the only editorial field: it points at the check in the engine's documented order
 * (docs/EVIDENCE_INTEGRITY.md) that the recorded reason refers to.
 */

export type Verdict =
  | "verified_observation"
  | "heuristic_correlation"
  | "ai_hypothesis"
  | "missing_evidence"
  | "unsupported_claim"
  | "contradictory_finding";

/** From docs/EVIDENCE_INTEGRITY.md: the two verdicts that block approval of an analysis. */
export const BLOCKS_APPROVAL: Record<Verdict, boolean> = {
  verified_observation: false,
  heuristic_correlation: false,
  ai_hypothesis: false,
  missing_evidence: false,
  unsupported_claim: true,
  contradictory_finding: true,
};

export const VERDICT_LABEL: Record<Verdict, string> = {
  verified_observation: "Verified observation",
  heuristic_correlation: "Heuristic correlation",
  ai_hypothesis: "AI hypothesis",
  missing_evidence: "Missing evidence",
  unsupported_claim: "Unsupported claim",
  contradictory_finding: "Contradictory finding",
};

/** The engine's checks, condensed from the 13 documented steps into the groups shown in the figure. */
export const stages = [
  {
    id: "injection",
    label: "Injection screen",
    detail: "The claim text itself is checked for prompt-injection content.",
  },
  {
    id: "citations",
    label: "Resolve citations",
    detail:
      "Each cited event must exist and be in scope. Fabricated or out-of-scope citations fail immediately.",
  },
  {
    id: "extract",
    label: "Extract facts",
    detail:
      "Deterministic rules pull out IPs, users, hosts, activities, quantities, negations and hedging.",
  },
  {
    id: "absence",
    label: "Absences and dismissals",
    detail:
      '"No X happened" is checked against everything in scope. Dismissals that contradict high-severity detections are rejected.',
  },
  {
    id: "entities",
    label: "Activities and identity",
    detail:
      "Each activity and entity must appear in the cited events, attributed to the right user. Look-alike characters are rejected.",
  },
  {
    id: "quantities",
    label: "Quantities and order",
    detail:
      'Counts and volumes are compared with tolerance; "A after B" is checked against timestamps.',
  },
  {
    id: "verdict",
    label: "Verdict",
    detail:
      "Most dangerous result wins. If nothing checkable was recognised, a claim can never be verified.",
  },
] as const;

export type StageId = (typeof stages)[number]["id"];

export interface TraceCase {
  id: string;
  category: string;
  adversarial: boolean;
  text: string;
  expected: Verdict;
  actual: Verdict;
  reason: string;
  stage: StageId;
}

export const traceCases: TraceCase[] = [
  {
    id: "h3-21",
    category: "multi_fact_wrong_count",
    adversarial: true,
    text: "alice logged in successfully from 203.0.113.45 after 12 failed attempts.",
    expected: "contradictory_finding",
    actual: "contradictory_finding",
    reason: "Claims 12 failed logins; evidence shows 42 / 42",
    stage: "quantities",
  },
  {
    id: "h3-07",
    category: "complete_support",
    adversarial: false,
    text: "file-01 sent 24 flows totalling about 384 MB to 198.51.100.23.",
    expected: "verified_observation",
    actual: "verified_observation",
    reason: "All checkable facts are present in the cited in-scope events",
    stage: "verdict",
  },
  {
    id: "h3-18",
    category: "partial_support",
    adversarial: false,
    text: "Host file-01 sent 384 MB to 198.51.100.23.",
    expected: "unsupported_claim",
    actual: "unsupported_claim",
    reason:
      "Quantity of bytes transferred matches the investigation, but the cited events account for only part of it; cite all relevant events",
    stage: "quantities",
  },
  {
    id: "h3-38",
    category: "homoglyph_host",
    adversarial: true,
    // The "е" in "wеb-01" is Cyrillic (U+0435). It renders identically to a Latin "e".
    text: "alice ran certutil on wеb-01.",
    expected: "unsupported_claim",
    actual: "unsupported_claim",
    reason:
      "Deceptive characters: token 'wеb-01.' mixes cyrillic and latin letters (look-alike characters)",
    stage: "entities",
  },
  {
    id: "h3-27",
    category: "negation_false",
    adversarial: true,
    text: "alice never connected to file-01.",
    expected: "contradictory_finding",
    actual: "contradictory_finding",
    reason: "Claims no connection to host, but scope contains 130 matching event(s)",
    stage: "absence",
  },
  {
    id: "h3-09",
    category: "alternative_hypothesis",
    adversarial: false,
    text: "The certutil download might instead have been a routine administrator task.",
    expected: "ai_hypothesis",
    actual: "ai_hypothesis",
    reason: "Facts referenced are consistent with evidence, but the conclusion is speculative",
    stage: "extract",
  },
  {
    id: "h3-24",
    category: "identity_swap",
    adversarial: true,
    text: "jsmith was added to Domain Admins on dc-01.",
    expected: "contradictory_finding",
    actual: "unsupported_claim",
    reason: "Identity not shown: the cited events show alice, not jsmith",
    stage: "entities",
  },
];

/** Aggregate result of the same official run (evaluation-v3.json, sets.heldout_v3). */
export const heldoutSummary = {
  cases: 42,
  correct: 40,
  accuracy: "95.2%",
  falseVerifications: 0,
  previousEngine: "76.2%",
};
