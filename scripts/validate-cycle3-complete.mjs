#!/usr/bin/env node
/**
 * Cycle 3 completion gate — in-house payments, Entra SSO, M365 files, transactional comms.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const centralRoot = path.resolve(root, "..", "auricrux-central-work");
const mobileRoot = path.resolve(root, "..", "fca-mobile-maui-work");
let failed = 0;
const findings = [];

function read(relativePath, base = root) {
  return fs.readFileSync(path.join(base, relativePath), "utf8");
}

function pass(label, detail = "") {
  findings.push({ cycle: 3, status: "pass", label, detail });
  console.log(`PASS: ${label}${detail ? ` — ${detail}` : ""}`);
}

function fail(label, detail = "") {
  failed += 1;
  findings.push({ cycle: 3, status: "fail", label, detail });
  console.error(`FAIL: ${label}${detail ? ` — ${detail}` : ""}`);
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

for (const script of ["validate-cycle2-complete.mjs"]) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", script)], { stdio: "pipe", encoding: "utf8" });
  if (result.status === 0) {
    pass(`cycle 2 regression: ${script}`);
  } else {
    fail(`cycle 2 regression: ${script}`, (result.stderr || result.stdout || "").trim().slice(0, 200));
  }
}

requireIncludes("core/entra_auth.py", "resolve_entra_account", "Entra OAuth core", centralRoot);
requireIncludes("customer-entra/__init__.py", "exchange_authorization_code", "Entra callback handler", centralRoot);
requireIncludes("core/v1_routes.py", "customer-entra", "Entra route registered", centralRoot);

requireIncludes("src/api/entraAuthClient.js", "startEntraSignIn", "Entra web client");
requireIncludes("src/pages/website/Login.jsx", "Sign in with Microsoft", "Entra login UI");
requireIncludes("src/api/stripeClient.js", "createInvoiceCheckout", "invoice checkout client");
requireIncludes("src/pages/portal/PortalInvoiceDetail.jsx", "createInvoiceCheckout", "invoice pay UI");
requireIncludes("src/pages/portal/PortalBilling.jsx", "createPortalBillingPortal", "billing portal UI");
requireIncludes("src/pages/portal/PortalBilling.jsx", "payInvoice", "billing list pay action");

requireIncludes("src/api/m365Client.js", "listSharePointFolderItems", "SharePoint client");
requireIncludes("src/pages/portal/PortalFiles.jsx", "SharePoint governed library", "SharePoint files bridge");

requireIncludes("src/api/commsClient.js", "enqueueTransactionalEmail", "transactional email client");
requireIncludes("src/pages/portal/PortalMessages.jsx", "enqueueTransactionalEmail", "messages email enqueue");

const guide = read("docs/FOUNDER_COMPLETION_GUIDE.md");
if (!guide.includes("in-house") && !guide.includes("Auricrux-Central")) {
  fail("founder guide documents Central integrations");
} else {
  pass("founder guide documents Central integrations");
}

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "cycle3-completion-report.json"),
  JSON.stringify({
    generatedAt: new Date().toISOString(),
    cycle: 3,
    complete: failed === 0,
    failed,
    findings,
  }, null, 2),
);

if (failed > 0) {
  console.error(`Cycle 3 incomplete (${failed} failures).`);
  process.exit(1);
}

console.log(`Cycle 3 complete — ${findings.length} checks passed (100%).`);
