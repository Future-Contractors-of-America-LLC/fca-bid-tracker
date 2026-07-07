#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const workflowPath = path.join(root, ".github", "workflows", "build-validation.yml");
const source = fs.readFileSync(workflowPath, "utf8");

const mustBeStrict = [
  "npm run verify:live-deployment",
  "npm run validate:runtime-proof-integrity",
  "npm run validate:module-capability-coverage",
  "npm run validate:fca-total-integrity",
];

const failures = [];
for (const marker of mustBeStrict) {
  if (!source.includes(marker)) {
    failures.push(`Missing required CI truth gate step: ${marker}`);
    continue;
  }
  if (source.includes(`${marker} || true`)) {
    failures.push(`CI truth gate is weakened with '|| true': ${marker}`);
  }
}

if (failures.length > 0) {
  console.error("CI truth gate validation failed:");
  for (const issue of failures) console.error(` - ${issue}`);
  process.exit(1);
}

console.log("CI truth gate validation passed (critical gates are strict). ");
