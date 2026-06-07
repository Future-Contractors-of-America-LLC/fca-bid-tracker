import fs from "fs/promises";
import path from "path";

const root = process.cwd();

const checks = [
  {
    file: path.join(root, "src", "projectWorkspaceStore.js"),
    markers: [
      'export const PROJECT_WORKSPACE_KEY = "fca_project_workspace_v1";',
      'export function readProjectWorkspace()',
      'export function writeProjectWorkspace(projects = [])',
      'export function updateProjectWorkspace(mutator)',
    ],
  },
  {
    file: path.join(root, "src", "hooks", "useProjectWorkspace.js"),
    markers: [
      'appendAutomationLog({',
      'appendCommercialLog({',
      'advanceProjectStage(projectId, stage, detail)',
      'clearPermitBlocker(projectId, detail',
    ],
  },
  {
    file: path.join(root, "src", "components", "ProjectActionCenter.jsx"),
    markers: [
      'Clear Permit Blocker',
      'Move to Execution',
      'Move to Closeout',
    ],
  },
  {
    file: path.join(root, "src", "pages", "portal", "PortalProjects.jsx"),
    markers: [
      'import useProjectWorkspace from "../../hooks/useProjectWorkspace";',
      'import ProjectActionCenter from "../../components/ProjectActionCenter";',
      'import CommercialContinuityFeed from "../../components/CommercialContinuityFeed";',
      'import AutomationRecoveryFeed from "../../components/AutomationRecoveryFeed";',
      '<ProjectActionCenter project={project}',
      '<CommercialContinuityFeed title="Project commercial continuity feed"',
      '<AutomationRecoveryFeed title="Project automation feed"',
    ],
  },
];

const failures = [];
for (const check of checks) {
  const source = await fs.readFile(check.file, "utf8");
  for (const marker of check.markers) {
    if (!source.includes(marker)) {
      failures.push(`${path.basename(check.file)} is missing required project workspace marker: ${marker}`);
    }
  }
}

if (failures.length > 0) {
  console.error("Project workspace validation failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Project workspace validation passed.");
