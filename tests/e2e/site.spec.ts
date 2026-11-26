/**
 * End-to-end checks of the rendered site: navigation, case studies, links, résumé, layout at
 * several widths, keyboard use of the interactive figures, reduced motion and missing content.
 */
import { expect, test } from "@playwright/test";

const SLUGS = ["tracelayer", "passable", "marketpulse", "energy-analytics", "fit-letter"];
const PAGES = ["/", "/work", "/experience", "/about", "/beyond", ...SLUGS.map((s) => `/work/${s}`)];

test.describe("navigation", () => {
  test("primary navigation reaches every section and marks the current one", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Primary" });
    for (const [label, path] of [
      ["Work", "/work"],
      ["Experience", "/experience"],
      ["About", "/about"],
      ["Beyond", "/beyond"],
    ] as const) {
      await nav.getByRole("link", { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(nav.getByRole("link", { name: label, exact: true })).toHaveAttribute(
        "aria-current",
        "page",
      );
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    }
  });

  test("notes are hidden while nothing is published", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Notes" }),
    ).toHaveCount(0);
    const res = await page.goto("/notes");
    expect(res?.status()).toBe(404);
  });

  test("homepage shows identity, education and featured work in the first viewport", async ({
    page,
  }, info) => {
    test.skip(info.project.name === "mobile", "first-viewport rule applies to desktop and tablet");
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "Prateek Sharma" })).toBeInViewport();
    await expect(page.getByText("University of Waterloo").first()).toBeInViewport();
    await expect(page.getByRole("link", { name: /TraceLayer/ }).first()).toBeInViewport();
  });
});

test.describe("case studies", () => {
  for (const slug of SLUGS) {
    test(`/work/${slug} renders with contents, limitations and an architecture figure`, async ({
      page,
    }) => {
      const res = await page.goto(`/work/${slug}`);
      expect(res?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator("#limitations")).toBeAttached();
      await expect(page.getByRole("group", { name: /components/ })).toBeVisible();
      await expect(page).toHaveTitle(/Prateek Sharma/);
    });
  }

  test("unknown project returns the custom 404", async ({ page }) => {
    const res = await page.goto("/work/does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Nothing at this address." })).toBeVisible();
  });
});

test.describe("links and résumé", () => {
  test("résumé PDF is served from every entry point", async ({ page, request }) => {
    const direct = await request.get("/resume/prateek-sharma-resume.pdf");
    expect(direct.status()).toBe(200);
    expect(direct.headers()["content-type"]).toContain("pdf");

    const short = await request.get("/resume", { maxRedirects: 0 });
    expect([307, 308]).toContain(short.status());

    await page.goto("/");
    await expect(page.getByRole("link", { name: /Résumé/ }).first()).toHaveAttribute(
      "href",
      "/resume/prateek-sharma-resume.pdf",
    );
  });

  test("external links open safely and internal links resolve", async ({ page, request }) => {
    // Visits every page and requests every internal link: slower than the default 30 s under load.
    test.setTimeout(90_000);
    const seen = new Set<string>();
    for (const path of PAGES) {
      await page.goto(path);
      for (const a of await page.locator("a[href]").all()) {
        const href = (await a.getAttribute("href"))!;
        if (/^https?:/.test(href)) {
          await expect(a, href).toHaveAttribute("rel", /noopener/);
        } else if (href.startsWith("/") && !seen.has(href)) {
          seen.add(href);
          const res = await request.get(href.split("#")[0]!);
          expect(res.status(), `${path} -> ${href}`).toBe(200);
        }
      }
    }
  });
});

test.describe("layout", () => {
  for (const path of PAGES) {
    test(`${path} has no horizontal overflow`, async ({ page }) => {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test("body text is never smaller than 12px", async ({ page }) => {
    await page.goto("/work/tracelayer");
    const smallest = await page.evaluate(() => {
      let min = Infinity;
      for (const el of document.querySelectorAll("main p, main li, main dd, main td")) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        min = Math.min(min, parseFloat(getComputedStyle(el).fontSize));
      }
      return min;
    });
    expect(smallest).toBeGreaterThanOrEqual(12);
  });
});

test.describe("interactive figures", () => {
  test("architecture explorer works with the keyboard", async ({ page }) => {
    await page.goto("/work/passable");
    const group = page.getByRole("group", { name: /components/ });
    const pressed = group.locator('button[aria-pressed="true"]');
    await expect(pressed).toHaveCount(1);
    await expect(pressed).toContainText("Hazard overlay");

    await pressed.focus();
    await page.keyboard.press("ArrowRight");
    await expect(group.locator('button[aria-pressed="true"]')).toContainText("A* router");
    await expect(page.locator(":focus")).toContainText("A* router");
    await expect(page.getByRole("heading", { level: 3, name: "A* router" })).toBeVisible();

    await page.keyboard.press("Home");
    await expect(group.locator('button[aria-pressed="true"]')).toContainText("OSM importer");
  });

  test("claim trace: selecting a claim shows its recorded verdict", async ({ page }) => {
    await page.goto("/");
    const fig = page.getByRole("figure", { name: /Trace one AI-written claim/ });
    await expect(fig.getByText("Claims 12 failed logins; evidence shows 42 / 42")).toBeVisible();

    // Native radio group: arrow keys move the selection.
    await fig.getByRole("radio").first().focus();
    await page.keyboard.press("ArrowDown");
    await expect(
      fig.getByText("All checkable facts are present in the cited in-scope events"),
    ).toBeVisible();

    // Click the claim text, as a user would; on phones it scrolls into view inside the strip.
    await fig.locator("label", { hasText: "jsmith was added to Domain Admins" }).click();
    await expect(fig.getByRole("radio", { checked: true })).toHaveValue("h3-24");
    await expect(fig.getByText(/One of the two misses/)).toBeVisible();
  });

  test("respects reduced motion", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/work/tracelayer");
    const dur = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--dur").trim(),
    );
    expect(["0ms", "0s"]).toContain(dur); // browsers normalise the unit
    const behavior = await page.evaluate(
      () => getComputedStyle(document.documentElement).scrollBehavior,
    );
    expect(behavior).toBe("auto");
    await ctx.close();
  });
});

test.describe("accessibility basics", () => {
  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("every page has exactly one h1 and images have alt text", async ({ page }) => {
    for (const path of PAGES) {
      await page.goto(path);
      await expect(page.locator("h1"), path).toHaveCount(1);
      expect(await page.locator("img:not([alt])").count(), path).toBe(0);
    }
  });
});

test.describe("missing content", () => {
  test("beyond page leads with poems, numbered, with no placeholders", async ({ page }) => {
    await page.goto("/beyond");
    await expect(page.getByRole("heading", { name: "Poems" })).toBeVisible();
    await expect(page.getByText(/lorem|coming soon|placeholder/i)).toHaveCount(0);

    // The featured poem links to its own reading page, which shows its number.
    await page
      .getByRole("link", { name: /Poem 01/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/beyond\/poems\//);
    await expect(page.getByText(/Poem 01 of \d+/)).toBeVisible();
    await expect(page.locator("h1")).not.toContainText("#");

    const res = await page.goto("/beyond/poems/does-not-exist");
    expect(res?.status()).toBe(404);
  });

  test("homepage highlights the latest poem", async ({ page }, info) => {
    test.skip(info.project.name === "mobile", "on phones the hero block is below the fold");
    await page.goto("/");
    // The hero block (first) and the Beyond section both link to the poem.
    const links = page.getByRole("link", { name: /Read the poem/ });
    await expect(links.first()).toBeInViewport();
    await expect(links.first()).toHaveAttribute("href", /\/beyond\/poems\//);
  });
});
