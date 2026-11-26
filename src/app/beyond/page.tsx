/**
 * /beyond: the personal page.
 *
 * Two parts, kept light so there is never too much on screen:
 *   1. Sports: cricket and tennis side by side, each with a small animated plan-view drawing.
 *   2. Writing: a numbered list of poems ("Poem 01", "Poem 02", ...). Each entry shows the title
 *      and a short excerpt; the full poem opens on its own quiet reading page.
 * All text comes from content/beyond/*.md and poems from content/poetry/*.md.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { CricketPitch, TennisCourt } from "@/components/beyond/Drawings";
import { PageHeader } from "@/components/ui/PageHeader";
import { getBeyondEntry, getPoems, poemNo } from "@/lib/markdown";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Beyond engineering",
  description: "Cricket, tennis and poetry.",
  alternates: { canonical: "/beyond" },
};

/**
 * A short excerpt for the list: the start of the first stanza, cut at a word boundary.
 * Display only; the poem itself is always shown in full and unchanged on its own page.
 */
function excerpt(body: string, max = 150): string {
  const first = (body.split(/\r?\n[ \t]*\r?\n/)[0] ?? body).replace(/\s+/g, " ").trim();
  if (first.length <= max) return first;
  return `${first.slice(0, first.lastIndexOf(" ", max))}…`;
}

export default function BeyondPage() {
  const intro = getBeyondEntry("intro");
  const cricket = getBeyondEntry("cricket");
  const tennis = getBeyondEntry("tennis");
  const writing = getBeyondEntry("writing");
  const poems = getPoems();

  return (
    <>
      <PageHeader kicker="Beyond engineering" title="Away from the keyboard">
        {intro && <div dangerouslySetInnerHTML={{ __html: intro.html }} />}
      </PageHeader>

      <div className="page">
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

        {/* ---------- Writing ---------- */}
        {writing && (
          <section className={styles.writing} aria-labelledby="writing-h" data-reveal>
            <header className={styles.writingHead}>
              <h2 id="writing-h" className={styles.writingTitle}>
                {writing.title}
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

            {poems.length > 0 && (
              <ol className={styles.poems}>
                {poems.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/beyond/poems/${p.slug}`} className={styles.poemCard}>
                      <span className={styles.poemNo}>{poemNo(p.number)}</span>
                      <span className={styles.poemTitle}>
                        {p.title}
                        {!p.published && <span className={styles.draft}>Draft</span>}
                      </span>
                      <span className={styles.poemExcerpt}>{excerpt(p.body)}</span>
                      <span className={styles.read}>
                        Read the poem <span aria-hidden="true">→</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}
      </div>
    </>
  );
}
