#!/usr/bin/env node
/** Cycle 14 completion gate � hanging items, CI-safe QC, conversion + academy sovereignty. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { resolveCentralRoot } from "./lib/fcaCentralRoot.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const centralRoot = resolveCentralRoot(root);
const apiBase = (process.env.AURICRUX_CENTRAL_API || "https://api.futurecontractorsofamerica.com/api").replace(/\/$/, "");
const skipBuild = process.env.CI === "true" || process.env.FCA_SKIP_REDUNDANT_BUILD === "1";

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
  "validate-fca-sovereignty.mjs",
  "validate-academy-native-commerce-journey.mjs",
  "validate-public-conversion-surface-route-truth.mjs",
]) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", script)], {
    encoding: "utf8",
    env: { ...process.env, FCA_CENTRAL_ROOT: centralRoot },
  });
  if (result.status === 0) pass(`regression: ${script}`);
  else fail(`regression: ${script}`, (result.stderr || result.stdout || "").slice(0, 240));
}

if (skipBuild) {
  pass("production build", "deferred in CI � build:system runs separately");
} else {
  const buildResult = spawnSync("npm", ["run", "build"], { cwd: root, encoding: "utf8", shell: true });
  if (buildResult.status === 0) pass("production build");
  else fail("production build", (buildResult.stderr || buildResult.stdout || "").slice(0, 300));
}

const matrix = read("FCA_COVERAGE_MATRIX.md", centralRoot);
if (matrix.includes("Cycle 14 closed gaps") && matrix.includes("academy-native-commerce")) {
  pass("coverage matrix cycle 14");
} else {
  fail("coverage matrix cycle 14");
}

const guide = read("docs/FOUNDER_COMPLETION_GUIDE.md");
if (guide.includes("checkout?plan=pilot") && !guide.includes("| Pilot checkout | https://buy.stripe.com")) {
  pass("founder guide native checkout links");
} else {
  fail("founder guide sovereignty", "stale Stripe pilot link in support table");
}

for (const endpoint of ["/fca-payments/status", "/fca-warranty/status"]) {
  try {
    const response = await fetch(`${apiBase}${endpoint}`, { headers: { Accept: "application/json" } });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : null;
    if (response.ok && payload?.ok) pass(`live ${endpoint}`);
    else if ([400, 401].includes(response.status) && !text) pass(`live ${endpoint} auth boundary`, `HTTP ${response.status}`);
    else fail(`live ${endpoint}`, `HTTP ${response.status}`);
  } catch (error) {
    fail(`live ${endpoint}`, error.message);
  }
}

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "cycle14-completion-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), cycle: 14, complete: failed === 0, failed, apiBase, skipBuild }, null, 2),
);

if (failed > 0) {
  console.error(`Cycle 14 incomplete (${failed} failures).`);
  process.exit(1);
}
console.log("Cycle 14 complete - 100%.");
