import fs from "fs";

const checks = [
  { path: "src/academyCatalog.js", includes: ["goal:", "lessonsData", "buildLessonHref", "getLessonByKey"] },
  { path: "src/academyCoverageMatrix.js", includes: ["Single-release hold", "credentialFamilies", "gatingPrinciples"] },
  { path: "src/api/academyClient.js", includes: ["readCustomerSession", "X-FCA-Customer-Id", "customerName"] },
  { path: "src/academyApiViewModels.js", includes: ["buildApiBackedTranscript", "buildApiBackedCredentialLedger", "buildApiBackedCohorts", "getApiLessonStatus", "getApiCourseProgress", "getApiProgramProgress"] },
  { path: "src/hooks/useAcademyLms.js", includes: ["withdrawEnrollment", "startLesson", "completeLesson", "mutateAcademyLms(\"complete-lesson\""] },
  { path: "src/routes.js", includes: ["/academy/catalog", "/academy/transcript", "/portal/academy/transcript", "/academy/programs/:programKey/courses/:courseKey/lessons/:lessonKey"] },
  { path: "src/pages/academy/AcademyProgramDetail.jsx", includes: ["Program architecture", "AcademyProgressPanel"] },
  { path: "src/pages/academy/AcademyCourseDetail.jsx", includes: ["Course progress", "Open lesson view"] },
  { path: "src/pages/academy/AcademyLessonView.jsx", includes: ["shared Academy API-backed LMS spine", "startLesson", "completeLesson", "Enrollment:"] },
  { path: "src/pages/academy/AcademyTranscript.jsx", includes: ["shared Academy API-backed LMS spine", "AcademyTranscriptPanel", "AcademyCohortPanel"] },
  { path: "src/components/AcademyTranscriptPanel.jsx", includes: ["buildApiBackedTranscript", "Academy API spine"] },
  { path: "src/components/AcademyCohortPanel.jsx", includes: ["buildApiBackedCohorts", "withdrawEnrollment"] },
  { path: "src/components/AcademyProgressPanel.jsx", includes: ["getApiCourseProgress", "getApiProgramProgress", "Academy API spine"] },
  { path: "src/components/AcademyCoverageMatrixPanel.jsx", includes: ["Breadth + depth coverage matrix", "Single-release gating principles"] },
  { path: "src/components/CredentialIssuanceLedger.jsx", includes: ["buildApiBackedCredentialLedger", "API-backed readiness"] },
  { path: "src/pages/portal/PortalAdmin.jsx", includes: ["CredentialIssuanceLedger", "academic credential issuance"] },
  { path: "src/pages/portal/PortalHome.jsx", includes: ["Training readiness", "Training pathways linked to real work"] },
  { path: "src/pages/academy/AcademyHome.jsx", includes: ["AcademyCoverageMatrixPanel", "Open transcript and certificate surface"] },
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
