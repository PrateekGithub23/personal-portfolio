# Poems

Each poem is one Markdown file in this folder. This README is ignored by the site.

```markdown
---
title: The poem's title
published: false        # true to show it on the live site
date: 2026-11-01        # optional, shown only if present
note: Optional author's note, shown under the poem.
---
First line of the poem
second line, exactly as written

Blank lines separate stanzas.
    Leading spaces are kept.
```

The body is rendered exactly as written: line breaks, spacing, punctuation and blank lines are
preserved and never reformatted. Drafts (`published: false`) are visible in `npm run dev` with a
"Draft" label and hidden from the production build.

Note: everything in `content/` is committed to Git. Keep private drafts in `input/poetry/` (ignored)
until you want them in the repository, then run `npm run poems:import`.
