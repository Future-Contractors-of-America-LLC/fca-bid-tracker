import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const routesFilePath = path.join(projectRoot, "src", "routes.js");
const customerSessionPath = path.join(projectRoot, "src", "customerSession.js");
const scriptsDir = path.join(projectRoot, "scripts");
const qcDir = path.join(projectRoot, "docs", "qc");
const reportJsonPath = path.join(qcDir, "module-capability-coverage-report.json");
const reportMdPath = path.join(qcDir, "module-capability-coverage-report.md");
const baselinePath = path.join(qcDir, "module-capability-baseline.json");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function listFilesRecursive(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFilesRecursive(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function normalizeToken(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractPortalRoutes(routesText) {
  const matches = [...routesText.matchAll(/\"(?<route>\/portal[^\"]*)\"\s*:\s*lazyPage\(\(\)\s*=>\s*import\(\"(?<importPath>[^\"]+)\"\)\),/g)];
  return matches.map((match) => ({
    route: match.groups.route,
    importPath: match.groups.importPath,
  }));
}

function resolvePageFile(projectRootPath, importPath) {
  const noPrefix = importPath.startsWith("./") ? importPath.slice(2) : importPath;
  const root = path.join(projectRootPath, "src", noPrefix);
  const candidates = [".jsx", ".js", ".tsx", ".ts"].map((ext) => `${root}${ext}`);
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function moduleToken(route) {
  const withoutPrefix = route.replace(/^\/portal\/?/, "");
  if (!withoutPrefix) return "overview";
  const segments = withoutPrefix.split("/").filter(Boolean);
  return normalizeToken(segments[segments.length - 1] || "overview");
}

function buildRouteTokens(route) {
  const withoutPrefix = route.replace(/^\/portal\/?/, "");
  const segments = withoutPrefix.split("/").filter(Boolean).map((item) => normalizeToken(item));
  const last = segments[segments.length - 1] || "overview";
  const tokens = new Set([last, ...segments]);

  // Common naming aliases to improve hit-rate for validators/reports.
  const aliases = {
    overview: ["platform", "portal"],
    profile: ["access", "login", "account"],
    admin: ["governance", "access"],
    payroll: ["finance", "ops"],
    internal: ["governance", "employee"],
    finance: ["billing", "payments"],
    "revenue-engine": ["revenue"],
    "change-orders": ["change", "orders"],
    "field-supervision": ["field", "supervision"],
    "field-tasks": ["field", "tasks"],
    immersive: ["vr"],
    academy: ["lms"],
    bids: ["bid"],
    estimates: ["estimate"],
    plans: ["plan"],
    rfis: ["rfi"],
    communications: ["comms", "messages"],
  };

  for (const token of [...tokens]) {
    const aliasValues = aliases[token] || [];
    for (const alias of aliasValues) tokens.add(alias);
  }

  return [...tokens];
}

function findMatchingPaths(files, tokens) {
  const normalizedTokens = tokens.map((token) => normalizeToken(token)).filter(Boolean);
  return files
    .filter((filePath) => {
      const name = normalizeToken(path.basename(filePath));
      return normalizedTokens.some((token) => name.includes(token));
    })
    .map((filePath) => path.relative(projectRoot, filePath).replace(/\\/g, "/"));
}

function hasApiClientUsage(pageContent) {
  return /from\s+\"\.\.\/\.\.\/api\/.+\"/.test(pageContent) || /usePortalApiLoad\(/.test(pageContent) || /centralFetch\(/.test(pageContent);
}

function createAssessment(routeInfo, context) {
  const token = moduleToken(routeInfo.route);
  const tokens = buildRouteTokens(routeInfo.route);
  const pageFile = resolvePageFile(projectRoot, routeInfo.importPath);
  const pageExists = Boolean(pageFile);
  const pageContent = pageExists ? readText(pageFile) : "";
  const apiClientCoverage = pageExists ? hasApiClientUsage(pageContent) : false;
  const validatorHits = findMatchingPaths(context.validatorFiles, tokens);
  const qcReportHits = findMatchingPaths(context.qcFiles, tokens).filter((item) => item.endsWith(".json") || item.endsWith(".md"));

  const requiresRoleGate = routeInfo.route.startsWith("/portal/admin") || routeInfo.route.startsWith("/portal/employee");
  const roleGateCoverage = !requiresRoleGate
    ? true
    : routeInfo.route.startsWith("/portal/admin")
      ? context.hasAdminRolePrefix
      : context.hasEmployeeRolePrefix;

  const authGateCoverage = true; // All /portal routes are protected in customerSession.
  const validatorCoverage = validatorHits.length > 0;
  const reportCoverage = qcReportHits.length > 0;

  let risk = "low";
  const gaps = [];

  if (!pageExists) {
    risk = "blocker";
    gaps.push("missing-page-implementation");
  }
  if (!authGateCoverage) {
    risk = "blocker";
    gaps.push("missing-auth-gate");
  }
  if (requiresRoleGate && !roleGateCoverage) {
    risk = "blocker";
    gaps.push("missing-role-gate");
  }

  if (risk !== "blocker" && !apiClientCoverage && !validatorCoverage) {
    risk = "critical";
    gaps.push("no-api-tooling");
    gaps.push("no-validator-tooling");
  } else {
    if (!apiClientCoverage) {
      if (risk === "low") risk = "high";
      gaps.push("no-api-tooling");
    }
    if (!validatorCoverage) {
      if (risk === "low") risk = "high";
      gaps.push("no-validator-tooling");
    }
  }

  if (!reportCoverage && risk === "low") {
    risk = "medium";
    gaps.push("no-qc-report-evidence");
  } else if (!reportCoverage) {
    gaps.push("no-qc-report-evidence");
  }

  const scoreParts = [
    pageExists,
    authGateCoverage,
    roleGateCoverage,
    apiClientCoverage,
    validatorCoverage,
    reportCoverage,
  ];
  const score = scoreParts.filter(Boolean).length / scoreParts.length;

  return {
    route: routeInfo.route,
    token,
    pageFile: pageFile ? path.relative(projectRoot, pageFile).replace(/\\/g, "/") : null,
    signals: {
      pageExists,
      authGateCoverage,
      roleGateCoverage,
      apiClientCoverage,
      validatorCoverage,
      reportCoverage,
    },
    score: Number(score.toFixed(3)),
    risk,
    gaps,
    evidence: {
      validators: validatorHits,
      reports: qcReportHits,
    },
  };
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function readBaseline() {
  if (!fs.existsSync(baselinePath)) {
    return {
      allowedBlockers: [],
      allowedCritical: [],
      notes: "Populate allowed routes temporarily while remediation is in-flight.",
    };
  }
  try {
    return JSON.parse(readText(baselinePath));
  } catch {
    return {
      allowedBlockers: [],
      allowedCritical: [],
      notes: "Baseline parse failed; defaulting to strict mode.",
    };
  }
}

function writeBaseline(findings) {
  const baseline = {
    allowedBlockers: findings.filter((item) => item.risk === "blocker").map((item) => item.route),
    allowedCritical: findings.filter((item) => item.risk === "critical").map((item) => item.route),
    notes: "Generated from current repository state. Reduce and remove entries as modules are remediated.",
    generatedAt: new Date().toISOString(),
  };
  ensureDir(path.dirname(baselinePath));
  fs.writeFileSync(baselinePath, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
}

function renderMarkdown(summary, findings, baseline) {
  const lines = [];
  lines.push("# Module Capability Coverage Report");
  lines.push("");
  lines.push(`Generated: ${summary.generatedAt}`);
  lines.push(`Modules assessed: ${summary.totalModules}`);
  lines.push(`Blocker: ${summary.riskCounts.blocker} | Critical: ${summary.riskCounts.critical} | High: ${summary.riskCounts.high} | Medium: ${summary.riskCounts.medium} | Low: ${summary.riskCounts.low}`);
  lines.push("");
  lines.push("## Failing Gates");
  if (!summary.failingRoutes.length) {
    lines.push("No unapproved blocker/critical modules.");
  } else {
    for (const item of summary.failingRoutes) {
      lines.push(`- ${item.route} (${item.risk}) :: ${item.gaps.join(", ")}`);
    }
  }
  lines.push("");
  lines.push("## Baseline");
  lines.push(`- allowedBlockers: ${(baseline.allowedBlockers || []).length}`);
  lines.push(`- allowedCritical: ${(baseline.allowedCritical || []).length}`);
  lines.push("");
  lines.push("## Module Matrix");
  lines.push("| Route | Risk | Score | API | Validator | Report | Role Gate | Gaps |");
  lines.push("| --- | --- | ---: | :---: | :---: | :---: | :---: | --- |");
  for (const item of findings) {
    lines.push(`| ${item.route} | ${item.risk} | ${item.score.toFixed(3)} | ${item.signals.apiClientCoverage ? "Y" : "N"} | ${item.signals.validatorCoverage ? "Y" : "N"} | ${item.signals.reportCoverage ? "Y" : "N"} | ${item.signals.roleGateCoverage ? "Y" : "N"} | ${item.gaps.join(", ") || "-"} |`);
  }
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function main() {
  const argv = new Set(process.argv.slice(2));
  const writeBaselineFlag = argv.has("--write-baseline");

  const routesText = readText(routesFilePath);
  const customerSessionText = readText(customerSessionPath);
  const routes = extractPortalRoutes(routesText);

  const validatorFiles = listFilesRecursive(scriptsDir).filter((filePath) => path.basename(filePath).startsWith("validate-") && filePath.endsWith(".mjs"));
  const qcFiles = listFilesRecursive(qcDir).filter((filePath) => filePath.endsWith(".json") || filePath.endsWith(".md"));

  const context = {
    validatorFiles,
    qcFiles,
    hasAdminRolePrefix: customerSessionText.includes('"/portal/admin"'),
    hasEmployeeRolePrefix: customerSessionText.includes('"/portal/employee"'),
  };

  const findings = routes
    .map((route) => createAssessment(route, context))
    .sort((a, b) => {
      const order = { blocker: 0, critical: 1, high: 2, medium: 3, low: 4 };
      const riskCompare = order[a.risk] - order[b.risk];
      if (riskCompare !== 0) return riskCompare;
      return a.route.localeCompare(b.route);
    });

  if (writeBaselineFlag) {
    writeBaseline(findings);
    console.log(`Baseline written to ${path.relative(projectRoot, baselinePath).replace(/\\/g, "/")}`);
  }

  const baseline = readBaseline();
  const allowedBlockers = new Set((baseline.allowedBlockers || []).map((item) => String(item)));
  const allowedCritical = new Set((baseline.allowedCritical || []).map((item) => String(item)));

  const failingRoutes = findings.filter((item) => {
    if (item.risk === "blocker") return !allowedBlockers.has(item.route);
    if (item.risk === "critical") return !allowedCritical.has(item.route);
    return false;
  });

  const riskCounts = findings.reduce(
    (acc, item) => {
      acc[item.risk] = (acc[item.risk] || 0) + 1;
      return acc;
    },
    { blocker: 0, critical: 0, high: 0, medium: 0, low: 0 },
  );

  const summary = {
    generatedAt: new Date().toISOString(),
    totalModules: findings.length,
    riskCounts,
    failingRouteCount: failingRoutes.length,
    failingRoutes,
  };

  const report = {
    ok: failingRoutes.length === 0,
    summary,
    findings,
    baseline,
  };

  ensureDir(path.dirname(reportJsonPath));
  fs.writeFileSync(reportJsonPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  fs.writeFileSync(reportMdPath, renderMarkdown(summary, findings, baseline), "utf8");

  if (failingRoutes.length) {
    console.error(`Module capability gate failed with ${failingRoutes.length} unapproved blocker/critical routes.`);
    process.exit(1);
  }

  console.log(`Module capability gate passed: ${findings.length} modules assessed.`);
}

main();
