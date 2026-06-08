import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";

const root = process.cwd();
const outputDir = path.join(root, "generated");
await fs.mkdir(outputDir, { recursive: true });

const catalogModule = await import(pathToFileURL(path.join(root, "src", "academyCatalog.js")).href);
const programs = catalogModule.academyCatalog?.programs || [];
const generatedAt = new Date().toISOString();

const report = {
  generatedAt,
  programCount: programs.length,
  totalCourseCount: programs.reduce((sum, program) => sum + (program.courses?.length || 0), 0),
  totalOutcomeCount: programs.reduce((sum, program) => sum + (program.outcomes?.length || 0), 0),
  programs: programs.map((program) => ({
    key: program.key,
    title: program.title,
    credential: program.credential,
    duration: program.duration,
    format: program.format,
    linkedSurface: program.linkedSurface,
    courseCount: program.courses?.length || 0,
    outcomeCount: program.outcomes?.length || 0,
  })),
};

const markdown = `# FCA Academy Catalog Report\n\n- Generated at: ${generatedAt}\n- Program count: ${report.programCount}\n- Total courses: ${report.totalCourseCount}\n- Total outcomes: ${report.totalOutcomeCount}\n\n## Programs\n${programs.map((program) => `- **${program.title}** (${program.credential}) · ${program.courses.length} courses · ${program.outcomes.length} outcomes · ${program.linkedSurface}`).join("\n")}
`;

await fs.writeFile(path.join(outputDir, "academy-catalog-report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outputDir, "academy-catalog-report.md"), markdown);

console.log(`Generated academy catalog report with ${report.programCount} programs and ${report.totalCourseCount} courses.`);
