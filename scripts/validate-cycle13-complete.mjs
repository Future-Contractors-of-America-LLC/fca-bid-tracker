#!/usr/bin/env node
/** Cycle 13 completion gate  platform QC, sovereignty, and Auricrux embedment. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const centralRoot = path.resolve(root, "..", "auricrux-central-work");
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

for (const script of ["validate-platform-qc-matrix.mjs"]) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", script)], { encoding: "utf8" });
  if (result.status === 0) pass(`regression: ${script}`);
  else fail(`regression: ${script}`, (result.stderr || result.stdout || "").slice(0, 240));
}

const buildResult = spawnSync("npm", ["run", "build"], { cwd: root, encoding: "utf8", shell: true });
if (buildResult.status === 0) pass("production build");
else fail("production build", (buildResult.stderr || buildResult.stdout || "").slice(0, 300));

const matrix = read("FCA_COVERAGE_MATRIX.md", centralRoot);
if (matrix.includes("Cycle 13 closed gaps") && matrix.includes("portal-auricrux-coverage")) {
  pass("coverage matrix cycle 13");
} else {
  fail("coverage matrix cycle 13");
}

for (const endpoint of ["/fca-payments/status", "/fca-warranty/status"]) {
  try {
    const response = await fetch(`${apiBase}${endpoint}`, { headers: { Accept: "application/json" } });
    const payload = await response.json();
    if (response.ok && payload?.ok) pass(`live ${endpoint}`);
    else fail(`live ${endpoint}`, `HTTP ${response.status}`);
  } catch (error) {
    fail(`live ${endpoint}`, error.message);
  }
}

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "cycle13-completion-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), cycle: 13, complete: failed === 0, failed, apiBase }, null, 2),
);

if (failed > 0) {
  console.error(`Cycle 13 incomplete (${failed} failures).`);
  process.exit(1);
}
console.log("Cycle 13 complete - 100%.");
