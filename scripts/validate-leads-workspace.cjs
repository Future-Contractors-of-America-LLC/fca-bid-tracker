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

requireIncludes("src/routes.js", ["/portal/leads", "PortalLeads"]);
requireIncludes("src/api/leadsClient.js", ["fetchLeads", "qualifyLead", "fetchLeadsNextActions"]);
requireIncludes("src/hooks/useLeadsWorkspace.js", ["qualificationReady", "saveChecklist", "qualifySelectedLead"]);
requireIncludes("src/hooks/useLeadsNextActions.js", ["fetchLeadsNextActions"]);
requireIncludes("src/pages/portal/PortalLeads.jsx", [
  "LeadQualificationChecklist",
  "LeadAuditTrail",
  "Lead register",
  "Open qualified opportunity",
]);
requireIncludes("src/components/leads/LeadQualificationChecklist.jsx", ["Qualification checklist", "qualificationBlockingReasons"]);
requireIncludes("src/components/leads/LeadsEcosystemHub.jsx", ["Bid workspace", "Auricrux next actions"]);
requireIncludes("src/utils/leadsModel.js", ["isQualificationReady", "buildQualifyPayload", "CHECKLIST_FIELDS"]);
requireIncludes("src/api/intakeClient.js", ["sourceBidId", "Lead mirror failed"]);
requireIncludes("src/operationsPipeline.js", ["/portal/leads"]);
requireIncludes("src/systemState.js", ["leads:", "/portal/leads"]);
requireIncludes("src/components/AuricruxDock.jsx", ["useLeadsNextActions", "leadsNextActions"]);
requireIncludes("src/publicPackageRouteGroups.js", ["/portal/leads"]);
requireIncludes("src/productBlueprint.js", ["/portal/leads", "Open Lead Intelligence"]);
requireIncludes("src/websiteShell.js", ["Open Lead Intelligence", "/portal/leads"]);
requireIncludes("src/pages/portal/PortalPipeline.jsx", ["Open Lead Intelligence"]);
requireIncludes("src/pages/portal/PortalBids.jsx", ["Lead-to-bid continuity"]);
requireIncludes("src/components/RouteReadinessOverlay.jsx", ["Lead Intelligence readiness"]);
requireIncludes("public/leads/index.html", ["/portal/leads"]);
requireIncludes("public/leads/new.html", ["/portal/leads"]);
requireIncludes("public/leads/detail.html", ["/portal/leads"]);

requireIncludes("core/leads.py", ["validate_qualification_readiness", "get_leads_next_actions", "opportunityId"], centralRoot);
requireIncludes("core/leads_auth.py", ["require_leads_mutation", "validate_public_intake_payload", "enforce_public_intake_rate"], centralRoot);
requireIncludes("core/leads_http.py", ["leads/next-actions"], centralRoot);
requireIncludes("core/workspaces.py", ["sourceLeadId", "tenant_store.get(\"opportunities\")"], centralRoot);
requireIncludes("core/auricrux_chat.py", ["/portal/leads", "leadsNextActions"], centralRoot);
requireIncludes("function_app.py", ["register_leads_routes"], centralRoot);
requireIncludes("leads/__init__.py", ["require_leads_read", "validate_public_intake_payload"], centralRoot);
requireIncludes("lead-detail/__init__.py", ["require_leads_mutation"], centralRoot);
requireIncludes("lead-qualify/__init__.py", ["require_leads_mutation"], centralRoot);
requireIncludes("opportunities-workspace/__init__.py", ["require_leads_read"], centralRoot);
requireIncludes("opportunity-convert/__init__.py", ["require_leads_mutation"], centralRoot);
requireIncludes("tests/test_leads_governance.py", ["get_opportunity_workspace", "opportunityId"], centralRoot);

requireNotIncludes("public/leads/index.html", ["Construction Lead Pipeline"]);

if (errors.length) {
  console.error("Leads workspace validation failed:");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Leads workspace validation passed.");
