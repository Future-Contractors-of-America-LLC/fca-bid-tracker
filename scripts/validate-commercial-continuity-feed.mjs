import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "sessionCommercialLog.js"),
    markers: [
      'export const CUSTOMER_COMMERCIAL_LOG_KEY = "fca_customer_commercial_log_v1";',
      'export function readCommercialLog()',
      'export function appendCommercialLog(entry = {})',
      'export function clearCommercialLog()',
    ],
  },
  {
    file: path.join(root, "src", "hooks", "useCustomerSession.js"),
    markers: [
      'import { appendCommercialLog, clearCommercialLog } from "../sessionCommercialLog";',
      'logCommercialEvent("workspace-activation"',
      'logCommercialEvent("commercial-update"',
      'logCommercialEvent("product-continuity"',
      'logCommercialEvent("comms-continuity"',
      'logCommercialEvent("plan-promotion"',
      'clearCommercialLog();',
    ],
  },
  {
    file: path.join(root, "src", "components", "CommercialContinuityFeed.jsx"),
    markers: [
      'import { readCommercialLog } from "../sessionCommercialLog";',
      'Recent pricing, rollout, billing, and workspace activation actions remain visible so revenue continuity survives route changes and founder context switching.',
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "Pricing.jsx"),
    markers: [
      'import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";',
      '<CommercialContinuityFeed title="Pricing and rollout memory"',
    ],
  },
  {
    file: path.join(root, "src", "pages", "website", "Contact.jsx"),
    markers: [
      'import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";',
      '<CommercialContinuityFeed title="Walkthrough and conversion memory"',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalBilling.jsx"),
    markers: [
      'import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";',
      '<CommercialContinuityFeed title="Billing and commercial continuity feed"',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required commercial continuity marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Commercial continuity feed validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Commercial continuity feed validation passed.");
