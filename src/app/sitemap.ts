/**
 * sitemap.xml, generated at build time from the same content the pages use, so a new project,
 * poem or note is included automatically and unpublished ones never are.
 */
import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { getNotes, getPoems } from "@/lib/markdown";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const url = (path: string) => new URL(path, base).toString();

  const notes = getNotes().filter((n) => n.published);
  const poems = getPoems().filter((p) => p.published);

  return [
    { url: url("/"), priority: 1 },
    { url: url("/work"), priority: 0.9 },
    ...projects.map((p) => ({ url: url(`/work/${p.slug}`), priority: 0.8 })),
    { url: url("/experience"), priority: 0.7 },
    { url: url("/about"), priority: 0.6 },
    { url: url("/beyond"), priority: 0.4 },
    ...poems.map((p) => ({ url: url(`/beyond/poems/${p.slug}`), priority: 0.3 })),
    ...(notes.length > 0 ? [{ url: url("/notes"), priority: 0.6 }] : []),
    ...notes.map((n) => ({ url: url(`/notes/${n.slug}`), priority: 0.5 })),
  ];
}
