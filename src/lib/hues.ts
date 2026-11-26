/**
 * Colour assignments. Presentation, not content: each project and domain maps to a CSS custom
 * property defined in src/styles/tokens.css, so the palette is changed in one place.
 */
import type { Domain } from "@/content/types";

const PROJECT_HUE: Record<string, string> = {
  tracelayer: "var(--hue-tracelayer)",
  passable: "var(--hue-passable)",
  marketpulse: "var(--hue-marketpulse)",
  "energy-analytics": "var(--hue-energy)",
  "fit-letter": "var(--hue-fitletter)",
};

export function projectHue(slug: string): string {
  return PROJECT_HUE[slug] ?? "var(--accent)";
}

export function domainHue(domain: Domain): string {
  return `var(--hue-${domain})`;
}
