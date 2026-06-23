#!/usr/bin/env node
/**
 * Bounded runtime smoke for Auricrux Central spine endpoints.
 * Safe for CI: recommend mode only (no execute mutations).
 */
import fs from "node:fs";
import path from "node:path";
import { FCA_API_ORIGIN, FCA_AZURE_API_FALLBACK_ORIGIN } from "./domainHosts.constants.mjs";

const outputDir = path.join(process.cwd(), "docs", "qc");
const findings = [];
let failed = 0;
let API_BASE = process.env.FCA_API_BASE || "";

async function resolveApiBase() {
  if (API_BASE) return API_BASE;
  for (const candidate of [FCA_API_ORIGIN, FCA_AZURE_API_FALLBACK_ORIGIN]) {
    try {
      const response = await fetch(`${candidate}/api/health`, { headers: { Accept: "application/json" } });
      if (response.ok) {
        API_BASE = candidate;
        return API_BASE;
      }
    } catch {
      // try next candidate
    }
  }
  API_BASE = FCA_AZURE_API_FALLBACK_ORIGIN;
  return API_BASE;
}

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

await resolveApiBase();
console.log(`Using API base: ${API_BASE}`);

const getChecks = [
  "/api/health",
  "/api/auricrux-comms",
  "/api/change-orders",
  "/api/job-cost",
  "/api/warranty-cases",
  "/api/field-photos",
  "/api/auricrux/actions",
  "/api/customer-auth-state",
  "/api/academy-commerce?limit=1",
  "/api/commercial-pipeline",
];

const detailChecks = [
  { route: "/api/projects/PRJ-SMOKE-001", allowStatuses: [200, 404] },
  { route: "/api/opportunities/LEAD-SMOKE-001", allowStatuses: [200, 404] },
  { route: "/api/portal-invoices/INV-SMOKE-001", allowStatuses: [200, 404] },
];

for (const route of getChecks) {
  if (route === "/api/customer-auth-state") continue;
  try {
    const { response } = await getJson(route);
    if (response.ok) pass(`GET ${route}`, `HTTP ${response.status}`);
    else fail(`GET ${route}`, `HTTP ${response.status}`);
  } catch (error) {
    fail(`GET ${route}`, error.message);
  }
}

try {
  const { response, body } = await getJson("/api/customer-auth-state");
  const boundary = body?.authBoundary;
  if (!response.ok) {
    fail("GET /api/customer-auth-state", `HTTP ${response.status}`);
  } else if (boundary?.productionAuthReady && boundary?.activeMode === "managed-server-session") {
    pass("GET /api/customer-auth-state", "productionAuthReady=true");
  } else {
    fail(
      "GET /api/customer-auth-state",
      `expected productionAuthReady=true, got productionAuthReady=${boundary?.productionAuthReady}, activeMode=${boundary?.activeMode}`,
    );
  }
} catch (error) {
  fail("GET /api/customer-auth-state", error.message);
}

for (const { route, allowStatuses } of detailChecks) {
  try {
    const { response, body } = await getJson(route);
    if (allowStatuses.includes(response.status) && response.status !== 500) {
      pass(`GET ${route}`, `HTTP ${response.status}`);
    } else if (response.status === 500 && body?.error?.includes("missing 1 required positional argument")) {
      fail(`GET ${route}`, "route handler context dispatch bug (deploy v1_routes fix)");
    } else {
      fail(`GET ${route}`, `HTTP ${response.status}`);
    }
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
