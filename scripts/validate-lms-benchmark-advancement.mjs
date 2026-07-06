#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateLmsBenchmarkAdvancement } from "./lib/lmsBenchmarkAdvancement.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDir = path.join(root, "docs", "qc");
const lmsReportPath = path.join(outputDir, "lms-qc-report.json");
const benchmarkJsonPath = path.join(outputDir, "lms-benchmark-advancement-report.json");
const benchmarkMdPath = path.join(outputDir, "lms-benchmark-advancement-report.md");

fs.mkdirSync(outputDir, { recursive: true });

let lmsReport = {
  passed: 0,
  failed: 0,
  warnings: 0,
  totalLessons: 0,
  mediaCoveragePct: 0,
  findings: [],
};

if (fs.existsSync(lmsReportPath)) {
  try {
    lmsReport = JSON.parse(fs.readFileSync(lmsReportPath, "utf8"));
  } catch {
    // continue with zeroed report and still emit advancement packet(s)
  }
}

const benchmark = evaluateLmsBenchmarkAdvancement(lmsReport);

const md = `# LMS Benchmark Advancement Report

- Generated: ${benchmark.generatedAt}
- Mode: ${benchmark.mode}
- Status: ${benchmark.status}

## Minimums

- Quality: ${benchmark.minimums.quality}
- Capability: ${benchmark.minimums.capability}
- Customer Experience: ${benchmark.minimums.customerExperience}
- Visual/Presentation: ${benchmark.minimums.visualPresentation}
- Composite: ${benchmark.minimums.composite}

## Scores

- Quality: ${benchmark.scores.quality}
- Capability: ${benchmark.scores.capability}
- Customer Experience: ${benchmark.scores.customerExperience}
- Visual/Presentation: ${benchmark.scores.visualPresentation}
- Composite: ${benchmark.scores.composite}

## Comparators

${benchmark.benchmarkComparators.map((name) => `- ${name}`).join("\n")}

## Advancement Packets

${benchmark.misses.length === 0
    ? "- None"
    : benchmark.misses
      .map(
        (miss) => `- ${miss.metric}: score ${miss.score} below minimum ${miss.minimum}; delta ${miss.deltaNeeded}; owner ${miss.owner}; ETA ${miss.etaHours}h`,
      )
      .join("\n")}
`;

fs.writeFileSync(benchmarkJsonPath, JSON.stringify(benchmark, null, 2));
fs.writeFileSync(benchmarkMdPath, md);

if (benchmark.misses.length > 0) {
  console.warn(`ADVANCEMENT: ${benchmark.misses.length} metric miss(es) converted to active improvement packets.`);
} else {
  console.log("PASS: all benchmark minimums met at or above 9.7.");
}

// Advancement-only policy: never block or restart execution.
process.exit(0);
