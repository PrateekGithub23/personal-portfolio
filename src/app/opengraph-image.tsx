/**
 * Default Open Graph image (1200×630), rendered once at build time.
 * Typographic, in the site's palette: name, program, and the three strongest projects.
 * Uses the built-in font of next/og so the build needs no extra font files.
 */
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

export const alt = `${site.name}: ${site.program}, ${site.school}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#f3f3ef",
        color: "#101110",
        padding: "64px 72px",
      }}
    >
      <div style={{ display: "flex", fontSize: 26, color: "#5f6460", letterSpacing: 1 }}>
        {site.program.toUpperCase()} · {site.school.toUpperCase()} · {site.graduation.toUpperCase()}
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 104, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>
          {site.name}
        </div>
        <div style={{ marginTop: 28, fontSize: 34, maxWidth: 900, lineHeight: 1.3 }}>
          Backend, data and applied ML systems, with the measurements to back them.
        </div>
      </div>
      <div
        style={{ display: "flex", borderTop: "2px solid #101110", paddingTop: 22, fontSize: 26 }}
      >
        <span style={{ color: "#b5400f", marginRight: 16 }}>01</span>
        <span style={{ marginRight: 48 }}>TraceLayer</span>
        <span style={{ color: "#b5400f", marginRight: 16 }}>02</span>
        <span style={{ marginRight: 48 }}>Passable</span>
        <span style={{ color: "#b5400f", marginRight: 16 }}>03</span>
        <span>MarketPulse</span>
      </div>
    </div>,
    size,
  );
}
