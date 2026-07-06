#!/usr/bin/env node
/** FCA warranty and service continuity journey - Cycle 12. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveCentralRoot } from "./lib/fcaCentralRoot.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const centralRoot = resolveCentralRoot(root);
const apiBase = (process.env.AURICRUX_CENTRAL_API || "https://api.futurecontractorsofamerica.com/api").replace(/\/$/, "");

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

function requireIncludes(relativePath, marker, label, base = root) {
  if (!read(relativePath, base).includes(marker)) {
    fail(label, `missing "${marker}" in ${relativePath}`);
    return;
  }
  pass(label);
}

requireIncludes("core/fca_warranty_intake.py", "create_public_warranty_intake", "central warranty intake", centralRoot);
requireIncludes("core/warranty_sla.py", "SLA_HOURS", "central warranty SLA", centralRoot);
requireIncludes("core/fca_warranty_http.py", "fca-warranty/intake", "central warranty routes", centralRoot);
requireIncludes("src/api/warrantyIntakeClient.js", "submitPublicWarrantyIntake", "web warranty client", root);
requireIncludes("src/components/warranty/WarrantyIntakeForm.jsx", "FCA is the service rail", "public warranty intake form", root);
requireIncludes("src/pages/website/Warranty.jsx", "WarrantyIntakeForm", "public warranty page intake", root);
requireIncludes("src/pages/portal/PortalWarranty.jsx", "warrantySlaLabel", "portal warranty SLA labels", root);
requireIncludes("src/utils/warrantyContinuityHints.js", "closeout-gap", "warranty continuity hints", root);

try {
  const statusResponse = await fetch(`${apiBase}/fca-warranty/status`);
  const statusPayload = await statusResponse.json();
  if (statusResponse.ok && statusPayload?.ok && statusPayload?.data?.service?.primaryRail === "fca-native") {
    pass("live fca-warranty/status");
  } else {
    fail("live fca-warranty/status", `HTTP ${statusResponse.status}`);
  }
} catch (error) {
  fail("live fca-warranty/status", error.message);
}

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "warranty-service-journey-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), complete: failed === 0, failed, apiBase }, null, 2),
);

if (failed > 0) {
  console.error(`Warranty service journey incomplete (${failed} failures).`);
  process.exit(1);
}
console.log("Warranty service journey complete.");
