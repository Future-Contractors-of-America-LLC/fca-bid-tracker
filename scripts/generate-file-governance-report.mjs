import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const outputDir = path.join(root, "generated");
await fs.mkdir(outputDir, { recursive: true });

const { fileGovernance } = await import(pathToFileURL(path.join(root, "src", "fileGovernance.js")).href);
const generatedAt = new Date().toISOString();

const report = {
  generatedAt,
  registerCount: fileGovernance.registers.length,
  closeoutPackageCount: fileGovernance.closeoutPackages.length,
  auditSignalCount: fileGovernance.auditSignals.length,
  registers: fileGovernance.registers,
  closeoutPackages: fileGovernance.closeoutPackages,
  auditSignals: fileGovernance.auditSignals,
};

const markdown = `# FCA File Governance Report\n\n- Generated at: ${generatedAt}\n- Registers: ${report.registerCount}\n- Closeout package items: ${report.closeoutPackageCount}\n- Audit signals: ${report.auditSignalCount}\n\n## Registers\n${fileGovernance.registers.map((register) => `- **${register.title}** → ${register.route} · ${register.artifacts.length} artifacts`).join("\n")}\n\n## Closeout Package\n${fileGovernance.closeoutPackages.map((item) => `- ${item}`).join("\n")}\n\n## Audit Signals\n${fileGovernance.auditSignals.map((signal) => `- ${signal}`).join("\n")}
`;

await fs.writeFile(path.join(outputDir, "file-governance-report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outputDir, "file-governance-report.md"), markdown);

console.log(`Generated file governance report with ${report.registerCount} registers and ${report.closeoutPackageCount} closeout items.`);
