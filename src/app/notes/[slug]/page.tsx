/**
 * /notes/[slug]: one engineering note, rendered from content/notes/<slug>.md.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getNote, getNotes } from "@/lib/markdown";
import styles from "../notes.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  const notes = getNotes();
  return notes.length > 0 ? notes.map((n) => ({ slug: n.slug })) : [{ slug: "_none" }];
}

export async function generateMetadata({ params }: PageProps<"/notes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) return { robots: { index: false } };
  return {
    title: note.title,
    description: note.summary,
    alternates: { canonical: `/notes/${note.slug}` },
  };
}

export default async function NotePage({ params }: PageProps<"/notes/[slug]">) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  return (
    <article className={`page ${styles.article}`}>
      <p className={styles.back}>
        <Link href="/notes">Notes</Link>
        {note.date && <> · {note.date}</>}
      </p>
      <h1 className={styles.heading}>{note.title}</h1>
      {/* Notes are Markdown written by the site owner and committed to the repository. */}
      <div className={`prose ${styles.body}`} dangerouslySetInnerHTML={{ __html: note.html }} />
    </article>
  );
}
