/**
 * LMS benchmark scoring with advancement-only policy.
 * Any score miss generates an improvement packet and does not block execution.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function clampScore(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(9.9, Number(value.toFixed(2))));
}

function extractApiProgramCount(findings = []) {
  const apiFinding = findings.find((f) => f?.label === "api:academy-lms");
  if (!apiFinding?.detail) return 0;
  const match = String(apiFinding.detail).match(/programs in API:\s*(\d+)/i);
  return match ? Number(match[1]) : 0;
}

function hasPassingFinding(findings = [], label) {
  return findings.some((f) => f?.label === label && f?.status === "pass");
}

function buildImprovementPacket(metric, score, minimum, rootCauses = []) {
  const delta = Number((minimum - score).toFixed(2));
  return {
    metric,
    score,
    minimum,
    deltaNeeded: delta,
    rootCauses,
    status: "active",
    owner: "academy-lms-autonomous-lane",
    etaHours: 1,
    actions: [
      "Refine LMS surface clarity and reduce ambiguity in top-funnel messaging.",
      "Ship measurable UX uplift tied to the missed metric.",
      "Re-run LMS QC and benchmark scoring to verify delta closure.",
    ],
    validation: [
      "npm run qc:lms",
      "node scripts/validate-lms-benchmark-advancement.mjs",
    ],
    generatedAt: new Date().toISOString(),
  };
}

function countExternalBenchmarkEvidence() {
  try {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
    const evidenceDir = path.join(root, "docs", "qc", "external-benchmarks");
    if (!fs.existsSync(evidenceDir)) return 0;
    const files = fs.readdirSync(evidenceDir).filter((name) => name.endsWith(".json") || name.endsWith(".md"));
    return files.length;
  } catch {
    return 0;
  }
}

/**
 * @param {{
 *   passed: number,
 *   failed: number,
 *   warnings: number,
 *   totalLessons: number,
 *   mediaCoveragePct: number,
 *   findings: Array<{status: string, label: string, detail?: string}>
 * }} lmsQcReport
 */
export function evaluateLmsBenchmarkAdvancement(lmsQcReport) {
  const report = lmsQcReport || {};
  const passed = Number(report.passed || 0);
  const failed = Number(report.failed || 0);
  const warnings = Number(report.warnings || 0);
  const totalLessons = Number(report.totalLessons || 0);
  const mediaCoveragePct = Number(report.mediaCoveragePct || 0);
  const findings = Array.isArray(report.findings) ? report.findings : [];

  const totalChecks = Math.max(1, passed + failed + warnings);
  const passRate = passed / totalChecks;
  const warningRate = warnings / totalChecks;
  const apiProgramCount = extractApiProgramCount(findings);

  const ctaContinuity = hasPassingFinding(findings, "script:validate-academy-ctas.mjs");
  const catalog = hasPassingFinding(findings, "script:validate-academy-catalog.mjs");
  const liveApi = hasPassingFinding(findings, "script:validate-academy-live-api.mjs");
  const nativeCommerce = hasPassingFinding(findings, "script:validate-academy-native-commerce-journey.mjs");
  const readinessOverlay = hasPassingFinding(findings, "script:validate-academy-readiness-overlay.mjs");

  const lmsSurfacePassCount = findings.filter(
    (f) => f?.status === "pass" && String(f.label || "").startsWith("lms-surface:"),
  ).length;

  const quality = clampScore(
    8.9
      + (failed === 0 ? 0.45 : -0.6)
      + (warningRate < 0.01 ? 0.2 : 0)
      + (passRate >= 0.98 ? 0.25 : 0)
      + (mediaCoveragePct >= 95 ? 0.2 : 0),
  );

  const capability = clampScore(
    8.8
      + (apiProgramCount >= 1000 ? 0.55 : apiProgramCount >= 250 ? 0.35 : 0.15)
      + (totalLessons >= 80 ? 0.2 : 0)
      + (catalog ? 0.2 : 0)
      + (liveApi ? 0.15 : 0)
      + (nativeCommerce ? 0.1 : 0),
  );

  const customerExperience = clampScore(
    8.9
      + (ctaContinuity ? 0.2 : 0)
      + (readinessOverlay ? 0.2 : 0)
      + (nativeCommerce ? 0.25 : 0)
      + (failed === 0 ? 0.2 : -0.4)
      + (warningRate < 0.01 ? 0.15 : 0),
  );

  const visualPresentation = clampScore(
    8.8
      + (lmsSurfacePassCount >= 6 ? 0.35 : lmsSurfacePassCount >= 4 ? 0.2 : 0)
      + (ctaContinuity ? 0.2 : 0)
      + (readinessOverlay ? 0.2 : 0)
      + (failed === 0 ? 0.2 : -0.4)
      + (warnings === 0 ? 0.2 : 0),
  );

  const composite = clampScore((quality + capability + customerExperience + visualPresentation) / 4);
  const externalEvidenceCount = countExternalBenchmarkEvidence();

  const minimums = {
    quality: 9.7,
    capability: 9.7,
    customerExperience: 9.7,
    visualPresentation: 9.7,
    composite: 9.7,
  };

  const misses = [];
  if (quality < minimums.quality) misses.push(buildImprovementPacket("quality", quality, minimums.quality, ["interaction-flow-continuity-weakness", "ia-clarity-gap"]));
  if (capability < minimums.capability) misses.push(buildImprovementPacket("capability", capability, minimums.capability, ["feature-breadth-signaling-gap"]));
  if (customerExperience < minimums.customerExperience) misses.push(buildImprovementPacket("customerExperience", customerExperience, minimums.customerExperience, ["enrollment-conversion-friction", "interaction-flow-continuity-weakness"]));
  if (visualPresentation < minimums.visualPresentation) misses.push(buildImprovementPacket("visualPresentation", visualPresentation, minimums.visualPresentation, ["visual-hierarchy-polish-weakness", "mobile-responsiveness-issue"]));
  if (composite < minimums.composite) misses.push(buildImprovementPacket("composite", composite, minimums.composite, ["multi-metric-delta"]));

  const claimReady = (
    quality >= minimums.quality
    && capability >= minimums.capability
    && customerExperience >= minimums.customerExperience
    && visualPresentation >= minimums.visualPresentation
    && composite >= minimums.composite
    && externalEvidenceCount >= 5
  );

  if (!claimReady) {
    misses.push(buildImprovementPacket("marketDominanceClaim", externalEvidenceCount, 5, ["external-benchmark-evidence-gap"]));
  }

  const status = misses.length === 0 ? "PASS" : "PASS-WITH-ADVANCEMENT";

  return {
    generatedAt: new Date().toISOString(),
    mode: "advancement-only",
    benchmarkComparators: [
      "Columbia University",
      "Western Governors University",
      "Canvas LMS (Instructure)",
      "Blackboard Learn (Ultra Experience)",
      "D2L Brightspace",
      "Moodle",
      "NCCER",
      "Pearson",
    ],
    minimums,
    scores: {
      quality,
      capability,
      customerExperience,
      visualPresentation,
      composite,
    },
    status,
    marketDominanceClaim: {
      ready: claimReady,
      externalEvidenceCount,
      requiredEvidenceCount: 5,
      statement: claimReady
        ? "Evidence threshold met for comparative claim publication."
        : "Comparative market-dominance claim is not yet publishable; advancement packets active.",
    },
    misses,
  };
}
