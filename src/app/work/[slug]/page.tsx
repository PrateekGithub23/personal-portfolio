/**
 * /work/[slug]: one case study per project.
 *
 * Statically generated for every published project. The page has three layers, for two readers:
 *   1. Header + "At a glance" (problem / built / result): enough for a recruiter in 15 seconds.
 *   2. A hero that differs per project (`project.hero`), so case studies do not all look the same.
 *   3. The full article with a sticky contents rail, for engineers who want the detail.
 */
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Blocks, MetricTable, figureCounter } from "@/components/projects/Blocks";
import { getProject, projects } from "@/content/projects";
import { DOMAIN_LABEL, type Project } from "@/content/types";
import styles from "./page.module.css";

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title: `${project.title}: ${project.kind}`, description: project.summary },
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const nextFigure = figureCounter();
  const position = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(position + 1) % projects.length]!;

  return (
    <article className={styles.article} data-hero={project.hero}>
      {/* ---------- Header ---------- */}
      <header className={`page ${styles.header}`}>
        <p className={styles.kicker}>
          <Link href="/work">Work</Link>
          <span aria-hidden="true">/</span>
          <span>{project.index}</span>
        </p>
        <h1 className={styles.title}>{project.title}</h1>
        <p className={styles.dek}>{project.kind}</p>

        <dl className={styles.facts}>
          <div>
            <dt>Period</dt>
            <dd>{project.period}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{project.status}</dd>
          </div>
          <div>
            <dt>Domains</dt>
            <dd>{project.domains.map((d) => DOMAIN_LABEL[d]).join(", ")}</dd>
          </div>
          <div>
            <dt>Stack</dt>
            <dd>{project.stack.join(", ")}</dd>
          </div>
          <div>
            <dt>Links</dt>
            <dd className={styles.links}>
              {project.links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label} <span aria-hidden="true">↗</span>
                </a>
              ))}
              {project.sourceNote && (
                <span className={styles.sourceNote}>{project.sourceNote}</span>
              )}
            </dd>
          </div>
        </dl>
      </header>

      {/* ---------- Hero: composition depends on the project ---------- */}
      <Hero project={project} />

      {/* ---------- At a glance ---------- */}
      <section className={`page ${styles.glance}`} aria-labelledby="glance">
        <h2 id="glance" className="visually-hidden">
          At a glance
        </h2>
        <div>
          <p className={styles.glanceLabel}>Problem</p>
          <p>{project.glance.problem}</p>
        </div>
        <div>
          <p className={styles.glanceLabel}>What I built</p>
          <p>{project.glance.built}</p>
        </div>
        <div>
          <p className={styles.glanceLabel}>Result</p>
          <p>{project.glance.result}</p>
        </div>
      </section>

      {/* ---------- Article body ---------- */}
      <div className={`page ${styles.body}`}>
        <nav className={styles.toc} aria-label="Sections">
          <p className={styles.tocTitle}>Contents</p>
          <ol>
            {project.sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className={styles.sections}>
          {project.sections.map((s, i) => (
            <section key={s.id} id={s.id} className={styles.section} aria-labelledby={`${s.id}-h`}>
              <h2 id={`${s.id}-h`} className={styles.sectionTitle}>
                <span className={styles.sectionNo}>{String(i + 1).padStart(2, "0")}</span>
                {s.title}
              </h2>
              <div className={styles.flow}>
                <Blocks blocks={s.blocks} nextFigure={nextFigure} />
              </div>
            </section>
          ))}
        </div>
      </div>

      {/* ---------- Next ---------- */}
      <nav className={`page ${styles.next}`} aria-label="Next project">
        <Link href={`/work/${next.slug}`}>
          <span className={styles.nextLabel}>Next · {next.index}</span>
          <span className={styles.nextTitle}>{next.title}</span>
          <span className={styles.nextKind}>{next.kind}</span>
        </Link>
      </nav>
    </article>
  );
}

/**
 * Hero variants. Each project leads with the thing that best represents it:
 *   evidence   (TraceLayer)  results ledger + product screenshot side by side
 *   screenshot (Passable)    a full-width live screenshot with numbers overlapping its edge
 *   matrix     (MarketPulse) replay screenshot + the two numbers that matter
 *   flow / brief             no hero image; the article starts with the diagram
 */
function Hero({ project }: { project: Project }) {
  if (project.hero === "flow" || project.hero === "brief" || !project.cover) return null;

  const image = (
    <Image
      src={project.cover.src}
      alt={project.cover.alt}
      width={project.cover.width}
      height={project.cover.height}
      priority
      sizes="(max-width: 56rem) 100vw, 70vw"
    />
  );

  if (project.hero === "screenshot") {
    return (
      <div className={styles.heroScreenshot}>
        <div className={styles.heroImage}>{image}</div>
        <div className={`page ${styles.heroOverlap}`}>
          <MetricTable metrics={project.headline} />
        </div>
      </div>
    );
  }

  // "evidence" and "matrix": image and numbers in a two-column spread, mirrored for variety.
  return (
    <div
      className={`page ${styles.heroSplit}`}
      data-mirror={project.hero === "matrix" || undefined}
    >
      <div className={styles.heroImage}>{image}</div>
      <div className={styles.heroMetrics}>
        <MetricTable metrics={project.headline} />
      </div>
    </div>
  );
}
