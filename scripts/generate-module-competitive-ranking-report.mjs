import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const qcDir = path.join(root, "docs", "qc");
const capabilityPath = path.join(qcDir, "module-capability-coverage-report.json");
const competitivePath = path.join(qcDir, "competitive-module-audit-report.json");
const outputJsonPath = path.join(qcDir, "module-competitive-ranking-report.json");
const outputMdPath = path.join(qcDir, "module-competitive-ranking-report.md");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function competitorsForRoute(route) {
  const map = [
    { pattern: /^\/portal\/academy/, competitors: ["Pearson", "Procore Learning"] },
    { pattern: /^\/portal\/(design|plans|rfis|change-orders|closeout|field-|punch|job-cost|warranty|projects|files)/, competitors: ["Procore", "Autodesk Construction Cloud"] },
    { pattern: /^\/portal\/(bids|estimates|proposals|pipeline|leads|opportunities)/, competitors: ["BuildingConnected", "PlanHub"] },
    { pattern: /^\/portal\/(finance|billing|admin\/payroll|employee\/payroll|admin\/internal|employee\/internal|profile)/, competitors: ["Intuit QuickBooks", "Gusto"] },
    { pattern: /^\/portal\/(messages|communications|notifications|support)/, competitors: ["Microsoft Teams", "Procore Communications"] },
    { pattern: /^\/portal\/(auricrux|command-tower|decision-queue|platform|operations|admin|revenue-engine|hiring|scheduling|overview)/, competitors: ["Point-solution copilots", "Procore Platform"] },
  ];

  for (const entry of map) {
    if (entry.pattern.test(route)) return entry.competitors;
  }

  return ["Procore", "Autodesk Construction Cloud"];
}

function coverageComplete(signals = {}) {
  return Boolean(
    signals.pageExists
      && signals.authGateCoverage
      && signals.roleGateCoverage
      && signals.apiClientCoverage
      && signals.validatorCoverage
      && signals.reportCoverage,
  );
}

const capability = readJson(capabilityPath);
const competitive = readJson(competitivePath);

const strictPass = competitive.strictStatus === "PASS";

const rankedModules = capability.findings.map((item) => {
  const complete = coverageComplete(item.signals);
  const rank = complete && strictPass && item.risk === "low" ? "HIGHER" : "NEEDS_WORK";
  return {
    route: item.route,
    token: item.token,
    competitors: competitorsForRoute(item.route),
    risk: item.risk,
    score: item.score,
    coverageComplete: complete,
    rank,
    justification: complete && strictPass
      ? "Route has full FCA capability coverage (UI+auth+role+API+validator+report) and competitive benchmark strict pass."
      : "Route requires additional capability or benchmark remediation before higher-than-competitor claim.",
  };
});

const summary = {
  generatedAt: new Date().toISOString(),
  strictCompetitiveStatus: competitive.strictStatus,
  moduleCapabilityRiskCounts: capability.summary.riskCounts,
  totalModules: rankedModules.length,
  higherCount: rankedModules.filter((item) => item.rank === "HIGHER").length,
  needsWorkCount: rankedModules.filter((item) => item.rank !== "HIGHER").length,
};

const report = {
  summary,
  modules: rankedModules,
};

if (!fs.existsSync(qcDir)) fs.mkdirSync(qcDir, { recursive: true });
fs.writeFileSync(outputJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

const md = [
  "# Module Competitive Ranking Report",
  "",
  `- Generated: ${summary.generatedAt}`,
  `- Competitive strict status: ${summary.strictCompetitiveStatus}`,
  `- Capability risk counts: blocker ${summary.moduleCapabilityRiskCounts.blocker}, critical ${summary.moduleCapabilityRiskCounts.critical}, high ${summary.moduleCapabilityRiskCounts.high}, medium ${summary.moduleCapabilityRiskCounts.medium}, low ${summary.moduleCapabilityRiskCounts.low}`,
  `- Higher-ranked modules: ${summary.higherCount}/${summary.totalModules}`,
  "",
  "| Route | Competitors | FCA Rank | Coverage |",
  "| --- | --- | --- | --- |",
  ...rankedModules.map((item) => `| ${item.route} | ${item.competitors.join(" / ")} | ${item.rank} | ${item.coverageComplete ? "Complete" : "Incomplete"} |`),
  "",
].join("\n");

fs.writeFileSync(outputMdPath, `${md}\n`, "utf8");

if (summary.needsWorkCount > 0) {
  console.error(`Module competitive ranking failed: ${summary.needsWorkCount} module(s) still below higher-rank threshold.`);
  process.exit(1);
}

console.log(`Module competitive ranking passed: ${summary.higherCount}/${summary.totalModules} modules ranked HIGHER.`);
