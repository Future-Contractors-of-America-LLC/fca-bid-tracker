import fs from "fs";

const checks = [
  { path: "src/academyCatalog.js", includes: ["goal:", "lessonsData", "buildLessonHref", "getLessonByKey"] },
  { path: "src/academyCoverageMatrix.js", includes: ["Single-release hold", "credentialFamilies", "gatingPrinciples"] },
  { path: "src/api/academyClient.js", includes: ["readCustomerSession", "X-FCA-Customer-Id", "customerName"] },
  { path: "src/context/AcademyLmsContext.jsx", includes: ["AcademyLmsProvider", "useAcademyLmsContext"] },
  { path: "src/academyApiViewModels.js", includes: ["buildApiBackedTranscript", "buildApiBackedCredentialLedger", "buildApiBackedCohorts", "getApiLessonStatus", "getApiCourseProgress", "getApiProgramProgress"] },
  { path: "src/hooks/useAcademyLms.js", includes: ["authoritativeState", "mutationState", "startLesson", "completeLesson", "warning:"] },
  { path: "src/components/AcademyStateAuthorityBanner.jsx", includes: ["Authoritative Academy state active", "Academy truth boundary / API caution"] },
  { path: "src/routes.js", includes: ["/academy/catalog", "/academy/transcript", "/portal/academy/transcript", "/academy/programs/:programKey/courses/:courseKey/lessons/:lessonKey"] },
  { path: "src/pages/academy/AcademyProgramDetail.jsx", includes: ["AcademyLmsProvider", "useAcademyLmsContext", "AcademyProgressPanel academyLms={academyLms}"] },
  { path: "src/pages/academy/AcademyCourseDetail.jsx", includes: ["Course progress", "Open lesson view"] },
  { path: "src/pages/academy/AcademyLessonView.jsx", includes: ["AcademyLmsProvider", "useAcademyLmsContext", "Lesson mutation blocked:"] },
  { path: "src/pages/academy/AcademyTranscript.jsx", includes: ["AcademyLmsProvider", "useAcademyLmsContext", "AcademyTranscriptPanel academyLms={academyLms}"] },
  { path: "src/pages/academy/AcademyHome.jsx", includes: ["AcademyLmsProvider", "useAcademyLmsContext", "AcademyProgressPanel academyLms={academyLms}", "AcademyCohortPanel academyLms={academyLms}", "AcademyTranscriptPanel academyLms={academyLms}"] },
  { path: "src/components/AcademyTranscriptPanel.jsx", includes: ["academyLms", "buildApiBackedTranscript", "Academy API spine"] },
  { path: "src/components/AcademyCohortPanel.jsx", includes: ["academyLms", "buildApiBackedCohorts", "withdrawEnrollment"] },
  { path: "src/components/AcademyProgressPanel.jsx", includes: ["academyLms", "getApiCourseProgress", "getApiProgramProgress", "Academy API spine"] },
  { path: "src/components/AcademyCoverageMatrixPanel.jsx", includes: ["Breadth + depth coverage matrix", "Single-release gating principles"] },
  { path: "src/components/CredentialIssuanceLedger.jsx", includes: ["academyLms", "buildApiBackedCredentialLedger", "API-backed readiness"] },
  { path: "src/pages/portal/PortalAdmin.jsx", includes: ["AcademyLmsProvider", "useAcademyLmsContext", "CredentialIssuanceLedger academyLms={academyLms}"] },
  { path: "src/pages/portal/PortalHome.jsx", includes: ["Training readiness", "Training pathways linked to real work"] },
  { path: "src/academyProgressStore.js", includes: ["Quarantined fallback only.", "should not be treated as", "authoritative product path"] }
];

const failures = [];
for (const check of checks) {
  const content = fs.readFileSync(check.path, "utf8");
  for (const token of check.includes) {
    if (!content.includes(token)) failures.push(`${check.path} is missing token: ${token}`);
  }
}

if (failures.length) {
  console.error("Real LMS depth verification failed:\n" + failures.join("\n"));
  process.exit(1);
}

console.log("Real LMS depth verification passed.");
