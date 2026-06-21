#!/usr/bin/env node
/**
 * Bounded runtime smoke for Auricrux Central spine endpoints.
 * Safe for CI: recommend mode only (no execute mutations).
 */
import fs from "node:fs";
import path from "node:path";

const API_BASE = process.env.FCA_API_BASE || "https://auricrux-central.azurewebsites.net";
const outputDir = path.join(process.cwd(), "docs", "qc");
const findings = [];
let failed = 0;

function pass(label, detail = "") {
  findings.push({ status: "pass", label, detail });
  console.log(`PASS: ${label}${detail ? ` — ${detail}` : ""}`);
}

function fail(label, detail = "") {
  failed += 1;
  findings.push({ status: "fail", label, detail });
  console.error(`FAIL: ${label}${detail ? ` — ${detail}` : ""}`);
}

async function getJson(route) {
  const response = await fetch(`${API_BASE}${route}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { response, body };
}

async function postJson(route, payload) {
  const response = await fetch(`${API_BASE}${route}`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }
  return { response, body };
}

const getChecks = [
  "/api/health",
  "/api/auricrux-comms",
  "/api/change-orders",
  "/api/job-cost",
  "/api/warranty-cases",
  "/api/field-photos",
  "/api/auricrux/actions",
];

for (const route of getChecks) {
  try {
    const { response } = await getJson(route);
    if (response.ok) pass(`GET ${route}`, `HTTP ${response.status}`);
    else fail(`GET ${route}`, `HTTP ${response.status}`);
  } catch (error) {
    fail(`GET ${route}`, error.message);
  }
}

try {
  const { response } = await getJson("/api/files/FILE-SMOKE-NO-MANIFEST/manifest");
  if (response?.status === 404) pass("GET manifest missing file", "HTTP 404 honest not-found");
  else fail("GET manifest missing file", `expected 404, got ${response?.status ?? "no response"}`);
} catch (error) {
  fail("GET manifest missing file", error.message);
}

try {
  const { response, body } = await postJson("/api/auricrux/actions", {
    mode: "recommend",
    targetObjectType: "Project",
    targetObjectId: "PRJ-SMOKE-001",
    rationale: "Bounded spine smoke recommend probe — no execute mutations.",
    sourceRoute: "/portal/platform",
  });
  const guidance = body?.data?.guidance || body?.guidance;
  if (response.ok && (guidance?.reply || body?.ok)) {
    pass("POST /api/auricrux/actions recommend", "guidance returned");
  } else {
    fail("POST /api/auricrux/actions recommend", `HTTP ${response.status}`);
  }
} catch (error) {
  fail("POST /api/auricrux/actions recommend", error.message);
}

try {
  const { response, body } = await getJson("/api/field-photos?projectId=PRJ-SMOKE-001&intelligence=1");
  const intelligence = body?.data;
  if (response.ok && body?.ok && intelligence?.projectId) {
    pass("GET field intelligence via field-photos", `projectId=${intelligence.projectId}`);
  } else {
    fail("GET field intelligence via field-photos", `HTTP ${response.status}`);
  }
} catch (error) {
  fail("GET field intelligence via field-photos", error.message);
}

fs.mkdirSync(outputDir, { recursive: true });
const report = {
  generatedAt: new Date().toISOString(),
  apiBase: API_BASE,
  summary: { passed: findings.filter((f) => f.status === "pass").length, failed },
  findings,
};
fs.writeFileSync(path.join(outputDir, "central-spine-smoke.json"), JSON.stringify(report, null, 2));

console.log(`\n=== Central spine smoke: ${report.summary.passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
