# Prateek Sharma: engineering portfolio

A static Next.js site: projects with case studies, experience, an about page and a small personal
section. Every number on the site comes from a project's own docs or recorded results, and is shown
with the conditions it was measured under.

```sh
npm install
npm run dev          # http://localhost:3000 (drafts visible)
npm run check        # typecheck + lint + unit tests + production build
npm run test:e2e     # Playwright against the production build (desktop, tablet, phone)
```

Requires Node 20.9+. `npx playwright install chromium` once before the first e2e run.

## Where things live

| What | Where |
|---|---|
| Name, intro, links, résumé path | `src/content/site.ts` |
| Co-op roles | `src/content/experience.ts` |
| Capabilities and the project each links to | `src/content/capabilities.ts` |
| Projects and case studies | `src/content/projects/*.ts` (registry: `index.ts`) |
| Fig. 1 claim data (TraceLayer recorded output) | `src/content/claim-trace.ts` |
| Hobbies (Markdown) | `content/beyond/*.md` |
| Poems (Markdown) | `content/poetry/*.md` |
| Engineering notes (Markdown) | `content/notes/*.md` |
| Screenshots | `public/images/<project>/` |
| Public résumé | `public/resume/prateek-sharma-resume.pdf` |
| Private source material (git-ignored) | `input/` |

Components only render this content; you should not need to touch `src/components` or `src/app` to
change what the site says.

## Common updates

**Add or edit a project.** Copy an existing file in `src/content/projects/`, edit it, and add it to the
array in `index.ts` (array order is display order). Required: every `Metric` needs a `context` string
(where and how it was measured), and every case study needs a `limitations` section. The unit tests
enforce both, check that images exist and have alt text, and that diagram edges point at real nodes.
Choose a `hero` (`evidence`, `screenshot`, `matrix`, `flow`, `brief`) so case studies don't all look
the same.

**Architecture diagrams** are data (`ArchDiagram` in `src/content/types.ts`): nodes have viewBox
coordinates and optional `role`, `tech`, `dataFlow`, `failure`, `tradeoff` text. Leave out anything you
can't verify; the panel hides empty fields. Keep `sub` under about 20 characters so it fits on one line.

**Update experience.** Edit `src/content/experience.ts`. Keep titles and dates exactly as on the résumé.

**Update the résumé.** Put the LaTeX source at `input/resume.tex` and run `npm run resume:build`
(needs `brew install tectonic`). The script removes the phone number before compiling and refuses to
build if one remains. Or replace the PDF in `public/resume/` directly, keeping the filename.

**Add a poem.** Drop it in `input/poetry/` (private) and run `npm run poems:import`. It is copied
byte for byte into `content/poetry/` with `published: false`. Check it in `npm run dev`, then set
`published: true`. The body is rendered exactly as written (line breaks, indentation, stanza gaps).
Note that anything in `content/` is committed to Git, even when unpublished.

**Add an engineering note.** Create `content/notes/<slug>.md` with `title`, `summary`, `date` and
`published` front matter. "Notes" appears in the navigation and sitemap only once a note is published.

## How it is built

- Next.js App Router, TypeScript strict, CSS Modules with design tokens in `src/styles/tokens.css`
  (dark theme; one hue per project in `src/lib/hues.ts`). No UI framework, no animation library,
  no analytics.
- Motion is CSS: the homepage system map (`src/components/home/SystemMap.tsx`), bar charts that
  grow on scroll (`src/components/viz/BarChart.tsx`), scroll reveals (`data-reveal` +
  `RevealObserver`) and a route transition (`src/app/template.tsx`). Chart data is in
  `src/content/charts.ts`; homepage lanes in `src/content/system-map.ts`.
- Every route is statically generated. The only client-side JavaScript is the navigation's active
  state, the architecture explorer and the claim trace.
- Fonts (Inter Tight, IBM Plex Mono, Newsreader for poems) are self-hosted by `next/font`.
- `sitemap.xml`, `robots.txt`, canonical URLs and the Open Graph image are generated from content.

## Deployment (Vercel, free tier)

1. Push this repository to GitHub (the `input/` folder is git-ignored and in `.vercelignore`).
2. On vercel.com, **Add New → Project**, import the repository. No settings need to change.
3. After the first deploy, set `NEXT_PUBLIC_SITE_URL` (Project → Settings → Environment Variables)
   to the final URL so canonical links and the sitemap use it. Without it, Vercel's production URL
   is used automatically.

Any static host works too: `npm run build` produces a fully prerendered site served by `next start`.

### Custom domain

Buy a domain from any registrar (around $10–15 per year for a .dev or .com), then in Vercel go to
Project → Settings → Domains, add it, and create the DNS records Vercel shows (an `A` record for the
apex, a `CNAME` for `www`). HTTPS is automatic. Update `NEXT_PUBLIC_SITE_URL` and redeploy.

## Measured quality (local, production build)

Lighthouse 12, local machine, `next start`. Mobile uses Lighthouse's default throttling; mobile
performance varies by a few points between runs, so ranges are shown where runs differed.

| Page | Mobile perf | Desktop perf | Accessibility | Best practices | SEO |
|---|---|---|---|---|---|
| `/` | 93–96 | 100 | 100 | 100 | 100 |
| `/work/tracelayer` | 95 | 100 | 100 | 100 | 100 |
| `/work/passable` | 96 | 100 | 100 | 100 | 100 |
| `/beyond` | 95 | 100 | 100 | 100 | 100 |

All animations use transform/opacity only (Lighthouse reports no non-composited animations) and are
disabled under `prefers-reduced-motion`. Scores on a real deployment will differ; re-measure there.
