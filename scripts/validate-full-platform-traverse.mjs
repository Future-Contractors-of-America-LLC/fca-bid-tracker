#!/usr/bin/env node
/** Full platform traverse - lead through warranty plus field and immersive surfaces. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function pass(label) {
  console.log(`PASS: ${label}`);
}

function fail(label, detail = "") {
  failed += 1;
  console.error(`FAIL: ${label}${detail ? ` - ${detail}` : ""}`);
}

const routes = read("src/routes.js");
const traverse = [
  "/intake",
  "/portal/pipeline",
  "/portal/bids",
  "/portal/estimates",
  "/portal/proposals",
  "/portal/projects",
  "/portal/files",
  "/portal/design",
  "/portal/rfis",
  "/portal/change-orders",
  "/portal/field-tasks",
  "/portal/punch",
  "/portal/job-cost",
  "/portal/billing",
  "/portal/closeout",
  "/portal/warranty",
  "/portal/immersive",
  "/academy",
];

for (const href of traverse) {
  if (routes.includes(`"${href}"`) || routes.includes(`'${href}'`)) pass(`traverse route ${href}`);
  else fail(`traverse route ${href}`);
}

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "full-platform-traverse-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), cycle: 10, stops: traverse.length, complete: failed === 0, failed }, null, 2),
);

if (failed > 0) process.exit(1);
console.log(`Full platform traverse validation complete (${traverse.length} stops).`);
