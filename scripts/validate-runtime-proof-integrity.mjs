import fs from "fs/promises";
import path from "path";

const root = process.cwd();
const failures = [];

async function read(relativePath) {
  return fs.readFile(path.join(root, relativePath), "utf8");
}

function expectIncludes(source, marker, file) {
  if (!source.includes(marker)) {
    failures.push(`${file} is missing required marker: ${marker}`);
  }
}

const ledgerSource = await read("docs/FCA_EXECUTION_CONTINUITY_LEDGER.md");
const buildEvidenceSource = await read("scripts/build_evidence_capture.js");
const buildWorkflowSource = await read(".github/workflows/build-validation.yml");
const runtimeWorkflowSource = await read(".github/workflows/runtime-smoke-validation.yml");
const packageSource = await read("package.json");

const packetMatch = ledgerSource.match(/- Active packet: `([^`]+)`/);
if (!packetMatch) {
  failures.push("docs/FCA_EXECUTION_CONTINUITY_LEDGER.md is missing an active packet marker.");
}

expectIncludes(buildEvidenceSource, "readContinuityPacket", "scripts/build_evidence_capture.js");
expectIncludes(buildEvidenceSource, "docs', 'FCA_EXECUTION_CONTINUITY_LEDGER.md", "scripts/build_evidence_capture.js");
expectIncludes(buildEvidenceSource, "packet: activePacket", "scripts/build_evidence_capture.js");

expectIncludes(packageSource, '"validate:runtime-proof-integrity"', "package.json");
expectIncludes(packageSource, '"generate:runtime-proof-integrity-report"', "package.json");

expectIncludes(buildWorkflowSource, "npm run validate:runtime-proof-integrity", ".github/workflows/build-validation.yml");
expectIncludes(buildWorkflowSource, "npm run generate:runtime-proof-integrity-report", ".github/workflows/build-validation.yml");
expectIncludes(buildWorkflowSource, "runtime-proof-integrity-report.json", ".github/workflows/build-validation.yml");

expectIncludes(runtimeWorkflowSource, "npm run validate:runtime-proof-integrity", ".github/workflows/runtime-smoke-validation.yml");
expectIncludes(runtimeWorkflowSource, "npm run generate:runtime-proof-integrity-report", ".github/workflows/runtime-smoke-validation.yml");
expectIncludes(runtimeWorkflowSource, "runtime-proof-integrity-report.json", ".github/workflows/runtime-smoke-validation.yml");

if (failures.length > 0) {
  console.error("Runtime proof integrity validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(`Runtime proof integrity validation passed for active packet ${packetMatch[1]}.`);
