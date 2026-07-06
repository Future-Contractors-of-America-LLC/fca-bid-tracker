#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });

const deferredFinanceKeys = new Set([
  "FCA_BANK_NAME",
  "FCA_BANK_ROUTING_FINGERPRINT",
  "FCA_BANK_ACCOUNT_FINGERPRINT",
  "FCA_PAYOUT_DESTINATION_ID",
  "FCA_PAYROLL_EMPLOYEE_MICHAEL_ID",
  "FCA_PAYROLL_EMPLOYEE_AMANDA_ID",
]);

function run(command, cwd = root) {
  const result = spawnSync(command, {
    cwd,
    shell: true,
    stdio: "pipe",
    encoding: "utf8",
    env: process.env,
  });

  return {
    command,
    exitCode: result.status ?? 1,
    stdout: (result.stdout || "").trim(),
    stderr: (result.stderr || "").trim(),
  };
}

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function buildBlockersFromRuns(runs) {
  return runs
    .filter((item) => item.exitCode !== 0)
    .map((item) => item.stderr || item.stdout || `${item.command} failed`);
}

function evaluateModule({ id, label, competitorSet, commands, extractor }) {
  const runs = commands.map((command) => run(command));
  let blockers = buildBlockersFromRuns(runs);

  if (typeof extractor === "function") {
    blockers = extractor({ runs, blockers });
  }

  const passedCommands = runs.filter((item) => item.exitCode === 0).length;
  const totalCommands = runs.length || 1;
  const score = Math.round((passedCommands / totalCommands) * 100);
  const targetScore = 90;

  return {
    id,
    label,
    competitorSet,
    score,
    targetScore,
    scoreStatus: score >= targetScore ? "MEETS_TARGET" : "BELOW_TARGET",
    status: blockers.length === 0 ? "PASS" : "BLOCKED",
    commands: runs.map((item) => ({ command: item.command, exitCode: item.exitCode })),
    blockers,
  };
}

const modules = [];

modules.push(
  evaluateModule({
    id: "project-intelligence-and-cde",
    label: "Project information continuity, design coordination, and CDE behavior",
    competitorSet: ["Procore", "Autodesk Construction Cloud"],
    commands: [
      "npm run validate:design-workspace",
      "npm run verify:central-api",
    ],
  }),
);

modules.push(
  evaluateModule({
    id: "preconstruction-bid-intelligence",
    label: "Bid qualification, routing, and precon continuity",
    competitorSet: ["BuildingConnected", "PlanHub"],
    commands: [
      "npm run validate:operations-pipeline",
      "node scripts/validate-bid-workspace.mjs",
      "npm run verify:central-api",
    ],
  }),
);

modules.push(
  evaluateModule({
    id: "enterprise-finance-and-controls",
    label: "Finance, payroll, AP/tax controls, and payout readiness",
    competitorSet: ["Intuit QuickBooks", "Gusto"],
    commands: [
      "npm run validate:finance-workspace",
      "npm run validate:finance-ops-readiness",
      "node scripts/validate-fca-native-payments-journey.mjs",
    ],
    extractor: ({ blockers }) => {
      const financeReport = readJsonSafe(path.join(outputDir, "finance-ops-readiness-report.json"));
      const missing = Array.isArray(financeReport?.checks)
        ? financeReport.checks.filter((item) => !item.present).map((item) => item.key)
        : [];

      if (!missing.length) {
        return blockers;
      }

      return [`Missing readiness keys: ${missing.join(", ")}`];
    },
  }),
);

modules.push(
  evaluateModule({
    id: "integrated-workforce-academy",
    label: "Embedded training, certification continuity, and workforce development",
    competitorSet: ["Pearson", "Procore Learning"],
    commands: [
      "npm run qc:lms",
      "npm run validate:lms-benchmark-advancement",
    ],
  }),
);

modules.push(
  evaluateModule({
    id: "field-intelligence-and-execution",
    label: "Field-first execution, intelligence capture, and governed actions",
    competitorSet: ["Procore Field", "Autodesk Build"],
    commands: [
      "npm run smoke:central-spine",
      "node scripts/validate-field-execution-journey.mjs",
    ],
  }),
);

modules.push(
  evaluateModule({
    id: "ai-continuity-layer",
    label: "Auricrux continuity reasoning and cross-workflow orchestration",
    competitorSet: ["Point-solution copilots"],
    commands: [
      "npm run audit:ai-glue",
      "npm run validate:execution-context-propagation",
    ],
  }),
);

modules.push(
  evaluateModule({
    id: "api-first-open-ecosystem",
    label: "API alignment, contract envelope continuity, and integration posture",
    competitorSet: ["Fragmented point integrations"],
    commands: [
      "npm run validate:flat-api-proxy-alignment",
      "npm run validate:nonlms-contract-envelope",
      "npm run verify:central-api",
    ],
  }),
);

const blocked = modules.filter((item) => item.status !== "PASS");
const aggregateScore = Math.round(
  modules.reduce((acc, item) => acc + item.score, 0) / (modules.length || 1),
);

const financeModule = modules.find((item) => item.id === "enterprise-finance-and-controls");
const financeDeferredOnly = Boolean(
  financeModule
    && financeModule.blockers.length === 1
    && financeModule.blockers[0].startsWith("Missing readiness keys:")
    && financeModule.blockers[0]
      .replace("Missing readiness keys:", "")
      .split(",")
      .map((key) => key.trim())
      .filter(Boolean)
      .every((key) => deferredFinanceKeys.has(key)),
);

const blockedExcludingDeferredFinance = blocked.filter((item) => {
  if (item.id !== "enterprise-finance-and-controls") {
    return true;
  }
  return !financeDeferredOnly;
});

const strictStatus = blocked.length === 0 ? "PASS" : "FAIL";
const statusWithDeferredFinance = blockedExcludingDeferredFinance.length === 0
  ? (financeDeferredOnly ? "PASS_WITH_DEFERRED_FINANCE" : "PASS")
  : "FAIL";

const report = {
  generatedAt: new Date().toISOString(),
  strictStatus,
  statusWithDeferredFinance,
  aggregateScore,
  deferredFinancePolicy: {
    enabled: true,
    appliesWhenOnlyKnownBankAndPayrollIdsAreMissing: true,
    keys: Array.from(deferredFinanceKeys),
  },
  modules,
  blockedModules: blocked.map((item) => ({
    id: item.id,
    blockers: item.blockers,
  })),
  blockedModulesExcludingDeferredFinance: blockedExcludingDeferredFinance.map((item) => ({
    id: item.id,
    blockers: item.blockers,
  })),
};

fs.writeFileSync(path.join(outputDir, "competitive-module-audit-report.json"), JSON.stringify(report, null, 2));

const markdown = [
  "# Competitive Module Audit Report",
  "",
  `- Generated: ${report.generatedAt}`,
  `- Strict status: ${report.strictStatus}`,
  `- Status with deferred finance policy: ${report.statusWithDeferredFinance}`,
  `- Aggregate score: ${report.aggregateScore}/100`,
  "",
  "## Module Results",
  ...modules.map((item) => `- ${item.status} ${item.id} vs ${item.competitorSet.join(" / ")} (score ${item.score}/100, target ${item.targetScore})`),
  "",
  "## Blockers",
  ...(blocked.length
    ? blocked.map((item) => `- ${item.id}: ${item.blockers.join(" | ") || "blocked"}`)
    : ["- none"]),
  "",
].join("\n");

fs.writeFileSync(path.join(outputDir, "competitive-module-audit-report.md"), `${markdown}\n`);

if (strictStatus !== "PASS") {
  console.error(`Competitive module audit failed (${blocked.length} blocked modules).`);
  process.exit(1);
}

console.log("Competitive module audit passed.");
