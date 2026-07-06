#!/usr/bin/env node
/** Cycle 12 completion gate - warranty service continuity and live API proof. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { resolveCentralRoot } from "./lib/fcaCentralRoot.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const centralRoot = resolveCentralRoot(root);
const apiBase = (process.env.AURICRUX_CENTRAL_API || "https://api.futurecontractorsofamerica.com/api").replace(/\/$/, "");

let failed = 0;

function read(relativePath, base = root) {
  return fs.readFileSync(path.join(base, relativePath), "utf8");
}

function pass(label, detail = "") {
  console.log(`PASS: ${label}${detail ? ` - ${detail}` : ""}`);
}

function fail(label, detail = "") {
  failed += 1;
  console.error(`FAIL: ${label}${detail ? ` - ${detail}` : ""}`);
}

for (const script of [
  "validate-fca-native-payments-journey.mjs",
  "validate-warranty-service-journey.mjs",
]) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", script)], { encoding: "utf8" });
  if (result.status === 0) pass(`regression: ${script}`);
  else fail(`regression: ${script}`, (result.stderr || result.stdout || "").slice(0, 240));
}

const buildResult = spawnSync("npm", ["run", "build"], { cwd: root, encoding: "utf8", shell: true });
if (buildResult.status === 0) pass("production build");
else fail("production build", (buildResult.stderr || buildResult.stdout || "").slice(0, 300));

const matrix = read("FCA_COVERAGE_MATRIX.md", centralRoot);
if (matrix.includes("Cycle 12 closed gaps") && matrix.includes("fca-warranty")) {
  pass("coverage matrix cycle 12");
} else {
  fail("coverage matrix cycle 12");
}

try {
  const intakeResponse = await fetch(`${apiBase}/fca-warranty/intake`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      title: "Cycle 12 QC - lobby finish touch-up",
      description: "Automated warranty intake gate.",
      severity: "standard",
      email: "cycle12-qc@futurecontractorsofamerica.com",
      projectId: "A-117",
    }),
  });
  const intakePayload = await intakeResponse.json();
  const caseId = intakePayload?.data?.warrantyCase?.warrantyCaseId;
  if (!intakeResponse.ok || !caseId) {
    fail("live fca-warranty/intake", `HTTP ${intakeResponse.status}`);
  } else {
    pass("live fca-warranty/intake", caseId);
    const continuityResponse = await fetch(`${apiBase}/fca-warranty/continuity?projectId=A-117`);
    const continuityPayload = await continuityResponse.json();
    if (continuityResponse.ok && continuityPayload?.ok && continuityPayload?.data?.continuity) {
      pass("live fca-warranty/continuity");
    } else {
      fail("live fca-warranty/continuity", `HTTP ${continuityResponse.status}`);
    }
  }
} catch (error) {
  fail("live fca-warranty flow", error.message);
}

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "cycle12-completion-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), cycle: 12, complete: failed === 0, failed, apiBase }, null, 2),
);

if (failed > 0) {
  console.error(`Cycle 12 incomplete (${failed} failures).`);
  process.exit(1);
}
console.log("Cycle 12 complete - 100%.");
