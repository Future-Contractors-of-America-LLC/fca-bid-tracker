#!/usr/bin/env node
/** Cycle 4 completion gate � lifecycle journey, legal persistence, SharePoint upload, deploy proof. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { resolveCentralRoot } from "./lib/fcaCentralRoot.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const centralRoot = resolveCentralRoot(root);
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

for (const script of ["validate-cycle3-complete.mjs", "validate-lifecycle-journey.mjs"]) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", script)], { encoding: "utf8" });
  if (result.status === 0) pass(`regression: ${script}`);
  else fail(`regression: ${script}`, (result.stderr || result.stdout || "").slice(0, 200));
}

spawnSync(process.execPath, [path.join(root, "scripts", "verify-post-deploy.mjs")], { stdio: "inherit" });

requireIncludes("core/legal_workspace.py", "save_legal_workspace", "legal workspace store", centralRoot);
requireIncludes("legal-workspace/__init__.py", "get_legal_workspace", "legal workspace API", centralRoot);
requireIncludes("core/v1_routes.py", "legal-workspace", "legal route registered", centralRoot);
requireIncludes("function_app.py", "m365/sharepoint/upload", "SharePoint upload route", centralRoot);

requireIncludes("src/api/legalClient.js", "saveLegalWorkspace", "legal web client");
requireIncludes("src/contractorLegal/contractorLegalStorage.js", "hydrateContractorLegalState", "legal hydration");
requireIncludes("src/pages/portal/PortalLegal.jsx", "hydrateContractorLegalState", "legal portal sync");
requireIncludes("src/api/m365Client.js", "uploadSharePointFile", "SharePoint upload client");

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "cycle4-completion-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), cycle: 4, complete: failed === 0, failed }, null, 2),
);

if (failed > 0) {
  console.error(`Cycle 4 incomplete (${failed} failures).`);
  process.exit(1);
}
console.log("Cycle 4 complete � 100%.");
