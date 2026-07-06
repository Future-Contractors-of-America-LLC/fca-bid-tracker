#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { resolveCentralRoot } from "./lib/fcaCentralRoot.mjs";

const root = process.cwd();
const centralRoot = resolveCentralRoot(root);

function readSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

function walkFiles(dir, extensions, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, extensions, out);
      continue;
    }
    if (entry.isFile() && extensions.includes(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

function anyToken(text, tokens) {
  return tokens.some((token) => text.includes(token));
}

function allToken(text, tokens) {
  return tokens.every((token) => text.includes(token));
}

const srcFiles = walkFiles(path.join(root, "src"), [".js", ".jsx", ".md"]);
const apiFiles = walkFiles(path.join(root, "api"), [".js", ".md"]);
const docsFiles = walkFiles(path.join(root, "docs"), [".md", ".json"]);
const centralFiles = walkFiles(centralRoot, [".py", ".md"]);

const routesText = readSafe(path.join(root, "src", "routes.js"));
const srcText = srcFiles.map((filePath) => readSafe(filePath)).join("\n");
const apiText = apiFiles.map((filePath) => readSafe(filePath)).join("\n");
const docsText = docsFiles.map((filePath) => readSafe(filePath)).join("\n");
const centralText = centralFiles.map((filePath) => readSafe(filePath)).join("\n");

const auricruxAssistTokens = [
  "submitAuricruxAction",
  "useAuricruxLiveInsight",
  "PortalSliceAuricrux",
  "AuricruxInsightPanel",
  "/portal/auricrux",
];

const capabilityChecks = [
  {
    id: "pipeline-bid-estimate-proposal",
    routeTokens: ["/portal/pipeline", "/portal/bids", "/portal/estimates", "/portal/proposals"],
    productTokens: ["runQualify", "mutateWorkflowBid", "advanceEstimate", "advanceProposal", "markWonAndCreateProject"],
    apiTokens: ["/api/leads", "/api/bids", "/api/estimates", "/api/proposals"],
  },
  {
    id: "project-delivery-execution",
    routeTokens: ["/portal/projects", "/portal/files", "/portal/rfis", "/portal/change-orders", "/portal/scheduling", "/portal/field-tasks", "/portal/closeout", "/portal/warranty"],
    productTokens: ["PortalProjects", "PortalFiles", "PortalRfis", "PortalChangeOrders", "PortalScheduling", "PortalFieldTasks", "PortalCloseout", "PortalWarranty"],
    apiTokens: ["/api/projects", "/api/files", "/api/change-orders", "/api/field-tasks", "/api/closeout-packages", "/api/warranty-cases"],
  },
  {
    id: "design-bim-cad",
    routeTokens: ["/portal/design", "/portal/plans", "/portal/immersive"],
    productTokens: ["runBimClashDetection", "createDesignMarkup", "compareRevisions", "fetchFcamStream", "exportFcaNativePackage", "isConstructionDesignFile"],
    apiTokens: ["designWorkspaceClient", "/design/export", "/design/cad", "/design/bim"],
  },
  {
    id: "finance-and-accounting",
    routeTokens: ["/portal/billing", "/portal/finance", "/portal/job-cost"],
    productTokens: ["recordNativePayment", "createRecurringInvoice", "generatePayAppDocument", "fetchReportExport", "submitFcaNativeCheckout"],
    apiTokens: ["/api/billing-summary", "/api/pay-apps", "/api/job-cost", "/api/fca-payments/intake"],
  },
  {
    id: "m365-collaboration",
    routeTokens: ["/portal/files", "/portal/legal", "/portal/messages"],
    productTokens: ["fetchM365Status", "listSharePointFolderItems", "uploadSharePointFile", "startEntraSignIn", "enqueueTransactionalEmail"],
    apiTokens: ["/api/m365/status", "/api/m365/sharepoint/folder", "/api/m365/sharepoint/upload", "/api/customer-entra"],
  },
];

function evaluateCapability(capability) {
  const routeOk = allToken(routesText, capability.routeTokens);
  const productOk = allToken(srcText, capability.productTokens);
  const apiOk = allToken(srcText + "\n" + apiText + "\n" + centralText, capability.apiTokens);
  const assistOk = anyToken(srcText, auricruxAssistTokens);

  return {
    id: capability.id,
    status: routeOk && productOk && apiOk && assistOk ? "pass" : "fail",
    routeOk,
    productOk,
    apiOk,
    assistOk,
  };
}

const capabilityResults = capabilityChecks.map(evaluateCapability);
const capabilityMap = Object.fromEntries(capabilityResults.map((item) => [item.id, item]));

const platformStatements = [
  {
    name: "PlanHub",
    benchmarkTokens: ["PlanHub"],
    requires: ["pipeline-bid-estimate-proposal", "project-delivery-execution"],
  },
  {
    name: "Procore",
    benchmarkTokens: ["Procore"],
    requires: ["project-delivery-execution", "finance-and-accounting", "m365-collaboration"],
  },
  {
    name: "BuildingConnected/Construction Cloud/Revit/AutoCAD",
    benchmarkTokens: ["BuildingConnected", "Construction Cloud", "Revit", "AutoCAD"],
    requires: ["pipeline-bid-estimate-proposal", "design-bim-cad", "project-delivery-execution"],
  },
  {
    name: "Intuit Enterprise Suite (Construction Edition)",
    benchmarkTokens: ["Intuit", "QuickBooks"],
    requires: ["finance-and-accounting", "project-delivery-execution"],
  },
  {
    name: "Microsoft 365",
    benchmarkTokens: ["Microsoft ecosystem", "M365"],
    requires: ["m365-collaboration", "project-delivery-execution", "finance-and-accounting"],
  },
];

const statementResults = platformStatements.map((statement) => {
  const benchmarkOk = anyToken(docsText + "\n" + centralText, statement.benchmarkTokens);
  const requirements = statement.requires.map((capabilityId) => capabilityMap[capabilityId]);
  const capabilityOk = requirements.every((item) => item?.status === "pass");

  return {
    platform: statement.name,
    status: benchmarkOk && capabilityOk ? "pass" : "fail",
    benchmarkOk,
    capabilityOk,
    requires: statement.requires,
  };
});

const failed = statementResults.filter((result) => result.status === "fail").length;
const report = {
  generatedAt: new Date().toISOString(),
  centralRoot,
  failed,
  statementCount: statementResults.length,
  statements: statementResults,
  capabilities: capabilityResults,
};

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "enterprise-parity-report.json"), JSON.stringify(report, null, 2));

const mdLines = [
  "# Enterprise Parity Report",
  "",
  `- Generated: ${report.generatedAt}`,
  `- Statements checked: ${report.statementCount}`,
  `- Failed: ${report.failed}`,
  "",
  "## Statement Results",
  ...statementResults.map((result) =>
    `- ${result.status.toUpperCase()} ${result.platform} | benchmark:${result.benchmarkOk} capability:${result.capabilityOk}`,
  ),
  "",
  "## Capability Results",
  ...capabilityResults.map((result) =>
    `- ${result.status.toUpperCase()} ${result.id} | route:${result.routeOk} product:${result.productOk} api:${result.apiOk} auricrux:${result.assistOk}`,
  ),
  "",
];

fs.writeFileSync(path.join(outputDir, "enterprise-parity-report.md"), `${mdLines.join("\n")}\n`);

if (failed > 0) {
  console.error("Enterprise parity validation failed.");
  process.exit(1);
}

console.log("Enterprise parity validation passed.");
