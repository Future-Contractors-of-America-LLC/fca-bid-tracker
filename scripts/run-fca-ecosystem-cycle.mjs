#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const generatedDir = path.join(root, "generated");
fs.mkdirSync(generatedDir, { recursive: true });

function resolveHeadSha() {
  const result = spawnSync("git rev-parse HEAD", {
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    shell: true,
  });
  if (result.status !== 0) {
    throw new Error(`Unable to resolve git HEAD SHA: ${String(result.stderr || "").trim()}`);
  }
  return String(result.stdout || "").trim();
}

const headSha = resolveHeadSha();

const args = new Set(process.argv.slice(2));
const runWorkspaceCycle = args.has("--workspace-cycle");

const workspaceValidators = [
  ["bid", "npm run validate:bid-workspace"],
  ["project", "npm run validate:project-workspace"],
  ["finance", "npm run validate:finance-workspace"],
  ["design", "npm run validate:design-workspace"],
  ["operations", "npm run validate:operations-pipeline"],
  ["academy", "npm run validate:academy-excellence"],
  ["admin", "node scripts/validate-admin-governance.mjs"],
];

const phaseSteps = [
  ["step1-architecture-contract", [
    "npm run validate:backend-stack",
    "npm run validate:triad-contract",
    "node scripts/validate-unified-architecture-contract.mjs",
  ]],
  ["step2-vertical-slice", [
    "npm run validate:phase4-ecosystem",
    "npm run validate:bid-workspace",
    "npm run validate:project-workspace",
  ]],
  ["step3-capability-gates", [
    "npm run validate:module-capability-coverage",
    "npm run validate:product-surfaces",
    "node scripts/validate-routes.mjs",
  ]],
  ["step4-fragmentation-elimination", [
    "node scripts/validate-fragmentation-paths.mjs",
  ]],
  ["step5-ci-truth-rules", [
    "node scripts/validate-ci-truth-gates.mjs",
    "npm run validate:runtime-proof-integrity",
  ]],
  ["step6-release-readiness-score", [
    "npm run generate:runtime-proof-integrity-report",
    "npm run generate:product-readiness-report",
    "npm run validate:build-validation-live-proof-coverage",
    "node scripts/calculate-release-readiness-score.mjs",
  ]],
  ["step7-controlled-live-trial", [
    "npm run verify:live-deployment",
    "npm run validate:live-deployment-current-head-verifier",
  ]],
];

if (runWorkspaceCycle) {
  for (const [workspace, validator] of workspaceValidators) {
    phaseSteps.unshift([`step8-workspace-${workspace}`, [validator]]);
  }
}

function runCommand(command) {
  const result = spawnSync(command, {
    cwd: root,
    stdio: "inherit",
    shell: true,
    env: {
      ...process.env,
      GITHUB_SHA: headSha,
      AURICRUX_EXPECTED_GIT_SHA: headSha,
      AURICRUX_LIVE_VERIFY_ENFORCE_TARGET_SHA: "true",
    },
  });
  return {
    command,
    exitCode: result.status ?? 1,
    passed: (result.status ?? 1) === 0,
  };
}

function hasExplicitLiveTargets() {
  return Boolean(
    (process.env.AURICRUX_LIVE_VERIFY_HOSTS || process.env.AURICRUX_EXPECTED_HOSTS || "").trim(),
  );
}

const report = {
  generatedAt: new Date().toISOString(),
  workspaceCycle: runWorkspaceCycle,
  steps: [],
  passed: true,
};

for (const [stepId, commands] of phaseSteps) {
  const step = { stepId, commands: [], passed: true };
  if (stepId === "step7-controlled-live-trial" && !hasExplicitLiveTargets()) {
    step.commands.push({
      command: "npm run verify:live-deployment",
      exitCode: 0,
      passed: true,
      skipped: true,
      note: "No explicit live targets configured (AURICRUX_LIVE_VERIFY_HOSTS/AURICRUX_EXPECTED_HOSTS).",
    });
    report.steps.push(step);
    continue;
  }
  for (const command of commands) {
    const outcome = runCommand(command);
    step.commands.push(outcome);
    if (!outcome.passed) {
      step.passed = false;
      report.passed = false;
      report.steps.push(step);
      const outPath = path.join(generatedDir, "fca-ecosystem-cycle-report.json");
      fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
      console.error(`Cycle failed at ${stepId}: ${command}`);
      process.exit(1);
    }
  }
  report.steps.push(step);
}

const outPath = path.join(generatedDir, "fca-ecosystem-cycle-report.json");
fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`FCA ecosystem cycle PASSED. Report: ${path.relative(root, outPath)}`);
