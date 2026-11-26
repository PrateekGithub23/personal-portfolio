/**
 * Homepage.
 *
 * Reading order, designed for a 15-second scan:
 *   1. First viewport: who I am, education, what I build, résumé/GitHub/LinkedIn, and the index of
 *      selected work (so projects are visible without scrolling on a typical laptop).
 *   2. Fig. 1: trace a real claim through TraceLayer (the signature interaction).
 *   3. Passable as a spread, then three smaller projects, each composed differently.
 *   4. Experience, capabilities, a one-line pointer to the personal page.
 * Contact lives in the footer on every page.
 */
import Image from "next/image";
import Link from "next/link";
import { MetricTable } from "@/components/projects/Blocks";
import { ClaimTrace } from "@/components/projects/ClaimTrace";
import { capabilities } from "@/content/capabilities";
import { roles } from "@/content/experience";
import { getProject, projects } from "@/content/projects";
import { site } from "@/content/site";
import { getBeyondEntry } from "@/lib/markdown";
import styles from "./page.module.css";

export default function HomePage() {
  const tracelayer = getProject("tracelayer")!;
  const passable = getProject("passable")!;
  const marketpulse = getProject("marketpulse")!;
  const energy = getProject("energy-analytics")!;
  const fitLetter = getProject("fit-letter")!;
  const cricket = getBeyondEntry("cricket");
  const tennis = getBeyondEntry("tennis");

  return (
    <>
      {/* ---------------- 1. Introduction + work index ---------------- */}
      <section className={`page ${styles.intro}`} aria-labelledby="intro-name">
        <div className={styles.identity}>
          <p className={styles.edu}>
            {site.program} · {site.school}
            <br />
            Expected {site.graduation}
          </p>
          <h1 id="intro-name" className={styles.name}>
            {site.name}
          </h1>
          <p className={styles.lede}>{site.lede}</p>
          <p className={styles.now}>{site.now}</p>
          <ul className={styles.actions}>
            <li>
              <a href={site.resume} className={styles.primary}>
                Résumé <span className={styles.small}>PDF</span>
              </a>
            </li>
            <li>
              <a href={site.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
            <li>
              <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`}>Email</a>
            </li>
          </ul>
        </div>

        <nav className={styles.index} aria-labelledby="index-title">
          <h2 id="index-title" className={styles.indexTitle}>
            <span>Selected work</span>
            <Link href="/work">All projects</Link>
          </h2>
          <ol>
            {projects.map((p) => {
              const m = p.headline[0];
              return (
                <li key={p.slug}>
                  <Link href={`/work/${p.slug}`} className={styles.indexRow}>
                    <span className={styles.indexNo}>{p.index}</span>
                    <span className={styles.indexTitleText}>{p.title}</span>
                    <span className={styles.indexShort}>{p.short}</span>
                    {m && (
                      <span className={styles.indexMetric}>
                        {m.value} <span>{m.label}</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </section>

      {/* ---------------- 2. TraceLayer + Fig. 1 ---------------- */}
      <section className={`page ${styles.feature}`} aria-labelledby="tl-title">
        <header className={styles.featureHead}>
          <p className={styles.featureNo}>{tracelayer.index}</p>
          <h2 id="tl-title" className={styles.featureTitle}>
            {tracelayer.title}
          </h2>
          <p className={styles.featureText}>{tracelayer.summary}</p>
          <p className={styles.featureLinks}>
            <Link href="/work/tracelayer">Read the case study</Link>
            <a href={tracelayer.links[0]!.href} target="_blank" rel="noopener noreferrer">
              Source ↗
            </a>
          </p>
        </header>
        <ClaimTrace compact />
      </section>

      {/* ---------------- 3a. Passable spread ---------------- */}
      <section className={`page ${styles.spread}`} aria-labelledby="pa-title">
        <div className={styles.spreadImage}>
          <Image
            src={passable.cover!.src}
            alt={passable.cover!.alt}
            width={passable.cover!.width}
            height={passable.cover!.height}
            sizes="(max-width: 56rem) 100vw, 60vw"
          />
        </div>
        <div className={styles.spreadText}>
          <p className={styles.featureNo}>{passable.index}</p>
          <h2 id="pa-title" className={styles.featureTitle}>
            {passable.title}
          </h2>
          <p className={styles.featureText}>{passable.summary}</p>
          <MetricTable metrics={passable.headline.slice(0, 2)} />
          <p className={styles.featureLinks}>
            <Link href="/work/passable">Read the case study</Link>
            <a href={passable.links[0]!.href} target="_blank" rel="noopener noreferrer">
              Live app ↗
            </a>
          </p>
        </div>
      </section>

      {/* ---------------- 3b. Three smaller projects, three compositions ---------------- */}
      <section className={`page ${styles.trio}`} aria-label="More projects">
        {/* MarketPulse: the two numbers that matter, with their denominators */}
        <article className={styles.trioMp}>
          <p className={styles.featureNo}>{marketpulse.index}</p>
          <h2 className={styles.trioTitle}>
            <Link href="/work/marketpulse">{marketpulse.title}</Link>
          </h2>
          <p>{marketpulse.summary}</p>
          <dl className={styles.mpNumbers}>
            <div>
              <dt>Recall</dt>
              <dd>
                69.7% <span>23 of 33 pump minutes</span>
              </dd>
            </div>
            <div>
              <dt>Precision</dt>
              <dd>
                48.9% <span>23 of 47 alerts</span>
              </dd>
            </div>
          </dl>
          <p className={styles.trioNote}>9 events held out by group; never seen in training.</p>
        </article>

        {/* Energy: the pipeline itself is the picture */}
        <article className={styles.trioEn}>
          <p className={styles.featureNo}>{energy.index}</p>
          <h2 className={styles.trioTitle}>
            <Link href="/work/energy-analytics">{energy.title}</Link>
          </h2>
          <ol className={styles.chain} aria-label="Pipeline stages">
            <li>Simulated sensors</li>
            <li>Kafka topic</li>
            <li>Raw zone, date= partitions</li>
            <li>Spark batch job</li>
            <li>Parquet, date/hour partitions</li>
            <li>Streamlit dashboard</li>
          </ol>
        </article>

        {/* Fit Letter: text only, because there is nothing measured to show yet */}
        <article className={styles.trioFl}>
          <p className={styles.featureNo}>{fitLetter.index}</p>
          <h2 className={styles.trioTitle}>
            <Link href="/work/fit-letter">{fitLetter.title}</Link>
          </h2>
          <p>{fitLetter.summary}</p>
        </article>
      </section>

      {/* ---------------- 4. Experience ---------------- */}
      <section className={`page ${styles.block}`} aria-labelledby="exp-title">
        <h2 id="exp-title" className={styles.blockTitle}>
          <span>Experience</span>
          <Link href="/experience">Full experience</Link>
        </h2>
        <p className={styles.blockIntro}>
          Five co-op terms across four placements in IT and security: investigating incidents,
          managing endpoints and identity, scripting reports, and one internal React tool.
        </p>
        <table className={styles.expTable}>
          <thead className="visually-hidden">
            <tr>
              <th scope="col">Dates</th>
              <th scope="col">Role and organisation</th>
              <th scope="col">Focus</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.org}>
                <td className={styles.expDates}>{r.dates}</td>
                <th scope="row" className={styles.expRole}>
                  {r.title}
                  <span>{r.org}</span>
                </th>
                <td className={styles.expSummary}>{r.summary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* ---------------- 5. Capabilities ---------------- */}
      <section className={`page ${styles.block}`} aria-labelledby="cap-title">
        <h2 id="cap-title" className={styles.blockTitle}>
          <span>Tools, by where I used them</span>
        </h2>
        <dl className={styles.caps}>
          {capabilities
            .filter((c) => c.items.length > 1)
            .map((c) => (
              <div key={c.domain}>
                <dt>{c.domain}</dt>
                <dd>
                  {c.items.map((item, i) => (
                    <span key={item.name}>
                      {item.evidence ? (
                        <Link href={item.evidence.href} title={`Used in ${item.evidence.label}`}>
                          {item.name}
                          {/* gives screen readers (and short names like "Go") a descriptive link */}
                          <span className="visually-hidden">, used in {item.evidence.label}</span>
                        </Link>
                      ) : (
                        item.name
                      )}
                      {i < c.items.length - 1 && ", "}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
        </dl>
      </section>

      {/* ---------------- 6. Beyond: hobbies, kept small and separate from the engineering ---------------- */}
      <section className={`page ${styles.beyond}`} aria-labelledby="beyond-title">
        <div className={styles.beyondHead}>
          <h2 id="beyond-title" className={styles.beyondTitle}>
            Beyond engineering
          </h2>
          <Link href="/beyond">The personal page</Link>
        </div>
        <ul className={styles.beyondList}>
          {[cricket, tennis].map(
            (entry) =>
              entry && (
                <li key={entry.slug}>
                  <span className={styles.beyondName}>{entry.title}</span>
                  <span dangerouslySetInnerHTML={{ __html: entry.html }} />
                </li>
              ),
          )}
          <li>
            <span className={styles.beyondName}>Writing</span>
            <span>I also write poetry.</span>
          </li>
        </ul>
      </section>
    </>
  );
}
