import { academyCatalog } from "../src/academyCatalog.js";
import * as customerCommandTools from "../src/customerCommandTools.js";

const requiredTracks = [
  "electrical-apprenticeship-year1",
  "osha30-certification-prep",
  "aas-construction-operations-sem1",
  "virginia-dpor-residential-license-prep",
  "fca-contractor-command-user-guide",
];

const requiredToolExports = [
  "stageEstimateRevisionTool",
  "queueProposalFollowupTool",
];

const results = [];
let failed = false;

for (const toolName of requiredToolExports) {
  const ok = typeof customerCommandTools[toolName] === "function";
  if (!ok) failed = true;
  results.push({ type: "tool", name: toolName, ok });
}

for (const trackKey of requiredTracks) {
  const program = academyCatalog.programs.find((item) => item.key === trackKey);
  const course = program?.courses?.[0];
  const ok = Boolean(
    program &&
    course &&
    Array.isArray(course.lessonTitles) && course.lessonTitles.length >= 5 &&
    Array.isArray(course.assignments) && course.assignments.length >= 1 &&
    Array.isArray(course.quizzes) && course.quizzes.length >= 1 &&
    Array.isArray(course.tests) && course.tests.length >= 1 &&
    Array.isArray(course.labs) && course.labs.length >= 1 &&
    course.performanceProfile?.role &&
    Array.isArray(course.performanceProfile?.measures) && course.performanceProfile.measures.length >= 1
  );
  if (!ok) failed = true;
  results.push({ type: "course", name: trackKey, ok });
}

const summary = {
  generatedAt: new Date().toISOString(),
  failed,
  results,
};

console.log(JSON.stringify(summary, null, 2));
if (failed) {
  process.exitCode = 1;
}
