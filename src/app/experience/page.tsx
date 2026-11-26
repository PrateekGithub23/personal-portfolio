/**
 * /experience: co-op roles in full, then capabilities grouped by domain with links to evidence.
 * Each role has an anchor (#td-bank, ...) so other pages can link straight to it.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { capabilities } from "@/content/capabilities";
import { roles } from "@/content/experience";
import { site } from "@/content/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Co-op experience in IT and security, and technical capabilities linked to the projects that use them.",
  alternates: { canonical: "/experience" },
};

/** "Blake, Cassels & Graydon LLP" -> "blake-cassels-graydon-llp" */
const anchor = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export default function ExperiencePage() {
  return (
    <>
      <PageHeader kicker="Experience" title="Co-op work">
        <p>
          Five terms in IT and security roles. These are not software engineering roles, and I do
          not describe them as such. They are where I worked with production systems: incident
          investigation, endpoint and identity management, and scripting around security tooling.
        </p>
        <p>
          <a href={site.resume}>Résumé, PDF</a>
        </p>
      </PageHeader>

      <div className="page">
        {roles.map((r) => (
          <section
            key={r.org}
            id={anchor(r.org)}
            className={styles.role}
            aria-labelledby={`${anchor(r.org)}-h`}
          >
            <div className={styles.when}>
              <p className={styles.dates}>{r.dates}</p>
              <p className={styles.where}>
                {r.location} · {r.kind}
              </p>
            </div>
            <div className={styles.what}>
              <h2 id={`${anchor(r.org)}-h`} className={styles.title}>
                {r.title}
              </h2>
              <p className={styles.org}>{r.org}</p>
              <ul className={styles.points}>
                {r.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </div>
            <div className={styles.tools}>
              <p className={styles.toolsLabel}>Tools</p>
              <p>{r.tools.join(", ")}</p>
            </div>
          </section>
        ))}

        <section className={styles.caps} aria-labelledby="caps-h">
          <h2 id="caps-h" className={styles.capsTitle}>
            Capabilities
          </h2>
          <p className={styles.capsIntro}>
            Grouped by domain. Each item links to the project or role where I used it.
          </p>
          <dl className={styles.capsGrid}>
            {capabilities.map((c) => (
              <div key={c.domain}>
                <dt>{c.domain}</dt>
                {c.items.map((item) => (
                  <dd key={item.name}>
                    <span>{item.name}</span>
                    {item.evidence && <Link href={item.evidence.href}>{item.evidence.label}</Link>}
                  </dd>
                ))}
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  );
}
