/**
 * TraceLayer case study.
 *
 * Sources (all in github.com/PrateekGithub23/tracelayer): README.md, docs/ARCHITECTURE.md,
 * docs/EVIDENCE_INTEGRITY.md, docs/AI_EVALUATION.md (v3 section, idle re-run),
 * docs/REAL_WORLD_DATA_EVALUATION.md, docs/LIMITATIONS.md, benchmarks/results/*.json.
 *
 * Note on the unsafe-claim figure: the header of AI_EVALUATION.md still quotes an earlier run made
 * while other tests were executing (62.9% -> 2.6%). The site uses the idle re-run in the v3 table
 * (55.4% -> 2.9%), which is also what the README reports.
 */
import type { ArchDiagram, Project } from "../types";

const REPO = "https://github.com/PrateekGithub23/tracelayer";

const architecture: ArchDiagram = {
  id: "tracelayer-arch",
  title: "TraceLayer system architecture",
  width: 1000,
  height: 440,
  initial: "integrity",
  summary:
    "A FastAPI modular monolith. Telemetry is parsed by versioned parsers into a hash-chained evidence ledger in PostgreSQL. Detection rules and correlation turn events into cases. A local LLM drafts an analysis, the Evidence Integrity Engine verifies every claim against the cited events, and an analyst reviews before anything is approved or exported.",
  nodes: [
    {
      id: "sources",
      label: "Telemetry",
      sub: "OTRF · synthetic",
      x: 20,
      y: 40,
      w: 170,
      h: 64,
      role: "Where events come from: five public OTRF Windows lab datasets (MIT licensed), a seeded synthetic scenario generator, or JSON uploads.",
      tech: ["Pinned dataset catalogue", "In-memory zip reader"],
      dataFlow: "Raw records go to the parser recorded for that source.",
      failure:
        "Datasets come only from a pinned catalogue and are read in memory, so there is no arbitrary-URL fetch (SSRF) and no path traversal; tampered upstream archives are refused.",
    },
    {
      id: "parsers",
      label: "Versioned parsers",
      sub: "otrf_windows.v3",
      x: 230,
      y: 40,
      w: 180,
      h: 64,
      role: "Normalise raw Windows events into a common schema, with a per-event diagnostic: full, partial (missing fields named) or raw-only (with the reason).",
      tech: ["Python 3.12", "Pydantic"],
      dataFlow: "Each raw record is hashed, parsed, de-duplicated and committed in a batch.",
      tradeoff:
        "Parsers are versioned instead of edited. Verification re-runs the recorded parser, so changing one in place would make every old event look tampered.",
    },
    {
      id: "ledger",
      label: "Evidence ledger",
      sub: "PostgreSQL 16",
      x: 450,
      y: 40,
      w: 180,
      h: 64,
      role: "Stores events as immutable evidence: SHA-256 per record, a Merkle root per batch, and a hash chain across batches.",
      tech: ["PostgreSQL 16", "SQLite (dev/tests)", "SQLAlchemy 2", "Alembic"],
      failure:
        "The runtime database role has no UPDATE or DELETE on evidence tables, so even a compromised API process cannot rewrite history.",
      tradeoff:
        "Tamper-evident, not tamper-proof: someone with database admin rights could recompute every hash. The chain head is exported with every bundle so it can be checked from outside.",
    },
    {
      id: "detect",
      label: "Detection",
      sub: "13 ATT&CK rules",
      x: 670,
      y: 40,
      w: 180,
      h: 64,
      role: "Sliding-window rules mapped to MITRE ATT&CK techniques.",
      dataFlow:
        "Late-arriving evidence is merged into an existing detection rather than creating a duplicate alert.",
      tradeoff:
        "Rules, not ML: each detection is explainable. Coverage is a small set of techniques, and the T1069 discovery dataset was missed.",
    },
    {
      id: "correlate",
      label: "Correlation",
      sub: "union-find → cases",
      x: 670,
      y: 170,
      w: 180,
      h: 64,
      role: "Groups detections that share entities (users, hosts, IPs) into investigation cases with explainable risk scores.",
      tech: ["Union-find"],
      tradeoff:
        "Ubiquitous entities are suppressed so one shared domain controller does not merge every case into one.",
    },
    {
      id: "llm",
      label: "Local LLM",
      sub: "Ollama · llama3.2:3b",
      x: 450,
      y: 170,
      w: 180,
      h: 64,
      role: "Drafts the analysis. In grounded mode (the default) it sees only a table of facts that were already verified and must reference them by id.",
      tech: ["Ollama", "llama3.2:3b (Q4_K_M)"],
      dataFlow:
        "Citations are derived server-side from fact ids, so the model cannot introduce a citation.",
      tradeoff:
        "Grounding removed fabricated citations but costs completeness: the model only restates facts the deterministic stage found.",
    },
    {
      id: "integrity",
      label: "Integrity engine",
      sub: "deterministic",
      x: 230,
      y: 170,
      w: 180,
      h: 64,
      role: "Checks every claim against the exact events it cites: entities, counts, times, outcomes, ordering, attribution. Each claim gets one of six verdicts, with reasons.",
      tech: ["Python", "Regex + vocabulary extraction"],
      failure:
        "Unrecognised phrasing fails safe: a claim with nothing checkable can never be verified.",
      tradeoff:
        "Rules instead of an LLM judge: reproducible, under 1 ms per claim, and explainable. The cost is recall on unfamiliar phrasing.",
    },
    {
      id: "review",
      label: "Analyst review",
      sub: "cases · RBAC · audit",
      x: 20,
      y: 170,
      w: 170,
      h: 64,
      role: "Case workflow with assignment, a state machine, reviewer segregation of duties and comments. Approval is blocked while any claim is unsupported or contradictory.",
      tech: ["React 18", "TypeScript", "TanStack Query", "Cytoscape.js"],
      failure:
        "Optimistic locking: two analysts editing the same case get a clear conflict instead of a silent overwrite.",
    },
    {
      id: "api",
      label: "API boundary",
      sub: "FastAPI · sessions · CSRF",
      x: 230,
      y: 320,
      w: 400,
      h: 64,
      role: "Every route goes through session, CSRF, Origin and permission checks. One permission table defines access.",
      tech: ["FastAPI", "Argon2id", "Server-side sessions", "nginx"],
      tradeoff:
        "Opaque server-side sessions over JWTs: instant revocation and nothing in localStorage for XSS to steal, at the cost of one indexed lookup per request.",
      failure:
        "A test discovers every route from the app object and checks it against every role, so a new endpoint without a permission check fails CI.",
    },
    {
      id: "export",
      label: "Evidence export",
      sub: "ZIP + hash manifest",
      x: 670,
      y: 320,
      w: 180,
      h: 64,
      role: "Reports and evidence bundles with per-file SHA-256, a bundle hash and the ledger head.",
      dataFlow: "A standalone script can verify a bundle without TraceLayer installed.",
    },
  ],
  edges: [
    { from: "sources", to: "parsers" },
    { from: "parsers", to: "ledger" },
    { from: "ledger", to: "detect" },
    { from: "detect", to: "correlate" },
    { from: "correlate", to: "llm", label: "evidence pack" },
    { from: "llm", to: "integrity", label: "claims" },
    { from: "integrity", to: "review", label: "verdicts" },
    { from: "ledger", to: "integrity", dashed: true, label: "cited events" },
    { from: "review", to: "api", dashed: true },
    { from: "api", to: "export", dashed: true },
  ],
};

export const tracelayer: Project = {
  slug: "tracelayer",
  index: "01",
  title: "TraceLayer",
  kind: "Security investigation platform with deterministic verification of AI-written claims",
  short: "Security investigation platform with verified AI claims",
  summary:
    "A local LLM drafts the investigation; a rule-based engine re-checks every sentence against the exact log events it cites and blocks approval until a person handles anything unsupported. Underneath: versioned parsers for real Windows telemetry, a hash-chained evidence ledger, ATT&CK-mapped detections and a multi-user case workflow.",
  domains: ["backend", "ml", "security", "data"],
  period: "2026",
  status: "v3 · open source",
  stack: ["Python", "FastAPI", "PostgreSQL", "React", "TypeScript", "Ollama", "Playwright"],
  links: [
    { label: "Source", href: REPO },
    { label: "Live demo (read-only)", href: "https://prateekgithub23.github.io/tracelayer/" },
  ],
  headline: [
    {
      value: "95.2%",
      label: "claim verdicts correct",
      context:
        "Frozen 42-case adversarial held-out set, single official run; 0 false verifications.",
      source: "docs/AI_EVALUATION.md",
    },
    {
      value: "55.4% → 2.9%",
      label: "unsafe claims, free-form vs grounded",
      context: "llama3.2:3b, same 3 investigations, 5 runs per mode, idle machine.",
      source: "docs/AI_EVALUATION.md",
    },
    {
      value: "97.7–99.8%",
      label: "events fully normalised",
      context: "26,228 events across 5 public OTRF Windows lab datasets; 0 rejected.",
      source: "docs/REAL_WORLD_DATA_EVALUATION.md",
    },
  ],
  cover: {
    src: "/images/tracelayer/desktop-integrity.png",
    alt: "TraceLayer's Evidence integrity page: an ingest ledger listing batches with their Merkle roots and chain hashes, beside a 'Run full verification' panel.",
    width: 1440,
    height: 900,
  },
  hero: "evidence",
  glance: {
    problem:
      "Small language models write confident investigation reports in which many claims are not supported by the logs. An analyst cannot tell which ones by reading.",
    built:
      "A FastAPI and React platform that treats model output as untrusted input: every claim is parsed and checked against its cited events, and approval is blocked until unsafe claims are handled.",
    result:
      "95.2% correct verdicts on a frozen adversarial held-out set with no false verifications; grounded generation cut a 3B model's unsafe claims from 55.4% to 2.9%.",
  },
  published: true,
  sections: [
    {
      id: "problem",
      title: "Problem",
      blocks: [
        {
          type: "p",
          text: "I wanted to know whether a small local model could draft security investigations that an analyst could trust. In the first benchmark, llama3.2:3b produced valid JSON every time, and more than half of its factual claims were unsupported or contradicted by the evidence. Formatting was never the issue. The issue was that nothing in the output tells you which sentences are true.",
        },
        {
          type: "p",
          text: 'So the question changed from "how do I prompt the model better" to "how do I check what it wrote, sentence by sentence, against the data it claims to be describing".',
        },
      ],
    },
    {
      id: "objectives",
      title: "Engineering objectives",
      blocks: [
        {
          type: "list",
          items: [
            "Treat model output as untrusted input, the same way the API treats request bodies.",
            "Make every verdict reproducible and explain it in words an analyst can act on.",
            "Keep evidence provably unchanged from ingest to export.",
            "Measure on data the system was not tuned on, and report misses.",
            "Run entirely on a laptop at zero cost.",
          ],
        },
      ],
    },
    {
      id: "architecture",
      title: "System architecture",
      blocks: [
        {
          type: "p",
          text: "TraceLayer is a modular monolith: one FastAPI process behind nginx, PostgreSQL 16 for evidence, and an optional local model through Ollama. Select a component to see what it is responsible for and the trade-off behind it.",
        },
        { type: "architecture", diagram: architecture },
      ],
    },
    {
      id: "verification",
      title: "Verifying a claim",
      blocks: [
        {
          type: "p",
          text: "Each claim the model writes has text, a kind and citations. The engine resolves the citations, extracts checkable facts with deterministic rules, and compares them with the cited events. The most dangerous result wins: a contradiction outranks a missing citation, which outranks a hedge.",
        },
        { type: "custom", component: "claim-trace" },
        {
          type: "aside",
          title: "Why not an LLM judge?",
          text: "A judge model can be wrong in the same ways as the generator, costs inference time and gives different answers between runs. Rules are reproducible, take a fraction of a millisecond per claim, and every verdict comes with reasons. The cost is recall: phrasing outside the vocabulary is not understood, so the design makes that failure safe. Unrecognised content can never raise a verdict.",
        },
      ],
    },
    {
      id: "decisions",
      title: "Key decisions",
      blocks: [
        {
          type: "decisions",
          rows: [
            {
              chose: "Grounded generation from a verified fact table",
              rejected: "Better prompting of free-form output",
              why: "The model only sees facts that already passed verification and cites them by id; the server derives the event citations. Fabricated citations went from 7.9 per analysis to 0. It costs completeness.",
            },
            {
              chose: "New parser version (v3) with v2 frozen",
              rejected: "Fixing the v2 parser in place",
              why: "Verification re-runs the recorded parser. Editing it would make every previously ingested event look tampered. Re-normalisation is an audited, owner-only operation that leaves raw records and hashes untouched.",
            },
            {
              chose: "Database-enforced evidence immutability",
              rejected: "Application-level checks only",
              why: "The runtime role cannot UPDATE or DELETE evidence, so a compromised API process still cannot rewrite it.",
            },
            {
              chose: "Server-side sessions with synchronizer CSRF tokens",
              rejected: "JWT in localStorage",
              why: "Instant revocation on role change or logout, and no token for XSS to steal. One indexed lookup per request.",
            },
            {
              chose: "Rate limits per IP and per account",
              rejected: "Account lockout",
              why: "Lockout lets anyone who knows a username lock that analyst out.",
            },
          ],
        },
      ],
    },
    {
      id: "provenance",
      title: "Tamper-evident storage",
      blocks: [
        {
          type: "p",
          text: "Every raw record is fingerprinted with its source. A batch commits to the exact set of its events through a Merkle root, and each batch commits to the previous one. Deleting, injecting, editing or reordering anything changes a hash that verification recomputes.",
        },
        {
          type: "code",
          lang: "python",
          file: "backend/app/integrity/provenance.py",
          href: `${REPO}/blob/main/backend/app/integrity/provenance.py`,
          code: `def record_hash(source: str, raw: dict[str, Any]) -> str:
    """Fingerprint of a raw record. The source is included: the same bytes from two
    different collectors are two different observations."""
    return sha256_hex(f"{source}\\n{canonical_json(raw)}")


def merkle_root(leaf_hashes: list[str]) -> str:
    """Binary Merkle root over *sorted* leaves (order-independent set commitment)."""
    if not leaf_hashes:
        return sha256_hex(b"")
    level = sorted(leaf_hashes)
    while len(level) > 1:
        if len(level) % 2 == 1:
            level.append(level[-1])  # duplicate the last node on odd levels (Bitcoin-style)
        level = [sha256_hex(level[i] + level[i + 1]) for i in range(0, len(level), 2)]
    return level[0]`,
          note: "Excerpt. The batch chain hash adds the previous chain hash, sequence number, parser version and accepted count.",
        },
      ],
    },
    {
      id: "real-data",
      title: "What real telemetry exposed",
      blocks: [
        {
          type: "p",
          text: "Synthetic data passed. The public OTRF lab datasets did not: in v2, about 97% of events were stored raw-only. None were rejected, but they carried no typed fields. Going through all 82 distinct channel and event-id pairs found four causes:",
        },
        {
          type: "list",
          ordered: true,
          items: [
            "Whole event classes were unmapped (Sysmon process access, registry, image loads, object access, filtering platform, PowerShell pipeline).",
            'A real bug: the channel name appears as both "Security" and "security" in the same dataset, and v2 compared it case-sensitively.',
            "Rich fields such as process GUIDs, parent paths and logon ids were present but discarded, so parent-child relationships could not be followed.",
            'PowerShell put the command line in free text with inconsistent spacing ("HostApplication=" and "Host Application = ").',
          ],
        },
        {
          type: "p",
          text: 'The v3 adapter maps 50 event types and records why each event is full, partial or raw-only. The criteria for "full" were fixed before measuring. One criterion turned out too lenient and was tightened, which lowered the score; the change is in the git history.',
        },
      ],
    },
    {
      id: "testing",
      title: "Testing",
      blocks: [
        {
          type: "list",
          items: [
            "119 backend tests (pytest) and 12 frontend unit tests (Vitest); 8 Playwright end-to-end tests against the real API, plus 6 on the static demo.",
            "An authorization matrix that discovers every API route from the application and checks all 82 against every role. A new endpoint without a permission check fails CI.",
            "Held-out sets are frozen and hash-pinned in a test, run once officially, and never used for tuning. Post-hoc results are reported separately.",
            "CI runs ruff, mypy, gitleaks and pip-audit alongside the tests.",
          ],
        },
        {
          type: "code",
          lang: "python",
          file: "backend/tests/test_rbac_matrix.py",
          href: `${REPO}/blob/main/backend/tests/test_rbac_matrix.py`,
          code: `def test_every_route_is_guarded() -> None:
    unguarded = [f"{m} {p}" for m, p, perm in ROUTES
                 if perm is None and f"{m} {p}" not in PUBLIC_ROUTES]
    assert unguarded == [], f"routes without an auth dependency: {unguarded}"`,
          note: "ROUTES is built by walking the FastAPI app's dependency tree, so it cannot drift from the real API.",
        },
      ],
    },
    {
      id: "results",
      title: "Results",
      blocks: [
        {
          type: "metrics",
          metrics: [
            {
              value: "95.2%",
              label: "Held-out verdict accuracy (40 of 42)",
              context:
                "Frozen adversarial set written before the v3 engine changes; single official run. Previous engine: 76.2% with 2 false verifications.",
              source: "docs/AI_EVALUATION.md",
            },
            {
              value: "0",
              label: "False verifications on that set",
              context:
                "Both misses were still blocked: each got a different unsafe verdict from the one expected.",
              source: "benchmarks/results/evaluation-v3.json",
            },
            {
              value: "55.4% → 2.9%",
              label: "Unsafe-claim rate, free-form vs grounded",
              context:
                "llama3.2:3b Q4_K_M; same 3 investigations (2 synthetic, 1 OTRF); 5 runs per mode; mean per analysis.",
              source: "docs/AI_EVALUATION.md",
            },
            {
              value: "0.27 ms",
              label: "Claim validation, p50",
              context: "Warm, 56 validations of the development sets; p95 0.40 ms.",
              source: "docs/AI_EVALUATION.md",
            },
            {
              value: "97.7–99.8%",
              label: "Fully normalised events",
              context:
                "26,228 events, 5 OTRF lab datasets, 0 rejected. The labelled technique was detected in 4 of 5 datasets.",
              source: "docs/REAL_WORLD_DATA_EVALUATION.md",
            },
            {
              value: "23,904/s",
              label: "Ingest throughput, SQLite",
              context: "100k synthetic events on a local, idle machine; PostgreSQL 16.7–17.3k/s.",
              source: "docs/PERFORMANCE.md",
            },
          ],
        },
        {
          type: "image",
          wide: true,
          image: {
            src: "/images/tracelayer/desktop-analysis.png",
            alt: "TraceLayer analysis view: an AI-drafted investigation where each claim shows its verdict, its citations and the reasons from the integrity engine.",
            width: 1440,
            height: 3267,
            caption:
              "An analysis in the public demo. Each claim carries its verdict and the engine's reasons. Screenshot of recorded output, not a mock-up.",
          },
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
            "Evaluated on synthetic data and five small lab datasets. Detection quality on a real network is unmeasured, and no false-positive rate is claimed because the public data has no benign baseline.",
            "The held-out sets are small (40 and 42 claims) and not perfectly independent: each baseline run revealed failure categories the next development set targeted.",
            "Rule-based extraction does not understand unusual phrasing; such claims fail safe as unsupported, which costs analyst time.",
            "The engine checks what the cited evidence shows. It cannot tell whether the logs themselves are truthful.",
            "Single node, no MFA or SSO, one model generation at a time.",
          ],
        },
      ],
    },
    {
      id: "next",
      title: "Next",
      blocks: [
        {
          type: "list",
          items: [
            "Sign the ledger head with a key held outside the database, turning tamper-evident into something closer to tamper-proof.",
            "Adapters beyond Windows event logs (Zeek, cloud audit logs).",
            "A benign-traffic baseline so false-positive rates can be measured honestly.",
          ],
        },
      ],
    },
  ],
};
