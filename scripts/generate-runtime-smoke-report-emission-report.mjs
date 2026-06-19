import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const outputDir = path.join(root, "generated");
await fs.mkdir(outputDir, { recursive: true });

async function read(relativePath) {
  return fs.readFile(path.join(root, relativePath), "utf8");
}

function has(source, marker) {
  return source.includes(marker);
}

const runtimeSmokeSource = await read("scripts/runtime_smoke_check.cjs");
const packageSource = await read("package.json");
const workflowSource = await read(".github/workflows/runtime-smoke-validation.yml");
const ledgerSource = await read("docs/FCA_EXECUTION_CONTINUITY_LEDGER.md");
const timestamp = new Date().toISOString();
const packetMatch = ledgerSource.match(/- Active packet: `([^`]+)`/);
const activePacket = packetMatch ? packetMatch[1] : "UNLOCKED";

const report = {
  generatedAt: timestamp,
  activePacket,
  runtimeSmokeScript: {
    emissionGuaranteedFlag: has(runtimeSmokeSource, "emissionGuaranteed: true"),
    perRouteExceptionCapture: has(runtimeSmokeSource, "bodyType: 'exception'"),
    writesSummaryBeforeFailureExit: has(runtimeSmokeSource, "writeSummary(repoRoot, summary, results)"),
    fatalCatchWritesSummary: has(runtimeSmokeSource, "fatalError"),
  },
  packageScripts: {
    validatePresent: has(packageSource, '"validate:runtime-smoke-report-emission"'),
    reportPresent: has(packageSource, '"generate:runtime-smoke-report-emission-report"'),
  },
  workflow: {
    validatesEmission: has(workflowSource, "npm run validate:runtime-smoke-report-emission"),
    generatesEmissionReport: has(workflowSource, "npm run generate:runtime-smoke-report-emission-report"),
    persistsEmissionReport: has(workflowSource, "runtime-smoke-report-emission-report.json"),
  },
};

const allChecks = [
  report.runtimeSmokeScript.emissionGuaranteedFlag,
  report.runtimeSmokeScript.perRouteExceptionCapture,
  report.runtimeSmokeScript.writesSummaryBeforeFailureExit,
  report.runtimeSmokeScript.fatalCatchWritesSummary,
  report.packageScripts.validatePresent,
  report.packageScripts.reportPresent,
  report.workflow.validatesEmission,
  report.workflow.generatesEmissionReport,
  report.workflow.persistsEmissionReport,
];

report.status = allChecks.every(Boolean) ? "pass" : "fail";

const markdown = `# FCA Runtime Smoke Report Emission Report\n\n- Generated at: ${timestamp}\n- Active packet: ${activePacket}\n- Status: ${report.status.toUpperCase()}\n\n## Runtime Smoke Script\n- Emission guaranteed flag: ${report.runtimeSmokeScript.emissionGuaranteedFlag ? "yes" : "no"}\n- Per-route exception capture: ${report.runtimeSmokeScript.perRouteExceptionCapture ? "yes" : "no"}\n- Writes summary before failure exit: ${report.runtimeSmokeScript.writesSummaryBeforeFailureExit ? "yes" : "no"}\n- Fatal catch writes summary: ${report.runtimeSmokeScript.fatalCatchWritesSummary ? "yes" : "no"}\n\n## Package Scripts\n- Validation script present: ${report.packageScripts.validatePresent ? "yes" : "no"}\n- Report script present: ${report.packageScripts.reportPresent ? "yes" : "no"}\n\n## Workflow\n- Validates emission: ${report.workflow.validatesEmission ? "yes" : "no"}\n- Generates emission report: ${report.workflow.generatesEmissionReport ? "yes" : "no"}\n- Persists emission report: ${report.workflow.persistsEmissionReport ? "yes" : "no"}\n`;

await fs.writeFile(path.join(outputDir, "runtime-smoke-report-emission-report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outputDir, "runtime-smoke-report-emission-report.md"), markdown);

console.log(`Generated runtime smoke report emission report with status ${report.status.toUpperCase()} for packet ${activePacket}.`);
