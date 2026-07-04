#!/usr/bin/env node
/** Precon sovereignty journey � lead, estimate, proposal, award, briefing, native formats, mobile. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { resolveMobileRoot } from "./lib/fcaMobileRoot.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mobileRoot = resolveMobileRoot(root);
let failed = 0;

function read(relativePath, base = root) {
  return fs.readFileSync(path.join(base, relativePath), "utf8");
}

function pass(label) {
  console.log(`PASS: ${label}`);
}

function fail(label, detail = "") {
  failed += 1;
  console.error(`FAIL: ${label}${detail ? ` � ${detail}` : ""}`);
}

function requireIncludes(relativePath, marker, label, base = root) {
  if (!read(relativePath, base).includes(marker)) {
    fail(label, `missing "${marker}" in ${relativePath}`);
    return;
  }
  pass(label);
}

const routes = read("src/routes.js");
for (const href of ["/intake", "/portal/pipeline", "/portal/estimates", "/portal/proposals", "/portal/files", "/portal/design"]) {
  if (routes.includes(`"${href}"`) || routes.includes(`'${href}'`)) pass(`route ${href}`);
  else fail(`route ${href}`);
}

requireIncludes("src/pages/website/Intake.jsx", "submitGovernedIntake", "slice 01 intake mutation");
requireIncludes("src/pages/portal/PortalPipeline.jsx", "runQualify", "slice 01 pipeline qualify");
requireIncludes("src/pages/portal/PortalPipeline.jsx", "markWonAndCreateProject", "slice 05 award conversion");
requireIncludes("src/pages/portal/PortalEstimates.jsx", "advanceEstimate", "slice 03 estimate advance");
requireIncludes("src/pages/portal/PortalEstimates.jsx", "generateProposal", "slice 03 proposal generation");
requireIncludes("src/pages/portal/PortalProposals.jsx", "advanceProposal", "slice 04 proposal advance");
requireIncludes("src/pages/portal/PortalFiles.jsx", "create-briefing", "slice 08 briefing mutation");
requireIncludes("src/api/designWorkspaceClient.js", "fetchFcamStream", "FCA native FCAM client");
requireIncludes("src/api/designWorkspaceClient.js", "exportFcaNativePackage", "FCA native FCAP client");

if (fs.existsSync(path.join(mobileRoot, "src", "FcaMobile", "Services", "FcaApiClient.cs"))) {
  requireIncludes(
    "src/FcaMobile/Services/FcaApiClient.cs",
    "QualifyLeadAsync",
    "mobile qualify mutation",
    mobileRoot,
  );
  requireIncludes(
    "src/FcaMobile/Services/FcaConfig.cs",
    "BuildPortalHandoffUrl",
    "mobile portal handoff",
    mobileRoot,
  );
  requireIncludes(
    "src/FcaMobile/Services/FcaApiClient.cs",
    "SubmitLeadIntakeAsync",
    "mobile lead intake",
    mobileRoot,
  );
} else {
  fail("mobile repo", "fca-mobile-maui not found");
}

const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(
  path.join(outputDir, "precon-sovereignty-journey-report.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), cycle: 9, complete: failed === 0, failed }, null, 2),
);

if (failed > 0) process.exit(1);
console.log("Precon sovereignty journey validation complete.");
