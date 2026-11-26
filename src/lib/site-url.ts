/**
 * The absolute base URL of the deployed site, used for canonical links, the sitemap and Open Graph.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL   (set this once a custom domain exists)
 *   2. VERCEL_PROJECT_PRODUCTION_URL (provided automatically on Vercel)
 *   3. http://localhost:3000  (local development and tests)
 */
export function siteUrl(): URL {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return new URL(explicit);

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return new URL(`https://${vercel}`);

  return new URL("http://localhost:3000");
}

/** True for links that leave the site; used to add rel/target attributes consistently. */
export function isExternal(href: string): boolean {
  return /^https?:\/\//.test(href);
}
