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
const buildEvidenceSource = await read("scripts/build_evidence_capture.js");
const buildWorkflowSource = await read(".github/workflows/build-validation.yml");
const runtimeWorkflowSource = await read(".github/workflows/runtime-smoke-validation.yml");
const timestamp = new Date().toISOString();
const packetMatch = ledgerSource.match(/- Active packet: `([^`]+)`/);
const activePacket = packetMatch ? packetMatch[1] : "UNLOCKED";

const report = {
  generatedAt: timestamp,
  activePacket,
  buildEvidence: {
    readsContinuityLedger: has(buildEvidenceSource, "readContinuityPacket"),
    derivesPacketFromLedger: has(buildEvidenceSource, "packet: activePacket"),
    stale055AHardcodeRemoved: !has(buildEvidenceSource, "packet: '055A'"),
  },
  buildValidationFlow: {
    validatesIntegrity: has(buildWorkflowSource, "npm run validate:runtime-proof-integrity"),
    generatesIntegrityReport: has(buildWorkflowSource, "npm run generate:runtime-proof-integrity-report"),
    persistsIntegrityReport: has(buildWorkflowSource, "runtime-proof-integrity-report.json"),
  },
  runtimeSmokeFlow: {
    validatesIntegrity: has(runtimeWorkflowSource, "npm run validate:runtime-proof-integrity"),
    generatesIntegrityReport: has(runtimeWorkflowSource, "npm run generate:runtime-proof-integrity-report"),
    persistsIntegrityReport: has(runtimeWorkflowSource, "runtime-proof-integrity-report.json"),
  },
};

const allChecks = [
  report.buildEvidence.readsContinuityLedger,
  report.buildEvidence.derivesPacketFromLedger,
  report.buildEvidence.stale055AHardcodeRemoved,
  report.buildValidationFlow.validatesIntegrity,
  report.buildValidationFlow.generatesIntegrityReport,
  report.buildValidationFlow.persistsIntegrityReport,
  report.runtimeSmokeFlow.validatesIntegrity,
  report.runtimeSmokeFlow.generatesIntegrityReport,
  report.runtimeSmokeFlow.persistsIntegrityReport,
];

report.status = allChecks.every(Boolean) ? "pass" : "fail";

const markdown = `# FCA Runtime Proof Integrity Report\n\n- Generated at: ${timestamp}\n- Active packet: ${activePacket}\n- Status: ${report.status.toUpperCase()}\n\n## Build Evidence\n- Reads continuity ledger: ${report.buildEvidence.readsContinuityLedger ? "yes" : "no"}\n- Derives packet from ledger: ${report.buildEvidence.derivesPacketFromLedger ? "yes" : "no"}\n- Stale 055A hardcode removed: ${report.buildEvidence.stale055AHardcodeRemoved ? "yes" : "no"}\n\n## Build Validation Flow\n- Validates integrity: ${report.buildValidationFlow.validatesIntegrity ? "yes" : "no"}\n- Generates integrity report: ${report.buildValidationFlow.generatesIntegrityReport ? "yes" : "no"}\n- Persists integrity report: ${report.buildValidationFlow.persistsIntegrityReport ? "yes" : "no"}\n\n## Runtime Smoke Flow\n- Validates integrity: ${report.runtimeSmokeFlow.validatesIntegrity ? "yes" : "no"}\n- Generates integrity report: ${report.runtimeSmokeFlow.generatesIntegrityReport ? "yes" : "no"}\n- Persists integrity report: ${report.runtimeSmokeFlow.persistsIntegrityReport ? "yes" : "no"}\n`;

await fs.writeFile(path.join(outputDir, "runtime-proof-integrity-report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outputDir, "runtime-proof-integrity-report.md"), markdown);

console.log(`Generated runtime proof integrity report with status ${report.status.toUpperCase()} for packet ${activePacket}.`);
