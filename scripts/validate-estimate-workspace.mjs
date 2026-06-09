import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "estimateWorkspaceStore.js"),
    markers: [
      'export const ESTIMATE_WORKSPACE_KEY = "fca_estimate_workspace_v1";',
      'function normalizeTakeoffItem(item = {}, index = 0)',
      'function normalizeEstimateRecord(record = {}, index = 0)',
      'takeoffItems: Array.isArray(record.takeoffItems)',
      'export function readEstimateWorkspace()',
      'export function updateEstimateWorkspace(mutator)',
    ],
  },
  {
    file: path.join(root, "src", "hooks", "useEstimateWorkspace.js"),
    markers: [
      'function filterEstimatesForSession(estimates)',
      'getEstimateForBid(bidId)',
      'generateTakeoff(bidId, detail = "Auricrux generated a structured takeoff from linked evidence.")',
      'buildEstimate(bidId, detail = "Auricrux converted takeoff evidence into estimate continuity and proposal posture.")',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalBids.jsx"),
    markers: [
      'import useEstimateWorkspace from "../../hooks/useEstimateWorkspace";',
      'Estimate and takeoff continuity',
      'Generate Takeoff',
      'Build Estimate',
    ],
  },
  {
    file: path.join(root, "package.json"),
    markers: [
      '"validate:estimate-workspace": "node scripts/validate-estimate-workspace.mjs"',
      'npm run validate:bid-workspace && npm run validate:qualification-evidence-spine && npm run validate:project-workspace && npm run validate:estimate-workspace',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required estimate workspace marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Estimate workspace validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Estimate workspace validation passed.");
