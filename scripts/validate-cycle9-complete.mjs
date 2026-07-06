#!/usr/bin/env node
/** Cycle 9 completion gate - sovereignty, precon journey, native streams, matrix rows. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { resolveCentralRoot } from "./lib/fcaCentralRoot.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const centralRoot = resolveCentralRoot(root);
const apiBase = (process.env.AURICRUX_CENTRAL_API || "https://api.futurecontractorsofamerica.com/api").replace(/\/$/, "");
const demoProjectId = process.env.FCA_DEMO_PROJECT_ID || "A-117";
const demoFileId = process.env.FCA_DEMO_FILE_ID || "FILE-1";

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
  "validate-cycle8-complete.mjs",
  "validate-fca-sovereignty.mjs",
  "validate-precon-sovereignty-journey.mjs",
]) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", script)], { encoding: "utf8" });
  if (result.status === 0) pass(`regression: ${script}`);
  else fail(`regression: ${script}`, (result.stderr || result.stdout || "").slice(0, 240));
}

const matrix = read("FCA_COVERAGE_MATRIX.md", centralRoot);
for (const marker of [
  "| 01 | Lead / Opportunity | Market network, CRM intake, website/contact | `product-complete` | `docs/qc/cycle9-completion-report.json` |",
  "| 03 | Estimate | Bid & estimating | `product-complete` | `docs/qc/cycle9-completion-report.json` |",
  "| 04 | Proposal | Proposal generation | `product-complete` | `docs/qc/cycle9-completion-report.json` |",
  "| 05 | Award | Customer portal, project conversion | `product-complete` | `docs/qc/cycle9-completion-report.json` |",
  "| 08 | Plan / Spec Briefing | Document intelligence | `product-complete` | `docs/qc/cycle9-completion-report.json` |",
  "| FCA Native Formats (FCAM/FCAS/FCAP) | Design Workspace, immersive 3D | fcam-stream, fcas-stream, fca-export | `product-complete` |",
]) {
  if (matrix.includes(marker)) pass(`coverage matrix: ${marker.slice(0, 42)}...`);
  else fail("coverage matrix row", marker);
}
if (
  matrix.includes("Mobile contractor shell") &&
  matrix.includes("fca-mobile-maui") &&
  matrix.includes("`product-complete` | `docs/qc/cycle9-completion-report.json`")
) {
  pass("coverage matrix: mobile shell product-complete");
} else {
  fail("coverage matrix row", "Mobile contractor shell");
}

try {
  const fcamResponse = await fetch(`${apiBase}/files/${encodeURIComponent(demoFileId)}/fcam-stream`);
  const fcamText = await fcamResponse.text();
  let fcamPayload = null;
  try {
    fcamPayload = JSON.parse(fcamText);
  } catch {
    fail("live fcam-stream GET", `non-JSON HTTP ${fcamResponse.status} (deploy Auricrux-Central Cycle 9 routes)`);
  }
  if (fcamPayload && (!fcamResponse.ok || !fcamPayload?.ok || fcamPayload?.data?.stream?.format !== "FCAM")) {
    fail("live fcam-stream GET", `HTTP ${fcamResponse.status}`);
  } else if (fcamPayload) {
    pass("live fcam-stream GET", `${fcamPayload.data.stream.elements?.length ?? 0} element(s)`);
  }

  const fcasResponse = await fetch(`${apiBase}/files/${encodeURIComponent(demoFileId)}/fcas-stream`);
  const fcasText = await fcasResponse.text();
  let fcasPayload = null;
  try {
    fcasPayload = JSON.parse(fcasText);
  } catch {
    fail("live fcas-stream GET", `non-JSON HTTP ${fcasResponse.status} (deploy Auricrux-Central Cycle 9 routes)`);
  }
  if (fcasPayload && (!fcasResponse.ok || !fcasPayload?.ok || fcasPayload?.data?.stream?.format !== "FCAS")) {
    fail("live fcas-stream GET", `HTTP ${fcasResponse.status}`);
  } else if (fcasPayload) {
    pass("live fcas-stream GET", `${fcasPayload.data.stream.sheets?.length ?? 0} sheet(s)`);
  }

  const exportResponse = await fetch(`${apiBase}/projects/${encodeURIComponent(demoProjectId)}/fca-export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileId: demoFileId }),
  });
  const exportText = await exportResponse.text();
  let exportPayload = null;
  try {
    exportPayload = JSON.parse(exportText);
  } catch {
    fail("live fca-export POST", `non-JSON HTTP ${exportResponse.status} (deploy Auricrux-Central Cycle 9 routes)`);
  }
  if (exportPayload && (!exportResponse.ok || !exportPayload?.ok || exportPayload?.data?.package?.format !== "FCAP")) {
    fail("live fca-export POST", `HTTP ${exportResponse.status}`);
  } else if (exportPayload) {
    pass("live fca-export POST", exportPayload.data.package.exportStatus || "ready");
  }
} catch (error) {
  fail("live native format API", error.message);
}

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "cycle9-completion-report.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      cycle: 9,
      complete: failed === 0,
      failed,
      apiBase,
      demoProjectId,
      demoFileId,
    },
    null,
    2,
  ),
);

if (failed > 0) {
  console.error(`Cycle 9 incomplete (${failed} failures).`);
  process.exit(1);
}
console.log("Cycle 9 complete - 100%.");
