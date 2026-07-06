import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const qcDir = path.join(root, "docs", "qc");
const reportPath = path.join(qcDir, "command-tower-decision-queue-legal-report.json");

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

ensureIncludes(path.join(root, "src", "api", "moduleCapabilityClient.js"), [
  "probeCommandTowerCapability",
  "probeDecisionQueueCapability",
  "probeLegalCapability",
  "centralFetch",
], errors);

ensureIncludes(path.join(root, "src", "pages", "portal", "PortalCommandTower.jsx"), [
  'from "../../api/moduleCapabilityClient"',
  "probeCommandTowerCapability()",
  "API spine:",
  'activeHref="/portal/command-tower"',
], errors);

ensureIncludes(path.join(root, "src", "pages", "portal", "PortalDecisionQueue.jsx"), [
  'from "../../api/moduleCapabilityClient"',
  "probeDecisionQueueCapability()",
  "API spine:",
  'activeHref="/portal/decision-queue"',
], errors);

ensureIncludes(path.join(root, "src", "pages", "portal", "PortalLegal.jsx"), [
  'from "../../api/moduleCapabilityClient"',
  "probeLegalCapability()",
  "API spine:",
  'activeHref="/portal/legal"',
], errors);

const report = {
  generatedAt: new Date().toISOString(),
  ok: errors.length === 0,
  modules: ["/portal/command-tower", "/portal/decision-queue", "/portal/legal"],
  checks: {
    apiProbeClient: errors.filter((item) => item.includes("moduleCapabilityClient")).length === 0,
    commandTowerWiring: errors.filter((item) => item.includes("PortalCommandTower")).length === 0,
    decisionQueueWiring: errors.filter((item) => item.includes("PortalDecisionQueue")).length === 0,
    legalWiring: errors.filter((item) => item.includes("PortalLegal")).length === 0,
  },
  errors,
};

if (!fs.existsSync(qcDir)) {
  fs.mkdirSync(qcDir, { recursive: true });
}
fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

if (errors.length > 0) {
  console.error("Command-tower/decision-queue/legal validation failed:");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log("Command-tower/decision-queue/legal validation passed.");
console.log(`Report written: ${path.relative(root, reportPath).replace(/\\/g, "/")}`);
