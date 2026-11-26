/**
 * Custom 404. Short, useful, and points to the three places a visitor most likely wanted.
 */
import Link from "next/link";
import { site } from "@/content/site";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <section className={`page ${styles.wrap}`}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Nothing at this address.</h1>
      <p className={styles.text}>
        The page may have moved, or the link was mistyped. These are the useful places:
      </p>
      <ul className={styles.links}>
        <li>
          <Link href="/work">Projects and case studies</Link>
        </li>
        <li>
          <Link href="/experience">Experience</Link>
        </li>
        <li>
          <a href={site.resume}>Résumé (PDF)</a>
        </li>
        <li>
          <Link href="/">Home</Link>
        </li>
      </ul>
    </section>
  );
}
