import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const outputDir = path.join(root, "generated");
await fs.mkdir(outputDir, { recursive: true });

const { adminGovernance } = await import(pathToFileURL(path.join(root, "src", "adminGovernance.js")).href);
const generatedAt = new Date().toISOString();

const report = {
  generatedAt,
  controlCount: adminGovernance.controls.length,
  readinessSignalCount: adminGovernance.readinessSignals.length,
  governanceActionCount: adminGovernance.governanceActions.length,
  controls: adminGovernance.controls,
  readinessSignals: adminGovernance.readinessSignals,
  governanceActions: adminGovernance.governanceActions,
};

const markdown = `# FCA Admin Governance Report\n\n- Generated at: ${generatedAt}\n- Admin controls: ${report.controlCount}\n- Readiness signals: ${report.readinessSignalCount}\n- Governance actions: ${report.governanceActionCount}\n\n## Controls\n${adminGovernance.controls.map((control) => `- **${control.title}** → ${control.route} · ${control.artifacts.length} artifacts`).join("\n")}\n\n## Readiness Signals\n${adminGovernance.readinessSignals.map((signal) => `- ${signal}`).join("\n")}\n\n## Governance Actions\n${adminGovernance.governanceActions.map((action) => `- **${action.title}** → ${action.href}`).join("\n")}
`;

await fs.writeFile(path.join(outputDir, "admin-governance-report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outputDir, "admin-governance-report.md"), markdown);

console.log(`Generated admin governance report with ${report.controlCount} controls and ${report.readinessSignalCount} readiness signals.`);
