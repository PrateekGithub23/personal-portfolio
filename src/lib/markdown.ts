/**
 * Loaders for the Markdown content in /content (hobbies, poems, notes).
 *
 * These run only at build time (inside Server Components / generateStaticParams), so reading the
 * filesystem is fine and nothing ships to the browser. Each loader:
 *   1. reads every .md file in its folder except README.md,
 *   2. parses front matter with gray-matter,
 *   3. filters out unpublished entries in production builds.
 *
 * Poems are special: their body is returned untouched so the page can render it character for
 * character. They are never passed through a Markdown renderer, which would merge lines and
 * collapse spaces.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

const CONTENT_ROOT = path.join(process.cwd(), "content");

/** Drafts are visible while developing locally and hidden in production builds. */
const SHOW_DRAFTS = process.env.NODE_ENV === "development";

interface RawEntry {
  slug: string;
  data: Record<string, unknown>;
  body: string;
}

/** Read all Markdown entries in content/<folder>, skipping READMEs. Missing folder = no entries. */
function readFolder(folder: string): RawEntry[] {
  const dir = path.join(CONTENT_ROOT, folder);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md")
    .sort()
    .map((file) => {
      const source = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(source);
      return { slug: file.replace(/\.md$/, ""), data, body: content };
    });
}

/** Front matter values arrive untyped; these helpers coerce them safely. */
const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim() : v instanceof Date ? isoDate(v) : undefined;
const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Render trusted, repository-owned Markdown to HTML. */
export function renderMarkdown(body: string): string {
  return marked.parse(body, { async: false, gfm: true });
}

/* ---------------- Beyond engineering ---------------- */

export interface BeyondEntry {
  slug: string;
  title: string;
  order: number;
  html: string;
}

export function getBeyondEntries(): BeyondEntry[] {
  return readFolder("beyond")
    .map(({ slug, data, body }) => ({
      slug,
      title: str(data.title) ?? slug,
      order: typeof data.order === "number" ? data.order : 0,
      html: renderMarkdown(body),
    }))
    .sort((a, b) => a.order - b.order);
}

export function getBeyondEntry(slug: string): BeyondEntry | undefined {
  return getBeyondEntries().find((e) => e.slug === slug);
}

/* ---------------- Poetry ---------------- */

export interface Poem {
  slug: string;
  /** 1-based position in the collection, shown as "Poem 01". */
  number: number;
  title: string;
  /** Exactly as written in the file, minus the front matter, a leading title heading and surrounding blank lines. */
  body: string;
  date?: string;
  note?: string;
  published: boolean;
}

/**
 * Strip only the blank lines gray-matter leaves before and after the poem. Interior whitespace,
 * including leading spaces on the first line, is preserved.
 */
export function trimPoemBody(body: string): string {
  return body.replace(/^(?:[ \t]*\r?\n)+/, "").replace(/(?:\r?\n[ \t]*)+$/, "");
}

/**
 * Some editors save line breaks as Unicode LINE SEPARATOR (U+2028) or PARAGRAPH SEPARATOR (U+2029)
 * instead of "\n". Browsers do not break lines on them, so a poem would collapse into one line per
 * stanza. They are line breaks in the author's file, so display them as such. The file is untouched.
 */
export function showLineSeparators(body: string): string {
  return body.replace(/\u2029/g, "\n\n").replace(/\u2028/g, "\n");
}

/**
 * If a poem file starts with a Markdown heading ("## Title"), that line is the title, not part of
 * the poem: return it separately so the page never shows "##". The poem's own lines are untouched.
 */
export function splitTitleHeading(body: string): { heading?: string; body: string } {
  const match = body.match(/^#{1,6}[ \t]+(.+?)[ \t]*(?:\r?\n|$)/);
  if (!match) return { body };
  return { heading: match[1]!.trim(), body: trimPoemBody(body.slice(match[0].length)) };
}

export function getPoems(): Poem[] {
  const poems = readFolder("poetry")
    .map(({ slug, data, body }) => {
      const { heading, body: text } = splitTitleHeading(trimPoemBody(showLineSeparators(body)));
      return {
        slug,
        order: typeof data.order === "number" ? data.order : Number.MAX_SAFE_INTEGER,
        title: str(data.title) ?? heading ?? slug,
        body: text,
        date: str(data.date),
        note: str(data.note),
        published: data.published === true,
      };
    })
    .filter((p) => p.published || SHOW_DRAFTS)
    // Collection order: explicit `order`, then date, then filename.
    .sort(
      (a, b) =>
        a.order - b.order ||
        (a.date ?? "").localeCompare(b.date ?? "") ||
        a.slug.localeCompare(b.slug),
    );

  return poems.map((p, i) => ({
    slug: p.slug,
    number: i + 1,
    title: p.title,
    body: p.body,
    date: p.date,
    note: p.note,
    published: p.published,
  }));
}

/** Two-digit label used everywhere a poem is numbered, e.g. "Poem 01". */
export const poemNo = (n: number) => `Poem ${String(n).padStart(2, "0")}`;

/** The first stanza of a poem, exactly as written (used for previews). */
export function firstStanza(body: string): string {
  return body.split(/\r?\n[ \t]*\r?\n/)[0] ?? body;
}

/**
 * A one-line excerpt cut at a word boundary, for compact lists. Display only: the poem itself is
 * always shown in full and unchanged on its own page.
 */
export function poemExcerpt(body: string, max = 150): string {
  const first = firstStanza(body).replace(/\s+/g, " ").trim();
  if (first.length <= max) return first;
  return `${first.slice(0, first.lastIndexOf(" ", max))}…`;
}

export function getPoem(slug: string): Poem | undefined {
  return getPoems().find((p) => p.slug === slug);
}

/* ---------------- Engineering notes ---------------- */

export interface Note {
  slug: string;
  title: string;
  summary?: string;
  date?: string;
  html: string;
  published: boolean;
}

export function getNotes(): Note[] {
  return readFolder("notes")
    .map(({ slug, data, body }) => ({
      slug,
      title: str(data.title) ?? slug,
      summary: str(data.summary),
      date: str(data.date),
      html: renderMarkdown(body),
      published: data.published === true,
    }))
    .filter((n) => n.published || SHOW_DRAFTS)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export function getNote(slug: string): Note | undefined {
  return getNotes().find((n) => n.slug === slug);
}

/** Navigation shows "Notes" only once something is published. */
export function hasPublishedNotes(): boolean {
  return getNotes().some((n) => n.published);
}
