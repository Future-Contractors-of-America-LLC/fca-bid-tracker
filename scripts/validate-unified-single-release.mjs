import fs from "fs";
import path from "path";

const root = process.cwd();
const failures = [];

function requireFile(relativePath, markers = []) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`Missing required file: ${relativePath}`);
    return "";
  }

  const content = fs.readFileSync(fullPath, "utf8");
  for (const marker of markers) {
    if (!content.includes(marker)) {
      failures.push(`Missing marker in ${relativePath}: ${marker}`);
    }
  }
  return content;
}

requireFile("docs/FCA_UNIFIED_SINGLE_RELEASE_GATE.md", [
  "FCA Contractor Command Unified Release",
  "Unified release gates",
  "Stop-ship conditions",
]);

requireFile("docs/fca-contractor-command-award-handoff-contract.md", [
  "proposal",
  "award",
  "project setup",
  "academy readiness",
]);

requireFile("docs/FCA_UNIFIED_RELEASE_SIGNOFF_CHECKLIST.md", [
  "auth gate",
  "flagship continuity gate",
  "academy gate",
  "deployment gate",
]);

requireFile("src/routes.js", [
  '"/login"',
  '"/portal/platform"',
  '"/academy"',
  '"/portal/projects"',
  '"/portal/proposals"',
]);

requireFile("api/customer-login.js", ["route: \"customer-login\"", "activeMode"]);
requireFile("api/customer-session.js", ["customer-session", "authenticated"]);
requireFile("api/projects.js", ["api-unified-project-spine"]);
requireFile("api/projects-workspace.js", ["api-unified-project-spine"]);
requireFile("api/academy-assignments.js", ["academy-assignments", "projectReadiness"]);
requireFile("api/opportunity-convert.js", ["convert-to-project"]);
requireFile("src/pages/academy/AcademyHome.jsx", ["useAcademyProjectReadiness", "project-linked academy runtime"]);
requireFile("src/pages/portal/PortalProjectDetail.jsx", ["Academy readiness", "api-unified-project-spine"]);
requireFile("src/api/workflowClient.js", ["fetchAcademyAssignments", "fetchProjectWorkspace"]);

if (failures.length > 0) {
  console.error("Unified single-release validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Unified single-release validation passed for release gate artifacts, required APIs, and shared SaaS/LMS surfaces.");
