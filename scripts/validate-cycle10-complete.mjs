#!/usr/bin/env node
/** Cycle 10 completion gate - research extensions, full traverse, build proof. */
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
  "validate-cycle9-complete.mjs",
  "validate-research-extensions-journey.mjs",
  "validate-full-platform-traverse.mjs",
]) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", script)], { encoding: "utf8" });
  if (result.status === 0) pass(`regression: ${script}`);
  else fail(`regression: ${script}`, (result.stderr || result.stdout || "").slice(0, 240));
}

const buildResult = spawnSync("npm", ["run", "build"], { cwd: root, encoding: "utf8", shell: true });
if (buildResult.status === 0) pass("production build");
else fail("production build", (buildResult.stderr || buildResult.stdout || "").slice(0, 300));

const matrix = read("FCA_COVERAGE_MATRIX.md", centralRoot);
if (matrix.includes("Cycle 9 closed gaps") && matrix.includes("founder-blocked")) {
  pass("coverage matrix cycle 9 + founder-blocked");
} else {
  fail("coverage matrix structure");
}

try {
  const fcamResponse = await fetch(`${apiBase}/files/FILE-1/fcam-stream`);
  const fcamPayload = await fcamResponse.json();
  if (fcamResponse.ok && fcamPayload?.ok && fcamPayload?.data?.stream?.format === "FCAM") {
    pass("live fcam-stream regression");
  } else {
    fail("live fcam-stream regression", `HTTP ${fcamResponse.status}`);
  }
} catch (error) {
  fail("live fcam-stream regression", error.message);
}

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "cycle10-completion-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), cycle: 10, complete: failed === 0, failed, apiBase }, null, 2),
);

if (failed > 0) {
  console.error(`Cycle 10 incomplete (${failed} failures).`);
  process.exit(1);
}
console.log("Cycle 10 complete - 100%.");
