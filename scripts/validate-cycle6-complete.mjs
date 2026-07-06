#!/usr/bin/env node
/** Cycle 6 completion gate � execution tail (change orders, closeout, warranty) lifecycle + live API proof. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { resolveCentralRoot } from "./lib/fcaCentralRoot.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const centralRoot = resolveCentralRoot(root);
const apiBase = (process.env.AURICRUX_CENTRAL_API || "https://api.futurecontractorsofamerica.com/api").replace(/\/$/, "");
const demoProjectId = process.env.FCA_DEMO_PROJECT_ID || "A-117";

let failed = 0;

function read(relativePath, base = root) {
  return fs.readFileSync(path.join(base, relativePath), "utf8");
}

function pass(label, detail = "") {
  console.log(`PASS: ${label}${detail ? ` � ${detail}` : ""}`);
}

function fail(label, detail = "") {
  failed += 1;
  console.error(`FAIL: ${label}${detail ? ` � ${detail}` : ""}`);
}

function requireIncludes(relativePath, marker, label, base = root) {
  if (!read(relativePath, base).includes(marker)) {
    fail(label, `missing "${marker}" in ${relativePath}`);
    return false;
  }
  pass(label, relativePath);
  return true;
}

for (const script of ["validate-cycle5-complete.mjs", "validate-lifecycle-journey.mjs"]) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", script)], { encoding: "utf8" });
  if (result.status === 0) pass(`regression: ${script}`);
  else fail(`regression: ${script}`, (result.stderr || result.stdout || "").slice(0, 240));
}

requireIncludes("src/api/constructionClient.js", "advanceChangeOrder", "construction client change orders");
requireIncludes("src/api/constructionClient.js", "advanceCloseoutPackage", "construction client closeout");
requireIncludes("src/api/constructionClient.js", "advanceWarrantyCase", "construction client warranty");
requireIncludes("change-orders/__init__.py", "_mutate_change_order", "central change-orders PATCH", centralRoot);
requireIncludes("closeout-packages/__init__.py", "_mutate_closeout_package", "central closeout PATCH", centralRoot);
requireIncludes("core/warranty.py", "mutate_warranty_case", "central warranty mutations", centralRoot);

const matrix = read("FCA_COVERAGE_MATRIX.md", centralRoot);
for (const row of [
  "| 11 | Change Events / Change Orders |",
  "| 16 | Closeout / Warranty |",
  "`product-complete` | `docs/qc/cycle6-completion-report.json`",
]) {
  if (matrix.includes(row)) pass(`coverage matrix row: ${row.slice(0, 40)}�`);
  else fail(`coverage matrix row`, row);
}

async function checkLiveList(route, label) {
  try {
    const response = await fetch(`${apiBase}/${route}?projectId=${encodeURIComponent(demoProjectId)}`);
    if (!response.ok) {
      fail(`live ${label}`, `HTTP ${response.status}`);
      return;
    }
    const payload = await response.json();
    if (payload.ok !== true || !Array.isArray(payload.items)) {
      fail(`live ${label}`, `unexpected payload`);
      return;
    }
    pass(`live ${label}`, `${payload.count ?? payload.items.length} item(s)`);
  } catch (error) {
    fail(`live ${label}`, error.message);
  }
}

await checkLiveList("change-orders", "change-orders");
await checkLiveList("closeout-packages", "closeout-packages");
await checkLiveList("warranty-cases", "warranty-cases");

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "cycle6-completion-report.json"),
  JSON.stringify(
    { generatedAt: new Date().toISOString(), cycle: 6, complete: failed === 0, failed, apiBase, demoProjectId },
    null,
    2,
  ),
);

if (failed > 0) {
  console.error(`Cycle 6 incomplete (${failed} failures).`);
  process.exit(1);
}
console.log("Cycle 6 complete � 100%.");
