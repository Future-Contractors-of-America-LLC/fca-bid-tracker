import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const outputDir = path.join(root, "generated");
await fs.mkdir(outputDir, { recursive: true });

const { operationsPipeline } = await import(pathToFileURL(path.join(root, "src", "operationsPipeline.js")).href);
const generatedAt = new Date().toISOString();

const report = {
  generatedAt,
  stageCount: operationsPipeline.stages.length,
  commandDeckCount: operationsPipeline.commandDeck.length,
  totalArtifactCount: operationsPipeline.stages.reduce((sum, stage) => sum + (stage.artifacts?.length || 0), 0),
  stages: operationsPipeline.stages.map((stage) => ({
    key: stage.key,
    title: stage.title,
    owner: stage.owner,
    primaryRoute: stage.primaryRoute,
    artifactCount: stage.artifacts?.length || 0,
  })),
  commandDeck: operationsPipeline.commandDeck,
};

const markdown = `# FCA Operations Pipeline Report\n\n- Generated at: ${generatedAt}\n- Stage count: ${report.stageCount}\n- Command deck actions: ${report.commandDeckCount}\n- Total named artifacts: ${report.totalArtifactCount}\n\n## Stages\n${operationsPipeline.stages.map((stage, index) => `- **Stage ${index + 1}: ${stage.title}** (${stage.owner}) → ${stage.primaryRoute} · ${stage.artifacts.length} artifacts`).join("\n")}\n\n## Command Deck\n${operationsPipeline.commandDeck.map((action) => `- **${action.title}** → ${action.href}`).join("\n")}
`;

await fs.writeFile(path.join(outputDir, "operations-pipeline-report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outputDir, "operations-pipeline-report.md"), markdown);

console.log(`Generated operations pipeline report with ${report.stageCount} stages and ${report.totalArtifactCount} named artifacts.`);
