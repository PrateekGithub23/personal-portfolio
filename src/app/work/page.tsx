/**
 * /work: the full project index.
 *
 * A table, not a card grid: one row per project with what it is, the domains it covers, and its
 * strongest measured result in context. Projects without measurements say so instead of padding.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { projects } from "@/content/projects";
import { DOMAIN_LABEL } from "@/content/types";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Projects in backend systems, data engineering, applied ML and security, each with a case study.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  return (
    <>
      <PageHeader kicker="Work" title="Projects and case studies">
        <p>
          Five projects, ordered by how much engineering they hold. Each case study covers the
          problem, architecture, decisions, testing, results and limitations.
        </p>
      </PageHeader>

      <div className="page">
        <ol className={styles.list}>
          {projects.map((p) => {
            const m = p.headline[0];
            return (
              <li key={p.slug} className={styles.row}>
                <span className={styles.no}>{p.index}</span>
                <div className={styles.main}>
                  <h2 className={styles.title}>
                    <Link href={`/work/${p.slug}`}>{p.title}</Link>
                  </h2>
                  <p className={styles.kind}>{p.kind}</p>
                  <p className={styles.summary}>{p.summary}</p>
                </div>
                <dl className={styles.side}>
                  <div>
                    <dt>Domains</dt>
                    <dd>{p.domains.map((d) => DOMAIN_LABEL[d]).join(", ")}</dd>
                  </div>
                  <div>
                    <dt>Stack</dt>
                    <dd>{p.stack.join(", ")}</dd>
                  </div>
                  <div>
                    <dt>Evidence</dt>
                    <dd>
                      {m ? (
                        <>
                          <strong>{m.value}</strong> {m.label}
                          <span className={styles.context}>{m.context}</span>
                        </>
                      ) : (
                        <span className={styles.context}>
                          No measurements yet. See limitations.
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
