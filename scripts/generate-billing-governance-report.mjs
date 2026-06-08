import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const outputDir = path.join(root, "generated");
await fs.mkdir(outputDir, { recursive: true });

const { billingGovernance } = await import(pathToFileURL(path.join(root, "src", "billingGovernance.js")).href);
const generatedAt = new Date().toISOString();

const report = {
  generatedAt,
  laneCount: billingGovernance.lanes.length,
  revenueSignalCount: billingGovernance.revenueSignals.length,
  conversionLinkCount: billingGovernance.conversionLinks.length,
  lanes: billingGovernance.lanes,
  revenueSignals: billingGovernance.revenueSignals,
  conversionLinks: billingGovernance.conversionLinks,
};

const markdown = `# FCA Billing Governance Report\n\n- Generated at: ${generatedAt}\n- Billing lanes: ${report.laneCount}\n- Revenue signals: ${report.revenueSignalCount}\n- Conversion links: ${report.conversionLinkCount}\n\n## Billing Lanes\n${billingGovernance.lanes.map((lane) => `- **${lane.title}** → ${lane.route} · ${lane.artifacts.length} artifacts`).join("\n")}\n\n## Revenue Signals\n${billingGovernance.revenueSignals.map((signal) => `- ${signal}`).join("\n")}\n\n## Conversion Links\n${billingGovernance.conversionLinks.map((link) => `- **${link.title}** → ${link.href}`).join("\n")}
`;

await fs.writeFile(path.join(outputDir, "billing-governance-report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outputDir, "billing-governance-report.md"), markdown);

console.log(`Generated billing governance report with ${report.laneCount} lanes and ${report.revenueSignalCount} revenue signals.`);
