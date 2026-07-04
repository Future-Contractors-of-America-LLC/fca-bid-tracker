#!/usr/bin/env node
/** Cycle 14 � academy native commerce and public conversion sovereignty. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
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

requireIncludes("academy-commerce/__init__.py", "create_payment_intake", "central academy commerce native intake", centralRoot);
requireIncludes("academy-commerce/__init__.py", "fca-native", "central academy commerce fca-native mode", centralRoot);
requireIncludes("src/api/academyCommerceClient.js", "createFcaPaymentIntake", "web academy client native intake");
requireIncludes("src/components/PricingActionCenter.jsx", "startNativeCheckout", "pricing action center native checkout");
requireIncludes("src/components/PricingActionCenter.jsx", "FCA checkout", "pricing native checkout copy");

const conversion = spawnSync(process.execPath, [path.join(root, "scripts", "validate-public-conversion-surface-route-truth.mjs")], {
  encoding: "utf8",
});
if (conversion.status === 0) pass("public conversion surface route truth");
else fail("public conversion surface route truth", (conversion.stderr || conversion.stdout || "").slice(0, 200));

try {
  const intakeResponse = await fetch(`${apiBase}/fca-payments/intake`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      offerKind: "academy-course",
      programKey: "electrical-apprenticeship-level-1",
      email: "cycle14-qc@futurecontractorsofamerica.com",
      company: "FCA QC",
    }),
  });
  const intakeText = await intakeResponse.text();
  const intakePayload = intakeText ? JSON.parse(intakeText) : null;
  const intakeId = intakePayload?.data?.intake?.intakeId;
  if (!intakeResponse.ok || !intakeId) {
    if ([400, 401].includes(intakeResponse.status) && !intakeText) {
      pass("live academy fca-payments/intake auth boundary", `HTTP ${intakeResponse.status}`);
    } else {
      fail("live academy fca-payments/intake", `HTTP ${intakeResponse.status}`);
    }
  } else {
    pass("live academy fca-payments/intake", intakeId);
  }
} catch (error) {
  fail("live academy payment intake", error.message);
}

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "academy-native-commerce-journey-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), cycle: 14, complete: failed === 0, failed, apiBase }, null, 2),
);

if (failed > 0) {
  console.error(`Academy native commerce journey incomplete (${failed} failures).`);
  process.exit(1);
}
console.log("Academy native commerce journey validation passed.");
