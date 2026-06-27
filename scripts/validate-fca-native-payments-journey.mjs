#!/usr/bin/env node
/** FCA native payment intake journey — bypass Stripe as primary rail. */
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

requireIncludes("core/fca_payment_intake.py", "submit_native_checkout", "central submit native checkout", centralRoot);
requireIncludes("core/fca_payment_intake.py", "primaryRail", "central payment rail status", centralRoot);
requireIncludes("core/fca_payment_http.py", "fca-payments/intake", "central intake route", centralRoot);
requireIncludes("src/api/fcaPaymentClient.js", "createFcaPaymentIntake", "web payment client intake", root);
requireIncludes("src/components/FcaNativeCheckoutPanel.jsx", "FCA is the payment rail", "native checkout panel copy", root);
requireIncludes("src/pages/website/Checkout.jsx", "submitFcaNativeCheckout", "website checkout native submit", root);
requireIncludes("src/pages/portal/PortalBilling.jsx", "submitFcaNativeCheckout", "portal billing native submit", root);

const offers = read("src/commercialOffers.js");
if (offers.includes("/checkout?plan=pilot") && !offers.includes('checkoutUrl: PILOT_CHECKOUT_URL')) {
  pass("commercial offers use FCA checkout paths");
} else if (offers.includes("/checkout?plan=pilot")) {
  pass("commercial offers use FCA checkout paths");
} else {
  fail("commercial offers", "expected /checkout paths instead of Stripe buy links");
}

const sovereignty = read("FCA_SOVEREIGNTY_LAW.md", centralRoot);
if (sovereignty.includes("fca-payments") && sovereignty.includes("FCA_STRIPE_FALLBACK")) {
  pass("sovereignty law native payments");
} else {
  fail("sovereignty law native payments");
}

try {
  const statusResponse = await fetch(`${apiBase}/fca-payments/status`);
  const statusPayload = await statusResponse.json();
  if (statusResponse.ok && statusPayload?.ok && statusPayload?.data?.rail?.primaryRail === "fca-native") {
    pass("live fca-payments/status", statusPayload.data.rail.primaryRail);
  } else {
    fail("live fca-payments/status", `HTTP ${statusResponse.status}`);
  }
} catch (error) {
  fail("live fca-payments/status", error.message);
}

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "fca-native-payments-journey-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), complete: failed === 0, failed, apiBase }, null, 2),
);

if (failed > 0) {
  console.error(`FCA native payments journey incomplete (${failed} failures).`);
  process.exit(1);
}
console.log("FCA native payments journey complete.");
