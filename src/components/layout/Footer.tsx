/**
 * Footer: the contact block, repeated on every page so a recruiter never has to hunt for it.
 * Doubles as the "Contact" section (id="contact") that the homepage links to.
 */
import { site } from "@/content/site";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer} id="contact">
      <div className={`page ${styles.grid}`}>
        <div className={styles.lead}>
          <h2 className={styles.title}>Contact</h2>
          <p className={styles.text}>
            Email is the best way to reach me about co-op roles, projects or anything on this site.
          </p>
        </div>

        <dl className={styles.list}>
          <div>
            <dt className="meta-caps">Email</dt>
            <dd>
              <a href={`mailto:${site.email}`}>{site.email}</a>
            </dd>
          </div>
          <div>
            <dt className="meta-caps">GitHub</dt>
            <dd>
              <a href={site.github} rel="noopener noreferrer" target="_blank">
                PrateekGithub23
              </a>
            </dd>
          </div>
          <div>
            <dt className="meta-caps">LinkedIn</dt>
            <dd>
              <a href={site.linkedin} rel="noopener noreferrer" target="_blank">
                prateek-s
              </a>
            </dd>
          </div>
          <div>
            <dt className="meta-caps">Résumé</dt>
            <dd>
              <a href={site.resume}>PDF, one page</a>
            </dd>
          </div>
        </dl>

        <p className={`meta ${styles.colophon}`}>
          {site.name} · {site.location} · Built with Next.js, set in Inter Tight and IBM Plex Mono.
          No tracking.
        </p>
      </div>
    </footer>
  );
}
