#!/usr/bin/env node
/**
 * Slice perfection validation for slices 0216.
 * Static wiring checks per ecosystem slice (mutation-oriented where applicable).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mobileRoot = path.resolve(root, "..", "fca-mobile-maui-work");
let failed = 0;
const findings = [];

function read(relativePath, base = root) {
  return fs.readFileSync(path.join(base, relativePath), "utf8");
}

function pass(slice, label, detail = "") {
  findings.push({ slice, status: "pass", label, detail, tag: "mutation" });
  console.log(`PASS [${slice}]: ${label}${detail ? `  ${detail}` : ""}`);
}

function fail(slice, label, detail = "") {
  failed += 1;
  findings.push({ slice, status: "fail", label, detail, tag: "mutation" });
  console.error(`FAIL [${slice}]: ${label}${detail ? `  ${detail}` : ""}`);
}

function requireIncludes(slice, relativePath, marker, label, base = root) {
  const source = read(relativePath, base);
  if (!source.includes(marker)) {
    fail(slice, label, `missing "${marker}" in ${relativePath}`);
    return false;
  }
  pass(slice, label, relativePath);
  return true;
}

function rejectIncludes(slice, relativePath, marker, label) {
  const source = read(relativePath);
  if (source.includes(marker)) {
    fail(slice, label, `still contains "${marker}" in ${relativePath}`);
    return false;
  }
  pass(slice, label, relativePath);
  return true;
}

// Slice 02  Website & conversion
rejectIncludes("02-website", "src/pages/website/Contact.jsx", "coming soon", "contact removes coming-soon blockers");
requireIncludes("02-website", "src/pages/website/CheckoutSuccess.jsx", "/portal/platform", "checkout success opens workspace");
requireIncludes("02-website", "src/pages/website/Intake.jsx", "Company profile", "intake shows conversion stepper");

// Slice 03  Pipeline & leads
requireIncludes("03-pipeline", "src/pages/portal/PortalBids.jsx", "/portal/opportunities/", "bids link to opportunity detail");
requireIncludes("03-pipeline", "src/pages/portal/PortalBids.jsx", "/portal/pipeline", "bids empty state routes to pipeline");

// Slice 04  Estimates & proposals
requireIncludes("04-estimating", "api/commercial-store.js", "add-line", "estimate add-line mutation exists");
requireIncludes("04-estimating", "src/pages/portal/PortalEstimates.jsx", 'mutateEstimate("add-line"', "estimates persist new lines via API");
requireIncludes("04-estimating", "src/pages/portal/PortalProposals.jsx", "No proposals yet", "proposals empty state guidance");

// Slice 05  Projects & files
requireIncludes("05-projects", "src/pages/portal/PortalFiles.jsx", 'params.get("projectId") || params.get("project")', "files accept project deep-link aliases");

// Slice 06  Comms
requireIncludes("06-comms", "src/pages/portal/PortalMessages.jsx", "drafts.sent", "messages prefer API-sent stream when live");

// Slice 07  Academy
requireIncludes("07-academy", "src/pages/academy/AcademyHome.jsx", "advanceProgress", "academy lesson toggle syncs LMS progress");

// Slice 08  Design
requireIncludes("08-design", "src/pages/portal/PortalDesignWorkspace.jsx", 'params.get("project")', "design accepts project deep-link alias");

// Slice 09  RFI / closeout
requireIncludes("09-rfi-closeout", "src/pages/portal/PortalCloseout.jsx", "!hasProject", "closeout guards missing project");

// Slice 10  Field & scheduling
requireIncludes("10-field", "src/pages/portal/PortalScheduling.jsx", "AuricruxInsightPanel", "scheduling includes Auricrux guidance");
requireIncludes("10-field", "src/components/OperationalToolPage.jsx", 'params.get("project")', "operational tools accept project query alias");

// Slice 11  Finance
requireIncludes("11-finance", "src/pages/portal/PortalChangeOrders.jsx", "Review SOV and job billing", "change order advance shows billing continuity");

// Slice 12  Warranty
requireIncludes("12-warranty", "src/pages/portal/PortalWarranty.jsx", "/portal/support", "warranty links to support");

// Slice 13  Admin / audit / legal
rejectIncludes("13-admin", "src/pages/portal/PortalProfile.jsx", "Why this route matters", "profile removes commentary shell");
requireIncludes("13-admin", "src/pages/portal/PortalAdmin.jsx", "PortalSliceAuricrux", "admin embeds Auricrux");
requireIncludes("13-admin", "src/pages/portal/PortalAudit.jsx", "PortalSliceAuricrux", "audit embeds Auricrux");
requireIncludes("13-admin", "src/pages/portal/PortalLegal.jsx", "PortalSliceAuricrux", "legal embeds Auricrux");
requireIncludes("13-admin", "src/pages/portal/PortalInvoiceDetail.jsx", "createFcaPaymentIntake", "invoice detail native pay");

// Slice 14  Auricrux
requireIncludes("14-auricrux", "src/pages/portal/PortalAuricrux.jsx", "usingLiveActions", "auricrux shows live vs guidance mode");

// Slice 15  Mobile MAUI
if (fs.existsSync(path.join(mobileRoot, "src", "FcaMobile", "Services", "FcaApiClient.cs"))) {
  requireIncludes("15-mobile", "src/FcaMobile/Services/FcaApiClient.cs", "CustomerStore", "mobile API client uses customer store", mobileRoot);
  requireIncludes("15-mobile", "src/FcaMobile/Services/FcaApiClient.cs", "SignOutAsync", "mobile API client supports sign-out", mobileRoot);
  requireIncludes("15-mobile", "src/FcaMobile/Services/FcaApiClient.cs", "QualifyLeadAsync", "mobile qualify mutation", mobileRoot);
  requireIncludes("15-mobile", "src/FcaMobile/Services/FcaConfig.cs", "BuildPortalHandoffUrl", "mobile portal handoff", mobileRoot);
  requireIncludes("15-mobile", "src/FcaMobile/Services/FcaApiClient.cs", "GetFieldTasksAsync", "mobile field tasks read", mobileRoot);
} else {
  fail("15-mobile", "mobile repo present", "fca-mobile-maui-work not found");
}

// Slice 16  Platform ops & profile
requireIncludes("16-platform", "src/pages/portal/PlatformDashboard.jsx", "PortalWorkspaceGuide", "platform dashboard includes workspace guide");
requireIncludes("16-platform", "src/pages/portal/PortalProfile.jsx", "Account security", "profile includes account security section");

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "platform-slices-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), failed, sliceCount: 15, findings }, null, 2),
);

if (failed > 0) process.exit(1);
console.log(`Platform slice validation complete (${findings.length} checks, 0 failures).`);
