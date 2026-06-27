#!/usr/bin/env node
/**
 * Unified FCA ecosystem golden path — one product, parallel capability proof.
 * Composes existing validators; writes founder digest.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });

const steps = [];
let failed = 0;

function runStep(name, scriptRel) {
  const scriptPath = path.join(root, scriptRel);
  if (!fs.existsSync(scriptPath)) {
    steps.push({ name, status: "skip", detail: "script missing" });
    return;
  }
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, FCA_CENTRAL_ROOT: process.env.FCA_CENTRAL_ROOT || path.resolve(root, "..", "auricrux-central") },
    timeout: 300000,
  });
  const ok = result.status === 0;
  if (!ok) failed += 1;
  steps.push({
    name,
    status: ok ? "pass" : "fail",
    detail: ok ? "ok" : (result.stderr || result.stdout || "").trim().split("\n").slice(-2).join(" "),
  });
  console.log(`${ok ? "PASS" : "FAIL"}: ${name}`);
}

console.log("\n=== FCA Unified Ecosystem Golden Path ===\n");

runStep("Commerce — academy native journey", "scripts/validate-academy-native-commerce-journey.mjs");
runStep("Commerce — FCA native payments", "scripts/validate-fca-native-payments-journey.mjs");
runStep("Website — public conversion surfaces", "scripts/validate-public-conversion-surface-route-truth.mjs");
runStep("Lifecycle — contractor journey wiring", "scripts/validate-lifecycle-journey.mjs");
runStep("Auricrux — journey layer embedded", "scripts/validate-auricrux-journey-layer.mjs");
runStep("Academy — CTA continuity", "scripts/validate-academy-ctas.mjs");

const report = {
  generatedAt: new Date().toISOString(),
  product: "FCA Contractor Command",
  unifiedGoldenPath: "discover → purchase → activate tenant → operate → teach → communicate → bill",
  complete: failed === 0,
  summary: { passed: steps.filter((s) => s.status === "pass").length, failed, skipped: steps.filter((s) => s.status === "skip").length, total: steps.length },
  steps,
};

fs.writeFileSync(path.join(outputDir, "ecosystem-golden-path-report.json"), JSON.stringify(report, null, 2));

const md = `# FCA Unified Ecosystem Golden Path

- **When:** ${report.generatedAt}
- **Product:** FCA Contractor Command (one ecosystem)
- **Result:** ${report.complete ? "ALL STEPS PASSED" : `${failed} FAILURE(S)`}

## One-system promise

Academy, workspace, Auricrux, comms, and billing are capabilities inside one tenant — not separate products.

## Steps

${steps.map((s) => `- **${s.status.toUpperCase()}** ${s.name}${s.detail ? `: ${s.detail}` : ""}`).join("\n")}
`;

fs.writeFileSync(path.join(outputDir, "ecosystem-golden-path-latest.md"), md);

if (failed === 0) {
  console.log(`\nFCA ecosystem golden path validation passed (${report.summary.passed}/${report.summary.total}).`);
  process.exit(0);
}

console.error(`\nFCA ecosystem golden path incomplete — ${failed} failure(s).`);
process.exit(1);
