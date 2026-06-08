import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const outputDir = path.join(root, "generated");
await fs.mkdir(outputDir, { recursive: true });

const { supportGovernance } = await import(pathToFileURL(path.join(root, "src", "supportGovernance.js")).href);
const generatedAt = new Date().toISOString();

const report = {
  generatedAt,
  laneCount: supportGovernance.lanes.length,
  responseSignalCount: supportGovernance.responseSignals.length,
  recoveryActionCount: supportGovernance.commsRecoveryActions.length,
  lanes: supportGovernance.lanes,
  responseSignals: supportGovernance.responseSignals,
  commsRecoveryActions: supportGovernance.commsRecoveryActions,
};

const markdown = `# FCA Support Governance Report\n\n- Generated at: ${generatedAt}\n- Support lanes: ${report.laneCount}\n- Response signals: ${report.responseSignalCount}\n- Recovery actions: ${report.recoveryActionCount}\n\n## Support Lanes\n${supportGovernance.lanes.map((lane) => `- **${lane.title}** → ${lane.route} · ${lane.artifacts.length} artifacts`).join("\n")}\n\n## Response Signals\n${supportGovernance.responseSignals.map((signal) => `- ${signal}`).join("\n")}\n\n## Recovery Actions\n${supportGovernance.commsRecoveryActions.map((action) => `- **${action.title}** → ${action.href}`).join("\n")}
`;

await fs.writeFile(path.join(outputDir, "support-governance-report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outputDir, "support-governance-report.md"), markdown);

console.log(`Generated support governance report with ${report.laneCount} lanes and ${report.responseSignalCount} response signals.`);
