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
import { getPoem, getPoems } from "@/lib/markdown";
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

  return (
    <article className={styles.sheet}>
      <div className={styles.inner}>
        <p className={styles.back}>
          <Link href="/beyond">Beyond engineering</Link>
        </p>
        <h1 className={styles.title}>
          {poem.title}
          {!poem.published && <span className={styles.draft}>Draft</span>}
        </h1>
        <p className={styles.byline}>
          {site.name}
          {poem.date && <> · {poem.date}</>}
        </p>
        <div className={styles.poem}>{poem.body}</div>
        {poem.note && (
          <aside className={styles.note}>
            <p className={styles.noteLabel}>Note</p>
            <p>{poem.note}</p>
          </aside>
        )}
      </div>
    </article>
  );
}
