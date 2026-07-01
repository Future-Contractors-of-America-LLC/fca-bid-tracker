#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const apiRoot = path.join(repoRoot, "api");
const outputDir = path.join(repoRoot, "docs", "qc");
const reportPath = path.join(outputDir, "flat-api-proxy-alignment.json");

const ROUTE_EXPECTATIONS = [
  { file: "workflow-audit.js", expectedTarget: "\"/workflow-audit\"" },
  { file: "files-summary.js", expectedTarget: "\"/files-summary\"" },
  { file: "audit-events-summary.js", expectedTarget: "\"/audit-events-summary\"" },
  { file: "files.js", expectedTarget: "\"/files\"" },
  { file: "estimates.js", expectedTarget: "\"/estimates\"" },
  { file: "proposals.js", expectedTarget: "\"/proposals\"" },
  { file: "billing-summary.js", expectedTarget: "\"/billing-summary\"" },
  { file: "change-orders.js", expectedTarget: "\"/change-orders\"" },
  { file: "pay-apps.js", expectedTarget: "\"/pay-apps\"" },
  { file: "closeout-packages.js", expectedTarget: "\"/closeout-packages\"" },
  { file: "warranty-cases.js", expectedTarget: "\"/warranty-cases\"" },
  { file: "academy-lms.js", expectedTarget: "\"/academy-lms\"" },
  { file: "academy-remediation-summary.js", expectedTarget: "\"/academy/remediation-summary\"" },
  { file: "remediation-links.js", expectedTarget: "\"/remediation-links\"" },
  { file: "projects-workspace.js", expectedTarget: "projects/" },
  { file: "opportunities-workspace.js", expectedTarget: "opportunities/" },
  { file: "opportunity-convert.js", expectedTarget: "convert-to-project" },
];

const FORBIDDEN_IMPORTS = [
  "./workflow-store.js",
  "./workspace-read-models.js",
  "./commercial-store.js",
  "./finance-store.js",
  "./warranty-store.js",
  "./remediation-store.js",
  "./academy-store.js",
  "./leads-store.js",
];

function readFileSafe(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, "utf8");
}

function analyzeFile(fileName, expectedTarget) {
  const fullPath = path.join(apiRoot, fileName);
  const source = readFileSafe(fullPath);
  if (!source) {
    return {
      file: fileName,
      exists: false,
      passed: false,
      failures: ["missing file"],
    };
  }

  const failures = [];

  if (!source.includes("proxyCentralRequest")) {
    failures.push("missing proxyCentralRequest usage");
  }

  if (!source.includes(expectedTarget)) {
    failures.push(`missing expected proxy target hint: ${expectedTarget}`);
  }

  for (const forbidden of FORBIDDEN_IMPORTS) {
    if (source.includes(forbidden)) {
      failures.push(`forbidden local-store import detected: ${forbidden}`);
    }
  }

  return {
    file: fileName,
    exists: true,
    passed: failures.length === 0,
    failures,
  };
}

function writeReport(report) {
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

function main() {
  const results = ROUTE_EXPECTATIONS.map((entry) => analyzeFile(entry.file, entry.expectedTarget));
  const failed = results.filter((item) => !item.passed);

  const report = {
    generatedAt: new Date().toISOString(),
    total: results.length,
    passed: results.length - failed.length,
    failed: failed.length,
    results,
  };

  writeReport(report);

  if (failed.length > 0) {
    console.error("Flat API proxy alignment failed:");
    for (const item of failed) {
      console.error(`- ${item.file}: ${item.failures.join("; ")}`);
    }
    process.exit(1);
  }

  console.log(`Flat API proxy alignment passed (${report.passed}/${report.total}).`);
}

main();
