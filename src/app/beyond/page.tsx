/**
 * /beyond: the personal page.
 *
 * Asymmetric editorial layout: cricket and tennis take the narrow left column, each with a small
 * plan-view line drawing; writing takes the wide right column and gets a serif reading treatment.
 * All text comes from content/beyond/*.md and poems from content/poetry/*.md.
 * If no poem is published, the writing feature shows only its short description, no placeholders.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { CricketPitch, TennisCourt } from "@/components/beyond/Drawings";
import { PageHeader } from "@/components/ui/PageHeader";
import { getBeyondEntry, getPoems } from "@/lib/markdown";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Beyond engineering",
  description: "Cricket, tennis and poetry.",
  alternates: { canonical: "/beyond" },
};

/** First stanza of a poem, used as its preview. */
const firstStanza = (body: string) => body.split(/\r?\n[ \t]*\r?\n/)[0] ?? body;

export default function BeyondPage() {
  const intro = getBeyondEntry("intro");
  const cricket = getBeyondEntry("cricket");
  const tennis = getBeyondEntry("tennis");
  const writing = getBeyondEntry("writing");
  const poems = getPoems();
  const [lead, ...rest] = poems;

  return (
    <>
      <PageHeader kicker="Beyond engineering" title="Away from the keyboard">
        {intro && <div dangerouslySetInnerHTML={{ __html: intro.html }} />}
      </PageHeader>

      <div className={`page ${styles.grid}`}>
        <div className={styles.sports}>
          {cricket && (
            <section className={styles.sport} aria-labelledby="cricket-h">
              <CricketPitch className={styles.drawing} />
              <h2 id="cricket-h" className={styles.sportTitle}>
                {cricket.title}
              </h2>
              <div
                className={styles.sportText}
                dangerouslySetInnerHTML={{ __html: cricket.html }}
              />
            </section>
          )}
          {tennis && (
            <section className={styles.sport} aria-labelledby="tennis-h">
              <TennisCourt className={styles.drawing} />
              <h2 id="tennis-h" className={styles.sportTitle}>
                {tennis.title}
              </h2>
              <div className={styles.sportText} dangerouslySetInnerHTML={{ __html: tennis.html }} />
            </section>
          )}
        </div>

        {writing && (
          <section className={styles.writing} aria-labelledby="writing-h">
            <h2 id="writing-h" className={styles.writingTitle}>
              {writing.title}
            </h2>
            <div
              className={styles.writingIntro}
              dangerouslySetInnerHTML={{ __html: writing.html }}
            />

            {lead && (
              <article className={styles.preview}>
                <h3 className={styles.poemTitle}>
                  <Link href={`/beyond/poems/${lead.slug}`}>{lead.title}</Link>
                  {!lead.published && <span className={styles.draft}>Draft</span>}
                </h3>
                <p className={styles.poemPreview}>{firstStanza(lead.body)}</p>
                <Link href={`/beyond/poems/${lead.slug}`} className={styles.read}>
                  Read the poem
                </Link>
              </article>
            )}

            {rest.length > 0 && (
              <ul className={styles.poemList}>
                {rest.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/beyond/poems/${p.slug}`}>{p.title}</Link>
                    {p.date && <span>{p.date}</span>}
                    {!p.published && <span className={styles.draft}>Draft</span>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </>
  );
}
