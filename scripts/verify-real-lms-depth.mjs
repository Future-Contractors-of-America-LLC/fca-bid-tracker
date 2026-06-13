import fs from "fs";

const checks = [
  { path: "src/academyCatalog.js", includes: ["goal:", "lessonsData", "buildLessonHref", "getLessonByKey"] },
  { path: "src/academyCoverageMatrix.js", includes: ["Single-release hold", "credentialFamilies", "gatingPrinciples"] },
  { path: "src/api/academyClient.js", includes: ["readCustomerSession", "X-FCA-Customer-Id", "customerName"] },
  { path: "src/routes.js", includes: ["/academy/catalog", "/academy/transcript", "/portal/academy/transcript", "/academy/programs/:programKey/courses/:courseKey/lessons/:lessonKey"] },
  { path: "src/pages/academy/AcademyProgramDetail.jsx", includes: ["Program architecture", "AcademyProgressPanel"] },
  { path: "src/pages/academy/AcademyCourseDetail.jsx", includes: ["Course progress", "Open lesson view"] },
  { path: "src/pages/academy/AcademyLessonView.jsx", includes: ["Mark Started", "Mark Completed", "Graduate-level prompts"] },
  { path: "src/pages/academy/AcademyTranscript.jsx", includes: ["Transcript, cohort, and credential control", "AcademyTranscriptPanel", "AcademyCohortPanel"] },
  { path: "src/components/AcademyCoverageMatrixPanel.jsx", includes: ["Breadth + depth coverage matrix", "Single-release gating principles"] },
  { path: "src/components/CredentialIssuanceLedger.jsx", includes: ["Credential issuance ledger", "Issue credential"] },
  { path: "src/pages/portal/PortalAdmin.jsx", includes: ["CredentialIssuanceLedger", "academic credential issuance"] },
  { path: "src/pages/portal/PortalHome.jsx", includes: ["Training readiness", "Training pathways linked to real work"] },
  { path: "src/pages/academy/AcademyHome.jsx", includes: ["AcademyCoverageMatrixPanel", "Open transcript and certificate surface"] }
];

const failures = [];

for (const check of checks) {
  const content = fs.readFileSync(check.path, "utf8");
  for (const token of check.includes) {
    if (!content.includes(token)) {
      failures.push(`${check.path} is missing token: ${token}`);
    }
  }
}

if (failures.length) {
  console.error("Real LMS depth verification failed:\n" + failures.join("\n"));
  process.exit(1);
}

console.log("Real LMS depth verification passed.");
