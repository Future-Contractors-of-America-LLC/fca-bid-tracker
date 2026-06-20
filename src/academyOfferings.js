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
    description: "Professional certification pathways covering construction management, project controls, estimating, OSHA safety, BIM, superintendency, QA/QC, commissioning, LEED sustainability, and trade journeyman credentials.",
    credentialType: "Professional Certificate",
  },
  {
    key: "degree",
    label: "Degree Programs",
    description: "Ivy League-standard associate and bachelor degree pathways in construction management, engineering technology, BIM, safety, business, project management, sustainability, and construction technology.",
    credentialType: "Academic Degree",
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
  "contractor-business-formation-legal": "licensure",
  "contractor-construction-law-essentials": "licensure",
  "fca-contractor-command-user-guide": "professional",
};

const CERTIFICATION_PREFIXES = ["cert-", "project-controls", "precon-estimating", "field-readiness"];
const DEGREE_PREFIXES = ["deg-"];

/** Nine degree pathway summaries (backend-aligned). */
export const DEGREE_PATHWAYS = [
  { key: "degree-general-education-core", label: "General Education Core", pathway: "General Education Core", courses: 15, credits: 45 },
  { key: "degree-aas-construction-management", label: "Construction Management AAS", pathway: "Construction Management AAS", courses: 20, credits: 60, level: "AAS" },
  { key: "degree-aas-civil-engineering-technology", label: "Civil Engineering Technology AAS", pathway: "Civil and Construction Engineering Technology AAS", courses: 20, credits: 60, level: "AAS" },
  { key: "degree-aas-bim-digital-construction", label: "BIM and Digital Construction AAS", pathway: "Building Information Modeling and Digital Construction AAS", courses: 20, credits: 60, level: "AAS" },
  { key: "degree-aas-occupational-safety-health", label: "Occupational Safety and Health AAS", pathway: "Occupational Safety and Health AAS", courses: 20, credits: 60, level: "AAS" },
  { key: "degree-aas-business-administration-contractors", label: "Business Administration for Contractors AAS", pathway: "Business Administration for Contractors AAS", courses: 20, credits: 60, level: "AAS" },
  { key: "degree-bs-construction-management", label: "Construction Management BS", pathway: "Construction Management BS", courses: 38, credits: 120, level: "BS" },
  { key: "degree-bs-project-management-construction", label: "Project Management BS", pathway: "Project Management BS (Construction Focus)", courses: 38, credits: 120, level: "BS" },
  { key: "degree-bs-sustainable-built-environment", label: "Sustainable Built Environment BS", pathway: "Sustainable Built Environment BS", courses: 38, credits: 120, level: "BS" },
  { key: "degree-bas-construction-technology-innovation", label: "Construction Technology BAS", pathway: "Construction Technology and Innovation BAS", courses: 38, credits: 120, level: "BAS" },
];

/** Featured AAS Construction Management term progression (backend-aligned). */
export const AAS_CONSTRUCTION_MANAGEMENT_TERMS = [
  { term: 1, courses: ["deg-engl-101", "deg-math-120", "deg-cmgt-101", "deg-cmgt-110"] },
  { term: 2, courses: ["deg-engl-102", "deg-math-210", "deg-cmgt-120", "deg-cmgt-201"] },
  { term: 3, courses: ["deg-comm-101", "deg-sci-101", "deg-cmgt-210", "deg-cmgt-220"] },
  { term: 4, courses: ["deg-sci-102", "deg-busa-101", "deg-cmgt-230", "deg-cmgt-240"] },
  { term: 5, courses: ["deg-cmgt-250", "deg-cmgt-260", "deg-cmgt-295", "deg-cmgt-299"] },
];

/** Featured BS Construction Management year progression (backend-aligned). */
export const BS_CONSTRUCTION_MANAGEMENT_YEARS = [
  { year: 1, label: "Foundation Year", courseCount: 8 },
  { year: 2, label: "Core Major Year", courseCount: 8 },
  { year: 3, label: "Advanced Major Year", courseCount: 10 },
  { year: 4, label: "Capstone Year", courseCount: 8 },
];

/** Ten certification pathway summaries (backend-aligned). */
export const CERTIFICATION_PATHWAYS = [
  { key: "construction-management-certification", label: "Construction Management", pathway: "Construction Management Certification", units: 5 },
  { key: "project-controls-certification", label: "Project Controls", pathway: "Project Controls Certification", units: 5 },
  { key: "estimating-preconstruction-certification", label: "Estimating and Preconstruction", pathway: "Estimating and Preconstruction Certification", units: 5 },
  { key: "safety-osha-certification", label: "Safety and OSHA", pathway: "Safety and OSHA Certification", units: 6 },
  { key: "bim-certification", label: "BIM", pathway: "BIM Certification", units: 5 },
  { key: "superintendent-certification", label: "Superintendent", pathway: "Superintendent Certification", units: 5 },
  { key: "qaqc-certification", label: "QA/QC", pathway: "QA/QC Certification", units: 5 },
  { key: "commissioning-certification", label: "Commissioning", pathway: "Commissioning Certification", units: 5 },
  { key: "sustainability-leed-certification", label: "Sustainability and LEED", pathway: "Sustainability and LEED Certification", units: 5 },
  { key: "trade-journeyman-certification", label: "Trade Journeyman", pathway: "Trade Journeyman Certification", units: 27 },
];

/** Featured certification unit progression (backend-aligned). */
export const PROJECT_CONTROLS_CERT_UNITS = [
  { unit: 1, key: "project-controls", title: "Document Governance", modules: 5 },
  { unit: 2, key: "cert-schedule-controls", title: "Schedule Controls", modules: 5 },
  { unit: 3, key: "cert-cost-controls", title: "Cost Controls", modules: 5 },
  { unit: 4, key: "cert-earned-value", title: "Earned Value", modules: 5 },
  { unit: 5, key: "cert-portfolio-controls", title: "Portfolio Controls", modules: 5 },
];

export const OSHA_CERT_UNITS = [
  { unit: 1, key: "field-readiness", title: "Field Readiness", modules: 3 },
  { unit: 2, key: "cert-osha-10-construction", title: "OSHA 10", modules: 4 },
  { unit: 3, key: "cert-osha-30-construction", title: "OSHA 30", modules: 6 },
  { unit: 4, key: "cert-fall-protection", title: "Fall Protection", modules: 4 },
  { unit: 5, key: "cert-confined-space-excavation", title: "Confined Space", modules: 4 },
  { unit: 6, key: "cert-hazcom-silica", title: "HazCom and Silica", modules: 4 },
];

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
  if (CERTIFICATION_PREFIXES.some((prefix) => program.key?.startsWith(prefix) || program.key === prefix)) return "certification";
  if (program.pathway?.includes("Certification")) return "certification";
  if (DEGREE_PREFIXES.some((prefix) => program.key?.startsWith(prefix))) return "degree";
  if (program.pathway?.includes("AAS") || program.pathway?.includes("BS") || program.pathway?.includes("BAS") || program.pathway === "General Education Core") return "degree";
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
