import { app } from "@azure/functions";
import { buildVirginiaCteAcademyPrograms } from "../src/virginiaCteCourses.js";

app.http("cte-program", {
  methods: ["GET"],
  authLevel: "anonymous",
  route: "cte-program",
  handler: async () => {
    const programs = buildVirginiaCteAcademyPrograms();
    const preview = programs.slice(0, 8).map((program) => ({
      key: program.key,
      title: program.title,
      credential: program.credential,
      duration: program.duration,
      gradeLevel: program?.vdoe?.gradeLevel || [],
      courseCode: program?.vdoe?.courseCode || null,
      sourceUrl: program?.vdoe?.sourceUrl || null,
    }));

    return {
      status: 200,
      jsonBody: {
        ok: true,
        programCount: programs.length,
        source: "virginia-cte",
        generatedAt: new Date().toISOString(),
        programs: preview,
      },
    };
  },
});
