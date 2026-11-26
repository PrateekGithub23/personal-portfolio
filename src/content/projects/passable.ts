/**
 * Passable case study.
 *
 * Sources (github.com/PrateekGithub23/passable): README.md, DECISIONS.md (entries 8-13, 19-24),
 * docs/benchmarks/day8.md, docs/benchmarks/day6-propagation.md, internal/overlay/overlay.go.
 * All load-test numbers are LOCAL (Apple M4, k6 on the same machine, PostGIS under amd64 emulation)
 * and are labelled as such. The README states production latency figures predate the Azure move,
 * so none are shown here.
 */
import type { ArchDiagram, Project } from "../types";

const REPO = "https://github.com/PrateekGithub23/passable";

const architecture: ArchDiagram = {
  id: "passable-arch",
  title: "Passable system architecture",
  width: 1000,
  height: 460,
  initial: "overlay",
  summary:
    "OpenStreetMap data is imported into PostgreSQL with PostGIS. Each Go API instance loads the whole walking graph into memory and routes with A*. Live hazard reports are written to a Postgres event log, applied to an immutable copy-on-write overlay, fanned out to other instances over Redis pub/sub, and pushed to affected users over WebSockets. Redis also caches routes keyed by graph version.",
  nodes: [
    {
      id: "osm",
      label: "OSM importer",
      sub: "Go · Overpass JSON",
      x: 20,
      y: 30,
      w: 180,
      h: 64,
      role: "Downloads OpenStreetMap ways for the campus bounding box and splits them into routable edges with the tags the cost model needs (surface, kerbs, steps, crossings).",
      tech: ["Go", "pgx", "Overpass API"],
      dataFlow: "9,013 ways became 21,173 edges (36 degenerate stretches skipped).",
      tradeoff:
        "A ~250-line custom importer instead of osm2pgsql: osm2pgsql produces rendering tables, not a routable graph, and osm2pgrouting is built around cars.",
    },
    {
      id: "pg",
      label: "PostgreSQL + PostGIS",
      sub: "edges · event log",
      x: 20,
      y: 200,
      w: 180,
      h: 64,
      role: "Source of truth for the graph, place search, hazard reports and the hazard event log. Its sequence number is the graph version.",
      tech: ["PostgreSQL", "PostGIS", "pg_trgm", "goose migrations"],
      dataFlow:
        "Nearest-edge snapping uses a GiST KNN query for candidates; exact projection happens in Go.",
      failure:
        "Every hazard write takes an advisory lock first, so writes are serialized across instances and sequence order equals commit order.",
    },
    {
      id: "graph",
      label: "In-memory graph",
      sub: "CSR · 6.5 MiB",
      x: 290,
      y: 30,
      w: 180,
      h: 64,
      role: "The whole walking network loaded at startup into a compressed adjacency index, with one precomputed cost slice per profile.",
      dataFlow: "Loads in about 110 ms; searches never touch the database.",
      tradeoff:
        "Memory and startup time grow with the region, which is irrelevant at campus scale. Immutability is what makes the copy-on-write overlay possible.",
    },
    {
      id: "overlay",
      label: "Hazard overlay",
      sub: "atomic snapshots",
      x: 290,
      y: 200,
      w: 180,
      h: 64,
      role: "Live hazards and their per-profile effect on each edge, held in an immutable snapshot behind an atomic pointer.",
      tech: ["Go sync/atomic"],
      dataFlow:
        "Each route request loads the snapshot once and uses it for the cache key, snapping, search and explanation.",
      tradeoff:
        "Writers clone two small maps (sized by live hazards, not the graph) and swap the pointer. An RWMutex was rejected: a long search holding the read lock blocks writers, and queued writers then block new searches.",
      failure:
        "Events are applied only in strict sequence. A gap triggers a resync from Postgres in one REPEATABLE READ snapshot.",
    },
    {
      id: "astar",
      label: "A* router",
      sub: "haversine heuristic",
      x: 560,
      y: 30,
      w: 180,
      h: 64,
      role: "Finds the cheapest route for the chosen profile (wheelchair, stroller or winter walking) over graph costs plus hazard effects.",
      dataFlow:
        "cost = length × multiplier + penalty. Multipliers are at least 1 and penalties at least 0, so cost never drops below length and the heuristic stays admissible.",
      tradeoff:
        "Plain A* over contraction hierarchies: CH precomputes shortcuts for fixed weights, and live hazards change weights constantly.",
    },
    {
      id: "redis",
      label: "Redis",
      sub: "cache · pub/sub",
      x: 560,
      y: 200,
      w: 180,
      h: 64,
      role: "Route cache, cross-instance hazard fan-out, and token-bucket rate limits per session and per IP.",
      tech: ["Redis", "go-redis v9"],
      dataFlow:
        "Cache keys include the graph version, so a hazard change makes new keys and stale routes are never served. No invalidation code.",
      failure:
        "Fails open: a Redis error is a cache miss, and a 30 s catch-up compares max(seq) in Postgres because a lost last pub/sub message would never cause a gap.",
    },
    {
      id: "ws",
      label: "WebSocket hub",
      sub: "edge → client index",
      x: 800,
      y: 115,
      w: 180,
      h: 64,
      role: "Pushes hazard events to clients whose viewport contains them, and reroute prompts only to clients whose active route uses the affected edge and whose profile the hazard actually blocks.",
      dataFlow:
        "An inverted index from edge id to clients makes the affected-route check a single map lookup.",
      failure:
        "Each client has a 32-message buffer and one writer goroutine. A client that falls behind is disconnected rather than slowing the broadcast.",
    },
    {
      id: "web",
      label: "Map client",
      sub: "Next.js · MapLibre",
      x: 800,
      y: 330,
      w: 180,
      h: 64,
      role: "Route planning, profile selection, hazard reporting and live reroute prompts.",
      tech: ["Next.js", "TypeScript", "MapLibre", "OpenFreeMap tiles"],
      tradeoff:
        "One component owns all state; three child components only render props. No global state library.",
    },
    {
      id: "deploy",
      label: "Deployment",
      sub: "Azure · Vercel · kind",
      x: 290,
      y: 360,
      w: 450,
      h: 64,
      role: "Live: Vercel frontend, Go API on Azure Container Apps (Canada Central), Neon Postgres + PostGIS, Upstash Redis. Kubernetes manifests run on a local kind cluster in CI.",
      tech: ["Docker", "Kubernetes (kind, Kustomize)", "GitHub Actions", "Trivy", "GHCR"],
      dataFlow:
        "CI runs race tests, a Trivy image scan and a kind deploy with a smoke test before publishing the API image. Backend releases to Azure are currently manual, by image digest.",
    },
  ],
  edges: [
    { from: "osm", to: "pg", label: "import" },
    { from: "pg", to: "graph", label: "load" },
    { from: "pg", to: "overlay", label: "event log" },
    { from: "graph", to: "astar" },
    { from: "overlay", to: "astar", label: "snapshot" },
    { from: "overlay", to: "redis", dashed: true, label: "publish" },
    { from: "astar", to: "ws", dashed: true },
    { from: "redis", to: "ws", dashed: true },
    { from: "ws", to: "web", label: "reroute prompt" },
  ],
};

export const passable: Project = {
  slug: "passable",
  index: "02",
  title: "Passable",
  kind: "Accessibility-aware walking routes for the UWaterloo campus, updated live by hazard reports",
  short: "Live accessibility-aware routing engine",
  summary:
    "A Go routing API and Next.js map that plan wheelchair, stroller and winter walking routes, avoiding steps, raised kerbs and rough surfaces. When someone reports a blocked path, only the users whose route and profile are affected are asked to reroute.",
  domains: ["backend", "infra", "data"],
  period: "Oct 2026",
  status: "Live",
  stack: ["Go", "PostgreSQL", "PostGIS", "Redis", "WebSockets", "Next.js", "Kubernetes"],
  links: [
    { label: "Live", href: "https://passable-alpha.vercel.app" },
    { label: "Source", href: REPO },
  ],
  headline: [
    {
      value: "5.6 ms",
      label: "p95 at 1,000 route requests/s",
      context:
        "Local k6 load test, 30 s, hazards changing every second, 0 failures in 30k requests. Apple M4, k6 on the same machine.",
      source: "docs/benchmarks/day8.md",
    },
    {
      value: "0.50 ms",
      label: "A* search, p50",
      context:
        "2,000 seeded random wheelchair queries on the 21,173-edge campus graph; p99 2.7 ms.",
      source: "README · cmd/bench",
    },
    {
      value: "141,586",
      label: "snapshot swaps under load, all routes consistent",
      context: "Race-detector stress test: 27,055 routes computed during constant hazard writes.",
      source: "README",
    },
  ],
  cover: {
    src: "/images/passable/live-reroute.jpg",
    alt: "Passable map of the University of Waterloo campus with a wheelchair route from the Student Life Centre to Hagey Hall, and a prompt reading 'Blocked sidewalk reported on your route' with a Reroute button.",
    width: 1920,
    height: 1200,
  },
  hero: "screenshot",
  glance: {
    problem:
      "Map apps route around traffic, not around steps, raised kerbs or a fenced-off sidewalk. A route that is fine for one person can be impassable for someone in a wheelchair.",
    built:
      "A Go API that routes with A* over an in-memory campus graph, with live hazards applied through lock-free copy-on-write snapshots and pushed to affected users over WebSockets.",
    result:
      "Live on Vercel and Azure. In a local load test it served 1,000 requests/s with 0 failures and a 5.6 ms p95 while hazards changed every second.",
  },
  published: true,
  sections: [
    {
      id: "problem",
      title: "Problem",
      blocks: [
        {
          type: "p",
          text: "Accessible routing has two parts. The static part is knowing which paths have steps, raised kerbs or gravel, which OpenStreetMap partly records. The dynamic part is that conditions change: a sidewalk gets fenced off, an elevator breaks. A route computed five minutes ago may now be impassable.",
        },
        {
          type: "p",
          text: "The engineering problem is the second part. Route queries must keep running while hazards are added, and every query must see one consistent version of the world, across more than one API instance.",
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
            "Routes that respect a profile's hard limits (steps for a wheelchair) and prefer better surfaces otherwise.",
            "Hazard writes must never block route reads, and a read must never see half an update.",
            "Never serve a stale cached route after a hazard changes.",
            "Notify only users whose route and profile are actually affected.",
            "Be honest about missing data instead of assuming a path is fine.",
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
          text: "Select a component to see its responsibility, failure handling and the alternative it replaced.",
        },
        { type: "architecture", diagram: architecture },
      ],
    },
    {
      id: "concurrency",
      title: "Lock-free reads under live writes",
      blocks: [
        {
          type: "p",
          text: "The graph itself never changes after startup. Hazards live in a separate overlay: an immutable snapshot of live hazards and their per-profile effect on each edge. A route request loads the current snapshot pointer once and uses that same snapshot for everything it does. A writer copies the small hazard maps, applies one event, and swaps the pointer. Readers never take a lock.",
        },
        {
          type: "code",
          lang: "go",
          file: "internal/overlay/overlay.go",
          href: `${REPO}/blob/main/internal/overlay/overlay.go`,
          code: `// Holder publishes the current snapshot. Reads are lock-free; writes are serialized.
type Holder struct {
	cur atomic.Pointer[Snapshot]
	mu  sync.Mutex // serializes writers so two updates can't both start from the same snapshot
}

// Load returns the current snapshot. Call it once per query and use the result throughout.
func (h *Holder) Load() *Snapshot { return h.cur.Load() }

// Apply publishes ev. Already-applied events are ignored (returns nil); a gap returns ErrGap
// and the caller must Replace with a fresh snapshot from the database.
func (h *Holder) Apply(ev Event) error {
	h.mu.Lock()
	defer h.mu.Unlock()
	next, err := h.cur.Load().With(ev)
	if errors.Is(err, ErrStale) {
		return nil
	}
	if err != nil {
		return err
	}
	h.cur.Store(next) // the atomic swap: from here on, new queries see the new costs
	return nil
}`,
        },
        {
          type: "p",
          text: "The snapshot's version is the sequence number of the Postgres hazard event log, not a per-instance counter. Two instances with the same hazards therefore report the same version, which is what lets them share one Redis route cache keyed by that version.",
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
              chose: "A* with a haversine heuristic",
              rejected: "Contraction hierarchies",
              why: "CH precomputes shortcuts for fixed weights; every hazard would force re-contraction. A* already runs in 2–3 ms at p99 on this graph.",
            },
            {
              chose: "Missing tags are penalized and labelled",
              rejected: "Blocking unknown edges, or treating them as fine",
              why: "About 30% of pedestrian edges have no surface tag. Blocking them disconnects the campus; ignoring them gives false confidence. The route shows which parts are unknown.",
            },
            {
              chose: "Snap to the profile's usable network",
              rejected: "Snap to the nearest node",
              why: "On a real trip the nearest node sat in a 9-node pocket reachable only by steps, so wheelchair routing failed although a step-free route existed.",
            },
            {
              chose: "Redis pub/sub with Postgres as the safety net",
              rejected: "Redis Streams or a message broker",
              why: "Postgres is already the durable log. Lost messages are recovered by gap detection plus a 30 s catch-up.",
            },
          ],
        },
        {
          type: "image",
          image: {
            src: "/images/passable/profiles.jpg",
            alt: "Passable showing the same trip planned for wheelchair, stroller and winter walking profiles, with different route lines and distances.",
            width: 1920,
            height: 1182,
            caption: "The same trip under different profiles. Screenshot of the live app.",
          },
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
            "Property tests: A* returns exactly Dijkstra's cost on random graphs and on 450 real campus queries.",
            "Golden routes: 3 campus trips × 3 profiles pinned to recorded results on a committed snapshot of the real graph.",
            "A race-detector stress test that routes during constant hazard writes.",
            "Integration tests on real PostGIS and Redis with two API instances (testcontainers): WebSocket delivery, cache-key change, votes, expiry, gap and resync.",
            "A kind cluster deploy in CI with 2 replicas, a migration Job, probes and default-deny NetworkPolicies, smoke-tested with a hazard crossing between replicas.",
          ],
        },
        {
          type: "aside",
          title: "Found by the load test",
          text: "The first k6 smoke run had 4% failed requests. All of them touched one point inside a building whose indoor corridors form a dense network disconnected from outdoor paths: the 20 nearest edges were all indoor. Snapping now widens its search when the candidates are a disconnected cluster, and an integration test fails without the fix. After it: 0 failures in 54k requests.",
        },
      ],
    },
    {
      id: "results",
      title: "Results",
      blocks: [
        { type: "custom", component: "pa-latency" },
        {
          type: "metrics",
          note: "All measured locally on an Apple M4 (16 GiB) with Postgres and Redis in Docker and k6 on the same machine. They show behaviour under load, not production capacity.",
          metrics: [
            {
              value: "0 / 30,066",
              label: "Failed requests at 1,000 req/s",
              context:
                "30 s, random pairs of 60 on-path points, random profile, hazard writes running. p95 5.6 ms, p99 12.3 ms.",
              source: "docs/benchmarks/day8.md",
            },
            {
              value: "1.0 ms",
              label: "Cache hit p95 (vs 5.0 ms miss)",
              context:
                "200 req/s with a stable graph version: 40% hit rate. With hazards changing, hit rates drop by design.",
              source: "docs/benchmarks/day8.md",
            },
            {
              value: "6.3 ms",
              label: "Report → WebSocket, across instances, p50",
              context: "Two API instances, includes the database write; p95 8.4 ms.",
              source: "docs/benchmarks/day6-propagation.md",
            },
            {
              value: "21,173",
              label: "Edges in the campus graph",
              context: "15,468 nodes, 703 km of paths and streets, from OSM fetched 2026-10-24.",
              source: "README",
            },
          ],
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
            "No slope data: elevation is out of scope and incline is almost never tagged, so a steep path can be suggested to a wheelchair user.",
            "Indoor routes are mostly missing; only 8 elevators are mapped.",
            "Reports are unverified until other people confirm them.",
            "No real user traffic is claimed. The load numbers are local.",
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
            "Elevation data for slope-aware wheelchair costs.",
            "Automated Azure deploys through OIDC (the workflow supports it; permissions are pending).",
            "Indoor connectors for the buildings where the campus is most often walked through.",
          ],
        },
      ],
    },
  ],
};
