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
const packageSource = await read("package.json");
const runtimeSmokeSource = await read("scripts/runtime_smoke_check.js");
const ciProofSource = await read("scripts/ci_proof_index.cjs");
const workflowSource = await read(".github/workflows/runtime-smoke-validation.yml");

const packetMatch = ledgerSource.match(/- Active packet: `([^`]+)`/);
if (!packetMatch) {
  failures.push("docs/FCA_EXECUTION_CONTINUITY_LEDGER.md is missing an active packet marker.");
}

expectIncludes(packageSource, '"capture:ci-proof-index"', "package.json");
expectIncludes(packageSource, '"validate:runtime-smoke-proof-lane"', "package.json");
expectIncludes(packageSource, '"generate:runtime-smoke-proof-lane-report"', "package.json");

expectIncludes(runtimeSmokeSource, "readContinuityPacket", "scripts/runtime_smoke_check.js");
expectIncludes(runtimeSmokeSource, "packet: activePacket", "scripts/runtime_smoke_check.js");
expectIncludes(runtimeSmokeSource, "Runtime smoke check passed for all bounded routes in packet", "scripts/runtime_smoke_check.js");

expectIncludes(ciProofSource, "readContinuityPacket", "scripts/ci_proof_index.cjs");
expectIncludes(ciProofSource, "packet: activePacket", "scripts/ci_proof_index.cjs");
expectIncludes(ciProofSource, "runtime-smoke-check-report.json", "scripts/ci_proof_index.cjs");

expectIncludes(workflowSource, "npm run capture:ci-proof-index", ".github/workflows/runtime-smoke-validation.yml");
expectIncludes(workflowSource, "npm run validate:runtime-smoke-proof-lane", ".github/workflows/runtime-smoke-validation.yml");
expectIncludes(workflowSource, "npm run generate:runtime-smoke-proof-lane-report", ".github/workflows/runtime-smoke-validation.yml");
expectIncludes(workflowSource, "runtime-smoke-proof-lane-report.json", ".github/workflows/runtime-smoke-validation.yml");

if (failures.length > 0) {
  console.error("Runtime smoke proof lane validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log(`Runtime smoke proof lane validation passed for active packet ${packetMatch ? packetMatch[1] : "UNLOCKED"}.`);
