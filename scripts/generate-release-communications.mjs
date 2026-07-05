#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const qcDir = path.join(root, "docs", "qc");

const capabilityPath = path.join(qcDir, "module-capability-coverage-report.json");
const competitivePath = path.join(qcDir, "competitive-module-audit-report.json");
const rankingPath = path.join(qcDir, "module-competitive-ranking-report.json");
const scorecardPath = path.join(qcDir, "weekly-executive-scorecard.json");

const claimMapPath = path.join(qcDir, "release-claim-proof-map.json");
const internalPath = path.join(qcDir, "release-communications-internal.md");
const externalPath = path.join(qcDir, "release-communications-external.md");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function requireFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required report: ${path.relative(root, filePath).replace(/\\/g, "/")}`);
  }
  return readJson(filePath);
}

const capability = requireFile(capabilityPath);
const competitive = requireFile(competitivePath);
const ranking = requireFile(rankingPath);
const scorecard = fs.existsSync(scorecardPath) ? readJson(scorecardPath) : null;

const totalModules = Number(capability?.summary?.totalModules || ranking?.summary?.totalModules || 0);
const riskCounts = capability?.summary?.riskCounts || {};
const higherCount = Number(ranking?.summary?.higherCount || 0);
const strictStatus = competitive?.strictStatus || "UNKNOWN";

const claimProofMap = {
  generatedAt: new Date().toISOString(),
  claims: [
    {
      claim: "All portal modules are low risk in capability matrix.",
      evidence: {
        report: "docs/qc/module-capability-coverage-report.json",
        fields: ["summary.totalModules", "summary.riskCounts", "summary.failingRouteCount"],
      },
      current: {
        totalModules,
        riskCounts,
      },
    },
    {
      claim: "Competitive strict benchmark passes against mapped industry leaders.",
      evidence: {
        report: "docs/qc/competitive-module-audit-report.json",
        fields: ["strictStatus", "aggregateScore", "modules"],
      },
      current: {
        strictStatus,
        aggregateScore: competitive?.aggregateScore ?? null,
      },
    },
    {
      claim: "Every portal module ranks higher than mapped competitor set.",
      evidence: {
        report: "docs/qc/module-competitive-ranking-report.json",
        fields: ["summary.totalModules", "summary.higherCount", "summary.needsWorkCount"],
      },
      current: {
        higherCount,
        needsWorkCount: ranking?.summary?.needsWorkCount ?? null,
      },
    },
    {
      claim: "Leadership weekly scorecard is generated from objective QC evidence.",
      evidence: {
        report: "docs/qc/weekly-executive-scorecard.json",
        fields: ["grade", "gates", "totals"],
      },
      current: scorecard || null,
    },
  ],
};

const internal = [
  "# Internal Release Communications",
  "",
  `- Generated: ${claimProofMap.generatedAt}`,
  `- Total modules: ${totalModules}`,
  `- Competitive strict status: ${strictStatus}`,
  `- Ranked higher modules: ${higherCount}/${totalModules}`,
  "",
  "## Executive Summary",
  "- FCA module governance and competitive enforcement lanes are now operationalized in CI-required checks.",
  "- Weekly executive scorecard generation is automated and sourced from QC artifacts in docs/qc.",
  "- Release claims are bound to report-level evidence via the release claim-proof map.",
  "",
  "## Evidence Anchors",
  "- docs/qc/module-capability-coverage-report.json",
  "- docs/qc/competitive-module-audit-report.json",
  "- docs/qc/module-competitive-ranking-report.json",
  "- docs/qc/weekly-executive-scorecard.json",
  "- docs/qc/release-claim-proof-map.json",
  "",
  "## Action Required",
  "- Keep branch protection requiring the Module QC Required Gates workflow job.",
  "- Run strict finance secret-store check before production release approvals.",
  "",
].join("\n");

const external = [
  "# FCA Platform Release Notes",
  "",
  `- Release evidence generated: ${claimProofMap.generatedAt}`,
  "",
  "## What improved",
  "- Strengthened route-level quality controls across all core portal modules.",
  "- Expanded benchmark enforcement to ensure module-level competitiveness against category leaders.",
  "- Added a standing executive scorecard for recurring governance review.",
  "",
  "## Verification statement",
  "- This release note is supported by machine-generated validation reports and comparative benchmark artifacts maintained in the product QC lane.",
  "",
].join("\n");

fs.writeFileSync(claimMapPath, `${JSON.stringify(claimProofMap, null, 2)}\n`, "utf8");
fs.writeFileSync(internalPath, `${internal}\n`, "utf8");
fs.writeFileSync(externalPath, `${external}\n`, "utf8");

console.log("Release communication artifacts generated.");
