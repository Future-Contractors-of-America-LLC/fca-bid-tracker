import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "components", "AcademyReadinessOverlay.jsx"),
    markers: [
      'setProductAccess("lms", true)',
      'setCommsAccess("lecture", true)',
      'setCommsAccess("email", true)',
      'setCommsAccess("conference", true)',
      'setCommsAccess("teams", true)',
      'applyPlanPreset("enterprise")',
      'Repair Academy Dependencies',
      'Activate Enterprise Academy Readiness',
    ],
  },
  {
    file: path.join(root, "src", "pages", "academy", "AcademyHome.jsx"),
    markers: [
      'import AcademyReadinessOverlay from "../../components/AcademyReadinessOverlay";',
      '<AcademyReadinessOverlay',
      'setProductAccess={setProductAccess}',
      'setCommsAccess={setCommsAccess}',
      'applyPlanPreset={applyPlanPreset}',
      'refreshSyncStamp={refreshSyncStamp}',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required academy readiness marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Academy readiness overlay validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Academy readiness overlay validation passed.");
