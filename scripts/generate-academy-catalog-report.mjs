import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const outputDir = path.join(root, "generated");
await fs.mkdir(outputDir, { recursive: true });

const catalogModule = await import(pathToFileURL(path.join(root, "src", "academyCatalog.js")).href);
const { academyCatalog } = catalogModule;
const generatedAt = new Date().toISOString();

const report = {
  generatedAt,
  programCount: academyCatalog.programs.length,
  credentialCount: academyCatalog.credentials.length,
  pathwayCount: academyCatalog.pathways.length,
  programs: academyCatalog.programs.map((program) => ({
    key: program.key,
    title: program.title,
    credential: program.credential,
    audience: program.audience,
    duration: program.duration,
    classroomCount: Array.isArray(program.classrooms) ? program.classrooms.length : 0,
    stackCount: Array.isArray(program.stack) ? program.stack.length : 0,
  })),
  credentials: academyCatalog.credentials,
  pathways: academyCatalog.pathways,
};

const markdown = `# FCA Academy Catalog Report\n\n- Generated at: ${generatedAt}\n- Programs: ${report.programCount}\n- Credentials: ${report.credentialCount}\n- Curriculum pathways: ${report.pathwayCount}\n\n## Programs\n${academyCatalog.programs.map((program) => `- **${program.title}** (${program.credential}) · ${program.duration} · ${program.format}`).join("\n")}\n\n## Credentials\n${academyCatalog.credentials.map((credential) => `- **${credential.title}** · Renewal: ${credential.renewal}`).join("\n")}\n\n## Curriculum Pathways\n${academyCatalog.pathways.map((pathway) => `- **${pathway.title}** → ${pathway.route}`).join("\n")}
`;

await fs.writeFile(path.join(outputDir, "academy-catalog-report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outputDir, "academy-catalog-report.md"), markdown);

console.log(`Generated academy catalog report with ${report.programCount} programs, ${report.credentialCount} credentials, and ${report.pathwayCount} curriculum pathways.`);
