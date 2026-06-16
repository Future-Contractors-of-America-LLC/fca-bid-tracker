import fs from "fs/promises";
import path from "path";
import { academyCatalog } from "../src/academyCatalog.js";

const root = process.cwd();
const outputDir = path.join(root, "generated");
await fs.mkdir(outputDir, { recursive: true });

const requiredTracks = [
  "electrical-apprenticeship-year1",
  "osha30-certification-prep",
  "aas-construction-operations-sem1",
  "virginia-dpor-residential-license-prep",
  "fca-contractor-command-user-guide",
];

const report = {
  generatedAt: new Date().toISOString(),
  trackCount: requiredTracks.length,
  tracks: requiredTracks.map((key) => {
    const program = academyCatalog.programs.find((item) => item.key === key);
    const course = program?.courses?.[0];
    return {
      key,
      title: program?.title || "missing",
      lessons: course?.lessonTitles?.length || 0,
      assignments: course?.assignments?.length || 0,
      quizzes: course?.quizzes?.length || 0,
      tests: course?.tests?.length || 0,
      labs: course?.labs?.length || 0,
      performanceMeasures: course?.performanceProfile?.measures?.length || 0,
      completionRequirements: course?.completionRequirements?.length || 0,
      evaluationRubric: course?.evaluationRubric?.length || 0,
    };
  }),
};

const markdown = `# Packet Functional Minimums Report\n\n- Generated at: ${report.generatedAt}\n- Tracks checked: ${report.trackCount}\n\n${report.tracks.map((track) => `## ${track.title}\n- Lessons: ${track.lessons}\n- Assignments: ${track.assignments}\n- Quizzes: ${track.quizzes}\n- Tests: ${track.tests}\n- Labs: ${track.labs}\n- Performance measures: ${track.performanceMeasures}\n- Completion requirements: ${track.completionRequirements}\n- Evaluation rubric items: ${track.evaluationRubric}`).join("\n\n")}`;

await fs.writeFile(path.join(outputDir, "packet-functional-minimums-report.json"), JSON.stringify(report, null, 2));
await fs.writeFile(path.join(outputDir, "packet-functional-minimums-report.md"), markdown);

console.log(`Generated packet functional minimums report for ${report.trackCount} tracks.`);
