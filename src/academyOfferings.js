import { academyCatalog } from "./academyCatalog.js";

/** Organized Academy taxonomy for customers and investors. */
export const OFFERING_LANES = [
  {
    key: "apprenticeship",
    label: "Apprenticeship",
    description: "Electrical and trade apprenticeship pathways from Level 1 through specialization.",
    credentialType: "Apprenticeship Certificate",
  },
  {
    key: "degree",
    label: "Degree Programs",
    description: "Associate and applied degree tracks tied to construction operations.",
    credentialType: "Degree Track",
  },
  {
    key: "certification",
    label: "Certification",
    description: "Industry certifications including OSHA, safety, and trade readiness.",
    credentialType: "Professional Certificate",
  },
  {
    key: "licensure",
    label: "Licensure Prep",
    description: "State and local contractor licensure preparation programs.",
    credentialType: "Licensure Prep",
  },
  {
    key: "operator",
    label: "Operator & How-To",
    description: "FCA platform operator guides and customer onboarding courses.",
    credentialType: "Operator Badge",
  },
];

const LANE_BY_PROGRAM_KEY = {
  "fca-workspace-quick-start": "operator",
  "electrical-apprenticeship-year1": "apprenticeship",
  "osha30-certification-prep": "certification",
  "aas-construction-operations-sem1": "degree",
  "virginia-dpor-residential-license-prep": "licensure",
  "fca-contractor-command-user-guide": "operator",
};

/** Deep electrical apprenticeship catalog (backend-aligned). */
export const ELECTRICAL_APPRENTICESHIP_LEVELS = [
  { level: 1, key: "electrical-core-level-1", title: "Core / Level 1 — Jobsite Foundations", modules: 12 },
  { level: 2, key: "electrical-core-level-2", title: "Core / Level 2 — Conduit & Branch Circuits", modules: 12 },
  { level: 3, key: "electrical-core-level-3", title: "Core / Level 3 — Systems Installation", modules: 12 },
  { level: 4, key: "electrical-core-level-4", title: "Core / Level 4 — Advanced Distribution", modules: 12 },
  { level: 5, key: "electrical-core-level-5", title: "Core / Level 5 — Leadership & Integration", modules: 12 },
  { level: 6, key: "electrical-core-level-6", title: "Core / Level 6 — Journey-Level Capstone", modules: 12 },
  { level: 7, key: "electrical-commercial-power-systems-level-7", title: "Commercial Power Systems / Level 7", modules: 12 },
  { level: 8, key: "electrical-commercial-power-systems-level-8", title: "Commercial Power Systems / Level 8", modules: 12 },
  { level: 9, key: "electrical-commercial-power-systems-level-9", title: "Commercial Power Systems / Level 9", modules: 12 },
  { level: 10, key: "electrical-commercial-power-systems-level-10", title: "Commercial Power Systems / Level 10", modules: 12 },
];

export function getProgramsByLane() {
  const grouped = Object.fromEntries(OFFERING_LANES.map((lane) => [lane.key, []]));

  for (const program of academyCatalog.programs) {
    const laneKey = LANE_BY_PROGRAM_KEY[program.key] || "operator";
    grouped[laneKey].push(program);
  }

  if (grouped.apprenticeship.length) {
    grouped.apprenticeship.push({
      key: "electrical-apprenticeship-l1-l10",
      title: "Electrical Apprenticeship — Full L1–L10 Pathway",
      credential: "Electrical Apprenticeship · Core + Specialization",
      audience: "Electrical apprentices and contractor training programs",
      duration: "Multi-year pathway",
      format: "Module-based with labs and performance evaluations",
      goal: "Complete structured electrical apprenticeship from orientation through journey-level specialization.",
      levels: ELECTRICAL_APPRENTICESHIP_LEVELS,
      linkedSurface: "/portal/academy",
      linkedLabel: "Open Academy",
      courses: [],
    });
  }

  return OFFERING_LANES.map((lane) => ({
    ...lane,
    programs: grouped[lane.key],
  }));
}

export function flattenCatalogLessons() {
  const lessons = [];
  for (const program of academyCatalog.programs) {
    for (const course of program.courses || []) {
      const titles = course.lessonTitles || [];
      const media = course.lessonMedia || [];
      titles.forEach((title, index) => {
        lessons.push({
          id: `${program.key}-${course.code}-L${index + 1}`,
          programKey: program.key,
          programTitle: program.title,
          courseCode: course.code,
          lessonIndex: index + 1,
          title,
          lab: course.lab,
          media: media[index] || {},
          linkedSurface: program.linkedSurface,
        });
      });
    }
  }
  return lessons;
}
