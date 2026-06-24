#!/usr/bin/env node
/** Static gate: workflow repair loop protocol is wired per FCA/Auricrux coverage law. */
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "scripts/run-workflow-repair-loop.mjs",
  "scripts/lib/workflowRepairPlaybooks.mjs",
  "scripts/lib/workflowRepairState.mjs",
  "docs/FCA_REPAIR_LOOP_PROTOCOL.md",
];

for (const file of requiredFiles) {
  try {
    await fs.access(path.join(root, file));
  } catch {
    failures.push(`Missing required repair loop file: ${file}`);
  }
}

const playbooks = await fs.readFile(path.join(root, "scripts/lib/workflowRepairPlaybooks.mjs"), "utf8");
for (const marker of ["observe-act-review", "REPAIR_CLASSES", "planRepairs", "retry-transient"]) {
  if (!playbooks.includes(marker)) {
    failures.push(`workflowRepairPlaybooks.mjs missing marker: ${marker}`);
  }
}

const loop = await fs.readFile(path.join(root, "scripts/run-workflow-repair-loop.mjs"), "utf8");
for (const marker of ["Observe", "Act", "Review", "enqueueRepairWorkItems", "auricruxReviewFailures"]) {
  if (!loop.includes(marker)) {
    failures.push(`run-workflow-repair-loop.mjs missing marker: ${marker}`);
  }
}

const pkg = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
if (!pkg.scripts?.["sim:workflow:loop"]) {
  failures.push("package.json missing script sim:workflow:loop");
}

const workflow = await fs.readFile(path.join(root, ".github/workflows/workflow-simulations.yml"), "utf8");
if (!workflow.includes("sim:workflow:loop") && !workflow.includes("run-workflow-repair-loop")) {
  failures.push("workflow-simulations.yml must invoke repair loop");
}

if (failures.length) {
  console.error("Workflow repair loop validation failed:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("Workflow repair loop validation passed.");
