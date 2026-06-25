#!/usr/bin/env node
/**
 * LMS depth + content quality control — catalog, media, live API, CTAs, compliance maps.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runLmsQcSteps } from "./lib/lmsQcSteps.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });

const API_BASE = process.env.FCA_API_BASE || "https://auricrux-central.azurewebsites.net";
const result = await runLmsQcSteps(root, { apiBase: API_BASE, log: true });

const { passed, failed, warnings, findings, programCount, totalLessons, lessonsWithMedia, lessonsMissingMedia, mediaCoveragePct } =
  result;

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
};

const md = `# LMS Depth & Content QC Report

- Generated: ${report.generatedAt}
- Programs (static slice): ${report.programCount}
- Total lessons: ${totalLessons}
- Lessons with full media: ${lessonsWithMedia}
- Lessons pending media: ${lessonsMissingMedia}
- Media coverage: ${report.mediaCoveragePct}%
- Passed: ${passed} | Failed: ${failed} | Warnings: ${warnings}

## Findings
${findings.map((f) => `- **${f.status.toUpperCase()}** ${f.label}${f.detail ? `: ${f.detail}` : ""}`).join("\n")}
`;

fs.writeFileSync(path.join(outputDir, "lms-qc-report.json"), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outputDir, "lms-qc-report.md"), md);

console.log(`\n=== LMS QC: ${passed} passed, ${failed} failed, ${warnings} warnings ===`);
process.exit(failed > 0 ? 1 : 0);
