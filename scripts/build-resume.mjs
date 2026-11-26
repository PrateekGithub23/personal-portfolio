/**
 * build-resume.mjs
 *
 * Builds the PUBLIC résumé PDF from the private LaTeX source.
 *
 *   input/resume.tex  (private, git-ignored)  ->  public/resume/prateek-sharma-resume.pdf
 *
 * Why a script instead of copying a PDF by hand: the private source contains a phone number,
 * which should not be published on the open web. This script strips any line that looks like a
 * phone number before compiling, so the public copy can never accidentally include it.
 *
 * Requires `tectonic` (brew install tectonic). Run with: npm run resume:build
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const SOURCE = "input/resume.tex";
const OUTPUT = "public/resume/prateek-sharma-resume.pdf";

if (!existsSync(SOURCE)) {
  console.error(`Missing ${SOURCE}. Put the LaTeX source of your résumé there first.`);
  process.exit(1);
}

// 1. Read the private source.
const tex = readFileSync(SOURCE, "utf8");

// 2. Remove the phone number. The header line is "\small <phone> $|$"; we keep "\small"
//    (it sets the font size for the contact line) and drop the number plus its separator.
const PHONE = /\d{3}[-.\s]\d{3}[-.\s]\d{4}\s*\$\|\$\s*/g;
const publicTex = tex.replace(PHONE, "");
if (PHONE.test(publicTex)) {
  console.error("A phone number is still present after redaction; refusing to build.");
  process.exit(1);
}

// 3. Compile in a throwaway directory so LaTeX's aux files never land in the repo.
const work = mkdtempSync(join(tmpdir(), "resume-"));
writeFileSync(join(work, "resume.tex"), publicTex);
execFileSync("tectonic", ["--chatter", "minimal", "resume.tex"], { cwd: work, stdio: "inherit" });

// 4. Publish the PDF under a stable, descriptive filename that every "Résumé" link points to.
copyFileSync(join(work, "resume.pdf"), OUTPUT);
console.log(`Wrote ${OUTPUT}`);
