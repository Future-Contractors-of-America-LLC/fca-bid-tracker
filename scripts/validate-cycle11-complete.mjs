#!/usr/bin/env node
/** Cycle 11 completion gate - FCA native payments, sovereignty, build proof. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const centralRoot = path.resolve(root, "..", "auricrux-central-work");
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

for (const script of [
  "validate-fca-sovereignty.mjs",
  "validate-fca-native-payments-journey.mjs",
]) {
  const result = spawnSync(process.execPath, [path.join(root, "scripts", script)], { encoding: "utf8" });
  if (result.status === 0) pass(`regression: ${script}`);
  else fail(`regression: ${script}`, (result.stderr || result.stdout || "").slice(0, 240));
}

const buildResult = spawnSync("npm", ["run", "build"], { cwd: root, encoding: "utf8", shell: true });
if (buildResult.status === 0) pass("production build");
else fail("production build", (buildResult.stderr || buildResult.stdout || "").slice(0, 300));

const matrix = read("FCA_COVERAGE_MATRIX.md", centralRoot);
if (matrix.includes("Cycle 11 closed gaps") && matrix.includes("fca-payments")) {
  pass("coverage matrix cycle 11");
} else {
  fail("coverage matrix cycle 11");
}

try {
  const intakeResponse = await fetch(`${apiBase}/fca-payments/intake`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      planKey: "startup",
      email: "cycle11-qc@futurecontractorsofamerica.com",
      company: "FCA QC",
      contactName: "Cycle 11 Gate",
    }),
  });
  const intakePayload = await intakeResponse.json();
  const intakeId = intakePayload?.data?.intake?.intakeId;
  if (!intakeResponse.ok || !intakeId) {
    fail("live fca-payments/intake", `HTTP ${intakeResponse.status}`);
  } else {
    pass("live fca-payments/intake", intakeId);
    const checkoutResponse = await fetch(`${apiBase}/fca-payments/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ intakeId, method: "ACH", reference: "CYCLE11-QC" }),
    });
    const checkoutPayload = await checkoutResponse.json();
    if (checkoutResponse.ok && checkoutPayload?.data?.intake?.status === "completed") {
      pass("live fca-payments/checkout");
    } else {
      fail("live fca-payments/checkout", `HTTP ${checkoutResponse.status}`);
    }
  }
} catch (error) {
  fail("live fca-payments flow", error.message);
}

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "cycle11-completion-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), cycle: 11, complete: failed === 0, failed, apiBase }, null, 2),
);

if (failed > 0) {
  console.error(`Cycle 11 incomplete (${failed} failures).`);
  process.exit(1);
}
console.log("Cycle 11 complete - 100%.");
