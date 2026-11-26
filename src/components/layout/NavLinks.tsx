"use client";

/**
 * Primary navigation links. A client component only because it needs the current path to set
 * aria-current, which marks the active section for screen readers and for the underline style.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

interface Props {
  items: readonly { label: string; href: string }[];
}

export function NavLinks({ items }: Props) {
  const pathname = usePathname();

  return (
    <ul className={styles.links}>
      {items.map((item) => {
        // A section is active on its own page and on any page below it (/work/passable -> Work).
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={styles.link}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
