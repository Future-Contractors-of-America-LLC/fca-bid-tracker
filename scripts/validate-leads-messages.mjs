import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const qcDir = path.join(root, "docs", "qc");
const reportPath = path.join(qcDir, "leads-messages-report.json");

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

ensureIncludes(path.join(root, "src", "pages", "portal", "PortalLeads.jsx"), [
  'activeHref="/portal/leads"',
  "PortalApiStatusBanner",
  "fetchPortalLeads",
  "qualifyPortalLead",
  "executeLeadWonHandoff",
  "routeStateOverlays",
], errors);

ensureIncludes(path.join(root, "src", "pages", "portal", "PortalMessages.jsx"), [
  'activeHref="/portal/messages"',
  "PortalApiStatusBanner",
  "fetchPortalMessages",
  "sendPortalMessage",
  "createWorkflowAuditEvent",
  "routeStateOverlays",
], errors);

const report = {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  modules: ["/portal/leads", "/portal/messages"],
  checks: {
    leadsApiAndWorkflowCoverage: errors.filter((item) => item.includes("PortalLeads")).length === 0,
    messagesApiAndWorkflowCoverage: errors.filter((item) => item.includes("PortalMessages")).length === 0,
  },
  errors,
};

if (!fs.existsSync(qcDir)) {
  fs.mkdirSync(qcDir, { recursive: true });
}

fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (errors.length > 0) {
  console.error("Leads/messages validation failed:");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log("Leads/messages validation passed.");
console.log(`Report written: ${path.relative(root, reportPath).replace(/\\/g, "/")}`);
