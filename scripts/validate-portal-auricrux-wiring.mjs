import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const portalDir = path.join(root, "src", "pages", "portal");

const REQUIRED_INSIGHT_PAGES = [
  "PortalHome.jsx",
  "PortalPipeline.jsx",
  "PortalProjects.jsx",
  "PortalFiles.jsx",
  "PortalRfis.jsx",
  "PortalChangeOrders.jsx",
  "PortalCloseout.jsx",
  "PortalWarranty.jsx",
  "PortalEstimates.jsx",
  "PortalFinance.jsx",
  "PortalProjectDetail.jsx",
  "PortalBilling.jsx",
  "PortalBids.jsx",
  "PortalProposals.jsx",
  "PortalFieldSupervision.jsx",
  "PortalFieldTasks.jsx",
];

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exit(1);
}

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

for (const page of REQUIRED_INSIGHT_PAGES) {
  const source = fs.readFileSync(path.join(portalDir, page), "utf8");
  if (!source.includes("AuricruxInsightPanel")) {
    fail(`${page} must import AuricruxInsightPanel`);
  }
  if (!source.includes("targetObjectId")) {
    fail(`${page} must pass targetObjectId to AuricruxInsightPanel`);
  }
}

const portalSources = fs.readdirSync(portalDir).filter((name) => name.endsWith(".jsx"));
for (const page of portalSources) {
  const source = fs.readFileSync(path.join(portalDir, page), "utf8");
  if (source.includes('"A-117"') || source.includes("'A-117'")) {
    fail(`${page} must not hardcode demo project A-117`);
  }
}

function requireIncludes(file, tokens) {
  const source = read(file);
  for (const token of tokens) {
    if (!source.includes(token)) fail(`${file} missing required token: ${token}`);
  }
}

requireIncludes("src/hooks/usePortalProjectId.js", ["useProjectWorkspace", "activeProject"]);
requireIncludes("src/hooks/useAuricruxLiveInsight.js", ["submitAuricruxAction"]);
requireIncludes("src/api/constructionClient.js", ["createProjectRfi", "createChangeOrder"]);
requireIncludes("src/api/fieldPhotosClient.js", ["uploadFieldPhoto", "compareFieldPhoto", "autoRedlineFromPhoto"]);
requireIncludes("src/components/field/FieldPhotoCapture.jsx", ["getUserMedia"]);
requireIncludes("src/pages/portal/PortalFieldSupervision.jsx", ["FieldPhotoCapture", "PlanComparePanel"]);
requireIncludes("src/pages/portal/PortalFieldTasks.jsx", ["Field Supervision", "AuricruxInsightPanel"]);

console.log("Portal Auricrux wiring validation passed.");
