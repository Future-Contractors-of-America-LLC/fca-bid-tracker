#!/usr/bin/env node
/** Cycle 5 completion gate — coverage matrix tags, live Entra config, mobile PR merge proof. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const centralRoot = path.resolve(root, "..", "auricrux-central-work");
const mobileRoot = path.resolve(root, "..", "fca-mobile-maui-work");
const apiBase = (process.env.AURICRUX_CENTRAL_API || "https://api.futurecontractorsofamerica.com/api").replace(/\/$/, "");

let failed = 0;

function read(relativePath, base = root) {
  return fs.readFileSync(path.join(base, relativePath), "utf8");
}

function pass(label, detail = "") {
  console.log(`PASS: ${label}${detail ? ` — ${detail}` : ""}`);
}

function fail(label, detail = "") {
  failed += 1;
  console.error(`FAIL: ${label}${detail ? ` — ${detail}` : ""}`);
}

function requireIncludes(relativePath, marker, label, base = root) {
  if (!read(relativePath, base).includes(marker)) {
    fail(label, `missing "${marker}" in ${relativePath}`);
    return false;
  }
  pass(label, relativePath);
  return true;
}

for (const script of ["validate-cycle4-complete.mjs"]) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", script)], { encoding: "utf8" });
  if (result.status === 0) pass(`regression: ${script}`);
  else fail(`regression: ${script}`, (result.stderr || result.stdout || "").slice(0, 200));
}

const matrix = read("FCA_COVERAGE_MATRIX.md", centralRoot);
for (const tag of ["product-complete", "mutation", "shell", "founder-blocked"]) {
  if (matrix.includes(tag)) pass(`coverage matrix tag: ${tag}`);
  else fail(`coverage matrix tag: ${tag}`);
}
if (matrix.includes("## Status Tags") && matrix.includes("| QC Proof |")) {
  pass("coverage matrix structure");
} else {
  fail("coverage matrix structure", "missing Status Tags or QC Proof column");
}

requireIncludes("core/entra_auth.py", "MICROSOFT_GRAPH_CLIENT_ID", "Entra Graph credential fallback", centralRoot);

try {
  const response = await fetch(`${apiBase}/customer-entra`);
  if (!response.ok) {
    fail("live customer-entra", `HTTP ${response.status}`);
  } else {
    const payload = await response.json();
    if (payload.configured === true) {
      pass("live Entra configured", apiBase);
    } else {
      fail("live Entra configured", `configured=${payload.configured}`);
    }
  }
} catch (error) {
  fail("live customer-entra", error.message);
}

const mobileClient = read("src/FcaMobile/Services/FcaApiClient.cs", mobileRoot);
if (mobileClient.includes("SignOutAsync") && mobileClient.includes("HasActiveSessionAsync")) {
  pass("mobile session helpers");
} else {
  fail("mobile session helpers");
}

const accountPage = read("src/FcaMobile/Pages/AccountPage.xaml", mobileRoot);
if (accountPage.includes("Sign in with Microsoft")) {
  pass("mobile Microsoft sign-in button");
} else {
  fail("mobile Microsoft sign-in button");
}

const mainLog = spawnSync("git", ["log", "-1", "--oneline", "origin/main"], {
  cwd: mobileRoot,
  encoding: "utf8",
});
const mainHasMicrosoft = spawnSync(
  "git",
  ["show", "origin/main:src/FcaMobile/Pages/AccountPage.xaml"],
  { cwd: mobileRoot, encoding: "utf8" },
);
if (mainHasMicrosoft.stdout?.includes("Sign in with Microsoft")) {
  pass("mobile main contains Microsoft sign-in", mainLog.stdout?.trim());
} else {
  fail("mobile main merge", "origin/main missing Microsoft sign-in — merge mobile PR first");
}

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "cycle5-completion-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), cycle: 5, complete: failed === 0, failed, apiBase }, null, 2),
);

if (failed > 0) {
  console.error(`Cycle 5 incomplete (${failed} failures).`);
  process.exit(1);
}
console.log("Cycle 5 complete — 100%.");
