#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pythonShellCommand, quoteCommand } from "./lib/pythonRuntime.mjs";

const root = process.cwd();
const githubRoot = path.resolve(root, "..");
const centralRoot = path.join(githubRoot, "auricrux-central");
const mobileRoot = path.join(githubRoot, "fca-mobile-maui");
const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });

const defaultCheckTimeoutMs = Number(process.env.FCA_TOTAL_INTEGRITY_CHECK_TIMEOUT_MS || 1200000);

function firstExisting(paths, predicate = () => true) {
  for (const candidate of paths) {
    if (candidate && fs.existsSync(candidate) && predicate(candidate)) return candidate;
  }
  return "";
}

function resolveAndroidSdkDirectory() {
  const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local");
  return firstExisting([
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    path.join(localAppData, "Android", "Sdk"),
    "C:\\Android\\android-sdk",
    "C:\\Program Files (x86)\\Android\\android-sdk",
  ], (candidate) => fs.existsSync(path.join(candidate, "platform-tools", "adb.exe")));
}

function resolveJavaSdkDirectory() {
  const candidates = [process.env.JAVA_HOME];
  const userJdkRoot = path.join(os.homedir(), ".jdk");
  for (const root of [userJdkRoot, "C:\\Program Files\\Eclipse Adoptium", "C:\\Program Files\\Java"]) {
    if (!fs.existsSync(root)) continue;
    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (entry.isDirectory() && /^jdk[-\d.]/i.test(entry.name)) {
        candidates.push(path.join(root, entry.name));
      }
    }
  }
  return firstExisting(candidates, (candidate) => fs.existsSync(path.join(candidate, "bin", "java.exe")));
}

function msbuildProperty(name, value) {
  return value ? `-p:${name}=${quoteCommand(value)}` : "";
}

function mobileAndroidBuildCommand() {
  return [
    "dotnet build src/FcaMobile/FcaMobile.csproj -c Release -f net8.0-android",
    msbuildProperty("AndroidSdkDirectory", resolveAndroidSdkDirectory()),
    msbuildProperty("JavaSdkDirectory", resolveJavaSdkDirectory()),
  ].filter(Boolean).join(" ");
}

const strictChecks = [
  {
    id: "frontend:routes",
    command: "node scripts/validate-routes.mjs",
    cwd: root,
  },
  {
    id: "frontend:ux-language-quality",
    command: "node scripts/validate-ux-language-quality.mjs",
    cwd: root,
  },
  {
    id: "frontend:product-readiness",
    command: "node scripts/validate-product-readiness-surfaces.mjs",
    cwd: root,
  },
  {
    id: "frontend:platform-qc-matrix",
    command: "node scripts/validate-platform-qc-matrix.mjs",
    cwd: root,
  },
  {
    id: "frontend:fca-sovereignty",
    command: "node scripts/validate-fca-sovereignty.mjs",
    cwd: root,
  },
  {
    id: "frontend:fca-native-payments",
    command: "node scripts/validate-fca-native-payments-journey.mjs",
    cwd: root,
  },
  {
    id: "frontend:finance-workspace",
    command: "node scripts/validate-finance-workspace.mjs",
    cwd: root,
  },
  {
    id: "frontend:operations-pipeline",
    command: "node scripts/validate-operations-pipeline.mjs",
    cwd: root,
  },
  {
    id: "frontend:execution-context",
    command: "node scripts/validate-execution-context-propagation.mjs",
    cwd: root,
  },
  {
    id: "frontend:saas-qc",
    command: "npm run qc:saas",
    cwd: root,
  },
  {
    id: "frontend:lms-qc",
    command: "npm run qc:lms",
    cwd: root,
  },
  {
    id: "frontend:ecosystem-leader-grade",
    command: "npm run qc:ecosystem:leaders",
    cwd: root,
  },
  {
    id: "central:runtime-smoke",
    command: pythonShellCommand("scripts/production_runtime_smoke.py"),
    cwd: centralRoot,
    optional: true,
  },
  {
    id: "central:academy-qc",
    command: pythonShellCommand("scripts/qc_academy.py"),
    cwd: centralRoot,
    optional: true,
  },
  {
    id: "mobile:dotnet-build-android",
    command: mobileAndroidBuildCommand(),
    cwd: mobileRoot,
    optional: true,
  },
  {
    id: "mobile:play-ready-probe",
    command: pythonShellCommand("scripts/ci_probe_play_ready.py"),
    cwd: mobileRoot,
    optional: true,
  },
];

const externalDependencyTokens = [
  "quickbooks",
  "intuit",
  "turbotax",
  "procore",
  "autodesk",
  "salesforce",
  "servicetitan",
  "canvas lms",
  "blackboard",
  "d2l brightspace",
  "moodle",
  "pearson",
  "wgu",
  "western governors",
  "columbia university",
  "nccer",
];

const runtimeScanRoots = [
  path.join(root, "src"),
  path.join(root, "api"),
  path.join(centralRoot, "core"),
  path.join(centralRoot, "apps"),
  path.join(centralRoot, "academy"),
  path.join(mobileRoot, "src"),
];

const allowListFiles = new Set([
  "src/components/design/ApsInteropPanel.jsx",
  "src/academyCatalogTaxonomy.js",
  "src/cteExternalAlignmentSources.js",
  "src/routes/public/Home.js",
  "src/vdoeCteSourceManifest.js",
  "src/components/JourneyStrip.jsx",
  "scripts/stripe-catalog-manifest.json",
  "README.md",
  "docs/",
]);

const staticBlockedTerms = [
  "coming soon",
  "lorem ipsum",
  "todo",
  "tbd",
  "dummy data",
  "fixme",
];

const staticScanRoots = [
  path.join(root, "src"),
  path.join(root, "api"),
  path.join(centralRoot, "core"),
  path.join(mobileRoot, "src"),
];

function normalizeRel(filePath) {
  return path.relative(root, filePath).replace(/\\/g, "/");
}

function readJsonSafe(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

function walkFiles(targetPath, out = []) {
  if (!fs.existsSync(targetPath)) return out;
  const stat = fs.statSync(targetPath);
  if (stat.isDirectory()) {
    const dirName = path.basename(targetPath).toLowerCase();
    if (["node_modules", ".git", "dist", "build", "obj", "bin", "__pycache__", "coverage"].includes(dirName)) {
      return out;
    }
    for (const entry of fs.readdirSync(targetPath)) {
      walkFiles(path.join(targetPath, entry), out);
    }
    return out;
  }

  if (/\.(js|jsx|mjs|cjs|ts|tsx|py|cs|json|md)$/i.test(targetPath)) {
    out.push(targetPath);
  }
  return out;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasDependencyToken(source, token) {
  if (token.includes(" ")) return source.includes(token);
  return new RegExp(`\\b${escapeRegExp(token)}\\b`).test(source);
}

function runCheck(check) {
  if (!fs.existsSync(check.cwd)) {
    return {
      id: check.id,
      command: check.command,
      cwd: check.cwd,
      optional: Boolean(check.optional),
      skipped: true,
      exitCode: check.optional ? 0 : 1,
      stdout: "",
      stderr: `Missing directory: ${check.cwd}`,
      durationMs: 0,
      timedOut: false,
    };
  }

  const startedAt = Date.now();
  console.log(`[fca-total-integrity] ${check.id} :: ${check.command}`);
  const result = spawnSync(check.command, {
    cwd: check.cwd,
    shell: true,
    stdio: "pipe",
    encoding: "utf8",
    env: process.env,
    timeout: check.timeoutMs || defaultCheckTimeoutMs,
    maxBuffer: 1024 * 1024 * 20,
  });
  const durationMs = Date.now() - startedAt;
  const timedOut = result.error?.code === "ETIMEDOUT";
  const exitCode = timedOut ? 124 : (result.status ?? 1);
  console.log(`[fca-total-integrity] ${check.id} => exit ${exitCode} (${durationMs}ms)`);

  return {
    id: check.id,
    command: check.command,
    cwd: check.cwd,
    optional: Boolean(check.optional),
    skipped: false,
    exitCode,
    stdout: (result.stdout || "").trim(),
    stderr: timedOut
      ? `Timed out after ${check.timeoutMs || defaultCheckTimeoutMs}ms. ${(result.stderr || "").trim()}`.trim()
      : (result.stderr || "").trim(),
    durationMs,
    timedOut,
  };
}

const commandResults = strictChecks.map(runCheck);
const commandFailures = commandResults.filter((entry) => entry.exitCode !== 0 && !entry.optional);
const optionalFailures = commandResults.filter((entry) => entry.exitCode !== 0 && entry.optional);

const tokenFindings = [];
for (const scanRoot of runtimeScanRoots) {
  for (const filePath of walkFiles(scanRoot)) {
    const rel = normalizeRel(filePath);
    if (allowListFiles.has(rel)) continue;
    if (rel.startsWith("scripts/")) continue;
    if (rel.startsWith("docs/")) continue;

    const source = fs.readFileSync(filePath, "utf8").toLowerCase();
    for (const token of externalDependencyTokens) {
      if (hasDependencyToken(source, token)) {
        tokenFindings.push({ file: rel, token });
      }
    }
  }
}

const staticQualityFindings = [];
for (const scanRoot of staticScanRoots) {
  for (const filePath of walkFiles(scanRoot)) {
    const rel = normalizeRel(filePath);
    const source = fs.readFileSync(filePath, "utf8").toLowerCase();
    for (const term of staticBlockedTerms) {
      if (source.includes(term)) {
        staticQualityFindings.push({ file: rel, term });
      }
    }
  }
}

const ecosystemReport = readJsonSafe(path.join(outputDir, "ecosystem-leader-grading-report.json"), {});
const moduleScores = Array.isArray(ecosystemReport?.moduleScores) ? ecosystemReport.moduleScores : [];

const moduleScoreFailures = [];
for (const module of moduleScores) {
  const scores = module?.scores || {};
  for (const metric of ["quality", "capability", "customerExperience", "visualPresentation", "composite"]) {
    const value = Number(scores?.[metric] || 0);
    if (!(value > 9.7)) {
      moduleScoreFailures.push({ module: module?.name || "unknown", metric, value });
    }
  }
}

const integrityStatus =
  commandFailures.length === 0
  && tokenFindings.length === 0
  && staticQualityFindings.length === 0
  && moduleScoreFailures.length === 0
    ? "PASS"
    : "FAIL";

const report = {
  generatedAt: new Date().toISOString(),
  status: integrityStatus,
  strictChecks: strictChecks.map((entry) => ({ id: entry.id, command: entry.command, optional: Boolean(entry.optional) })),
  commandResults: commandResults.map((item) => ({
    id: item.id,
    optional: item.optional,
    skipped: item.skipped,
    exitCode: item.exitCode,
    durationMs: item.durationMs,
    timedOut: item.timedOut,
  })),
  commandFailures: commandFailures.map((item) => ({
    id: item.id,
    exitCode: item.exitCode,
    timedOut: item.timedOut,
    excerpt: (item.stderr || item.stdout || "").slice(0, 500),
  })),
  optionalFailures: optionalFailures.map((item) => ({
    id: item.id,
    exitCode: item.exitCode,
    timedOut: item.timedOut,
    excerpt: (item.stderr || item.stdout || "").slice(0, 500),
  })),
  externalDependencyFindings: tokenFindings,
  staticQualityFindings,
  moduleScoreFailures,
};

fs.writeFileSync(
  path.join(outputDir, "fca-total-integrity-report.json"),
  JSON.stringify(report, null, 2),
);

const lines = [
  "# FCA Total Integrity Report",
  "",
  `- Generated: ${report.generatedAt}`,
  `- Status: ${report.status}`,
  `- Strict checks: ${strictChecks.length}`,
  `- Command failures: ${commandFailures.length}`,
  `- Optional check failures: ${optionalFailures.length}`,
  `- External dependency findings: ${tokenFindings.length}`,
  `- Static quality findings: ${staticQualityFindings.length}`,
  `- Module-score failures: ${moduleScoreFailures.length}`,
  "",
  "## Check Results",
  ...report.commandResults.map((entry) => `- ${entry.id}: exit ${entry.exitCode}${entry.optional ? " (optional)" : ""}${entry.skipped ? " (skipped)" : ""}`),
  "",
  "## Command Failures",
  ...(report.commandFailures.length
    ? report.commandFailures.map((entry) => `- ${entry.id}: ${entry.excerpt || "failed"}`)
    : ["- none"]),
  "",
  "## Optional Check Failures",
  ...(report.optionalFailures.length
    ? report.optionalFailures.map((entry) => `- ${entry.id}: ${entry.excerpt || "failed"}`)
    : ["- none"]),
  "",
  "## External Dependency Findings",
  ...(tokenFindings.length
    ? tokenFindings.slice(0, 200).map((finding) => `- ${finding.file}: ${finding.token}`)
    : ["- none"]),
  "",
  "## Static Quality Findings",
  ...(staticQualityFindings.length
    ? staticQualityFindings.slice(0, 200).map((finding) => `- ${finding.file}: ${finding.term}`)
    : ["- none"]),
  "",
  "## Module Score Failures",
  ...(moduleScoreFailures.length
    ? moduleScoreFailures.map((entry) => `- ${entry.module}.${entry.metric}=${entry.value}`)
    : ["- none"]),
  "",
];

fs.writeFileSync(path.join(outputDir, "fca-total-integrity-report.md"), `${lines.join("\n")}\n`);

if (integrityStatus !== "PASS") {
  console.error(
    `FCA total integrity validation failed (commands:${commandFailures.length}, external:${tokenFindings.length}, static:${staticQualityFindings.length}, module:${moduleScoreFailures.length}).`,
  );
  process.exit(1);
}

console.log("FCA total integrity validation passed.");
