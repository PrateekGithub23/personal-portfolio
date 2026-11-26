/**
 * /beyond: the personal page.
 *
 * Writing comes first because it is the main thing here:
 *   1. Writing: the newest poem as a large featured card (its whole first stanza, exactly as written)
 *      and, once there are more, the rest as a numbered list (Poem 01, Poem 02, ...).
 *   2. Sports: cricket and tennis as two smaller cards with animated plan-view drawings.
 * All text comes from content/beyond/*.md and poems from content/poetry/*.md.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { CricketPitch, TennisCourt } from "@/components/beyond/Drawings";
import { PageHeader } from "@/components/ui/PageHeader";
import { firstStanza, getBeyondEntry, getPoems, poemExcerpt, poemNo } from "@/lib/markdown";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Beyond engineering",
  description: "Poetry, cricket and tennis.",
  alternates: { canonical: "/beyond" },
};

export default function BeyondPage() {
  const intro = getBeyondEntry("intro");
  const cricket = getBeyondEntry("cricket");
  const tennis = getBeyondEntry("tennis");
  const writing = getBeyondEntry("writing");
  const poems = getPoems();
  // Featured: the most recent poem (highest number). The rest are listed below it.
  const featured = poems.at(-1);
  const others = poems.slice(0, -1).reverse();

  return (
    <>
      <PageHeader kicker="Beyond engineering" title="Away from the keyboard">
        {intro && <div dangerouslySetInnerHTML={{ __html: intro.html }} />}
      </PageHeader>

      <div className="page">
        {/* ---------- Writing (first, and largest) ---------- */}
        {writing && (
          <section className={styles.writing} aria-labelledby="writing-h">
            <header className={styles.writingHead}>
              <p className={styles.kicker}>Writing</p>
              <h2 id="writing-h" className={styles.writingTitle}>
                Poems
              </h2>
              <div
                className={styles.writingIntro}
                dangerouslySetInnerHTML={{ __html: writing.html }}
              />
              {poems.length > 0 && (
                <p className={styles.count}>
                  {poems.length} {poems.length === 1 ? "poem" : "poems"}
                </p>
              )}
            </header>

            <div className={styles.poemsCol}>
              {featured && (
                <Link
                  href={`/beyond/poems/${featured.slug}`}
                  className={styles.featured}
                  data-reveal
                >
                  <span className={styles.poemNo}>
                    {poemNo(featured.number)}
                    {poems.length > 1 && " · latest"}
                  </span>
                  <span className={styles.featuredTitle}>
                    {featured.title}
                    {!featured.published && <span className={styles.draft}>Draft</span>}
                  </span>
                  {/* The opening stanza, character for character. */}
                  <span className={styles.stanza}>{firstStanza(featured.body)}</span>
                  <span className={styles.read}>
                    Read the full poem <span aria-hidden="true">→</span>
                  </span>
                </Link>
              )}

              {others.length > 0 && (
                <ol className={styles.poems} aria-label="More poems">
                  {others.map((p) => (
                    <li key={p.slug}>
                      <Link href={`/beyond/poems/${p.slug}`} className={styles.poemRow}>
                        <span className={styles.poemNo}>{poemNo(p.number)}</span>
                        <span className={styles.poemTitle}>
                          {p.title}
                          {!p.published && <span className={styles.draft}>Draft</span>}
                        </span>
                        <span className={styles.poemExcerpt}>{poemExcerpt(p.body, 110)}</span>
                      </Link>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </section>
        )}

        {/* ---------- Sports ---------- */}
        <section className={styles.sports} aria-label="Sports">
          {[
            { entry: cricket, Drawing: CricketPitch, hue: "var(--hue-passable)", ball: "#ff5a4c" },
            { entry: tennis, Drawing: TennisCourt, hue: "var(--hue-energy)", ball: "#d7f04a" },
          ].map(
            ({ entry, Drawing, hue, ball }, i) =>
              entry && (
                <article
                  key={entry.slug}
                  className={styles.sport}
                  style={
                    {
                      "--hue": hue,
                      "--ball": ball,
                      "--reveal-delay": `${i * 100}ms`,
                    } as React.CSSProperties
                  }
                  data-reveal
                >
                  <div className={styles.art}>
                    <Drawing />
                  </div>
                  <h2 className={styles.sportTitle}>{entry.title}</h2>
                  <div
                    className={styles.sportText}
                    dangerouslySetInnerHTML={{ __html: entry.html }}
                  />
                </article>
              ),
          )}
        </section>
      </div>
    </>
  );
}
