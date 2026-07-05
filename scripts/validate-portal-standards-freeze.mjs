#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const qcDir = path.join(root, "docs", "qc");
const capabilityPath = path.join(qcDir, "module-capability-coverage-report.json");
const outputJsonPath = path.join(qcDir, "portal-standards-freeze-report.json");
const outputMdPath = path.join(qcDir, "portal-standards-freeze-report.md");

function run(command) {
  const result = spawnSync(command, {
    cwd: root,
    shell: true,
    encoding: "utf8",
    stdio: "pipe",
    env: process.env,
  });

  return {
    command,
    exitCode: result.status ?? 1,
    stdout: (result.stdout || "").trim(),
    stderr: (result.stderr || "").trim(),
  };
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function runScriptIfPresent(scriptFile) {
  const scriptPath = path.join(root, scriptFile);
  if (!fs.existsSync(scriptPath)) {
    return {
      command: `node ${scriptFile}`,
      exitCode: 0,
      skipped: true,
      stdout: "",
      stderr: "",
    };
  }

  return run(`node ${scriptFile}`);
}

const prerequisiteRuns = [
  runScriptIfPresent("scripts/validate-module-capability-coverage.mjs"),
  runScriptIfPresent("scripts/validate-portal-ux-sweep.mjs"),
];

const prerequisiteFailures = prerequisiteRuns
  .filter((item) => item.exitCode !== 0)
  .map((item) => `${item.command}: ${item.stderr || item.stdout || "failed"}`);

let capability = null;
let findings = [];
let nonCompliantRoutes = [];
let riskCounts = {
  blocker: 0,
  critical: 0,
  high: 0,
  medium: 0,
  low: 0,
};

if (fs.existsSync(capabilityPath)) {
  capability = readJson(capabilityPath);
  findings = Array.isArray(capability.findings) ? capability.findings : [];
  riskCounts = capability?.summary?.riskCounts || riskCounts;

  nonCompliantRoutes = findings
    .filter((item) => {
      const signals = item?.signals || {};
      const evidence = item?.evidence || {};
      const validators = Array.isArray(evidence.validators) ? evidence.validators : [];
      const reports = Array.isArray(evidence.reports) ? evidence.reports : [];

      const completeSignals = Boolean(
        signals.pageExists
          && signals.authGateCoverage
          && signals.roleGateCoverage
          && signals.apiClientCoverage
          && signals.validatorCoverage
          && signals.reportCoverage,
      );

      return !completeSignals || item.risk !== "low" || validators.length === 0 || reports.length === 0;
    })
    .map((item) => {
      const evidence = item?.evidence || {};
      const validators = Array.isArray(evidence.validators) ? evidence.validators : [];
      const reports = Array.isArray(evidence.reports) ? evidence.reports : [];

      return {
        route: item.route,
        risk: item.risk,
        signals: item.signals,
        validatorCount: validators.length,
        reportCount: reports.length,
      };
    });
}

const shouldRequireCapabilityReport = !prerequisiteRuns[0]?.skipped;
const hasHighRiskCounts = riskCounts.blocker > 0 || riskCounts.critical > 0 || riskCounts.high > 0 || riskCounts.medium > 0;
const capabilityReportReady = Boolean(capability) && findings.length > 0;

const blockers = [
  ...prerequisiteFailures,
  ...(shouldRequireCapabilityReport && !capability ? ["Missing capability report: docs/qc/module-capability-coverage-report.json"] : []),
  ...(shouldRequireCapabilityReport && findings.length === 0 ? ["Capability findings are empty."] : []),
  ...(hasHighRiskCounts
    ? [
        `Capability risk counts are not fully low: blocker=${riskCounts.blocker}, critical=${riskCounts.critical}, high=${riskCounts.high}, medium=${riskCounts.medium}.`,
      ]
    : []),
  ...nonCompliantRoutes.map((item) => `Route non-compliant: ${item.route} (risk=${item.risk}, validators=${item.validatorCount}, reports=${item.reportCount})`),
];

const status = blockers.length === 0 ? "PASS" : "FAIL";

const report = {
  generatedAt: new Date().toISOString(),
  status,
  checks: {
    moduleCapabilityCoverage: prerequisiteRuns[0]?.exitCode === 0,
    portalUxSweep: prerequisiteRuns[1]?.exitCode === 0,
    allRoutesLowRisk: !shouldRequireCapabilityReport || (capabilityReportReady && !hasHighRiskCounts),
    allRoutesStandardsCompliant: !shouldRequireCapabilityReport || (capabilityReportReady && nonCompliantRoutes.length === 0),
  },
  totals: {
    routeCount: findings.length,
    nonCompliantRouteCount: nonCompliantRoutes.length,
    blockerCount: blockers.length,
  },
  riskCounts,
  nonCompliantRoutes,
  prerequisiteRuns: prerequisiteRuns.map((item) => ({
    command: item.command,
    exitCode: item.exitCode,
  })),
  blockers,
};

fs.mkdirSync(qcDir, { recursive: true });
fs.writeFileSync(outputJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

const markdown = [
  "# Portal Standards Freeze Report",
  "",
  `- Generated: ${report.generatedAt}`,
  `- Status: ${report.status}`,
  `- Routes checked: ${report.totals.routeCount}`,
  `- Non-compliant routes: ${report.totals.nonCompliantRouteCount}`,
  `- Blockers: ${report.totals.blockerCount}`,
  "",
  "## Gate Checks",
  `- Module capability coverage validator: ${report.checks.moduleCapabilityCoverage ? "PASS" : "FAIL"}`,
  `- Portal UX sweep validator: ${report.checks.portalUxSweep ? "PASS" : "FAIL"}`,
  `- All routes low risk: ${report.checks.allRoutesLowRisk ? "PASS" : "FAIL"}`,
  `- All routes standards compliant: ${report.checks.allRoutesStandardsCompliant ? "PASS" : "FAIL"}`,
  "",
  "## Non-Compliant Routes",
  ...(nonCompliantRoutes.length
    ? nonCompliantRoutes.map((item) => `- ${item.route} (risk=${item.risk}, validators=${item.validatorCount}, reports=${item.reportCount})`)
    : ["- none"]),
  "",
  "## Blockers",
  ...(blockers.length ? blockers.map((item) => `- ${item}`) : ["- none"]),
  "",
].join("\n");

fs.writeFileSync(outputMdPath, `${markdown}\n`, "utf8");

if (status !== "PASS") {
  console.error(`Portal standards freeze failed with ${blockers.length} blocker(s).`);
  process.exit(1);
}

console.log("Portal standards freeze validation passed.");
