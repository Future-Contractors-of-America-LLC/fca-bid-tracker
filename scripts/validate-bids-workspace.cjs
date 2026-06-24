const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const centralRoot = path.resolve(root, "..", "auricrux-central");
const errors = [];

function requireFile(relativePath, base = root) {
  const absolute = path.join(base, relativePath);
  if (!fs.existsSync(absolute)) {
    errors.push(`Missing required file: ${relativePath}`);
    return "";
  }
  return fs.readFileSync(absolute, "utf8");
}

function requireIncludes(relativePath, needles, base = root) {
  const content = requireFile(relativePath, base);
  needles.forEach((needle) => {
    if (!content.includes(needle)) {
      errors.push(`${relativePath} missing expected content: ${needle}`);
    }
  });
}

function requireNotIncludes(relativePath, needles, base = root) {
  const content = requireFile(relativePath, base);
  needles.forEach((needle) => {
    if (content.includes(needle)) {
      errors.push(`${relativePath} should not include deprecated content: ${needle}`);
    }
  });
}

requireIncludes("src/routes.js", ["/portal/bids", "/portal/pipeline", "PortalBids", "PortalPipeline"]);
requireIncludes("src/api/bidsClient.js", ["fetchBidsNextActions", "/api/bids/next-actions"]);
requireIncludes("src/api/workflowClient.js", ["mutateWorkflowBid", "PATCH"]);
requireIncludes("src/hooks/useBidsNextActions.js", ["fetchBidsNextActions"]);
requireIncludes("src/utils/bidsModel.js", ["BID_CHECKLIST_FIELDS", "isQualificationReady", "buildQualifyPayload"]);
requireIncludes("src/components/bids/BidQualificationChecklist.jsx", ["Qualification checklist", "qualificationBlockingReasons"]);
requireIncludes("src/components/bids/BidsEcosystemHub.jsx", ["Commercial pipeline", "Lead Intelligence"]);
requireIncludes("src/pages/portal/PortalBids.jsx", [
  "BidQualificationChecklist",
  "BidsEcosystemHub",
  "Qualification command surface",
  "Qualification evidence packet",
  "Advance Qualification",
  "Route to Estimate",
  "BidActionCenter",
  "CommercialContinuityFeed",
  "AutomationRecoveryFeed",
]);
requireIncludes("src/pages/portal/PortalPipeline.jsx", [
  "BidQualificationChecklist",
  "BidsEcosystemHub",
  "buildQualifyPayload",
  "Open Qualification Board",
]);
requireIncludes("src/components/AuricruxDock.jsx", ["useBidsNextActions", "bidsNextActions", "/portal/bids"]);
requireIncludes("src/productBlueprint.js", ["/portal/bids", "Open Qualification Board"]);
requireIncludes("src/operationsPipeline.js", ["/portal/bids"]);
requireIncludes("public/pipeline/index.html", ["/portal/pipeline"]);

requireNotIncludes("src/pages/portal/PortalBids.jsx", ['score: "88/100"']);
requireNotIncludes("src/pages/portal/PortalPipeline.jsx", ['score: "88/100"']);

requireIncludes("core/bids.py", ["validate_bid_qualification_readiness", "get_bids_next_actions", "mutate_bid"], centralRoot);
requireIncludes("core/bids_auth.py", ["require_bids_read", "require_bids_mutation"], centralRoot);
requireIncludes("core/bids_http.py", ["bids/next-actions", "register_bids_routes"], centralRoot);
requireIncludes("core/auricrux_chat.py", ["bidsNextActions"], centralRoot);
requireIncludes("bids/__init__.py", ["require_bids_read", "require_bids_mutation", "PATCH"], centralRoot);
requireIncludes("commercial-pipeline/__init__.py", ["require_bids_read", "require_bids_mutation"], centralRoot);
requireIncludes("estimates/__init__.py", ["require_bids_read", "require_bids_mutation"], centralRoot);
requireIncludes("function_app.py", ["register_bids_routes", 'methods=["GET", "PATCH", "OPTIONS"]'], centralRoot);
requireIncludes("leads/__init__.py", ["_list_bids", "_mutate_bid"], centralRoot);
requireIncludes("tests/test_bids_governance.py", ["validate_bid_qualification_readiness", "get_bids_next_actions"], centralRoot);

if (errors.length) {
  console.error("Bids workspace validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Bids workspace validation passed.");
