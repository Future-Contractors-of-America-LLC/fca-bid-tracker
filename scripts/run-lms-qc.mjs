#!/usr/bin/env node
/**
 * LMS depth + content quality control — catalog, media slots, API, CTAs.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { academyCatalog } from "../src/academyCatalog.js";

const root = process.cwd();
const outputDir = path.join(root, "docs", "qc");
fs.mkdirSync(outputDir, { recursive: true });

const API_BASE = process.env.FCA_API_BASE || "https://auricrux-central.azurewebsites.net";
const findings = [];
let passed = 0;
let failed = 0;
let warnings = 0;

function pass(label, detail = "") {
  passed += 1;
  findings.push({ status: "pass", label, detail });
  console.log(`PASS: ${label}${detail ? ` — ${detail}` : ""}`);
}

function fail(label, detail = "") {
  failed += 1;
  findings.push({ status: "fail", label, detail });
  console.error(`FAIL: ${label}${detail ? ` — ${detail}` : ""}`);
}

function warn(label, detail = "") {
  warnings += 1;
  findings.push({ status: "warn", label, detail });
  console.warn(`WARN: ${label}${detail ? ` — ${detail}` : ""}`);
}

const ctaResult = spawnSync("node", ["scripts/validate-academy-ctas.mjs"], {
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (ctaResult.status === 0) pass("script:validate-academy-ctas.mjs");
else fail("script:validate-academy-ctas.mjs");

const routesSource = fs.readFileSync(path.join(root, "src", "routes.js"), "utf8");
const routeKeys = [...routesSource.matchAll(/(["'])(\/[^"']*)\1\s*:/g)].map((m) => m[2]);

let totalLessons = 0;
let lessonsWithMedia = 0;
let lessonsMissingMedia = 0;

for (const program of academyCatalog.programs) {
  if (!program.key || !program.title) fail(`program:${program.key || "unknown"}`, "missing key or title");
  else pass(`program-meta:${program.key}`);

  if (!program.linkedSurface || !routeKeys.includes(program.linkedSurface)) {
    fail(`program-link:${program.key}`, `invalid linkedSurface ${program.linkedSurface}`);
  } else {
    pass(`program-link:${program.key}`, program.linkedSurface);
  }

  if (!Array.isArray(program.courses) || program.courses.length === 0) {
    fail(`program-courses:${program.key}`, "no courses defined");
    continue;
  }

  for (const course of program.courses) {
    const lessonCount = course.lessons || 0;
    const titleCount = Array.isArray(course.lessonTitles) ? course.lessonTitles.length : 0;

    if (lessonCount < 1) fail(`course:${course.code}`, "lessons count is zero");
    else pass(`course-lessons:${course.code}`, `${lessonCount} lessons`);

    if (titleCount !== lessonCount) {
      fail(`course-titles:${course.code}`, `lessonTitles (${titleCount}) != lessons (${lessonCount})`);
    } else {
      pass(`course-titles:${course.code}`);
    }

    if (!course.lab || course.lab.length < 10) warn(`course-lab:${course.code}`, "lab description thin or missing");

    const media = course.lessonMedia || [];
    for (let i = 0; i < lessonCount; i += 1) {
      totalLessons += 1;
      const slot = media[i] || {};
      const hasLecture = Boolean(slot.lectureVideoUrl || slot.lectureAudioUrl);
      const hasLabDemo = Boolean(slot.labDemoVideoUrl);
      const hasEval = Boolean(slot.performanceEvalVideoUrl);

      if (hasLecture && hasLabDemo) {
        lessonsWithMedia += 1;
        pass(`lesson-media:${course.code}:${i + 1}`);
      } else {
        lessonsMissingMedia += 1;
        warn(`lesson-media:${course.code}:${i + 1}`, `lecture=${hasLecture} labDemo=${hasLabDemo} eval=${hasEval} — media pending production`);
      }
    }

    if (!course.outcomes && !program.outcomes?.length) {
      warn(`course-outcomes:${course.code}`, "no explicit outcomes on course or program");
    }
  }

  if (!program.goal || program.goal.length < 20) warn(`program-goal:${program.key}`, "goal text thin");
  if (!Array.isArray(program.outcomes) || program.outcomes.length < 2) warn(`program-outcomes:${program.key}`, "outcomes thin");
}

if (Array.isArray(academyCatalog.pathways) && academyCatalog.pathways.length > 0) {
  pass("pathways", `${academyCatalog.pathways.length} defined`);
} else {
  warn("pathways", "no curriculum pathways defined");
}

for (const programKey of ["contractor-business-formation-legal", "contractor-construction-law-essentials"]) {
  const program = academyCatalog.programs.find((item) => item.key === programKey);
  if (program) pass(`legal-program:${programKey}`, program.title);
  else fail(`legal-program:${programKey}`, "missing from academy catalog");
}

if (fs.existsSync(path.join(root, "api/academy-program-modules.js"))) {
  pass("legal-api:academy-program-modules", "program detail builder present");
} else {
  fail("legal-api:academy-program-modules", "missing api/academy-program-modules.js");
}

try {
  const response = await fetch(`${API_BASE}/api/academy-lms`, { headers: { Accept: "application/json" } });
  const payload = await response.json();
  if (response.ok && payload?.ok) {
    pass("api:academy-lms", `programs in API: ${payload.programs?.length ?? payload.catalog?.programs?.length ?? "unknown"}`);
    if (payload.learners !== undefined) pass("api:academy-learners", `${payload.learners?.length ?? 0} learners`);
    if (payload.enrollments !== undefined) pass("api:academy-enrollments", `${payload.enrollments?.length ?? 0} enrollments`);
  } else {
    fail("api:academy-lms", `HTTP ${response.status}`);
  }
} catch (error) {
  fail("api:academy-lms", error.message);
}

const lmsPages = [
  "src/pages/academy/AcademyHome.jsx",
  "src/pages/academy/AcademyCatalog.jsx",
  "src/hooks/useAcademyLms.js",
  "src/api/academyClient.js",
];
for (const page of lmsPages) {
  if (fs.existsSync(path.join(root, page))) pass(`lms-surface:${page}`);
  else fail(`lms-surface:${page}`, "missing");
}

const report = {
  generatedAt: new Date().toISOString(),
  scope: "LMS depth + content QC",
  apiBase: API_BASE,
  programCount: academyCatalog.programs.length,
  totalLessons,
  lessonsWithMedia,
  lessonsMissingMedia,
  mediaCoveragePct: totalLessons ? Math.round((lessonsWithMedia / totalLessons) * 100) : 0,
  summary: { passed, failed, warnings },
  findings,
};

const md = `# LMS Depth & Content QC Report

- Generated: ${report.generatedAt}
- Programs: ${report.programCount}
- Total lessons: ${totalLessons}
- Lessons with full media: ${lessonsWithMedia}
- Lessons pending media: ${lessonsMissingMedia}
- Media coverage: ${report.mediaCoveragePct}%
- Passed: ${passed} | Failed: ${failed} | Warnings: ${warnings}

## Content depth notes
- Every program must have courses, lesson counts matching titles, and a valid linked portal surface.
- Prerecorded lecture + lab demo + performance eval videos are tracked per lesson via \`course.lessonMedia[]\`.
- Warnings for missing media are expected until Foundry production pipeline fills slots.

## Findings
${findings.map((f) => `- **${f.status.toUpperCase()}** ${f.label}${f.detail ? `: ${f.detail}` : ""}`).join("\n")}
`;

fs.writeFileSync(path.join(outputDir, "lms-qc-report.json"), JSON.stringify(report, null, 2));
fs.writeFileSync(path.join(outputDir, "lms-qc-report.md"), md);

console.log(`\n=== LMS QC: ${passed} passed, ${failed} failed, ${warnings} warnings ===`);
process.exit(failed > 0 ? 1 : 0);
