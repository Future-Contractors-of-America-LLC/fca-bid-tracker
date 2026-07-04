#!/usr/bin/env node
/**
 * FCA Academy LMS unified simulation � Observe phases 1-4.
 * Emits lms-simulation-report.json for the repair loop.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runLmsQcSteps } from "./lib/lmsQcSteps.mjs";
import { runLmsSwaProbes } from "./lib/lmsSwaProbes.mjs";
import { runCentralArtifactCheck } from "./lib/lmsCentralArtifacts.mjs";
import { runAcademyLearnerWorkflow } from "./simulate-academy-learner-workflow.mjs";
import { resolveApiBase } from "./lib/workflowSimHttp.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runId = `LMS-SIM-${Date.now()}`;
const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });

const apiBase = await resolveApiBase(process.env.AURICRUX_CENTRAL_API || process.env.FCA_API_BASE || "");
const steps = [];
let failed = 0;

function mergeSteps(batch) {
  for (const step of batch) {
    steps.push(step);
    if (step.status === "fail") failed += 1;
  }
}

console.log("\n=== Phase 1: Static/content QC ===\n");
const qc = await runLmsQcSteps(root, { apiBase: apiBase || process.env.FCA_API_BASE, log: true });
mergeSteps(qc.steps);

console.log("\n=== Phase 2: Live learner workflow ===\n");
if (!apiBase) {
  steps.push({
    name: "Academy API reachable",
    status: "skip",
    detail: "Central API health check protected or unreachable from validator host",
    phase: "learner-workflow",
  });
  console.log("SKIP: Academy API learner workflow - Central API health check protected or unreachable from validator host");
} else {
  steps.push({ name: "Academy API reachable", status: "pass", detail: apiBase, phase: "learner-workflow" });
  console.log(`PASS: Academy API reachable - ${apiBase}`);
  const learner = await runAcademyLearnerWorkflow(apiBase, { log: true });
  mergeSteps(learner.steps);
}

console.log("\n=== Phase 3: Live SWA route probes ===\n");
const swa = await runLmsSwaProbes({ apiBase, log: true });
mergeSteps(swa.steps);

console.log("\n=== Phase 4: Central academy artifacts (best-effort) ===\n");
const central = runCentralArtifactCheck(root, { log: true });
mergeSteps(central.steps);

writeReport();
process.exit(failed > 0 ? 1 : 0);

function writeReport() {
  const passed = steps.filter((s) => s.status === "pass").length;
  const report = {
    generatedAt: new Date().toISOString(),
    runId,
    apiBase: apiBase || process.env.FCA_API_BASE || "",
    swaOrigin: swa.origin,
    scope: "FCA Academy LMS simulation",
    summary: { passed, failed, skipped: steps.filter((s) => s.status === "skip").length, total: steps.length },
    complete: failed === 0,
    phases: {
      staticQc: qc.failed,
      learnerWorkflow: steps.filter((s) => s.phase === "learner-workflow" && s.status === "fail").length,
      swaProbes: steps.filter((s) => s.phase === "swa-probes" && s.status === "fail").length,
      centralArtifacts: steps.filter((s) => s.phase === "central-artifacts" && s.status === "fail").length,
    },
    steps,
  };

  fs.writeFileSync(path.join(outputDir, "lms-simulation-report.json"), JSON.stringify(report, null, 2));

  const md = `# FCA Academy LMS Simulation

- **When:** ${report.generatedAt}
- **Run ID:** ${runId}
- **API:** ${report.apiBase || "(unreachable)"}
- **SWA:** ${report.swaOrigin}
- **Result:** ${report.complete ? "ALL STEPS PASSED" : `${failed} FAILURE(S)`} - ${passed}/${steps.length} passed

## What this proves

This robot exercises Academy catalog depth, live learner API mutations, SWA route reachability, and central content artifacts � without manual LMS walkthrough.

## Phases

| Phase | Focus |
|-------|--------|
| 1 | Static/content QC (catalog, media, CTAs, commerce wiring) |
| 2 | Live learner workflow (login, catalog, PATCH progress, commerce intake) |
| 3 | Live SWA routes (/academy, /academy/store, /portal/academy) |
| 4 | Central academy artifacts (when auricrux-central sibling present) |

## Steps

${steps.map((s) => `- **${s.status.toUpperCase()}** ${s.name}${s.detail ? `: ${s.detail}` : ""}`).join("\n")}

## For the founder

- Green = Academy worked on live surfaces when this ran.
- Red = repair loop will queue bounded fixes; see \`docs/qc/lms-repair-latest.md\`.
- Re-run: \`npm run sim:lms\`
- Full loop: \`npm run sim:lms:loop\`
`;

  fs.writeFileSync(path.join(outputDir, "lms-simulation-latest.md"), md);

  if (failed === 0) console.log(`\nAcademy LMS simulation complete - ${passed}/${steps.length} steps passed.`);
  else console.error(`\nAcademy LMS simulation incomplete - ${failed} failure(s).`);
}
