#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");

const matrixPath = "FCA_COVERAGE_MATRIX.md";
const routesPath = "src/routes.js";
const shellPaths = ["src/websiteShell.js", "src/portalShell.js", "src/workspaceState.js"];

function collectText(paths) {
  return paths.map((p) => read(p)).join("\n");
}

const matrix = read(matrixPath);
const routes = read(routesPath);
const shell = collectText(shellPaths);

const connectorFiles = fs
  .readdirSync(path.join(root, "src", "api"))
  .filter((name) => name.endsWith(".js"))
  .map((name) => path.join("src", "api", name));
const connectors = collectText(connectorFiles);

function walkApiJs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkApiJs(full));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".js")) files.push(full);
  }
  return files;
}

const apiFiles = walkApiJs(path.join(root, "api"));
const apiText = apiFiles
  .map((p) => fs.readFileSync(p, "utf8"))
  .join("\n");

const capabilities = [
  {
    name: "lead-opportunity",
    matrixTerms: ["Lead / Opportunity"],
    routeHints: ["/portal/leads", "/portal/pipeline", "/portal/opportunities/:opportunityId"],
    connectorHints: ["/api/leads", "/api/opportunities/", "portalLeadsClient"],
    apiHints: ["leads", "opportunities-workspace", "opportunity-convert"],
  },
  {
    name: "bid-estimate-proposal-award",
    matrixTerms: ["Bid / Estimate", "Proposal", "Award"],
    routeHints: ["/portal/bids", "/portal/estimates", "/portal/proposals"],
    connectorHints: ["/api/bids", "/api/estimates", "/api/proposals", "mutateWorkflowBid"],
    apiHints: ["bids", "estimates", "proposals", "opportunity-convert"],
  },
  {
    name: "project-setup",
    matrixTerms: ["Project Setup"],
    routeHints: ["/portal/projects", "/portal/projects/:projectId"],
    connectorHints: ["/api/projects", "/api/projects/", "fetchProjectWorkspace"],
    apiHints: ["projects-workspace", "project-detail"],
  },
  {
    name: "document-control",
    matrixTerms: ["Document Control (Plans / Specs)"],
    routeHints: ["/portal/files", "/portal/design"],
    connectorHints: ["/api/files", "designWorkspaceClient", "legal-workspace"],
    apiHints: ["files", "files-summary"],
  },
  {
    name: "takeoff-rfi-redline",
    matrixTerms: ["Takeoff / Quantity", "RFIs / Redlines"],
    routeHints: ["/portal/rfis", "/portal/design"],
    connectorHints: ["/api/projects/", "/rfis", "/takeoffs", "designWorkspaceClient"],
    apiHints: ["project-rfis", "project-takeoffs", "rfi"],
  },
  {
    name: "change-order",
    matrixTerms: ["Change Orders"],
    routeHints: ["/portal/change-orders"],
    connectorHints: ["/api/change-orders", "constructionClient"],
    apiHints: ["change-orders"],
  },
  {
    name: "scheduling-field",
    matrixTerms: ["Scheduling", "Field Execution"],
    routeHints: ["/portal/scheduling", "/portal/field-tasks", "/portal/field-supervision"],
    connectorHints: ["/api/field-schedule", "/api/field-tasks", "/api/field-photos", "fieldOpsClient", "fieldPhotosClient"],
    apiHints: ["field-schedule", "field-tasks", "field-photos"],
  },
  {
    name: "quality-punch-closeout",
    matrixTerms: ["Quality Control", "Punch / Closeout"],
    routeHints: ["/portal/punch", "/portal/closeout", "/portal/audit"],
    connectorHints: ["/api/closeout-packages", "/api/workflow-audit"],
    apiHints: ["closeout-packages", "workflow-audit"],
  },
  {
    name: "billing-payapps-jobcost-accounting",
    matrixTerms: ["Billing / Pay Applications", "Job Cost / Accounting"],
    routeHints: ["/portal/billing", "/portal/finance", "/portal/job-cost"],
    connectorHints: ["/api/billing-summary", "/api/pay-apps", "/api/job-cost", "financialClient", "fcaPaymentClient"],
    apiHints: ["billing-summary", "pay-apps", "job-cost", "finance-store"],
  },
  {
    name: "warranty",
    matrixTerms: ["Warranty / Recurring Work"],
    routeHints: ["/portal/warranty", "/warranty"],
    connectorHints: ["/api/warranty-cases", "/api/fca-warranty/", "warrantyIntakeClient"],
    apiHints: ["warranty-cases", "warranty-store"],
  },
  {
    name: "admin-portal-governance",
    matrixTerms: ["Customer Portal", "Admin Control", "Audit / Governance / Continuity"],
    routeHints: ["/portal/admin", "/portal", "/portal/audit"],
    connectorHints: ["/api/support-tickets", "/api/portal-messages", "/api/workflow-audit", "portalClient"],
    apiHints: ["auth-boundary", "workflow-audit", "support-tickets", "portal-messages"],
  },
  {
    name: "website-conversion",
    matrixTerms: ["Website / Public Conversion"],
    routeHints: ["/platform", "/pricing", "/contact", "/login", "/intake"],
    connectorHints: ["intakeClient", "authClient", "/api/customer-login"],
    apiHints: ["customer-login", "customer-verify"],
  },
];

function hasAny(text, tokens) {
  return tokens.some((token) => text.includes(token));
}

const findings = [];
let failed = 0;

for (const capability of capabilities) {
  const matrixOk = hasAny(matrix, capability.matrixTerms);
  const routeOk = hasAny(routes, capability.routeHints);
  const shellOk = hasAny(shell, capability.routeHints) || hasAny(shell, capability.connectorHints);
  const connectorOk = hasAny(connectors, capability.connectorHints);
  const apiOk = hasAny(apiText, capability.apiHints);

  const ok = matrixOk && (routeOk || shellOk) && (connectorOk || apiOk);
  if (!ok) failed += 1;

  findings.push({
    capability: capability.name,
    status: ok ? "pass" : "fail",
    matrixOk,
    routeOrShellOk: routeOk || shellOk,
    connectorOrApiOk: connectorOk || apiOk,
    matrixTerms: capability.matrixTerms,
  });
}

const report = {
  generatedAt: new Date().toISOString(),
  failed,
  checked: findings.length,
  findings,
};

const outDir = path.join(root, "docs", "qc");
fs.mkdirSync(outDir, { recursive: true });
const jsonPath = path.join(outDir, "matrix-shell-connector-parity-report.json");
const mdPath = path.join(outDir, "matrix-shell-connector-parity-report.md");

fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

const lines = [];
lines.push("# Matrix Shell Connector Parity Report");
lines.push("");
lines.push(`- Generated: ${report.generatedAt}`);
lines.push(`- Checked: ${report.checked}`);
lines.push(`- Failed: ${report.failed}`);
lines.push("");
for (const row of findings) {
  lines.push(`- ${row.status.toUpperCase()} ${row.capability} | matrix:${row.matrixOk} route/shell:${row.routeOrShellOk} connector/api:${row.connectorOrApiOk}`);
}
fs.writeFileSync(mdPath, `${lines.join("\n")}\n`);

if (failed > 0) {
  console.error("Matrix-shell-connector parity validation failed.");
  process.exit(1);
}

console.log("Matrix-shell-connector parity validation passed.");
