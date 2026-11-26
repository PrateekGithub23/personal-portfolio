/**
 * Site header: name on the left, conventional navigation on the right, résumé always one click away.
 * No hamburger menu: there are only five destinations, so on small screens the links wrap onto a
 * second row and stay visible.
 */
import Link from "next/link";
import { nav, site } from "@/content/site";
import { hasPublishedNotes } from "@/lib/markdown";
import { NavLinks } from "./NavLinks";
import styles from "./Header.module.css";

export function Header() {
  // "Notes" appears only after the first note is published.
  const items = hasPublishedNotes() ? [...nav, { label: "Notes", href: "/notes" }] : nav;

  return (
    <header className={styles.header}>
      <div className={`page ${styles.inner}`}>
        <Link href="/" className={styles.name}>
          {site.name}
        </Link>
        <nav aria-label="Primary" className={styles.nav}>
          <NavLinks items={items} />
          <a href={site.resume} className={styles.resume}>
            Résumé <span className={styles.ext}>PDF</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
