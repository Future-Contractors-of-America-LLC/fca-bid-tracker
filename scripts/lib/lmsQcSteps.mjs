/**
 * Shared LMS static/content QC steps for qc:lms and academy simulation Observe phase 1.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { academyCatalog } from "../../src/academyCatalog.js";

export const ACADEMY_SCRIPTS = [
  "validate-academy-ctas.mjs",
  "validate-academy-catalog.mjs",
  "validate-academy-excellence.mjs",
  "validate-academy-cte-curriculum.mjs",
  "validate-cte-shadow-environment.mjs",
  "validate-system-security-hardening.mjs",
  "validate-phase3-zero-trust-audit.mjs",
  "validate-catalog-balance.mjs",
  "validate-academy-media.mjs",
  "validate-academy-readiness-overlay.mjs",
  "validate-academy-live-api.mjs",
  "validate-academy-native-commerce-journey.mjs",
];

function resolvePublicMediaPath(root, url = "") {
  if (!url || typeof url !== "string") return null;
  const bare = url.split("#")[0].split("?")[0];
  if (!bare.startsWith("/academy/media/")) return null;
  return path.join(root, "public", bare.replace(/^\//, ""));
}

function mediaUrlReady(root, url = "") {
  if (!url) return false;
  const filePath = resolvePublicMediaPath(root, url);
  if (!filePath) return true;
  return fs.existsSync(filePath);
}

function slotLectureUrl(slot = {}) {
  return slot.auricruxLectureUrl || slot.lectureVideoUrl || slot.lectureAudioUrl || slot.lectureUrl || "";
}

function slotLabDemoUrl(slot = {}) {
  return slot.labDemoUrl || slot.skillsDemoUrl || slot.labDemoVideoUrl || "";
}

function slotEvalUrl(slot = {}) {
  return slot.performanceEvalVideoUrl || "";
}

function recordStep(steps, findings, counters, status, label, detail = "") {
  if (status === "pass") counters.passed += 1;
  else if (status === "fail") counters.failed += 1;
  else counters.warnings += 1;
  findings.push({ status, label, detail });
  steps.push({
    name: label,
    status: status === "fail" ? "fail" : "pass",
    detail: status === "warn" ? `warn: ${detail}` : detail,
    phase: "static-qc",
  });
}

/**
 * @param {string} root - repo root
 * @param {{ apiBase?: string, log?: boolean }} [options]
 */
export async function runLmsQcSteps(root, options = {}) {
  const apiBase = options.apiBase || process.env.FCA_API_BASE || "https://auricrux-central.azurewebsites.net";
  const log = options.log !== false;
  const steps = [];
  const findings = [];
  const counters = { passed: 0, failed: 0, warnings: 0 };

  const say = (status, label, detail = "") => {
    recordStep(steps, findings, counters, status, label, detail);
    if (!log) return;
    if (status === "pass") console.log(`PASS: ${label}${detail ? ` - ${detail}` : ""}`);
    else if (status === "fail") console.error(`FAIL: ${label}${detail ? ` - ${detail}` : ""}`);
    else console.warn(`WARN: ${label}${detail ? ` - ${detail}` : ""}`);
  };

  for (const script of ACADEMY_SCRIPTS) {
    const result = spawnSync(process.execPath, [path.join(root, "scripts", script)], {
      stdio: log ? "inherit" : "pipe",
      cwd: root,
      env: { ...process.env, FCA_API_BASE: apiBase },
    });
    if (result.status === 0) say("pass", `script:${script}`);
    else say("fail", `script:${script}`);
  }

  const routesSource = fs.readFileSync(path.join(root, "src", "routes.js"), "utf8");
  const routeKeys = [...routesSource.matchAll(/(["'])(\/[^"']*)\1\s*:/g)].map((m) => m[2]);

  let totalLessons = 0;
  let lessonsWithMedia = 0;
  let lessonsMissingMedia = 0;

  for (const program of academyCatalog.programs) {
    if (!program.key || !program.title) say("fail", `program:${program.key || "unknown"}`, "missing key or title");
    else say("pass", `program-meta:${program.key}`);

    if (!program.linkedSurface || !routeKeys.includes(program.linkedSurface)) {
      say("fail", `program-link:${program.key}`, `invalid linkedSurface ${program.linkedSurface}`);
    } else {
      say("pass", `program-link:${program.key}`, program.linkedSurface);
    }

    if (!Array.isArray(program.courses) || program.courses.length === 0) {
      say("fail", `program-courses:${program.key}`, "no courses defined");
      continue;
    }

    for (const course of program.courses) {
      const lessonCount = course.lessons || 0;
      const titleCount = Array.isArray(course.lessonTitles) ? course.lessonTitles.length : 0;

      if (lessonCount < 1) say("fail", `course:${course.code}`, "lessons count is zero");
      else say("pass", `course-lessons:${course.code}`, `${lessonCount} lessons`);

      if (titleCount !== lessonCount) {
        say("fail", `course-titles:${course.code}`, `lessonTitles (${titleCount}) != lessons (${lessonCount})`);
      } else {
        say("pass", `course-titles:${course.code}`);
      }

      if (!course.lab || course.lab.length < 10) say("warn", `course-lab:${course.code}`, "lab description thin or missing");

      const media = course.lessonMedia || [];
      for (let i = 0; i < lessonCount; i += 1) {
        totalLessons += 1;
        const slot = media[i] || {};
        const lectureUrl = slotLectureUrl(slot);
        const labDemoUrl = slotLabDemoUrl(slot);
        const evalUrl = slotEvalUrl(slot);
        const hasLecture = mediaUrlReady(root, lectureUrl);
        const hasLabDemo = mediaUrlReady(root, labDemoUrl);
        const hasEval = Boolean(evalUrl) && mediaUrlReady(root, evalUrl);

        if (hasLecture && hasLabDemo) {
          lessonsWithMedia += 1;
          say("pass", `lesson-media:${course.code}:${i + 1}`, hasEval ? "lecture+lab+eval" : "lecture+lab");
        } else {
          lessonsMissingMedia += 1;
          const missing = [];
          if (!hasLecture) missing.push("lecture");
          if (!hasLabDemo) missing.push("labDemo");
          say(
            "fail",
            `lesson-media:${course.code}:${i + 1}`,
            `missing ${missing.join(", ")}${evalUrl && !hasEval ? " (eval pending)" : ""}`,
          );
        }
      }

      if (!course.outcomes && !program.outcomes?.length) {
        say("warn", `course-outcomes:${course.code}`, "no explicit outcomes on course or program");
      }
    }

    if (!program.goal || program.goal.length < 20) say("warn", `program-goal:${program.key}`, "goal text thin");
    if (!Array.isArray(program.outcomes) || program.outcomes.length < 2) {
      say("warn", `program-outcomes:${program.key}`, "outcomes thin");
    }
  }

  if (Array.isArray(academyCatalog.pathways) && academyCatalog.pathways.length > 0) {
    say("pass", "pathways", `${academyCatalog.pathways.length} defined`);
  } else {
    say("warn", "pathways", "no curriculum pathways defined");
  }

  for (const programKey of ["contractor-business-formation-legal", "contractor-construction-law-essentials"]) {
    const program = academyCatalog.programs.find((item) => item.key === programKey);
    if (program) say("pass", `legal-program:${programKey}`, program.title);
    else say("fail", `legal-program:${programKey}`, "missing from academy catalog");
  }

  if (fs.existsSync(path.join(root, "api/academy-program-modules.js"))) {
    say("pass", "legal-api:academy-program-modules", "program detail builder present");
  } else {
    say("fail", "legal-api:academy-program-modules", "missing api/academy-program-modules.js");
  }

  try {
    const response = await fetch(`${apiBase}/api/academy-lms?view=summary`, { headers: { Accept: "application/json" } });
    const payload = await response.json();
    if (response.ok && payload?.ok) {
      const count = payload.catalog?.totalPrograms ?? payload.catalog?.programs?.length ?? "unknown";
      say("pass", "api:academy-lms", `programs in API: ${count}`);
      if (payload.catalogIntegrity?.aligned) say("pass", "api:catalog-integrity", "aligned");
      else say("warn", "api:catalog-integrity", "not aligned or missing");
      if (payload.learners !== undefined) say("pass", "api:academy-learners", `${payload.learners?.length ?? 0} learners`);
      if (payload.enrollments !== undefined) {
        say("pass", "api:academy-enrollments", `${payload.enrollments?.length ?? 0} enrollments`);
      }
    } else {
      say("fail", "api:academy-lms", `HTTP ${response.status}`);
    }
  } catch (error) {
    say("fail", "api:academy-lms", error.message);
  }

  const lmsPages = [
    "src/pages/academy/AcademyHome.jsx",
    "src/pages/academy/AcademyCatalog.jsx",
    "src/pages/academy/AcademyModuleLesson.jsx",
    "src/pages/academy/AcademyProgramDetail.jsx",
    "src/hooks/useAcademyLms.js",
    "src/api/academyClient.js",
  ];
  for (const page of lmsPages) {
    if (fs.existsSync(path.join(root, page))) say("pass", `lms-surface:${page}`);
    else say("fail", `lms-surface:${page}`, "missing");
  }

  return {
    steps,
    findings,
    passed: counters.passed,
    failed: counters.failed,
    warnings: counters.warnings,
    apiBase,
    programCount: academyCatalog.programs.length,
    totalLessons,
    lessonsWithMedia,
    lessonsMissingMedia,
    mediaCoveragePct: totalLessons ? Math.round((lessonsWithMedia / totalLessons) * 100) : 0,
  };
}
