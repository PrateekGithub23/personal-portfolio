"use client";

/**
 * RevealObserver: one IntersectionObserver for the whole page.
 *
 * Any element with a `data-reveal` attribute gets `data-visible` the first time it scrolls into
 * view; CSS in globals.css does the actual fade/rise. Mounted once in the root layout and re-run on
 * every route change, so newly rendered pages are observed too. Under reduced motion the CSS makes
 * elements visible immediately, so this only toggles an attribute that has no visual effect.
 */
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-visible])");
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.setAttribute("data-visible", ""));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute("data-visible", "");
          io.unobserve(entry.target); // reveal once; never hide again on scroll-up
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);

  return null;
}
