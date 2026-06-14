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

const packageSource = await read("package.json");
const runtimeSmokeSource = await read("scripts/runtime_smoke_check.js");
const workflowSource = await read(".github/workflows/runtime-smoke-validation.yml");

expectIncludes(packageSource, '"validate:runtime-smoke-report-emission"', "package.json");
expectIncludes(packageSource, '"generate:runtime-smoke-report-emission-report"', "package.json");

expectIncludes(runtimeSmokeSource, "emissionGuaranteed: true", "scripts/runtime_smoke_check.js");
expectIncludes(runtimeSmokeSource, "writeSummary(repoRoot, summary, results)", "scripts/runtime_smoke_check.js");
expectIncludes(runtimeSmokeSource, "bodyType: 'exception'", "scripts/runtime_smoke_check.js");
expectIncludes(runtimeSmokeSource, "fatalError", "scripts/runtime_smoke_check.js");

expectIncludes(workflowSource, "npm run validate:runtime-smoke-report-emission", ".github/workflows/runtime-smoke-validation.yml");
expectIncludes(workflowSource, "npm run generate:runtime-smoke-report-emission-report", ".github/workflows/runtime-smoke-validation.yml");
expectIncludes(workflowSource, "runtime-smoke-report-emission-report.json", ".github/workflows/runtime-smoke-validation.yml");

if (failures.length > 0) {
  console.error("Runtime smoke report emission validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Runtime smoke report emission validation passed.");
