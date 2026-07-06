import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const qcDir = path.join(root, "docs", "qc");
const reportPath = path.join(qcDir, "estimates-files-report.json");

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function ensureIncludes(filePath, markers, errors) {
  const source = read(filePath);
  for (const marker of markers) {
    if (!source.includes(marker)) {
      errors.push(`${path.relative(root, filePath).replace(/\\/g, "/")} missing marker: ${marker}`);
    }
  }
}

const errors = [];

ensureIncludes(path.join(root, "src", "pages", "portal", "PortalEstimates.jsx"), [
  'activeHref="/portal/estimates"',
  "usePortalApiLoad",
  "fetchJobCosts",
  "fetchWorkflowFiles",
  "fetchWorkflowAudit",
  "createInvoiceFromEstimate",
  "routeStateOverlays",
], errors);

ensureIncludes(path.join(root, "src", "pages", "portal", "PortalFiles.jsx"), [
  'activeHref="/portal/files"',
  "usePortalApiLoad",
  "useWorkflowEvidence",
  "fetchSharePointDriveStatus",
  "fetchProjectRfis",
  "fetchChangeOrders",
  "routeStateOverlays",
], errors);

const report = {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  modules: ["/portal/estimates", "/portal/files"],
  checks: {
    estimatesApiAndWorkflowCoverage: errors.filter((item) => item.includes("PortalEstimates")).length === 0,
    filesApiAndWorkflowCoverage: errors.filter((item) => item.includes("PortalFiles")).length === 0,
  },
  errors,
};

if (!fs.existsSync(qcDir)) {
  fs.mkdirSync(qcDir, { recursive: true });
}

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (errors.length > 0) {
  console.error("Estimates/files validation failed:");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log("Estimates/files validation passed.");
console.log(`Report written: ${path.relative(root, reportPath).replace(/\\/g, "/")}`);
