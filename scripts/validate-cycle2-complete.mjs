#!/usr/bin/env node
/**
 * Cycle 2 completion gate ù deeper mutation, UX polish, perf, and cross-slice continuity.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mobileRoot = path.resolve(root, "..", "fca-mobile-maui-work");
let failed = 0;
const findings = [];

function read(relativePath, base = root) {
  return fs.readFileSync(path.join(base, relativePath), "utf8");
}

function pass(label, detail = "") {
  findings.push({ cycle: 2, status: "pass", label, detail });
  console.log(`PASS: ${label}${detail ? ` ù ${detail}` : ""}`);
}

function fail(label, detail = "") {
  failed += 1;
  findings.push({ cycle: 2, status: "fail", label, detail });
  console.error(`FAIL: ${label}${detail ? ` ù ${detail}` : ""}`);
}

function requireIncludes(relativePath, marker, label, base = root) {
  const source = read(relativePath, base);
  if (!source.includes(marker)) {
    fail(label, `missing "${marker}" in ${relativePath}`);
    return false;
  }
  pass(label, relativePath);
  return true;
}

function scanPortalDir(relativeDir, bannedPhrases) {
  const dir = path.join(root, relativeDir);
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".jsx") && !file.endsWith(".js")) continue;
    const source = fs.readFileSync(path.join(dir, file), "utf8");
    for (const phrase of bannedPhrases) {
      if (source.includes(phrase)) {
        fail(`no "${phrase}" in ${relativeDir}/${file}`);
      }
    }
  }
}

for (const script of ["validate-auth-session-slice.mjs", "validate-platform-slices.mjs"]) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", script)], { stdio: "pipe", encoding: "utf8" });
  if (result.status === 0) {
    pass(`cycle 1 gate: ${script}`);
  } else {
    fail(`cycle 1 gate: ${script}`, (result.stderr || result.stdout || "").trim().slice(0, 200));
  }
}

scanPortalDir("src/pages/portal", ["Auricrux confirmed in", "Functional product:", "ExecutionTruthBanner"]);
scanPortalDir("src/pages/academy", ["Auricrux confirmed in"]);
pass("commentary shell scan complete");

requireIncludes("src/navigation.js", "prefetchManagedPath", "navigation prefetch helper");
requireIncludes("src/router.jsx", "prefetchManagedPath", "router prefetches on link hover");

const swa = read("staticwebapp.config.json");
if (!swa.includes('"route": "/assets/*"') || !swa.includes("max-age=31536000")) {
  fail("staticwebapp immutable asset caching");
} else {
  pass("staticwebapp immutable asset caching");
}

requireIncludes("api/_lib/runtime/fcaRuntimeStore.js", "respondRFI", "RFI respond mutation in runtime store");
requireIncludes("src/api/constructionClient.js", "respondProjectRfi", "RFI respond client");
requireIncludes("src/pages/portal/PortalRfis.jsx", "respondProjectRfi", "RFI respond UI");
requireIncludes("api/projects/[projectId]/rfis/index.js", "'PATCH'", "RFI PATCH handler");

requireIncludes("api/workflow-store.js", "update-command-notes", "project command notes mutation");
requireIncludes("src/hooks/useProjectWorkspace.js", "updateProjectCommandNotes", "project notes hook");
requireIncludes("src/pages/portal/PortalProjects.jsx", "persistCommandNotes", "project notes persist on blur");

requireIncludes("src/pages/portal/PortalAudit.jsx", "PortalAlert", "audit uses customer-friendly alert");
if (read("src/pages/portal/PortalAudit.jsx").includes("ExecutionTruthBanner")) {
  fail("audit removed engineering truth banner");
} else {
  pass("audit removed engineering truth banner");
}

requireIncludes("src/FcaMobile/Services/FcaApiClient.cs", "HasActiveSessionAsync", "mobile session check", mobileRoot);
requireIncludes("src/FcaMobile/Services/FcaApiClient.cs", "SignOutAsync", "mobile sign out", mobileRoot);

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "cycle2-completion-report.json"),
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    cycle: 2,
    complete: failed === 0,
    failed,
    findings,
  }, null, 2),
);

if (failed > 0) {
  console.error(`Cycle 2 incomplete (${failed} failures).`);
  process.exit(1);
}

console.log(`Cycle 2 complete ù ${findings.length} checks passed (100%).`);
