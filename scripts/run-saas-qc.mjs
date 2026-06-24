#!/usr/bin/env node
/**
 * SaaS quality control � portal tools, routes, API surfaces, governance.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });

const SAAS_PORTAL_ROUTES = [
  "/portal/platform",
  "/portal/bids",
  "/portal/estimates",
  "/portal/proposals",
  "/portal/projects",
  "/portal/files",
  "/portal/messages",
  "/portal/billing",
  "/portal/support",
  "/portal/admin",
  "/portal/auricrux",
  "/portal/academy",
  "/portal/operations",
  "/portal/pipeline",
  "/portal/audit",
  "/portal/profile",
  "/portal/plans",
  "/portal/finance",
  "/portal/scheduling",
  "/portal/field-tasks",
  "/portal/field-supervision",
  "/portal/warranty",
  "/portal/design",
  "/portal/immersive",
  "/portal/leads",
];

const SAAS_API_ENDPOINTS = [
  "/api/health",
  "/api/bids",
  "/api/projects",
  "/api/files",
  "/api/estimates",
  "/api/proposals",
  "/api/portal-messages",
  "/api/portal-invoices",
  "/api/billing-summary",
  "/api/support-tickets",
  "/api/workflow-audit",
  "/api/academy-lms",
  "/api/customer-login",
];

const SAAS_CLIENT_MODULES = [
  "src/api/workflowClient.js",
  "src/api/portalClient.js",
  "src/api/intakeClient.js",
  "src/api/leadsClient.js",
  "src/api/bidsClient.js",
  "src/hooks/useWorkspaceState.js",
];

const SCRIPT_CHECKS = [
  "validate-routes.mjs",
  "validate-critical-routes.mjs",
  "validate-public-package-route-groups.mjs",
  "validate-academy-ctas.mjs",
  "validate-design-workspace.cjs",
  "validate-immersive-framework.mjs",
  "validate-leads-workspace.cjs",
  "validate-bids-workspace.cjs",
  "validate-bid-workspace.mjs",
];

const API_BASE = process.env.FCA_API_BASE || "https://auricrux-central.azurewebsites.net";

const findings = [];
let passed = 0;
let failed = 0;

function pass(label, detail = "") {
  passed += 1;
  findings.push({ status: "pass", label, detail });
  console.log(`PASS: ${label}${detail ? ` � ${detail}` : ""}`);
}

function fail(label, detail = "") {
  failed += 1;
  findings.push({ status: "fail", label, detail });
  console.error(`FAIL: ${label}${detail ? ` � ${detail}` : ""}`);
}

function warn(label, detail = "") {
  findings.push({ status: "warn", label, detail });
  console.warn(`WARN: ${label}${detail ? ` � ${detail}` : ""}`);
}

for (const script of SCRIPT_CHECKS) {
  const result = spawnSync(process.execPath, [`scripts/${script}`], { stdio: "inherit", shell: false });
  if (result.status === 0) pass(`script:${script}`);
  else fail(`script:${script}`);
}

const routesSource = fs.readFileSync(path.join(root, "src", "routes.js"), "utf8");
const routeMatch = routesSource.match(/export const routes = \{([\s\S]*?)\n\};/);
const routeKeys = routeMatch
  ? [...routeMatch[1].matchAll(/(["'])(\/[^"']*)\1\s*:/g)].map((m) => m[2])
  : [];

for (const portalRoute of SAAS_PORTAL_ROUTES) {
  if (routeKeys.includes(portalRoute)) pass(`route:${portalRoute}`);
  else fail(`route:${portalRoute}`, "missing from routes.js");
}

for (const clientPath of SAAS_CLIENT_MODULES) {
  const full = path.join(root, clientPath);
  if (fs.existsSync(full)) pass(`client:${clientPath}`);
  else fail(`client:${clientPath}`, "module missing");
}

const importPattern = /import\("\.\/pages\/([^"]+)"\)/g;
const imports = [...routesSource.matchAll(importPattern)].map((m) => m[1]);
for (const importPath of imports) {
  const candidates = [
    path.join(root, "src", "pages", `${importPath}.jsx`),
    path.join(root, "src", "pages", `${importPath}.js`),
  ];
  if (candidates.some((c) => fs.existsSync(c))) pass(`page:${importPath}`);
  else fail(`page:${importPath}`, "lazy import target missing");
}

for (const endpoint of SAAS_API_ENDPOINTS) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: endpoint === "/api/customer-login" ? "GET" : "GET",
      headers: { Accept: "application/json" },
    });
    if (response.ok) pass(`api:${endpoint}`, `HTTP ${response.status}`);
    else fail(`api:${endpoint}`, `HTTP ${response.status}`);
  } catch (error) {
    fail(`api:${endpoint}`, error.message);
  }
}

const blueprintSource = fs.readFileSync(path.join(root, "src", "productBlueprint.js"), "utf8");
const blueprintHrefs = [...blueprintSource.matchAll(/href:\s*"(\/[^"]+)"/g)].map((m) => m[1]);
for (const href of blueprintHrefs) {
  if (routeKeys.includes(href) || href === "/warranty" || href === "/portal/warranty") pass(`blueprint:${href}`);
  else warn(`blueprint:${href}`, "href not in SPA routes (may be public static)");
}

const report = {
  generatedAt: new Date().toISOString(),
  scope: "SaaS QC",
  apiBase: API_BASE,
  summary: { passed, failed, warnings: findings.filter((f) => f.status === "warn").length },
  portalRouteCount: SAAS_PORTAL_ROUTES.length,
  apiEndpointCount: SAAS_API_ENDPOINTS.length,
  findings,
};

const md = `# SaaS Quality Control Report

- Generated: ${report.generatedAt}
- API base: ${API_BASE}
- Passed: ${passed}
- Failed: ${failed}
- Warnings: ${report.summary.warnings}

## Portal routes checked
${SAAS_PORTAL_ROUTES.map((r) => `- ${r}`).join("\n")}

## Findings
${findings.map((f) => `- **${f.status.toUpperCase()}** ${f.label}${f.detail ? `: ${f.detail}` : ""}`).join("\n")}
`;

fs.writeFileSync(path.join(outputDir, "saas-qc-report.json"), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outputDir, "saas-qc-report.md"), md);

console.log(`\n=== SaaS QC: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
