import fs from "fs/promises";
import path from "path";
import { academyCatalog } from "../src/academyCatalog.js";

const root = process.cwd();
const outputDir = path.join(root, "generated");
await fs.mkdir(outputDir, { recursive: true });

const generatedAt = new Date().toISOString();
const credentials = Array.isArray(academyCatalog.credentials) ? academyCatalog.credentials : [];
const pathways = Array.isArray(academyCatalog.pathways) ? academyCatalog.pathways : [];

const report = {
  generatedAt,
  programCount: academyCatalog.programs.length,
  credentialCount: credentials.length,
  pathwayCount: pathways.length,
  programs: academyCatalog.programs.map((program) => ({
    key: program.key,
    title: program.title,
    credential: program.credential,
    audience: program.audience,
    duration: program.duration,
    format: program.format,
    courseCount: Array.isArray(program.courses) ? program.courses.length : 0,
    lessonCount: Array.isArray(program.courses)
      ? program.courses.reduce((total, course) => total + (course.lessons || 0), 0)
      : 0,
    linkedSurface: program.linkedSurface,
  })),
  credentials,
  pathways,
};

const markdown = `# FCA Academy Catalog Report\n\n- Generated at: ${generatedAt}\n- Programs: ${report.programCount}\n- Credentials: ${report.credentialCount}\n- Curriculum pathways: ${report.pathwayCount}\n\n## Programs\n${academyCatalog.programs.map((program) => `- **${program.title}** (${program.credential}) · ${program.duration} · ${program.format} · courses: ${Array.isArray(program.courses) ? program.courses.length : 0}`).join("\n")}\n\n## Credentials\n${credentials.length ? credentials.map((credential) => `- **${credential.title}** · Renewal: ${credential.renewal}`).join("\n") : "- No standalone credential registry is currently defined in repo truth."}\n\n## Curriculum Pathways\n${pathways.map((pathway) => `- **${pathway.title}** → ${pathway.route}`).join("\n")}`;

await fs.writeFile(path.join(outputDir, "academy-catalog-report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outputDir, "academy-catalog-report.md"), markdown);

console.log(`Generated academy catalog report with ${report.programCount} programs, ${report.credentialCount} credentials, and ${report.pathwayCount} curriculum pathways.`);
