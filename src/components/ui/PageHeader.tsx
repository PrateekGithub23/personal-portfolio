/**
 * PageHeader: the opening block of every secondary page (Work, Experience, About, Beyond, Notes).
 * A monospace kicker, a large title and an optional introduction, left-aligned on the grid.
 */
import styles from "./PageHeader.module.css";

interface Props {
  kicker: string;
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ kicker, title, children }: Props) {
  return (
    <header className={`page ${styles.header}`}>
      <p className={styles.kicker}>{kicker}</p>
      <h1 className={styles.title}>{title}</h1>
      {children && <div className={styles.intro}>{children}</div>}
    </header>
  );
}
