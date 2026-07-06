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

  const cmd = `az functionapp config appsettings list --resource-group ${resourceGroup} --name ${appName} --query "[].name" -o tsv`;
  const result = run(cmd);
  if (result.exitCode !== 0) {
    return { source: `${resourceGroup}/${appName}`, names: new Set(), error: result.stderr || result.stdout || "Unable to read app settings." };
  }

  const names = new Set(
    String(result.stdout || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean),
  );
  return { source: `${resourceGroup}/${appName}`, names, error: "" };
}

const slices = [];

const financeRun = run("npm run validate:finance-ops-readiness");
const financeReport = readJsonSafe(path.join(outputDir, "finance-ops-readiness-report.json"));
const financeMissing = Array.isArray(financeReport?.checks)
  ? financeReport.checks.filter((item) => !item.present).map((item) => item.key)
  : [];
slices.push({
  id: "finance-ops",
  status: financeRun.exitCode === 0 ? "PASS" : "BLOCKED",
  command: financeRun.command,
  blockerCount: financeMissing.length,
  blockers: financeMissing,
  note: financeRun.exitCode === 0
    ? "Finance readiness keys satisfied."
    : `Missing readiness keys: ${financeMissing.join(", ") || "unknown"}`,
});

const commerceRun = run("node scripts/validate-fca-native-payments-journey.mjs");
slices.push({
  id: "commerce-journey",
  status: commerceRun.exitCode === 0 ? "PASS" : "BLOCKED",
  command: commerceRun.command,
  blockerCount: commerceRun.exitCode === 0 ? 0 : 1,
  blockers: commerceRun.exitCode === 0 ? [] : ["validate-fca-native-payments-journey failed"],
  note: commerceRun.exitCode === 0 ? "Native payments journey checks passed." : (commerceRun.stderr || commerceRun.stdout || "Commerce journey validation failed."),
});

const centralSmokeRun = run("npm run smoke:central-spine");
slices.push({
  id: "central-runtime",
  status: centralSmokeRun.exitCode === 0 ? "PASS" : "BLOCKED",
  command: centralSmokeRun.command,
  blockerCount: centralSmokeRun.exitCode === 0 ? 0 : 1,
  blockers: centralSmokeRun.exitCode === 0 ? [] : ["smoke:central-spine failed"],
  note: centralSmokeRun.exitCode === 0 ? "Central spine smoke checks passed." : (centralSmokeRun.stderr || centralSmokeRun.stdout || "Central smoke validation failed."),
});

const centralApiRun = run("npm run verify:central-api");
slices.push({
  id: "central-api-contract",
  status: centralApiRun.exitCode === 0 ? "PASS" : "BLOCKED",
  command: centralApiRun.command,
  blockerCount: centralApiRun.exitCode === 0 ? 0 : 1,
  blockers: centralApiRun.exitCode === 0 ? [] : ["verify:central-api failed"],
  note: centralApiRun.exitCode === 0 ? "Central API route verification passed." : (centralApiRun.stderr || centralApiRun.stdout || "Central API verification failed."),
});

const settings = readFunctionAppSettingNames();
const identityRouteRun = run("npm run verify:central-api");
const requiredIdentitySettings = [
  "FCA_TENANT_ID",
  "FCA_TENANT_PRIMARY_DOMAIN",
  "FCA_CLIENT_ID",
  "FCA_CLIENT_SECRET",
];
const missingIdentitySettings = requiredIdentitySettings.filter((name) => !settings.names.has(name));

const tenantBlockers = [];
if (settings.error) {
  tenantBlockers.push(`Unable to read identity settings from ${settings.source}: ${settings.error}`);
}
if (missingIdentitySettings.length) {
  tenantBlockers.push(`Missing identity settings in ${settings.source}: ${missingIdentitySettings.join(", ")}`);
}
if (!(identityRouteRun.exitCode === 0 && /OK\s+customer_verify_route/i.test(identityRouteRun.stdout))) {
  tenantBlockers.push("customer_verify_route was not confirmed healthy by verify:central-api");
}

slices.push({
  id: "identity-graph-tenant",
  status: tenantBlockers.length ? "BLOCKED" : "PASS",
  command: `${settings.source} settings + npm run verify:central-api`,
  blockerCount: tenantBlockers.length,
  blockers: tenantBlockers,
  note: tenantBlockers.length
    ? "M365/Graph connection readiness not proven from deployed settings and route health."
    : "M365/Graph connection readiness proven from deployed settings and route health.",
});

const integrityRun = run("npm run validate:fca-total-integrity");
slices.push({
  id: "code-integrity",
  status: integrityRun.exitCode === 0 ? "PASS" : "BLOCKED",
  command: integrityRun.command,
  blockerCount: integrityRun.exitCode === 0 ? 0 : 1,
  blockers: integrityRun.exitCode === 0 ? [] : ["validate:fca-total-integrity failed"],
  note: integrityRun.exitCode === 0 ? "Strict integrity gate passed." : (integrityRun.stderr || integrityRun.stdout || "Strict integrity gate failed."),
});

const blocked = slices.filter((slice) => slice.status !== "PASS");
const overallStatus = blocked.length === 0 ? "PASS" : "FAIL";

const report = {
  generatedAt: new Date().toISOString(),
  status: overallStatus,
  slices,
  blockedSlices: blocked.map((slice) => ({
    id: slice.id,
    blockerCount: slice.blockerCount,
    blockers: slice.blockers,
  })),
};

fs.writeFileSync(path.join(outputDir, "slice-audit-report.json"), JSON.stringify(report, null, 2));

const markdown = [
  "# Slice Audit Report",
  "",
  `- Generated: ${report.generatedAt}`,
  `- Status: ${report.status}`,
  "",
  "## Slice Results",
  ...slices.map((slice) => `- ${slice.status} ${slice.id}: ${slice.note}`),
  "",
  "## Blocked Slices",
  ...(blocked.length
    ? blocked.map((slice) => `- ${slice.id}: ${slice.blockers.join(" | ") || "blocked"}`)
    : ["- none"]),
  "",
].join("\n");

fs.writeFileSync(path.join(outputDir, "slice-audit-report.md"), markdown + "\n");

if (overallStatus !== "PASS") {
  console.error(`Slice audit failed (${blocked.length} blocked slices).`);
  process.exit(1);
}

console.log("Slice audit passed.");
