#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });

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

function readFunctionAppSettingNames() {
  const appName = (process.env.FCA_READINESS_FUNCTIONAPP_NAME || "Auricrux-Central").trim();
  const resourceGroup = (process.env.FCA_READINESS_FUNCTIONAPP_RG || "Auricrux_group").trim();

  const result = run(
    `az functionapp config appsettings list --resource-group ${resourceGroup} --name ${appName} --query "[].name" -o tsv`,
  );

  if (result.exitCode !== 0) {
    return {
      source: `${resourceGroup}/${appName}`,
      names: new Set(),
      error: result.stderr || result.stdout || "Unable to read app settings.",
    };
  }

  return {
    source: `${resourceGroup}/${appName}`,
    names: new Set(
      String(result.stdout || "")
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
    ),
    error: "",
  };
}

function makeSlice(id, pillar, label, commands, blockers = []) {
  const pass = commands.every((entry) => entry.exitCode === 0) && blockers.length === 0;
  return {
    id,
    pillar,
    label,
    status: pass ? "PASS" : "BLOCKED",
    commands: commands.map((entry) => ({
      command: entry.command,
      exitCode: entry.exitCode,
    })),
    blockers,
    note: pass ? `${label} validated.` : `${label} blocked.`,
  };
}

const runs = {
  designWorkspace: run("npm run validate:design-workspace"),
  operationsPipeline: run("npm run validate:operations-pipeline"),
  centralSmoke: run("npm run smoke:central-spine"),
  centralApi: run("npm run verify:central-api"),
  paymentsJourney: run("node scripts/validate-fca-native-payments-journey.mjs"),
  financeReadiness: run("npm run validate:finance-ops-readiness"),
  financeWorkspace: run("npm run validate:finance-workspace"),
  lmsQc: run("npm run qc:lms"),
  executionContext: run("npm run validate:execution-context-propagation"),
  apiAlignment: run("npm run validate:flat-api-proxy-alignment"),
};

const financeReport = readJsonSafe(path.join(outputDir, "finance-ops-readiness-report.json"));
const financeMissing = Array.isArray(financeReport?.checks)
  ? financeReport.checks.filter((item) => !item.present).map((item) => item.key)
  : [];

const settings = readFunctionAppSettingNames();
const requiredIdentitySettings = [
  "FCA_TENANT_ID",
  "FCA_TENANT_PRIMARY_DOMAIN",
  "FCA_CLIENT_ID",
  "FCA_CLIENT_SECRET",
  "MICROSOFT_GRAPH_TENANT_ID",
  "MICROSOFT_GRAPH_CLIENT_ID",
  "MICROSOFT_GRAPH_CLIENT_SECRET",
];
const missingIdentitySettings = requiredIdentitySettings.filter((name) => !settings.names.has(name));

const slices = [];

slices.push(
  makeSlice(
    "unified-project-information-management",
    1,
    "Common data environment, BIM/design continuity, and workflow routing",
    [runs.designWorkspace, runs.operationsPipeline, runs.centralApi],
  ),
);

slices.push(
  makeSlice(
    "advanced-preconstruction-bid-intelligence",
    2,
    "Bid intelligence, precon flow, and estimate routing",
    [runs.centralApi, runs.operationsPipeline],
  ),
);

slices.push(
  makeSlice(
    "enterprise-financials-resource-control",
    3,
    "Construction financial controls, payroll/AP/tax, and payout readiness",
    [runs.financeWorkspace, runs.financeReadiness, runs.paymentsJourney],
    financeMissing.length
      ? [`Missing readiness keys: ${financeMissing.join(", ")}`]
      : [],
  ),
);

slices.push(
  makeSlice(
    "integrated-learning-workforce-development",
    4,
    "In-workflow learning and workforce certification continuity",
    [runs.lmsQc, runs.centralSmoke],
  ),
);

slices.push(
  makeSlice(
    "intelligence-analytics-field-operations",
    5,
    "Field-first operations, execution context, and predictive continuity",
    [runs.centralSmoke, runs.executionContext],
  ),
);

const identityBlockers = [];
if (settings.error) {
  identityBlockers.push(`Unable to read identity settings from ${settings.source}: ${settings.error}`);
}
if (missingIdentitySettings.length) {
  identityBlockers.push(`Missing identity settings in ${settings.source}: ${missingIdentitySettings.join(", ")}`);
}
if (!(runs.centralApi.exitCode === 0 && /OK\s+customer_verify_route/i.test(runs.centralApi.stdout))) {
  identityBlockers.push("customer_verify_route was not confirmed healthy by verify:central-api");
}

slices.push(
  makeSlice(
    "api-first-open-architecture",
    6,
    "API-first architecture and M365/Graph enterprise app connection readiness",
    [runs.apiAlignment, runs.centralApi],
    identityBlockers,
  ),
);

const aiGlueRun = run("npm run audit:ai-glue");
const aiGlueReport = readJsonSafe(path.join(outputDir, "ai-glue-audit-report.json"));
const aiGlueBlockers = Array.isArray(aiGlueReport?.blockedChecks)
  ? aiGlueReport.blockedChecks.map((item) => `${item.id}: ${item.blocker || "blocked"}`)
  : [];

slices.push(
  makeSlice(
    "ai-glue-system-intelligence",
    7,
    "AI-as-glue reasoning across lifecycle, predictive risk, JIT assistance, admin automation, and knowledge architecture",
    [aiGlueRun],
    aiGlueRun.exitCode === 0 ? [] : (aiGlueBlockers.length ? aiGlueBlockers : ["AI glue audit failed"]),
  ),
);

const blocked = slices.filter((slice) => slice.status !== "PASS");
const status = blocked.length === 0 ? "PASS" : "FAIL";

const report = {
  generatedAt: new Date().toISOString(),
  status,
  slices,
  blockedSlices: blocked.map((slice) => ({
    id: slice.id,
    pillar: slice.pillar,
    blockers: slice.blockers,
  })),
};

fs.writeFileSync(path.join(outputDir, "e2e-pillar-audit-report.json"), JSON.stringify(report, null, 2));

const markdown = [
  "# E2E Pillar Audit Report",
  "",
  `- Generated: ${report.generatedAt}`,
  `- Status: ${report.status}`,
  "",
  "## Pillar Results",
  ...slices.map((slice) => `- Pillar ${slice.pillar} ${slice.status}: ${slice.id} — ${slice.label}`),
  "",
  "## Blockers",
  ...(blocked.length
    ? blocked.flatMap((slice) => [
        `- Pillar ${slice.pillar} ${slice.id}`,
        ...slice.blockers.map((blocker) => `  - ${blocker}`),
      ])
    : ["- none"]),
  "",
].join("\n");

fs.writeFileSync(path.join(outputDir, "e2e-pillar-audit-report.md"), `${markdown}\n`);

if (status !== "PASS") {
  console.error(`E2E pillar audit failed (${blocked.length} blocked pillars).`);
  process.exit(1);
}

console.log("E2E pillar audit passed.");
