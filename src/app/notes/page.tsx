/**
 * /notes: engineering notes index.
 *
 * Hidden until a note is published: with nothing published, this route returns 404 and the
 * navigation and sitemap leave it out. No placeholder or AI-written articles are ever shown here.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { getNotes } from "@/lib/markdown";
import styles from "./notes.module.css";

export const metadata: Metadata = {
  title: "Notes",
  description: "Engineering notes.",
  alternates: { canonical: "/notes" },
};

export default function NotesPage() {
  const notes = getNotes();
  if (notes.length === 0) notFound();

  return (
    <>
      <PageHeader kicker="Notes" title="Engineering notes" />
      <div className="page">
        <ol className={styles.list}>
          {notes.map((n) => (
            <li key={n.slug}>
              <Link href={`/notes/${n.slug}`}>
                <span className={styles.date}>{n.date ?? ""}</span>
                <span className={styles.title}>{n.title}</span>
                {n.summary && <span className={styles.summary}>{n.summary}</span>}
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
