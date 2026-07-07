#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const generatedDir = path.join(root, "generated");
fs.mkdirSync(generatedDir, { recursive: true });

const checks = [
  {
    id: "runtimeProofIntegrity",
    file: path.join(root, "generated", "runtime-proof-integrity-report.json"),
    weight: 0.25,
  },
  {
    id: "moduleCapabilityCoverage",
    file: path.join(root, "docs", "qc", "module-capability-coverage-report.json"),
    weight: 0.25,
  },
  {
    id: "routeAndSurfaceIntegrity",
    file: path.join(root, "generated", "product-readiness-report.json"),
    weight: 0.2,
  },
  {
    id: "liveDeploymentProofCoverage",
    file: path.join(root, "generated", "build-validation-live-proof-coverage-validation.json"),
    weight: 0.3,
  },
];

function existsAndLooksHealthy(filePath) {
  if (!fs.existsSync(filePath)) return false;
  const raw = fs.readFileSync(filePath, "utf8");
  if (!raw.trim()) return false;
  const lower = raw.toLowerCase();
  if (
    lower.includes('"status": "fail"')
    || lower.includes('"passed": false')
    || lower.includes('"ok": false')
    || lower.includes('"success": false')
  ) return false;
  return true;
}

const threshold = Number(process.env.FCA_RELEASE_READINESS_MIN_SCORE || 0.9);
const breakdown = checks.map((check) => ({
  ...check,
  passed: existsAndLooksHealthy(check.file),
}));

const score = breakdown.reduce((acc, item) => acc + (item.passed ? item.weight : 0), 0);
const passed = score >= threshold;

const payload = {
  generatedAt: new Date().toISOString(),
  threshold,
  score: Number(score.toFixed(3)),
  passed,
  breakdown: breakdown.map(({ id, file, weight, passed: checkPassed }) => ({
    id,
    file: path.relative(root, file).replace(/\\/g, "/"),
    weight,
    passed: checkPassed,
  })),
};

const outPath = path.join(generatedDir, "release-readiness-score.json");
fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

if (!passed) {
  console.error(`Release readiness score FAILED (${payload.score} < ${threshold}). See ${path.relative(root, outPath)}.`);
  process.exit(1);
}

console.log(`Release readiness score PASSED (${payload.score} >= ${threshold}).`);
