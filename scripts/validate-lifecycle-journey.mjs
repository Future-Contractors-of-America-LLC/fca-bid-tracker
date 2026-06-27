#!/usr/bin/env node
/**
 * Cycle 4  Startup customer lifecycle journey wiring (lead ? award ? bill ? train).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
let failed = 0;

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function pass(label) {
  console.log(`PASS: ${label}`);
}

function fail(label, detail = "") {
  failed += 1;
  console.error(`FAIL: ${label}${detail ? `  ${detail}` : ""}`);
}

function requireIncludes(relativePath, marker, label) {
  const source = read(relativePath);
  if (!source.includes(marker)) {
    fail(label, `missing "${marker}" in ${relativePath}`);
    return;
  }
  pass(label);
}

const journey = [
  { step: "intake", href: "/intake", files: ["src/pages/website/Intake.jsx"] },
  { step: "pipeline", href: "/portal/pipeline", files: ["src/pages/portal/PortalPipeline.jsx"] },
  { step: "bids", href: "/portal/bids", files: ["src/pages/portal/PortalBids.jsx"] },
  { step: "estimates", href: "/portal/estimates", files: ["src/pages/portal/PortalEstimates.jsx"] },
  { step: "proposals", href: "/portal/proposals", files: ["src/pages/portal/PortalProposals.jsx"] },
  { step: "projects", href: "/portal/projects", files: ["src/pages/portal/PortalProjects.jsx"] },
  { step: "files", href: "/portal/files", files: ["src/pages/portal/PortalFiles.jsx"] },
  { step: "rfis", href: "/portal/rfis", files: ["src/pages/portal/PortalRfis.jsx"] },
  { step: "change-orders", href: "/portal/change-orders", files: ["src/pages/portal/PortalChangeOrders.jsx"] },
  { step: "billing", href: "/portal/billing", files: ["src/pages/portal/PortalBilling.jsx"] },
  { step: "closeout", href: "/portal/closeout", files: ["src/pages/portal/PortalCloseout.jsx"] },
  { step: "warranty", href: "/portal/warranty", files: ["src/pages/portal/PortalWarranty.jsx"] },
  { step: "academy", href: "/academy", files: ["src/pages/academy/AcademyHome.jsx"] },
];

const routes = read("src/routes.js");
for (const stop of journey) {
  if (!routes.includes(`"${stop.href}"`) && !routes.includes(`'${stop.href}'`)) {
    fail(`lifecycle route ${stop.href}`);
  } else {
    pass(`lifecycle route ${stop.href}`);
  }
  for (const file of stop.files) {
    if (!fs.existsSync(path.join(root, file))) fail(`lifecycle surface ${stop.step}`, file);
    else pass(`lifecycle surface ${stop.step}`);
  }
}

requireIncludes("src/productBlueprint.js", "qualification pipeline", "blueprint includes pipeline");
requireIncludes("src/components/PortalWorkspaceGuide.jsx", "pipeline", "workspace guide references pipeline");
requireIncludes("src/pages/portal/PortalEstimates.jsx", "advanceEstimate", "estimate advance in lifecycle");
requireIncludes("src/pages/portal/PortalProposals.jsx", "advanceProposal", "proposal advance in lifecycle");
requireIncludes("src/pages/portal/PortalPipeline.jsx", "markWonAndCreateProject", "award conversion in lifecycle");
requireIncludes("src/pages/portal/PortalFiles.jsx", "create-briefing", "briefing mutation in lifecycle");
requireIncludes("src/pages/website/Intake.jsx", "submitGovernedIntake", "lead intake in lifecycle");
requireIncludes("src/pages/portal/PortalBilling.jsx", "submitFcaNativeCheckout", "billing supports in-house checkout");
requireIncludes("src/pages/portal/PortalRfis.jsx", "respondProjectRfi", "RFI respond in lifecycle");
requireIncludes("src/pages/portal/PortalChangeOrders.jsx", "advanceChangeOrder", "change order advance in lifecycle");
requireIncludes("src/pages/portal/PortalCloseout.jsx", "advanceCloseoutPackage", "closeout advance in lifecycle");
requireIncludes("src/pages/portal/PortalWarranty.jsx", "advanceWarrantyCase", "warranty advance in lifecycle");
requireIncludes("src/pages/academy/AcademyHome.jsx", "advanceProgress", "academy progress in lifecycle");

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "lifecycle-journey-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), cycle: 4, complete: failed === 0, failed }, null, 2),
);

if (failed > 0) process.exit(1);
console.log(`Lifecycle journey validation complete (${journey.length} stops).`);
