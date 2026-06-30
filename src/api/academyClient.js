import { centralApi, centralFetch } from "./backendBase";
import { academyCatalog } from "../academyCatalog.js";
import { resolveProgramCatalogMeta } from "../academyCatalogTaxonomy.js";
import {
  academyDegradedError,
  classifyAcademyResponse,
  readAcademyResponse,
} from "./academyResponseGuard";

function formatApiError(response, payload, fallbackMessage) {
  const statusSuffix = response.status ? ` (status ${response.status})` : "";
  return payload?.error || `${fallbackMessage}${statusSuffix}.`;
}

/**
 * Slice 07 protective wrapper around a central academy fetch. Surfaces a
 * tagged `academy-degraded` Error when the upstream returns an empty body or
 * a non-JSON 5xx (the exact pattern reported by the LMS repair loop) so that
 * AcademyServiceStatusBanner can render a customer-friendly state.
 */
async function readAcademyApi(response, fallbackMessage) {
  const { payload, isEmptyBody } = await readAcademyResponse(response);
  const degraded = classifyAcademyResponse(response, payload, isEmptyBody);
  if (degraded) {
    throw academyDegradedError(degraded, fallbackMessage);
  }
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, fallbackMessage));
  }
  return payload;
}

function buildProgramDetailFromCatalog(programKey) {
  const program = academyCatalog.programs.find((item) => item.key === programKey);
  if (!program) return null;

  const course = program.courses?.[0];
  const lessonTitles = Array.isArray(course?.lessonTitles) ? course.lessonTitles : [];
  const catalogMeta = resolveProgramCatalogMeta(program);
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
      pathwayKey: catalogMeta.pathwayKey,
      topicKey: catalogMeta.topicKey,
      enrollment: catalogMeta.enrollment,
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

export async function fetchAcademyLms(options = {}) {
  const params = new URLSearchParams();
  params.set("view", options.view || "summary");
  if (options.lane) params.set("lane", options.lane);
  if (options.offset != null) params.set("offset", String(options.offset));
  if (options.limit != null) params.set("limit", String(options.limit));
  const response = await centralFetch(`/api/academy-lms?${params.toString()}`, { method: "GET" });
  return readAcademyApi(response, "Unable to load academy state");
}

export async function fetchAcademyProgram(programKey) {
  const response = await centralFetch(`/api/academy-lms?programKey=${encodeURIComponent(programKey)}`, { method: "GET" });
  const { payload, isEmptyBody } = await readAcademyResponse(response);
  if (response.ok && payload?.ok) {
    return payload;
  }

  const fallback = buildProgramDetailFromCatalog(programKey);
  if (fallback) {
    return fallback;
  }

  const degraded = classifyAcademyResponse(response, payload, isEmptyBody);
  if (degraded) {
    throw academyDegradedError(degraded, "Unable to load academy program");
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

  return readAcademyApi(response, "Unable to mutate academy state");
}

export async function exportAcademyTranscript(learnerId) {
  if (!learnerId) {
    throw new Error("Unable to export transcript: learnerId is required.");
  }
  return mutateAcademyLms("export-transcript", { learnerId });
}

export { centralApi, centralFetch };
