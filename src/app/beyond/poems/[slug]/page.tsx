/**
 * /beyond/poems/[slug]: a quiet reading page for one poem.
 *
 * The poem body is rendered as text with `white-space: pre-wrap`, never through a Markdown parser,
 * so every line break, indent, blank line and punctuation mark appears exactly as written.
 * Only published poems are generated in production builds; drafts exist only in `npm run dev`.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { site } from "@/content/site";
import { getPoem, getPoems, poemNo, stanzas } from "@/lib/markdown";
import styles from "./page.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  const poems = getPoems();
  // With no poems, Next still needs one param to build the route; it renders the 404 page.
  return poems.length > 0 ? poems.map((p) => ({ slug: p.slug })) : [{ slug: "_none" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/beyond/poems/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const poem = getPoem(slug);
  if (!poem) return { robots: { index: false } };
  return {
    title: poem.title,
    description: `A poem by ${site.name}.`,
    alternates: { canonical: `/beyond/poems/${poem.slug}` },
  };
}

export default async function PoemPage({ params }: PageProps<"/beyond/poems/[slug]">) {
  const { slug } = await params;
  const poem = getPoem(slug);
  if (!poem) notFound();

  // Neighbours in the collection, for "previous / next poem" links.
  const all = getPoems();
  const prev = all[poem.number - 2];
  const next = all[poem.number];

  return (
    <article className={styles.sheet}>
      <div className={styles.inner}>
        <p className={styles.back}>
          <Link href="/beyond">Beyond engineering</Link>
          <span aria-hidden="true">/</span>
          <span className={styles.no}>
            {poemNo(poem.number)} of {all.length}
          </span>
        </p>
        <h1 className={styles.title}>
          {poem.title}
          {!poem.published && <span className={styles.draft}>Draft</span>}
        </h1>
        <p className={styles.byline}>
          {site.name}
          {poem.date && <> · {poem.date}</>}
        </p>
        {/*
          One block per stanza, one element per line: lines that are too long for a phone wrap
          with a hanging indent, and the gap between stanzas stays the same at every width.
          The words are exactly as written; only the line structure is used.
        */}
        <div className={styles.poem}>
          {stanzas(poem.body).map((lines, i) => (
            <p key={i} className={styles.stanza} data-stanza>
              {lines.map((line, j) => (
                <span key={j} className={styles.line}>
                  {line}
                </span>
              ))}
            </p>
          ))}
        </div>
        {poem.note && (
          <aside className={styles.note}>
            <p className={styles.noteLabel}>Note</p>
            <p>{poem.note}</p>
          </aside>
        )}

        {(prev || next) && (
          <nav className={styles.pager} aria-label="More poems">
            {prev ? (
              <Link href={`/beyond/poems/${prev.slug}`} rel="prev">
                <span>← {poemNo(prev.number)}</span>
                {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/beyond/poems/${next.slug}`} rel="next" className={styles.nextLink}>
                <span>{poemNo(next.number)} →</span>
                {next.title}
              </Link>
            )}
          </nav>
        )}
        <p className={styles.backBottom}>
          <Link href="/beyond">← All writing</Link>
        </p>
      </div>
    </article>
  );
}
