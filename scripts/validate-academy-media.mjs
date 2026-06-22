#!/usr/bin/env node
/**
 * Verify static Auricrux academy media coverage in public/academy/media.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const mediaRoot = path.join(root, "public", "academy", "media");
const manifestPath = path.join(mediaRoot, "manifest.json");

function countFiles(pattern) {
  let count = 0;
  if (!fs.existsSync(mediaRoot)) return 0;
  for (const entry of fs.readdirSync(mediaRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const dir = path.join(mediaRoot, entry.name);
    for (const file of fs.readdirSync(dir)) {
      if (file.includes(pattern)) count += 1;
    }
  }
  return count;
}

const auricruxLecture = countFiles("-auricrux-lecture.html");
const auricruxDemo = countFiles("-auricrux-skills-demo.html");
const lab = countFiles("-lab.html");
const programDirs = fs.existsSync(mediaRoot)
  ? fs.readdirSync(mediaRoot, { withFileTypes: true }).filter((e) => e.isDirectory()).length
  : 0;

const report = {
  programDirs,
  auricruxLectureFiles: auricruxLecture,
  auricruxSkillsDemoFiles: auricruxDemo,
  labFiles: lab,
  manifestPresent: fs.existsSync(manifestPath),
};

console.log(JSON.stringify(report, null, 2));

const ok =
  programDirs >= 1212 &&
  auricruxLecture >= 6772 &&
  auricruxDemo >= 6772 &&
  lab >= 6772 &&
  report.manifestPresent;

if (!ok) {
  console.error("Academy media validation failed.");
  process.exit(1);
}

console.log("Academy media validation passed.");
