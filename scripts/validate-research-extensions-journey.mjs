#!/usr/bin/env node
/** Cycle 10 research extensions - Go/No-Go, stagnation alerts, briefing conflict matrix. */
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

function requireIncludes(relativePath, marker, label) {
  if (!read(relativePath).includes(marker)) {
    fail(label, `missing "${marker}" in ${relativePath}`);
    return;
  }
  pass(label);
}

requireIncludes("src/utils/goNoGoScoring.js", "scoreBidQualification", "Go/No-Go scoring utility");
requireIncludes("src/utils/goNoGoScoring.js", "detectPipelineStagnation", "pipeline stagnation utility");
requireIncludes("src/utils/briefingConflictHints.js", "buildBriefingConflictHints", "briefing conflict matrix");
requireIncludes("src/pages/portal/PortalPipeline.jsx", "scoreBidQualification", "pipeline Go/No-Go panel");
requireIncludes("src/pages/portal/PortalPipeline.jsx", "detectPipelineStagnation", "pipeline stagnation alert");
requireIncludes("src/components/AuricruxBriefingCard.jsx", "buildBriefingConflictHints", "briefing conflict hints UI");
requireIncludes("src/components/AuricruxBriefingCard.jsx", "Cross-document conflict matrix", "briefing conflict matrix label");

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "research-extensions-journey-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), cycle: 10, complete: failed === 0, failed }, null, 2),
);

if (failed > 0) process.exit(1);
console.log("Research extensions journey validation complete.");
