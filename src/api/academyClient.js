import { centralApi, centralFetch } from "./backendBase";
import { academyCatalog } from "../academyCatalog.js";

async function readJsonSafe(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return null;

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function formatApiError(response, payload, fallbackMessage) {
  const statusSuffix = response.status ? ` (status ${response.status})` : "";
  return payload?.error || `${fallbackMessage}${statusSuffix}.`;
}

function buildProgramDetailFromCatalog(programKey) {
  const program = academyCatalog.programs.find((item) => item.key === programKey);
  if (!program) return null;

  const course = program.courses?.[0];
  const lessonTitles = Array.isArray(course?.lessonTitles) ? course.lessonTitles : [];
  const modules = lessonTitles.map((title, index) => ({
    moduleNumber: index + 1,
    title,
    objective: title,
    lessons: 1,
    practicalLab: course?.lab,
    knowledgeCheck: { passingScore: 80, questionCount: 5 },
  }));

  return {
    ok: true,
    program: {
      key: program.key,
      title: program.title,
      credential: program.credential,
      audience: program.audience,
      duration: program.duration,
      format: program.format,
      goal: program.goal,
      outcomes: program.outcomes,
      linkedSurface: program.linkedSurface,
      linkedLabel: program.linkedLabel,
      deliveryModel: program.format,
      completionRule: "Complete all modules with knowledge checks at 80% or higher.",
    },
    modules,
    completionRequirements: {
      modules: modules.length,
      knowledgeCheckPassingScore: "80%",
      practicalLab: course?.lab || "Complete linked portal lab surfaces where indicated.",
      credential: program.credential,
    },
    backingSource: "client-academy-catalog-fallback",
  };
}

export async function fetchAcademyLms() {
  const response = await centralFetch("/api/academy-lms", { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to load academy state"));
  }
  return payload;
}

export async function fetchAcademyProgram(programKey) {
  const response = await centralFetch(`/api/academy-lms?programKey=${encodeURIComponent(programKey)}`, { method: "GET" });
  const payload = await readJsonSafe(response);
  if (response.ok && payload?.ok) {
    return payload;
  }

  const fallback = buildProgramDetailFromCatalog(programKey);
  if (fallback) {
    return fallback;
  }

  throw new Error(formatApiError(response, payload, "Unable to load academy program"));
}

export async function mutateAcademyLms(action, body = {}) {
  if (!action || typeof action !== "string") {
    throw new Error("Unable to mutate academy state: action is required.");
  }

  const response = await centralFetch("/api/academy-lms", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...body }),
  });

  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to mutate academy state"));
  }
  return payload;
}

export { centralApi, centralFetch };
