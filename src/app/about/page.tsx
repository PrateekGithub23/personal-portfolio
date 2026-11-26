/**
 * /about: a short, plain introduction. Every statement here is a fact from the résumé, the
 * candidate profile or the projects; there are no invented anecdotes.
 */
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { site } from "@/content/site";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About",
  description:
    "Computer Engineering student at the University of Waterloo, expected to graduate in April 2028.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <PageHeader kicker="About" title="Hi, I'm Prateek." />

      <div className={`page ${styles.grid}`}>
        <div className={`prose ${styles.text}`}>
          <p>
            I&rsquo;m in my third year of Computer Engineering at the University of Waterloo, and I
            expect to graduate in April 2028.
          </p>
          <p>
            My co-op terms have all been in IT and security: investigating incidents in Defender and
            Azure AD, managing endpoints and identity, and now scripting around security tooling at
            TD. That work is mostly about operating systems other people built. On my own time I
            build the software side.
          </p>
          <p>
            The problems I like most are the ones where correctness can be checked. Can a router
            stay consistent while hazards change under it, across two instances? Does a sentence a
            model wrote match the log events it cites? Is a classifier being graded on events it has
            never seen? My projects are attempts to answer questions like those with tests and
            measurements, and to write down where the answer is still &ldquo;not yet&rdquo;.
          </p>
          <p>
            Winter 2027 is my last scheduled co-op term. After it I have three study terms, the last
            ending in winter 2028, and then I graduate. I&rsquo;m open to co-op and full-time
            opportunities from summer 2027 onward, and to experience that fits around school, in
            software, backend or data engineering. I&rsquo;m also interested in applied ML and
            security engineering teams.
          </p>
          <p>
            Away from the keyboard: cricket with the UW Cricket Club, tennis, and poetry.{" "}
            <Link href="/beyond">A little more about that</Link>.
          </p>
        </div>

        <aside className={styles.facts} aria-label="Quick facts">
          <dl>
            <div>
              <dt>Program</dt>
              <dd>
                Bachelor of Honors {site.program}
                <br />
                {site.school}
              </dd>
            </div>
            <div>
              <dt>Expected graduation</dt>
              <dd>{site.graduation}</dd>
            </div>
            <div>
              <dt>Based in</dt>
              <dd>{site.location}</dd>
            </div>
            <div>
              <dt>Looking for</dt>
              <dd>Co-op or full-time, summer 2027 onward</dd>
            </div>
            <div>
              <dt>Elsewhere</dt>
              <dd className={styles.links}>
                <a href={site.github} target="_blank" rel="noopener noreferrer">
                  GitHub
                </a>
                <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
                  LinkedIn
                </a>
                <a href={site.resume}>Résumé</a>
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </>
  );
}
