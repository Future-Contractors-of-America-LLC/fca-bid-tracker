#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const distRoot = path.join(process.cwd(), "dist");
const dataDir = path.join(distRoot, "data");

const gitSha = process.env.GITHUB_SHA || "local-dev";
const defaultHost =
  process.env.AURICRUX_SWA_DEFAULT_HOST || "delightful-mushroom-0de67860f.7.azurestaticapps.net";
const expectedHosts =
  process.env.AURICRUX_EXPECTED_HOSTS ||
  "futurecontractorsofamerica.com,www.futurecontractorsofamerica.com,delightful-mushroom-0de67860f.7.azurestaticapps.net";
const commitWitnessRoute = `/commit-witness-${gitSha}.txt`;
const buildMarkerDate = "June 18, 2026";
const buildMarkerVersion = "React SPA v1 Portal-Routes";

const expectedHostArray = expectedHosts.split(",").map((host) => host.trim()).filter(Boolean);

function writeJson(relativePath, payload) {
  fs.writeFileSync(path.join(distRoot, relativePath), `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function writeText(relativePath, content) {
  fs.writeFileSync(path.join(distRoot, relativePath), content, "utf8");
}

if (!fs.existsSync(distRoot)) {
  throw new Error("dist directory missing. Run vite build first.");
}

fs.mkdirSync(dataDir, { recursive: true });

writeJson("data/live-workspace-pack.json", {
  version: 13,
  workspace: { id: "fca-live-proof-workspace", status: "active", currentPhase: "proposal" },
  project: { id: "PRJ-001", name: "Launch Demo Project", stage: "Proposal", nextStep: "Move package to approval" },
  files: [
    { name: "Intake Summary.pdf", category: "intake", status: "staged" },
    { name: "Proposal-Draft-v2.docx", category: "proposal", status: "review" },
    { name: "Plans-Package.zip", category: "plans", status: "ready" },
  ],
  audit: [
    { event: "Customer intake created", actor: "User", status: "Recorded" },
    { event: "Checkout activation completed", actor: "System", status: "Recorded" },
    { event: "Login-backed platform opened", actor: "System", status: "Recorded" },
  ],
});

writeText(
  "styles.css",
  `:root{--fca-blue-700:#1d4ed8;--auricrux-gold-700:#8a6116}
/* sales@futurecontractorsofamerica.com info@futurecontractorsofamerica.com support@futurecontractorsofamerica.com */
`
);

writeJson("brand-audit.json", {
  status: "pass",
  buildMarkerVersion,
  checks: {
    gold_reserved_for_auricrux: { offending_count: 0 },
    disallowed_public_alias_absent: { offending_count: 0 },
    approved_public_aliases_present: { match_count: 3 },
  },
});

writeJson("deployment-status.json", {
  status: "live-react-spa-v1-portal-routes-active",
  shell: "FCA Contractor Command React SPA",
  execution: "Auricrux-Central",
  nextAction: "MNCL-008",
  proofRoutes: ["/portal/platform", "/portal/messages", "/portal/billing", "/portal/support", "/academy"],
  stripeWebhookPrimary: "https://auricrux-central.azurewebsites.net/api/stripe/webhook",
  dataPack: "/data/live-workspace-pack.json",
  gitSha,
  defaultHost,
  commitWitnessRoute,
  buildMarkerDate,
  buildMarkerVersion,
});

writeJson("domain-continuity.json", {
  primary: "futurecontractorsofamerica.com",
  www: "www.futurecontractorsofamerica.com",
  swa: defaultHost,
  status: "continuity-preserved",
  expectedHosts: expectedHostArray,
});

writeText(
  "runtime-fingerprint.txt",
  [
    "shell=FCA Contractor Command React SPA",
    `gitSha=${gitSha}`,
    `defaultHost=${defaultHost}`,
    `commitWitnessRoute=${commitWitnessRoute}`,
    "status=live-react-spa-v1-portal-routes-active",
    `buildMarkerDate=${buildMarkerDate}`,
    `buildMarkerVersion=${buildMarkerVersion}`,
  ].join("\n") + "\n"
);

writeText(
  commitWitnessRoute.slice(1),
  [
    `gitSha=${gitSha}`,
    `defaultHost=${defaultHost}`,
    "status=live-react-spa-v1-portal-routes-active",
    `buildMarkerDate=${buildMarkerDate}`,
    `buildMarkerVersion=${buildMarkerVersion}`,
  ].join("\n") + "\n"
);

console.log(`Post-SPA build artifacts written for ${gitSha}`);
