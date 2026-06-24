#!/usr/bin/env node
/** FCA / Auricrux sovereignty wiring  native spine, optional acceleration only. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const centralRoot = path.resolve(root, "..", "auricrux-central-work");
let failed = 0;

function read(relativePath, base = root) {
  return fs.readFileSync(path.join(base, relativePath), "utf8");
}

function pass(label) {
  console.log(`PASS: ${label}`);
}

function fail(label, detail = "") {
  failed += 1;
  console.error(`FAIL: ${label}${detail ? `  ${detail}` : ""}`);
}

function requireIncludes(relativePath, marker, label, base = root) {
  if (!read(relativePath, base).includes(marker)) {
    fail(label, `missing "${marker}" in ${relativePath}`);
    return;
  }
  pass(label);
}

requireIncludes("FCA_SOVEREIGNTY_LAW.md", "Native spine", "sovereignty law present", centralRoot);
requireIncludes("FCA_SOVEREIGNTY_LAW.md", "fcam-stream", "sovereignty law cites native streams", centralRoot);
requireIncludes("core/fca_native_design.py", "aps_interop_enabled", "native design gates optional interop", centralRoot);
requireIncludes("core/design_precon_http.py", "fcam-stream", "central fcam-stream route", centralRoot);
requireIncludes("core/design_precon_http.py", "fca-export", "central fca-export route", centralRoot);

requireIncludes("src/components/design/FcaNativeViewerPanel.jsx", "without third-party dependence", "native viewer sovereign copy");
requireIncludes("src/components/design/FcaNativeViewerPanel.jsx", "fetchFcamStream", "native viewer loads FCAM stream");
requireIncludes("src/components/design/ApsInteropPanel.jsx", "Optional Autodesk interop", "APS interop labeled optional");
requireIncludes("src/components/design/ApsInteropPanel.jsx", "not required", "APS interop not required copy");
requireIncludes("src/api/designWorkspaceClient.js", "exportFcaNativePackage", "design client fca-export");
requireIncludes("src/pages/portal/PortalDesignWorkspace.jsx", "exportFcaNativePackage", "design workspace FCAP export");
requireIncludes("docs/FCA_RESEARCH_EXTENSIONS.md", "FCA_SOVEREIGNTY_LAW", "research doc links sovereignty law");

const checkout = read("src/pages/website/Checkout.jsx");
if (checkout.includes("Stripe Embedded Checkout") || checkout.includes("createInvoiceCheckout")) {
  pass("checkout uses in-house embedded path");
} else {
  fail("checkout sovereignty", "expected embedded/in-house checkout");
}

const backendBase = read("src/config/domainHosts.js");
if (
  backendBase.includes("api.futurecontractorsofamerica.com") ||
  backendBase.includes("auricrux-central")
) {
  pass("API base targets FCA Central");
} else {
  fail("API base sovereignty");
}

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "fca-sovereignty-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), cycle: 9, complete: failed === 0, failed }, null, 2),
);

if (failed > 0) process.exit(1);
console.log("FCA sovereignty validation complete.");
