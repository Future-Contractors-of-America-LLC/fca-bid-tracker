import { academyCatalog } from "./academyCatalog.js";

/** Organized Academy taxonomy aligned with backend lanes. */
export const OFFERING_LANES = [
  {
    key: "apprenticeship",
    label: "Apprenticeship",
    description: "NCCER-style trade apprenticeship pathways across nine construction trades from Core Level 1 through Level 10 specialization.",
    credentialType: "Apprenticeship Certificate",
  },
  {
    key: "certification",
    label: "Certification",
    description: "Professional certifications including OSHA, safety, and trade readiness.",
    credentialType: "Professional Certificate",
  },
  {
    key: "degree",
    label: "Degree Programs",
    description: "Associate and applied degree tracks tied to construction operations.",
    credentialType: "Degree Track",
  },
  {
    key: "licensure",
    label: "Licensure Prep",
    description: "State and local contractor licensure preparation programs.",
    credentialType: "Licensure Prep",
  },
  {
    key: "professional",
    label: "Professional Development",
    description: "Pearson-style continuing education and project leadership courses.",
    credentialType: "Continuing Education",
  },
];

const STATIC_LANE_BY_PROGRAM_KEY = {
  "fca-workspace-quick-start": "professional",
  "electrical-apprenticeship-year1": "apprenticeship",
  "osha30-certification-prep": "certification",
  "aas-construction-operations-sem1": "degree",
  "virginia-dpor-residential-license-prep": "licensure",
  "fca-contractor-command-user-guide": "professional",
};

const APPRENTICESHIP_PREFIXES = [
  "electrical-",
  "plumbing-",
  "hvac-",
  "carpentry-",
  "masonry-",
  "welding-",
  "pipefitting-",
  "sheet-metal-",
  "fire-sprinkler-",
];

/** Nine-trade apprenticeship pathway summary (backend-aligned). */
export const APPRENTICESHIP_TRADES = [
  { key: "electrical", label: "Electrical", pathway: "Electrical Apprenticeship", coreLevels: 6, specializationTracks: 4, topLevel: 10 },
  { key: "plumbing", label: "Plumbing", pathway: "Plumbing Apprenticeship", coreLevels: 6, specializationTracks: 4, topLevel: 10 },
  { key: "hvac", label: "HVAC", pathway: "HVAC Apprenticeship", coreLevels: 6, specializationTracks: 4, topLevel: 10 },
  { key: "carpentry", label: "Carpentry", pathway: "Carpentry Apprenticeship", coreLevels: 6, specializationTracks: 4, topLevel: 10 },
  { key: "masonry", label: "Masonry", pathway: "Masonry Apprenticeship", coreLevels: 6, specializationTracks: 4, topLevel: 10 },
  { key: "welding", label: "Welding", pathway: "Welding Apprenticeship", coreLevels: 6, specializationTracks: 4, topLevel: 10 },
  { key: "pipefitting", label: "Pipefitting", pathway: "Pipefitting Apprenticeship", coreLevels: 6, specializationTracks: 4, topLevel: 10 },
  { key: "sheet-metal", label: "Sheet Metal", pathway: "Sheet Metal Apprenticeship", coreLevels: 6, specializationTracks: 4, topLevel: 10 },
  { key: "fire-sprinkler", label: "Fire Sprinkler", pathway: "Fire Sprinkler Apprenticeship", coreLevels: 6, specializationTracks: 4, topLevel: 10 },
];

/** Deep electrical apprenticeship catalog (backend-aligned). */
export const ELECTRICAL_APPRENTICESHIP_LEVELS = [
  { level: 1, key: "electrical-core-level-1", title: "Core / Level 1 - Jobsite Foundations", modules: 12 },
  { level: 2, key: "electrical-core-level-2", title: "Core / Level 2 - Conduit and Branch Circuits", modules: 12 },
  { level: 3, key: "electrical-core-level-3", title: "Core / Level 3 - Systems Installation", modules: 12 },
  { level: 4, key: "electrical-core-level-4", title: "Core / Level 4 - Advanced Distribution", modules: 12 },
  { level: 5, key: "electrical-core-level-5", title: "Core / Level 5 - Leadership and Integration", modules: 12 },
  { level: 6, key: "electrical-core-level-6", title: "Core / Level 6 - Journey-Level Capstone", modules: 12 },
  { level: 7, key: "electrical-commercial-power-systems-level-7", title: "Commercial Power Systems / Level 7", modules: 12 },
  { level: 8, key: "electrical-commercial-power-systems-level-8", title: "Commercial Power Systems / Level 8", modules: 12 },
  { level: 9, key: "electrical-commercial-power-systems-level-9", title: "Commercial Power Systems / Level 9", modules: 12 },
  { level: 10, key: "electrical-commercial-power-systems-level-10", title: "Commercial Power Systems / Level 10", modules: 12 },
];

function resolveProgramLane(program) {
  if (program.lane) return program.lane;
  if (STATIC_LANE_BY_PROGRAM_KEY[program.key]) return STATIC_LANE_BY_PROGRAM_KEY[program.key];
  if (APPRENTICESHIP_PREFIXES.some((prefix) => program.key?.startsWith(prefix))) return "apprenticeship";
  if (program.pathway?.includes("Apprenticeship")) return "apprenticeship";
  if (["project-controls", "precon-estimating", "field-readiness"].includes(program.key)) return "certification";
  return "professional";
}

/** Group API catalog programs by lane. Falls back to static catalog for degree/licensure gaps. */
export function organizeApiCatalogByLane(apiPrograms = [], catalogLanes = OFFERING_LANES) {
  const grouped = Object.fromEntries(catalogLanes.map((lane) => [lane.key, []]));
  const apiKeys = new Set();

  for (const program of apiPrograms) {
    const laneKey = resolveProgramLane(program);
    if (grouped[laneKey]) {
      grouped[laneKey].push(program);
      apiKeys.add(program.key);
    }
  }

  for (const program of academyCatalog.programs) {
    if (apiKeys.has(program.key)) continue;
    const laneKey = resolveProgramLane(program);
    if (grouped[laneKey]) {
      grouped[laneKey].push({ ...program, source: "catalog-preview" });
    }
  }

  return catalogLanes.map((lane) => ({
    ...lane,
    programs: grouped[lane.key].sort((a, b) => (a.level || 0) - (b.level || 0)),
  }));
}

/** @deprecated Use organizeApiCatalogByLane with API data */
export function getProgramsByLane() {
  return organizeApiCatalogByLane([]);
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
