#!/usr/bin/env node
/** Cycle 13 — Auricrux embedment on every sovereign portal slice page. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const portalDir = path.join(root, "src", "pages", "portal");

const EXEMPT_PAGES = new Set(["PortalAuricrux.jsx", "PortalWorkspaceRedirect.jsx"]);
const AURICRUX_MARKERS = [
  "PortalSliceAuricrux",
  "AuricruxInsightPanel",
  "AuricruxDesignInsight",
  "AuricruxBriefingCard",
];
const FACTORY_PAGES = new Set(["PortalPlans.jsx"]);

let failed = 0;

function pass(label) {
  console.log(`PASS: ${label}`);
}

function fail(label, detail = "") {
  failed += 1;
  console.error(`FAIL: ${label}${detail ? ` - ${detail}` : ""}`);
}

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

function hasAuricruxEmbed(source) {
  return AURICRUX_MARKERS.some((marker) => source.includes(marker));
}

const operationalToolSource = read("src/components/OperationalToolPage.jsx");
if (!hasAuricruxEmbed(operationalToolSource)) {
  fail("OperationalToolPage Auricrux", "factory pages depend on PortalSliceAuricrux");
} else {
  pass("OperationalToolPage Auricrux");
}

const portalPages = fs.readdirSync(portalDir).filter((name) => name.endsWith(".jsx"));
for (const page of portalPages) {
  if (EXEMPT_PAGES.has(page)) {
    pass(`exempt:${page}`);
    continue;
  }

  let source = fs.readFileSync(path.join(portalDir, page), "utf8");
  if (FACTORY_PAGES.has(page)) {
    source += operationalToolSource;
  }

  if (!hasAuricruxEmbed(source)) {
    fail(`${page} missing Auricrux embed`);
    continue;
  }

  const hasContext =
    source.includes("targetObjectId") ||
    source.includes("usingLiveActions") ||
    source.includes("AuricruxDesignInsight") ||
    source.includes("projectId") ||
    source.includes("invoiceId") ||
    source.includes("opportunityId");
  if (!hasContext) {
    fail(`${page} Auricrux missing object context`);
    continue;
  }

  pass(`auricrux:${page}`);
}

const platformDash = read("src/pages/portal/PlatformDashboard.jsx");
if (!hasAuricruxEmbed(platformDash)) {
  fail("PlatformDashboard missing Auricrux embed");
} else {
  pass("auricrux:PlatformDashboard.jsx");
}

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "portal-auricrux-coverage-report.json"),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      cycle: 13,
      portalPageCount: portalPages.length,
      exemptCount: EXEMPT_PAGES.size,
      complete: failed === 0,
      failed,
    },
    null,
    2,
  ),
);

if (failed > 0) {
  console.error(`Portal Auricrux coverage incomplete (${failed} failures).`);
  process.exit(1);
}
console.log("Portal Auricrux coverage validation passed.");
