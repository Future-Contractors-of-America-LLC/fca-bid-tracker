#!/usr/bin/env node
/** Static gate: LMS repair loop protocol is wired per FCA Academy coverage law. */
import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const failures = [];

const requiredFiles = [
  "scripts/run-lms-repair-loop.mjs",
  "scripts/simulate-academy-lms.mjs",
  "scripts/lib/lmsRepairPlaybooks.mjs",
  "scripts/lib/lmsRepairState.mjs",
  "scripts/lib/lmsQcSteps.mjs",
  "docs/FCA_LMS_REPAIR_LOOP_PROTOCOL.md",
  "auricrux/system/loops/lms-repair-loop.json",
];

for (const file of requiredFiles) {
  try {
    await fs.access(path.join(root, file));
  } catch {
    failures.push(`Missing required LMS repair loop file: ${file}`);
  }
}

const playbooks = await fs.readFile(path.join(root, "scripts/lib/lmsRepairPlaybooks.mjs"), "utf8");
for (const marker of ["observe-act-review", "REPAIR_CLASSES", "planRepairs", "retry-transient", "LMS-CATALOG-FIX"]) {
  if (!playbooks.includes(marker)) {
    failures.push(`lmsRepairPlaybooks.mjs missing marker: ${marker}`);
  }
}

const loop = await fs.readFile(path.join(root, "scripts/run-lms-repair-loop.mjs"), "utf8");
for (const marker of ["Observe", "Act", "Review", "enqueueRepairWorkItems", "auricruxReviewFailures", "writeNextAction"]) {
  if (!loop.includes(marker)) {
    failures.push(`run-lms-repair-loop.mjs missing marker: ${marker}`);
  }
}

const pkg = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
if (!pkg.scripts?.["sim:lms:loop"]) {
  failures.push("package.json missing script sim:lms:loop");
}
if (!pkg.scripts?.["sim:lms"]) {
  failures.push("package.json missing script sim:lms");
}

const workflow = await fs.readFile(path.join(root, ".github/workflows/lms-repair-loop.yml"), "utf8");
if (!workflow.includes("sim:lms:loop") && !workflow.includes("run-lms-repair-loop")) {
  failures.push("lms-repair-loop.yml must invoke repair loop");
}

if (failures.length) {
  console.error("LMS repair loop validation failed:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log("LMS repair loop validation passed.");
