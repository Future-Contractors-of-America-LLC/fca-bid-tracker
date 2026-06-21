import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const centralRoot = path.resolve(root, "..", "auricrux-central-work", "core");

async function extractProgramKeys(fileName) {
  const source = await fs.readFile(path.join(centralRoot, fileName), "utf8");
  return [...source.matchAll(/"key": "([^"]+)"/g)].map((match) => match[1]);
}

const taxonomyModule = await import(pathToFileURL(path.join(root, "src", "academyCatalogTaxonomy.js")).href);
const { resolveProgramCatalogMeta } = taxonomyModule;

const programKeys = [
  ...(await extractProgramKeys("apprenticeship_programs.py")),
  ...(await extractProgramKeys("degree_programs.py")).filter((key) => key.startsWith("deg-")),
  ...(await extractProgramKeys("certification_programs.py")),
  ...(await extractProgramKeys("licensure_programs.py")),
  ...(await extractProgramKeys("professional_programs.py")),
  ...(await extractProgramKeys("fca_howto_programs.py")),
];

const byPathwayTopic = {};

function inferLane(key) {
  if (key.startsWith("electrical-") || key.startsWith("plumbing-") || key.startsWith("hvac-") || key.startsWith("carpentry-") || key.startsWith("masonry-") || key.startsWith("welding-") || key.startsWith("pipefitting-") || key.startsWith("sheet-metal-") || key.startsWith("fire-sprinkler-")) {
    return "apprenticeship";
  }
  if (key.startsWith("deg-")) return "degree";
  if (key.startsWith("cert-") || key.endsWith("-certification") || key === "project-controls" || key === "precon-estimating" || key === "field-readiness") {
    return "certification";
  }
  if (key.startsWith("lic-")) return "licensure";
  if (key.startsWith("fca-")) return "fca-how-to";
  if (key.startsWith("prof-")) return "professional";
  return "professional";
}

for (const key of programKeys) {
  const meta = resolveProgramCatalogMeta({ key, lane: inferLane(key) });
  const bucket = `${meta.pathwayKey}::${meta.topicKey}`;
  byPathwayTopic[bucket] = (byPathwayTopic[bucket] || 0) + 1;
}

function summarize(pathwayKey) {
  const entries = Object.entries(byPathwayTopic)
    .filter(([bucket]) => bucket.startsWith(`${pathwayKey}::`))
    .map(([bucket, count]) => ({ topic: bucket.split("::")[1], count }))
    .sort((a, b) => b.count - a.count);
  return entries;
}

console.log("Apprenticeship topic counts:");
for (const entry of summarize("apprenticeship")) {
  console.log(`  ${entry.topic}: ${entry.count}`);
}

console.log("\nDegree topic counts:");
for (const entry of summarize("degree")) {
  console.log(`  ${entry.topic}: ${entry.count}`);
}

console.log("\nCertification topic counts:");
for (const entry of summarize("certification")) {
  console.log(`  ${entry.topic}: ${entry.count}`);
}

console.log("\nLicensure topic counts:");
for (const entry of summarize("licensure")) {
  console.log(`  ${entry.topic}: ${entry.count}`);
}

console.log("\nProfessional topic counts:");
for (const entry of summarize("professional")) {
  console.log(`  ${entry.topic}: ${entry.count}`);
}

console.log("\nFCA How-To topic counts:");
for (const entry of summarize("fca-how-to")) {
  console.log(`  ${entry.topic}: ${entry.count}`);
}

const apprenticeshipCounts = summarize("apprenticeship").map((entry) => entry.count);
const maxApp = Math.max(...apprenticeshipCounts);
const minApp = Math.min(...apprenticeshipCounts);
if (maxApp - minApp > 2) {
  console.error(`\nApprenticeship imbalance: max ${maxApp}, min ${minApp}`);
  process.exit(1);
}

const degreeTopicsWithCourses = summarize("degree").length;
if (degreeTopicsWithCourses < 25) {
  console.error(`\nDegree topics with courses: ${degreeTopicsWithCourses} (expected at least 25)`);
  process.exit(1);
}

const certTopicsWithCourses = summarize("certification").length;
if (certTopicsWithCourses < 8) {
  console.error(`\nCertification topics with courses: ${certTopicsWithCourses} (expected at least 8)`);
  process.exit(1);
}

console.log(`\nBalance check passed for ${programKeys.length} API programs.`);
