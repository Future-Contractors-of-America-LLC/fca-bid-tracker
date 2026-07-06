import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const qcDir = path.join(root, "docs", "qc");
const reportPath = path.join(qcDir, "change-orders-closeout-report.json");

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

ensureIncludes(path.join(root, "src", "pages", "portal", "PortalChangeOrders.jsx"), [
  'activeHref="/portal/change-orders"',
  "usePortalApiLoad",
  "fetchChangeOrders",
  "fetchProjectRfis",
  "fetchFieldTasks",
  "fetchFieldSchedule",
  "routeStateOverlays",
], errors);

ensureIncludes(path.join(root, "src", "pages", "portal", "PortalCloseout.jsx"), [
  'activeHref="/portal/closeout"',
  "usePortalApiLoad",
  "fetchCloseoutPackages",
  "fetchWarrantyCases",
  "fetchChangeOrders",
  "fetchFinancialWorkspace",
  "routeStateOverlays",
], errors);

const report = {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  modules: ["/portal/change-orders", "/portal/closeout"],
  checks: {
    changeOrdersApiAndWorkflowCoverage: errors.filter((item) => item.includes("PortalChangeOrders")).length === 0,
    closeoutApiAndWorkflowCoverage: errors.filter((item) => item.includes("PortalCloseout")).length === 0,
  },
  errors,
};

if (!fs.existsSync(qcDir)) {
  fs.mkdirSync(qcDir, { recursive: true });
}
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (errors.length > 0) {
  console.error("Change-orders/closeout validation failed:");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log("Change-orders/closeout validation passed.");
console.log(`Report written: ${path.relative(root, reportPath).replace(/\\/g, "/")}`);
