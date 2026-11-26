/**
 * Homepage.
 *
 * Reading order, designed for a 15-second scan:
 *   1. Hero: who I am, education, what I build, résumé/GitHub/LinkedIn, and the animated system map,
 *      which doubles as the index of selected work (projects visible without scrolling).
 *   2. TraceLayer: before/after charts and Fig. 1 (trace a real claim through the engine).
 *   3. Passable with its latency chart, then three smaller projects, each composed differently.
 *   4. Experience, tools by where they were used, and a small separate section for hobbies.
 * Sections below the hero fade in on scroll (data-reveal); contact lives in the footer.
 */
import Image from "next/image";
import Link from "next/link";
import { SystemMap } from "@/components/home/SystemMap";
import { ClaimTrace } from "@/components/projects/ClaimTrace";
import { BarChart } from "@/components/viz/BarChart";
import { capabilities } from "@/content/capabilities";
import { marketPulseScores, passableLatency, traceLayerCharts } from "@/content/charts";
import { roles } from "@/content/experience";
import { getProject } from "@/content/projects";
import { site } from "@/content/site";
import { DOMAIN_LABEL } from "@/content/types";
import { domainHue, projectHue } from "@/lib/hues";
import { firstStanza, getBeyondEntry, getPoems, poemNo } from "@/lib/markdown";
import styles from "./page.module.css";

export default function HomePage() {
  const tracelayer = getProject("tracelayer")!;
  const passable = getProject("passable")!;
  const marketpulse = getProject("marketpulse")!;
  const energy = getProject("energy-analytics")!;
  const fitLetter = getProject("fit-letter")!;
  const cricket = getBeyondEntry("cricket");
  const tennis = getBeyondEntry("tennis");
  const latestPoem = getPoems().at(-1);

  /** Small coloured domain tags for a project. */
  const tags = (domains: typeof tracelayer.domains) => (
    <ul className={styles.tags} aria-label="Domains">
      {domains.map((d) => (
        <li key={d} className="tag" style={{ "--tag": domainHue(d) } as React.CSSProperties}>
          {DOMAIN_LABEL[d]}
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* ---------------- 1. Hero ---------------- */}
      <div className={`grid-backdrop ${styles.heroWrap}`}>
        <section className={`page ${styles.intro}`} aria-labelledby="intro-name">
          <div className={styles.identity}>
            <p className={styles.edu}>
              <span className={styles.eduDot} aria-hidden="true" />
              <span>
                {site.program} · {site.school}
                <br />
                Expected {site.graduation}
              </span>
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
                <a
                  href={site.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.secondary}
                >
                  GitHub ↗
                </a>
              </li>
              <li>
                <a
                  href={site.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.secondary}
                >
                  LinkedIn ↗
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className={styles.secondary}>
                  Email
                </a>
              </li>
            </ul>

            {/* The personal side, visible in the first screen: the latest poem's opening lines. */}
            {latestPoem && (
              <Link href={`/beyond/poems/${latestPoem.slug}`} className={styles.heroPoem}>
                <span className={styles.heroPoemHead}>
                  <span className={styles.heroPoemTag}>{poemNo(latestPoem.number)}</span>
                  <span className={styles.heroPoemKicker}>I also write poetry</span>
                </span>
                <span className={styles.heroPoemTitle}>{latestPoem.title}</span>
                <span className={styles.heroPoemLines}>{firstStanza(latestPoem.body)}</span>
                <span className={styles.heroPoemRead}>
                  Read the poem <span aria-hidden="true">→</span>
                </span>
              </Link>
            )}
          </div>

          <div className={styles.mapCol}>
            <SystemMap />
            <p className={styles.mapLink}>
              <Link href="/work">All projects and case studies →</Link>
            </p>
          </div>
        </section>
      </div>

      {/* ---------------- 2. TraceLayer ---------------- */}
      <section
        className={`page ${styles.feature}`}
        aria-labelledby="tl-title"
        style={{ "--hue": projectHue("tracelayer") } as React.CSSProperties}
      >
        <header className={styles.featureHead} data-reveal>
          <p className={styles.featureNo}>{tracelayer.index}</p>
          <div className={styles.featureMain}>
            <h2 id="tl-title" className={styles.featureTitle}>
              {tracelayer.title}
            </h2>
            {tags(tracelayer.domains)}
          </div>
          <div className={styles.featureSide}>
            <p className={styles.featureText}>{tracelayer.summary}</p>
            <p className={styles.featureLinks}>
              <Link href="/work/tracelayer">Read the case study →</Link>
              <a href={tracelayer.links[0]!.href} target="_blank" rel="noopener noreferrer">
                Source ↗
              </a>
            </p>
          </div>
        </header>

        <div className={styles.chartRow}>
          {traceLayerCharts.map((c, i) => (
            <div
              key={c.title}
              data-reveal
              style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
            >
              <BarChart chart={c} hue={projectHue("tracelayer")} compact />
            </div>
          ))}
        </div>

        <div data-reveal className={styles.figWrap}>
          <ClaimTrace compact />
        </div>
      </section>

      {/* ---------------- 3a. Passable ---------------- */}
      <section
        className={`page ${styles.spread}`}
        aria-labelledby="pa-title"
        style={{ "--hue": projectHue("passable") } as React.CSSProperties}
      >
        <div className={styles.spreadImage} data-reveal>
          <Image
            src={passable.cover!.src}
            alt={passable.cover!.alt}
            width={passable.cover!.width}
            height={passable.cover!.height}
            sizes="(max-width: 56rem) 100vw, 60vw"
          />
          <span className={styles.liveBadge}>
            <span aria-hidden="true" /> Live app · Vercel + Azure
          </span>
        </div>
        <div className={styles.spreadText} data-reveal>
          <p className={styles.featureNo}>{passable.index}</p>
          <h2 id="pa-title" className={styles.featureTitle}>
            {passable.title}
          </h2>
          {tags(passable.domains)}
          <p className={styles.featureText}>{passable.summary}</p>
          <BarChart chart={passableLatency} hue={projectHue("passable")} compact />
          <p className={styles.featureLinks}>
            <Link href="/work/passable">Read the case study →</Link>
            <a href={passable.links[0]!.href} target="_blank" rel="noopener noreferrer">
              Live app ↗
            </a>
          </p>
        </div>
      </section>

      {/* ---------------- 3b. Three smaller projects, three compositions ---------------- */}
      <section className={`page ${styles.trio}`} aria-label="More projects">
        {/* MarketPulse: the two numbers that matter */}
        <article
          className={`${styles.card} ${styles.trioMp}`}
          style={{ "--hue": projectHue("marketpulse") } as React.CSSProperties}
          data-reveal
        >
          <p className={styles.featureNo}>{marketpulse.index}</p>
          <h2 className={styles.trioTitle}>
            <Link href="/work/marketpulse">{marketpulse.title}</Link>
          </h2>
          {tags(marketpulse.domains)}
          <p className={styles.cardText}>{marketpulse.summary}</p>
          <BarChart chart={marketPulseScores} hue={projectHue("marketpulse")} compact />
          <p className={styles.trioNote}>
            7 of 9 unseen events flagged at or before the price peak.
          </p>
        </article>

        {/* Energy: the pipeline itself is the picture */}
        <article
          className={`${styles.card} ${styles.trioEn}`}
          style={
            {
              "--hue": projectHue("energy-analytics"),
              "--reveal-delay": "90ms",
            } as React.CSSProperties
          }
          data-reveal
        >
          <p className={styles.featureNo}>{energy.index}</p>
          <h2 className={styles.trioTitle}>
            <Link href="/work/energy-analytics">{energy.title}</Link>
          </h2>
          {tags(energy.domains)}
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
        <article
          className={`${styles.card} ${styles.trioFl}`}
          style={
            { "--hue": projectHue("fit-letter"), "--reveal-delay": "180ms" } as React.CSSProperties
          }
          data-reveal
        >
          <p className={styles.featureNo}>{fitLetter.index}</p>
          <h2 className={styles.trioTitle}>
            <Link href="/work/fit-letter">{fitLetter.title}</Link>
          </h2>
          {tags(fitLetter.domains)}
          <p className={styles.cardText}>{fitLetter.summary}</p>
          <ol className={styles.flowLine} aria-label="How a request flows">
            <li>Job page</li>
            <li>Extension</li>
            <li>Express</li>
            <li>Claude API</li>
            <li>Schema check</li>
          </ol>
        </article>
      </section>

      {/* ---------------- 4. Experience ---------------- */}
      <section className={`page ${styles.block}`} aria-labelledby="exp-title" data-reveal>
        <h2 id="exp-title" className={styles.blockTitle}>
          <span>Experience</span>
          <Link href="/experience">Full experience →</Link>
        </h2>
        <p className={styles.blockIntro}>
          Five co-op terms across four placements in IT and security: investigating incidents,
          managing endpoints and identity, scripting reports, and one internal React tool.
        </p>
        <ol className={styles.timeline}>
          {roles.map((r, i) => (
            <li key={r.org} className={styles.tlItem} data-current={i === 0 || undefined}>
              <span className={styles.tlDot} aria-hidden="true" />
              <p className={styles.expDates}>{r.dates}</p>
              <h3 className={styles.expRole}>
                {r.title}
                <span>{r.org}</span>
              </h3>
              <p className={styles.expSummary}>{r.summary}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------------- 5. Capabilities ---------------- */}
      <section className={`page ${styles.block}`} aria-labelledby="cap-title" data-reveal>
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
                  {c.items.map((item) =>
                    item.evidence ? (
                      <Link
                        key={item.name}
                        href={item.evidence.href}
                        title={`Used in ${item.evidence.label}`}
                        className={styles.chip}
                      >
                        {item.name}
                        {/* gives screen readers (and short names like "Go") a descriptive link */}
                        <span className="visually-hidden">, used in {item.evidence.label}</span>
                      </Link>
                    ) : (
                      <span key={item.name} className={styles.chip}>
                        {item.name}
                      </span>
                    ),
                  )}
                </dd>
              </div>
            ))}
        </dl>
      </section>

      {/* ---------------- 6. Beyond: hobbies, kept small and separate from the engineering ---------------- */}
      <section className={`page ${styles.beyond}`} aria-labelledby="beyond-title" data-reveal>
        <div className={styles.beyondHead}>
          <h2 id="beyond-title" className={styles.beyondTitle}>
            Beyond engineering
          </h2>
          <Link href="/beyond">The personal page →</Link>
        </div>
        <div className={styles.beyondGrid}>
          {/* The poem is the highlight of this section, so it gets the large card. */}
          {latestPoem && (
            <Link href={`/beyond/poems/${latestPoem.slug}`} className={styles.poemHighlight}>
              <span className={styles.poemKicker}>Writing · {poemNo(latestPoem.number)}</span>
              <span className={styles.poemName}>{latestPoem.title}</span>
              {/* The opening stanza, line breaks as written. */}
              <span className={styles.poemLine}>{firstStanza(latestPoem.body)}</span>
              <span className={styles.poemRead}>
                Read the poem <span aria-hidden="true">→</span>
              </span>
            </Link>
          )}
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
          </ul>
        </div>
      </section>
    </>
  );
}
