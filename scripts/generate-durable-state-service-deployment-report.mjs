import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const outputDir = path.join(repoRoot, "generated");
const outputPath = path.join(outputDir, "durable_state_service_deployment_report.md");

fs.mkdirSync(outputDir, { recursive: true });

const lines = [
  "# Durable State Service Deployment Report",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "## Included artifacts",
  "- durable-state-service runtime starter",
  "- deployment env example",
  "- deployment and cutover packet",
  "- cutover checklist",
  "- durable packet validation script",
  "",
  "## Expected repository modes",
  "- filesystem",
  "- external-durable",
  "",
  "## Expected durable service repository modes",
  "- filesystem",
  "- database-ready",
  "",
  "## Completion boundary",
  "This report confirms repo-ready deployment artifacts exist. It does not prove live deployment or production cutover.",
];

fs.writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote ${path.relative(repoRoot, outputPath)}`);
