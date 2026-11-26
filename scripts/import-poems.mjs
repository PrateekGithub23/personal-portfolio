/**
 * import-poems.mjs
 *
 * Copies poems from the private drop folder into the site's content folder:
 *
 *   input/poetry/<name>.md|.txt   ->   content/poetry/<slug>.md   (published: false)
 *
 * Rules, because these are original poems:
 *   - The poem text is copied byte for byte. No trimming inside the poem, no reflowing,
 *     no punctuation or spelling changes.
 *   - Existing files in content/poetry are never overwritten.
 *   - Every imported poem starts unpublished; set `published: true` by hand when ready.
 *
 * Usage: npm run poems:import
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, extname, basename } from "node:path";

const FROM = "input/poetry";
const TO = "content/poetry";

if (!existsSync(FROM)) {
  console.log(`No ${FROM} folder; nothing to import.`);
  process.exit(0);
}
mkdirSync(TO, { recursive: true });

// Turn a filename into a URL-safe slug: "Winter Light.md" -> "winter-light".
const slugify = (s) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

let imported = 0;
for (const file of readdirSync(FROM)) {
  const ext = extname(file).toLowerCase();
  if (![".md", ".txt"].includes(ext) || file.toLowerCase().startsWith("readme")) continue;

  const name = basename(file, ext);
  const target = join(TO, `${slugify(name)}.md`);
  if (existsSync(target)) {
    console.log(`skip  ${file} (already in ${TO})`);
    continue;
  }

  const source = readFileSync(join(FROM, file), "utf8");

  // If the file already has front matter, keep it as-is and only make sure it starts unpublished.
  // Otherwise add minimal front matter with the filename as the title.
  let output;
  if (source.startsWith("---\n")) {
    output = /\npublished:/.test(source.split("\n---")[0] ?? "")
      ? source
      : source.replace(/^---\n/, "---\npublished: false\n");
  } else {
    const title = name.replace(/"/g, '\\"');
    output = `---\ntitle: "${title}"\npublished: false\n---\n${source}`;
  }

  writeFileSync(target, output);
  console.log(`added ${target} (unpublished)`);
  imported++;
}
console.log(`${imported} poem(s) imported.`);
