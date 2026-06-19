#!/usr/bin/env node
/**
 * Market readiness + QC gate — run before deploy.
 * Usage: node scripts/run-market-qc.mjs
 */
import { spawnSync } from "node:child_process";

const checks = [
  "validate-routes.mjs",
  "validate-site-metadata.mjs",
];

let failed = 0;

for (const script of checks) {
  const label = script.replace(".mjs", "");
  process.stdout.write(`\n--- ${label} ---\n`);
  const result = spawnSync("node", [`scripts/${script}`], {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    failed += 1;
    console.error(`FAIL: ${script}`);
  } else {
    console.log(`PASS: ${script}`);
  }
}

console.log(`\n=== Market QC: ${checks.length - failed}/${checks.length} passed ===`);
process.exit(failed > 0 ? 1 : 0);
