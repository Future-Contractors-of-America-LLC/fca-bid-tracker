import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { resolveCentralRoot } from "./lib/fcaCentralRoot.mjs";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const centralRepoRoot = process.env.FCA_CENTRAL_ROOT ? path.resolve(process.env.FCA_CENTRAL_ROOT) : resolveCentralRoot(root);
const centralRoot = path.resolve(centralRepoRoot, "core");

import fsSync from "fs";
if (!fsSync.existsSync(centralRoot)) {
  console.warn(`Catalog balance check skipped — backend core not found at ${centralRoot}`);
  console.log("Balance check skipped (no auricrux-central checkout).");
  process.exit(0);
}

async function extractProgramKeys(fileName) {
  const source = await fs.readFile(path.join(centralRoot, fileName), "utf8");
  return [...source.matchAll(/['"]key['"]:\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
}

const taxonomyModule = await import(pathToFileURL(path.join(root, "src", "academyCatalogTaxonomy.js")).href);
const { resolveProgramCatalogMeta, getTopicByKey, CERTIFICATION_AGENCY_MAP, APPRENTICESHIP_COMPLIANCE_MAP, DEGREE_ACCREDITATION_MAP } = taxonomyModule;

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

// Compliance metadata spot-check via taxonomy maps
const certTopicKeys = summarize("certification").map((e) => e.topic);
const appTopicKeys = summarize("apprenticeship").map((e) => e.topic);

for (const topic of certTopicKeys) {
  if (!CERTIFICATION_AGENCY_MAP[topic]) {
    console.error(`\nCertification topic missing agency map: ${topic}`);
    process.exit(1);
  }
}
for (const topic of appTopicKeys) {
  if (!APPRENTICESHIP_COMPLIANCE_MAP[topic]) {
    console.error(`\nApprenticeship topic missing compliance map: ${topic}`);
    process.exit(1);
  }
}
for (const level of ["AAS", "BS", "BAS", "Shared"]) {
  if (!DEGREE_ACCREDITATION_MAP[level]) {
    console.error(`\nDegree accreditation map missing level: ${level}`);
    process.exit(1);
  }
}

console.log(`\nBalance check passed for ${programKeys.length} API programs.`);
