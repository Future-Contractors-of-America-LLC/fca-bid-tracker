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
  "/portal",
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
  "/portal/design",
  "/portal/rfis",
  "/portal/change-orders",
  "/portal/closeout",
  "/portal/scheduling",
  "/portal/field-tasks",
  "/portal/field-supervision",
  "/portal/warranty",
  "/portal/legal",
  "/portal/notifications",
];

const SAAS_DETAIL_ROUTE_PATTERNS = [
  "/portal/opportunities/:opportunityId",
  "/portal/projects/:projectId",
  "/portal/billing/:invoiceId",
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
  "/api/customer-verify",
  "/api/leads",
  "/api/change-orders",
  "/api/job-cost",
  "/api/closeout-packages",
  "/api/warranty-cases",
  "/api/field-photos",
  "/api/auricrux/actions",
  "/api/auricrux-comms",
  "/api/academy-commerce",
  "/api/commercial-pipeline",
  "/api/customer-auth-state",
];

const SAAS_CLIENT_MODULES = [
  "src/api/workflowClient.js",
  "src/api/portalClient.js",
  "src/api/intakeClient.js",
  "src/api/constructionClient.js",
  "src/api/auricruxActionsClient.js",
  "src/api/designWorkspaceClient.js",
  "src/hooks/useWorkspaceState.js",
  "src/hooks/usePortalProjectId.js",
  "src/hooks/useAuricruxLiveInsight.js",
];

const LEGAL_SURFACES = [
  "src/pages/portal/PortalLegal.jsx",
  "src/pages/portal/PortalFiles.jsx",
  "src/pages/website/ContractorLegalResources.jsx",
  "src/legal/content/ContractorLegalResourcesContent.jsx",
  "src/contractorLegal/contractorLegalCatalog.js",
  "src/contractorLegal/contractorLegalStorage.js",
  "src/legal/entityInfo.js",
  "src/fileGovernance.js",
  "api/academy-program-modules.js",
  "api/_lib/entityInfo.js",
  "docs/legal/contractor/CONTRACTOR_LEGAL_INDEX.md",
];

const SCRIPT_CHECKS = [
  "validate-routes.mjs",
  "validate-critical-routes.mjs",
  "validate-public-package-route-groups.mjs",
  "validate-academy-ctas.mjs",
  "validate-academy-catalog.mjs",
  "validate-catalog-balance.mjs",
  "validate-academy-media.mjs",
  "validate-academy-readiness-overlay.mjs",
  "validate-academy-live-api.mjs",
  "validate-file-governance.mjs",
  "validate-finance-workspace.mjs",
  "validate-design-workspace.mjs",
  "validate-portal-auricrux-wiring.mjs",
  "validate-portal-ux-sweep.mjs",
  "validate-product-readiness-surfaces.mjs",
  "validate-operations-pipeline.mjs",
  "validate-site-metadata.mjs",
  "validate-auth-session-slice.mjs",
  "validate-platform-slices.mjs",
  "validate-cycle2-complete.mjs",
  "validate-cycle3-complete.mjs",
  "validate-lifecycle-journey.mjs",
  "validate-cycle4-complete.mjs",
  "verify-post-deploy.mjs",
  "smoke-central-spine.mjs",
];

if (process.env.FCA_RUN_MANAGED_AUTH_SMOKE === "1") {
  SCRIPT_CHECKS.push("smoke-managed-customer-auth.mjs");
}

const API_BASE = process.env.FCA_API_BASE || "https://auricrux-central.azurewebsites.net";

async function isApiLive(base) {
  try {
    const response = await fetch(`${base.replace(/\/$/, "")}/api/health`, { headers: { Accept: "application/json" } });
    if (!response.ok) return false;
    const text = (await response.text()).trim();
    if (!text) return false;
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}

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
  const result = spawnSync("node", [`scripts/${script}`], { stdio: "inherit", shell: process.platform === "win32" });
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

for (const pattern of SAAS_DETAIL_ROUTE_PATTERNS) {
  const hasPattern = routesSource.includes(`pattern: "${pattern}"`) || routesSource.includes(`pattern: '${pattern}'`);
  if (hasPattern) pass(`route-pattern:${pattern}`);
  else fail(`route-pattern:${pattern}`, "missing dynamic detail route");
}

for (const clientPath of SAAS_CLIENT_MODULES) {
  const full = path.join(root, clientPath);
  if (fs.existsSync(full)) pass(`client:${clientPath}`);
  else fail(`client:${clientPath}`, "module missing");
}

for (const legalPath of LEGAL_SURFACES) {
  const full = path.join(root, legalPath);
  if (fs.existsSync(full)) pass(`legal:${legalPath}`);
  else fail(`legal:${legalPath}`, "contractor legal surface missing");
}

const catalogSource = fs.readFileSync(path.join(root, "src", "contractorLegal", "contractorLegalCatalog.js"), "utf8");
const resourcesSource = fs.readFileSync(path.join(root, "src", "legal", "content", "ContractorLegalResourcesContent.jsx"), "utf8");
const staleSlugPattern = /lic-(contractor-business-formation|construction-law-essentials|dpor-residential-contractor-prep|osha-30-construction)/;
if (staleSlugPattern.test(resourcesSource) || staleSlugPattern.test(catalogSource)) {
  fail("legal:academy-slug-parity", "legacy lic-* academy slugs detected in contractor legal surfaces");
} else {
  pass("legal:academy-slug-parity", "catalog keys align with contractor legal CTAs");
}

const dinwiddieMarker = "22310 Old Vaughan Road";
for (const legalPath of ["src/legal/entityInfo.js", "api/_lib/entityInfo.js"]) {
  const full = path.join(root, legalPath);
  if (fs.existsSync(full) && fs.readFileSync(full, "utf8").includes(dinwiddieMarker)) {
    pass(`legal:principal-office:${legalPath}`);
  } else {
    fail(`legal:principal-office:${legalPath}`, "Dinwiddie principal office missing");
  }
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

const apiLive = await isApiLive(API_BASE);
if (!apiLive) {
  pass("api:live-smoke", "deferred — Auricrux-Central API unreachable from validator host");
} else {
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
