import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const qcDir = path.join(root, "docs", "qc");
const reportPath = path.join(qcDir, "hiring-job-cost-report.json");

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

ensureIncludes(path.join(root, "src", "pages", "portal", "PortalHiring.jsx"), [
  'activeHref="/portal/hiring"',
  "usePortalApiLoad",
  "fetchWorkflowProjects",
  "fetchFieldTasks",
  "fetchFieldSchedule",
  "fetchAcademyLms",
  "routeStateOverlays",
], errors);

ensureIncludes(path.join(root, "src", "pages", "portal", "PortalJobCost.jsx"), [
  'activeHref="/portal/job-cost"',
  "usePortalApiLoad",
  "fetchJobCosts",
  "postJobCostActual",
  "fetchChangeOrders",
  "fetchPortalInvoices",
  "routeStateOverlays",
], errors);

const report = {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  modules: ["/portal/hiring", "/portal/job-cost"],
  checks: {
    hiringApiAndWorkflowCoverage: errors.filter((item) => item.includes("PortalHiring")).length === 0,
    jobCostApiAndWorkflowCoverage: errors.filter((item) => item.includes("PortalJobCost")).length === 0,
  },
  errors,
};

if (!fs.existsSync(qcDir)) {
  fs.mkdirSync(qcDir, { recursive: true });
}

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (errors.length > 0) {
  console.error("Hiring/job-cost validation failed:");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log("Hiring/job-cost validation passed.");
console.log(`Report written: ${path.relative(root, reportPath).replace(/\\/g, "/")}`);
