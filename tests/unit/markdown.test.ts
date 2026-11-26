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
