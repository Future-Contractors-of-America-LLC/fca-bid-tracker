#!/usr/bin/env node
/**
 * LMS depth + content quality control — catalog, media, live API, CTAs, compliance maps.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runLmsQcSteps } from "./lib/lmsQcSteps.mjs";
import { evaluateLmsBenchmarkAdvancement } from "./lib/lmsBenchmarkAdvancement.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });

const API_BASE = process.env.FCA_API_BASE || "https://auricrux-central.azurewebsites.net";
const result = await runLmsQcSteps(root, { apiBase: API_BASE, log: true });

const { passed, failed, warnings, findings, programCount, totalLessons, lessonsWithMedia, lessonsMissingMedia, mediaCoveragePct } =
  result;

const benchmark = evaluateLmsBenchmarkAdvancement({
  passed,
  failed,
  warnings,
  findings,
  totalLessons,
  mediaCoveragePct,
});

const report = {
  generatedAt: new Date().toISOString(),
  scope: "LMS depth + content QC",
  apiBase: API_BASE,
  programCount,
  totalLessons,
  lessonsWithMedia,
  lessonsMissingMedia,
  mediaCoveragePct,
  summary: { passed, failed, warnings },
  findings,
  benchmark,
};

const md = `# LMS Depth & Content QC Report

- Generated: ${report.generatedAt}
- Programs (static slice): ${report.programCount}
- Total lessons: ${totalLessons}
- Lessons with full media: ${lessonsWithMedia}
- Lessons pending media: ${lessonsMissingMedia}
- Media coverage: ${report.mediaCoveragePct}%
- Passed: ${passed} | Failed: ${failed} | Warnings: ${warnings}
- Benchmark status: ${benchmark.status}
- Benchmark scores: Quality ${benchmark.scores.quality} | Capability ${benchmark.scores.capability} | Customer Experience ${benchmark.scores.customerExperience} | Visual/Presentation ${benchmark.scores.visualPresentation} | Composite ${benchmark.scores.composite}

## Findings
${findings.map((f) => `- **${f.status.toUpperCase()}** ${f.label}${f.detail ? `: ${f.detail}` : ""}`).join("\n")}

## Benchmark Advancement
${benchmark.misses.length === 0
  ? "- All benchmark minimums met (9.7+ across all dimensions)."
  : benchmark.misses.map((miss) => `- ${miss.metric}: ${miss.score} < ${miss.minimum}; delta ${miss.deltaNeeded}; active improvement packet owner ${miss.owner}`).join("\n")}
`;

fs.writeFileSync(path.join(outputDir, "lms-qc-report.json"), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outputDir, "lms-qc-report.md"), md);
fs.writeFileSync(path.join(outputDir, "lms-benchmark-advancement-report.json"), JSON.stringify(benchmark, null, 2));

console.log(`\n=== LMS QC: ${passed} passed, ${failed} failed, ${warnings} warnings ===`);
console.log(`=== LMS Benchmark: ${benchmark.status} | Composite ${benchmark.scores.composite} (minimum ${benchmark.minimums.composite}) ===`);
process.exit(failed > 0 ? 1 : 0);
