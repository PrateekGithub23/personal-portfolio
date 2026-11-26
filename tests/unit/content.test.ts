/**
 * Content integrity. These tests stop the most likely mistakes when editing content by hand:
 * a metric without its context, a broken internal link, a diagram edge pointing at a node that
 * does not exist, or summary numbers that disagree with the recorded cases.
 */
import { describe, expect, it } from "vitest";
import { capabilities } from "@/content/capabilities";
import { heldoutSummary, traceCases, stages } from "@/content/claim-trace";
import { roles } from "@/content/experience";
import { projects } from "@/content/projects";
import type { ArchDiagram } from "@/content/types";

const anchor = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

describe("projects", () => {
  it("have unique slugs and indexes", () => {
    expect(new Set(projects.map((p) => p.slug)).size).toBe(projects.length);
    expect(new Set(projects.map((p) => p.index)).size).toBe(projects.length);
  });

  it("every metric carries its context", () => {
    for (const p of projects) {
      const metrics = [
        ...p.headline,
        ...p.sections.flatMap((s) =>
          s.blocks.flatMap((b) => (b.type === "metrics" ? b.metrics : [])),
        ),
      ];
      for (const m of metrics) {
        expect(m.context.trim().length, `${p.slug}: ${m.label}`).toBeGreaterThan(10);
      }
    }
  });

  it("every case study states its limitations", () => {
    for (const p of projects) {
      expect(
        p.sections.some((s) => s.id === "limitations"),
        p.slug,
      ).toBe(true);
    }
  });

  it("images have alt text and real files", async () => {
    const fs = await import("node:fs");
    for (const p of projects) {
      const images = [
        ...(p.cover ? [p.cover] : []),
        ...p.sections.flatMap((s) =>
          s.blocks.flatMap((b) => (b.type === "image" ? [b.image] : [])),
        ),
      ];
      for (const img of images) {
        expect(img.alt.length, img.src).toBeGreaterThan(20);
        expect(fs.existsSync(`public${img.src}`), img.src).toBe(true);
      }
    }
  });

  it("architecture diagrams are internally consistent", () => {
    const diagrams = projects.flatMap((p) =>
      p.sections.flatMap((s) =>
        s.blocks.flatMap((b) => (b.type === "architecture" ? [b.diagram] : [])),
      ),
    ) as ArchDiagram[];
    expect(diagrams.length).toBe(projects.length);
    for (const d of diagrams) {
      const ids = new Set(d.nodes.map((n) => n.id));
      expect(ids.has(d.initial), d.id).toBe(true);
      for (const e of d.edges) {
        expect(ids.has(e.from) && ids.has(e.to), `${d.id}: ${e.from}->${e.to}`).toBe(true);
      }
      for (const n of d.nodes) {
        expect(
          n.x >= 0 && n.y >= 0 && n.x + n.w <= d.width && n.y + n.h <= d.height,
          `${d.id}/${n.id}`,
        ).toBe(true);
      }
    }
  });
});

describe("capabilities", () => {
  it("link only to pages and anchors that exist", () => {
    const slugs = new Set(projects.map((p) => p.slug));
    const roleAnchors = new Set(roles.map((r) => anchor(r.org)));
    for (const c of capabilities) {
      for (const item of c.items) {
        if (!item.evidence) continue;
        const [path, hash] = item.evidence.href.split("#");
        if (path!.startsWith("/work/")) expect(slugs.has(path!.slice(6)), item.name).toBe(true);
        else if (path === "/experience") expect(roleAnchors.has(hash!), item.name).toBe(true);
        else throw new Error(`Unexpected evidence link ${item.evidence.href}`);
      }
    }
  });
});

describe("claim trace (Fig. 1)", () => {
  it("summary agrees with itself", () => {
    expect((heldoutSummary.correct / heldoutSummary.cases) * 100).toBeCloseTo(95.2, 1);
  });

  it("every case points at a real stage and includes at least one miss", () => {
    const stageIds = new Set(stages.map((s) => s.id));
    for (const c of traceCases) expect(stageIds.has(c.stage), c.id).toBe(true);
    expect(traceCases.some((c) => c.expected !== c.actual)).toBe(true);
  });

  it("keeps the homoglyph case's Cyrillic character", () => {
    const h = traceCases.find((c) => c.id === "h3-38")!;
    expect(h.text).toContain("е");
  });
});
