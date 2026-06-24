import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "bidWorkspaceStore.js"),
    markers: [
      'export const BID_WORKSPACE_KEY = "fca_bid_workspace_v1";',
      "function normalizeQualification(qualification = {}, bid = {})",
      'qualification: normalizeQualification(bid.qualification, bid),',
      'qualification.nextGate || "Complete qualification command review"',
      '"Route to estimator handoff"',
    ],
  },
  {
    file: path.join(root, "src", "hooks", "useBidWorkspace.js"),
    markers: [
      "appendAutomationLog({",
      "appendCommercialLog({",
      "updateBidStatus(bidId, status, detail)",
      "clearBidBlocker(bidId, detail",
      "updateBidQualification(bidId, updates, detail = \"Qualification command surface updated.\")",
      "routeBidToEstimate(bidId, detail = \"Qualified opportunity routed into estimate production.\")",
    ],
  },
  {
    file: path.join(root, "src", "components", "BidActionCenter.jsx"),
    markers: ["Route to Approval", "Clear Blocker", "Mark Won"],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalBids.jsx"),
    markers: [
      'import useBidWorkspace from "../../hooks/useBidWorkspace";',
      'import BidActionCenter from "../../components/BidActionCenter";',
      'import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";',
      'import AutomationRecoveryFeed from "../../components/AutomationRecoveryFeed";',
      'import BidQualificationChecklist from "../../components/bids/BidQualificationChecklist";',
      "Qualification command surface",
      "Qualification evidence packet",
      "Advance Qualification",
      "Route to Estimate",
      "<BidActionCenter",
      '<CommercialContinuityFeed title="Bid revenue continuity feed"',
      '<AutomationRecoveryFeed title="Bid automation feed"',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required bid workspace marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Bid workspace validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Bid workspace validation passed.");
