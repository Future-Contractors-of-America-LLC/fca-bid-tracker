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

const ledgerSource = await read("docs/FCA_EXECUTION_CONTINUITY_LEDGER.md");
const packageSource = await read("package.json");
const runtimeSmokeSource = await read("scripts/runtime_smoke_check.cjs");
const ciProofSource = await read("scripts/ci_proof_index.cjs");
const workflowSource = await read(".github/workflows/runtime-smoke-validation.yml");
const timestamp = new Date().toISOString();
const packetMatch = ledgerSource.match(/- Active packet: `([^`]+)`/);
const activePacket = packetMatch ? packetMatch[1] : "UNLOCKED";

const report = {
  generatedAt: timestamp,
  activePacket,
  packageScripts: {
    captureCiProofIndexPresent: has(packageSource, '"capture:ci-proof-index"'),
    validateLanePresent: has(packageSource, '"validate:runtime-smoke-proof-lane"'),
    generateLaneReportPresent: has(packageSource, '"generate:runtime-smoke-proof-lane-report"'),
  },
  runtimeSmokeScript: {
    derivesPacketFromLedger: has(runtimeSmokeSource, "packet: activePacket"),
    hasContinuityReader: has(runtimeSmokeSource, "readContinuityPacket"),
    stale055AHardcodeRemoved: !has(runtimeSmokeSource, "packet: '055A'"),
  },
  ciProofScript: {
    derivesPacketFromLedger: has(ciProofSource, "packet: activePacket"),
    hasContinuityReader: has(ciProofSource, "readContinuityPacket"),
    stale060FHardcodeRemoved: !has(ciProofSource, "packet: '060F'"),
  },
  workflow: {
    capturesCiProofIndex: has(workflowSource, "npm run capture:ci-proof-index"),
    validatesLane: has(workflowSource, "npm run validate:runtime-smoke-proof-lane"),
    generatesLaneReport: has(workflowSource, "npm run generate:runtime-smoke-proof-lane-report"),
    persistsLaneReport: has(workflowSource, "runtime-smoke-proof-lane-report.json"),
  },
};

const allChecks = [
  report.packageScripts.captureCiProofIndexPresent,
  report.packageScripts.validateLanePresent,
  report.packageScripts.generateLaneReportPresent,
  report.runtimeSmokeScript.derivesPacketFromLedger,
  report.runtimeSmokeScript.hasContinuityReader,
  report.runtimeSmokeScript.stale055AHardcodeRemoved,
  report.ciProofScript.derivesPacketFromLedger,
  report.ciProofScript.hasContinuityReader,
  report.ciProofScript.stale060FHardcodeRemoved,
  report.workflow.capturesCiProofIndex,
  report.workflow.validatesLane,
  report.workflow.generatesLaneReport,
  report.workflow.persistsLaneReport,
];

report.status = allChecks.every(Boolean) ? "pass" : "fail";

const markdown = `# FCA Runtime Smoke Proof Lane Report\n\n- Generated at: ${timestamp}\n- Active packet: ${activePacket}\n- Status: ${report.status.toUpperCase()}\n\n## Package Scripts\n- capture:ci-proof-index present: ${report.packageScripts.captureCiProofIndexPresent ? "yes" : "no"}\n- validate lane present: ${report.packageScripts.validateLanePresent ? "yes" : "no"}\n- generate lane report present: ${report.packageScripts.generateLaneReportPresent ? "yes" : "no"}\n\n## Runtime Smoke Script\n- derives packet from ledger: ${report.runtimeSmokeScript.derivesPacketFromLedger ? "yes" : "no"}\n- has continuity reader: ${report.runtimeSmokeScript.hasContinuityReader ? "yes" : "no"}\n- stale 055A hardcode removed: ${report.runtimeSmokeScript.stale055AHardcodeRemoved ? "yes" : "no"}\n\n## CI Proof Script\n- derives packet from ledger: ${report.ciProofScript.derivesPacketFromLedger ? "yes" : "no"}\n- has continuity reader: ${report.ciProofScript.hasContinuityReader ? "yes" : "no"}\n- stale 060F hardcode removed: ${report.ciProofScript.stale060FHardcodeRemoved ? "yes" : "no"}\n\n## Workflow\n- captures CI proof index: ${report.workflow.capturesCiProofIndex ? "yes" : "no"}\n- validates lane: ${report.workflow.validatesLane ? "yes" : "no"}\n- generates lane report: ${report.workflow.generatesLaneReport ? "yes" : "no"}\n- persists lane report: ${report.workflow.persistsLaneReport ? "yes" : "no"}\n`;

await fs.writeFile(path.join(outputDir, "runtime-smoke-proof-lane-report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outputDir, "runtime-smoke-proof-lane-report.md"), markdown);

console.log(`Generated runtime smoke proof lane report with status ${report.status.toUpperCase()} for packet ${activePacket}.`);
