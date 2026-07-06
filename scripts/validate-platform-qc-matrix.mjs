#!/usr/bin/env node
/** Cycle 13 � per-slice QC matrix across website, portal, central, and mobile. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { resolveMobileRoot } from "./lib/fcaMobileRoot.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mobileRoot = resolveMobileRoot(root);

const SLICE_MATRIX = [
  { slice: "02-16-slices", scripts: ["validate-platform-slices.mjs"] },
  { slice: "08-design", scripts: ["validate-design-workspace.mjs"] },
  { slice: "09-rfi-closeout", scripts: ["validate-precon-sovereignty-journey.mjs"] },
  { slice: "10-field", scripts: ["validate-field-execution-journey.mjs"] },
  { slice: "11-finance", scripts: ["validate-finance-workspace.mjs", "validate-fca-native-payments-journey.mjs"] },
  { slice: "12-warranty", scripts: ["validate-warranty-service-journey.mjs"] },
  { slice: "13-platform", scripts: ["validate-portal-auricrux-coverage.mjs", "validate-fca-sovereignty.mjs"] },
  { slice: "14-auricrux", scripts: ["validate-portal-auricrux-wiring.mjs"] },
  {
    slice: "15-mobile",
    marker: {
      path: path.join(mobileRoot, "src", "FcaMobile", "Services", "FcaConfig.cs"),
      token: "checkout?plan=pilot",
      isAbsolute: true,
    },
  },
  { slice: "traverse", scripts: ["validate-full-platform-traverse.mjs"] },
];

let failed = 0;
const findings = [];

function pass(slice, label) {
  findings.push({ slice, status: "pass", label });
  console.log(`PASS [${slice}]: ${label}`);
}

function fail(slice, label, detail = "") {
  failed += 1;
  findings.push({ slice, status: "fail", label, detail });
  console.error(`FAIL [${slice}]: ${label}${detail ? ` - ${detail}` : ""}`);
}

for (const entry of SLICE_MATRIX) {
  if (entry.scripts) {
    for (const script of entry.scripts) {
      const result = spawnSync(process.execPath, [path.join(root, "scripts", script)], { encoding: "utf8" });
      if (result.status === 0) pass(entry.slice, script);
      else fail(entry.slice, script, (result.stderr || result.stdout || "").slice(0, 200));
    }
  }
  if (entry.marker) {
    const full = entry.marker.isAbsolute ? entry.marker.path : path.resolve(root, entry.marker.path);
    if (!fs.existsSync(full)) {
      fail(entry.slice, entry.marker.path, "file missing");
      continue;
    }
    const source = fs.readFileSync(full, "utf8");
    if (source.includes(entry.marker.token)) pass(entry.slice, entry.marker.path);
    else fail(entry.slice, entry.marker.path, `missing ${entry.marker.token}`);
  }
}

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "platform-qc-matrix-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), cycle: 13, complete: failed === 0, failed, findings }, null, 2),
);

if (failed > 0) {
  console.error(`Platform QC matrix incomplete (${failed} failures).`);
  process.exit(1);
}
console.log("Platform QC matrix validation passed.");
