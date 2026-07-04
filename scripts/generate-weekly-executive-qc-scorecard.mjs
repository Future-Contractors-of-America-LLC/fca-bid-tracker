#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const qcDir = path.join(root, "docs", "qc");

const capabilityPath = path.join(qcDir, "module-capability-coverage-report.json");
const competitivePath = path.join(qcDir, "competitive-module-audit-report.json");
const rankingPath = path.join(qcDir, "module-competitive-ranking-report.json");
const financePath = path.join(qcDir, "finance-ops-readiness-report.json");
const outputJsonPath = path.join(qcDir, "weekly-executive-scorecard.json");
const outputMdPath = path.join(qcDir, "weekly-executive-scorecard.md");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function exists(filePath) {
  return fs.existsSync(filePath);
}

const blockers = [];

if (!exists(capabilityPath)) blockers.push("Missing module capability report.");
if (!exists(competitivePath)) blockers.push("Missing competitive audit report.");
if (!exists(rankingPath)) blockers.push("Missing module competitive ranking report.");

const capability = exists(capabilityPath) ? readJson(capabilityPath) : null;
const competitive = exists(competitivePath) ? readJson(competitivePath) : null;
const ranking = exists(rankingPath) ? readJson(rankingPath) : null;
const finance = exists(financePath) ? readJson(financePath) : null;

const capabilitySummary = capability?.summary || {};
const capabilityRiskCounts = capabilitySummary.riskCounts || {
  blocker: 0,
  critical: 0,
  high: 0,
  medium: 0,
  low: 0,
};

const totalModules = Number(capabilitySummary.totalModules || ranking?.summary?.totalModules || 0);
const allModulesLow =
  capabilityRiskCounts.blocker === 0
  && capabilityRiskCounts.critical === 0
  && capabilityRiskCounts.high === 0
  && capabilityRiskCounts.medium === 0
  && capabilityRiskCounts.low === totalModules;

const strictCompetitivePass = competitive?.strictStatus === "PASS";
const rankingHigherCount = Number(ranking?.summary?.higherCount || 0);
const rankingNeedsWorkCount = Number(ranking?.summary?.needsWorkCount || 0);
const allModulesRankedHigher = totalModules > 0 && rankingHigherCount === totalModules && rankingNeedsWorkCount === 0;

const financeStatus = finance?.status || "UNKNOWN";
const financeMissing = Number(finance?.totals?.missing || 0);

const grade = allModulesLow && strictCompetitivePass && allModulesRankedHigher
  ? "GREEN"
  : (allModulesLow && allModulesRankedHigher ? "AMBER" : "RED");

const summary = {
  generatedAt: new Date().toISOString(),
  grade,
  totals: {
    modules: totalModules,
    rankedHigher: rankingHigherCount,
    needsWork: rankingNeedsWorkCount,
  },
  gates: {
    capabilityAllLow: allModulesLow,
    strictCompetitivePass,
    allModulesRankedHigher,
    financeReadinessPass: financeStatus === "PASS",
  },
  riskCounts: capabilityRiskCounts,
  finance: {
    status: financeStatus,
    missing: financeMissing,
    mode: finance?.mode || null,
  },
  sourceReports: {
    capability: path.relative(root, capabilityPath).replace(/\\/g, "/"),
    competitive: path.relative(root, competitivePath).replace(/\\/g, "/"),
    ranking: path.relative(root, rankingPath).replace(/\\/g, "/"),
    finance: exists(financePath) ? path.relative(root, financePath).replace(/\\/g, "/") : null,
  },
  blockers,
};

fs.mkdirSync(qcDir, { recursive: true });
fs.writeFileSync(outputJsonPath, `${JSON.stringify(summary, null, 2)}\n`, "utf8");

const markdown = [
  "# Weekly Executive QC Scorecard",
  "",
  `- Generated: ${summary.generatedAt}`,
  `- Grade: ${summary.grade}`,
  `- Modules: ${summary.totals.modules}`,
  `- Ranked higher than benchmark: ${summary.totals.rankedHigher}/${summary.totals.modules}`,
  "",
  "## Gate Status",
  `- Capability matrix all low: ${summary.gates.capabilityAllLow ? "PASS" : "FAIL"}`,
  `- Competitive strict status: ${summary.gates.strictCompetitivePass ? "PASS" : "FAIL"}`,
  `- All modules ranked HIGHER: ${summary.gates.allModulesRankedHigher ? "PASS" : "FAIL"}`,
  `- Finance readiness status: ${summary.finance.status} (${summary.finance.missing} missing)` ,
  "",
  "## Capability Risk Counts",
  `- blocker: ${summary.riskCounts.blocker}`,
  `- critical: ${summary.riskCounts.critical}`,
  `- high: ${summary.riskCounts.high}`,
  `- medium: ${summary.riskCounts.medium}`,
  `- low: ${summary.riskCounts.low}`,
  "",
  "## Source Reports",
  `- ${summary.sourceReports.capability}`,
  `- ${summary.sourceReports.competitive}`,
  `- ${summary.sourceReports.ranking}`,
  ...(summary.sourceReports.finance ? [`- ${summary.sourceReports.finance}`] : []),
  "",
  "## Blockers",
  ...(summary.blockers.length ? summary.blockers.map((item) => `- ${item}`) : ["- none"]),
  "",
].join("\n");

fs.writeFileSync(outputMdPath, `${markdown}\n`, "utf8");

console.log(`Weekly executive scorecard generated with grade ${summary.grade}.`);
