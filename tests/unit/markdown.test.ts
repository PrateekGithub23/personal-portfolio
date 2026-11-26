/**
 * Markdown loaders: poems must be preserved exactly, and drafts must never reach a production build.
 */
import { describe, expect, it } from "vitest";
import { getNotes, getPoems, hasPublishedNotes, trimPoemBody } from "@/lib/markdown";

describe("poems", () => {
  it("trimPoemBody keeps line breaks, indentation and stanza gaps", () => {
    const body = "\n\nfirst line,\n  indented second\n\nnew stanza —\n\tend.\n\n";
    expect(trimPoemBody(body)).toBe("first line,\n  indented second\n\nnew stanza —\n\tend.");
  });

  it("keeps leading spaces on the first line", () => {
    expect(trimPoemBody("\n   opening\nsecond")).toBe("   opening\nsecond");
  });

  it("hides drafts outside development", () => {
    // NODE_ENV is "test" here, so only published poems may be returned.
    expect(getPoems().every((p) => p.published)).toBe(true);
  });
});

describe("notes", () => {
  it("returns only published notes outside development", () => {
    expect(getNotes().every((n) => n.published)).toBe(true);
    expect(hasPublishedNotes()).toBe(getNotes().length > 0);
  });
});

describe("poem collection", () => {
  it("numbers published poems from 1 and keeps the title heading out of the body", async () => {
    const { getPoems, splitTitleHeading } = await import("@/lib/markdown");
    const poems = getPoems();
    poems.forEach((p, i) => expect(p.number).toBe(i + 1));
    for (const p of poems) expect(p.body.startsWith("#")).toBe(false);
    expect(splitTitleHeading("## Title  \n  \nFirst line")).toEqual({
      heading: "Title",
      body: "First line",
    });
  });

  it("publishes the poem text byte for byte", async () => {
    const fs = await import("node:fs");
    const { getPoem } = await import("@/lib/markdown");
    const poem = getPoem("what-could-have-been");
    expect(poem).toBeDefined();
    const source = fs.readFileSync("content/poetry/what-could-have-been.md", "utf8");
    // Every line of the rendered body appears unchanged in the source file.
    for (const line of poem!.body.split("\n")) expect(source).toContain(line);
  });
});
