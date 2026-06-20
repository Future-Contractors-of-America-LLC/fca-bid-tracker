/** Pathway ? topic ? course hierarchy for FCA Academy catalog navigation. */

export const CATALOG_PATHWAYS = [
  {
    key: "apprenticeship",
    label: "Apprenticeship",
    description: "NCCER-style trade pathways from core jobsite foundations through Level 10 specialization.",
    credentialType: "Apprenticeship Certificate",
  },
  {
    key: "degree",
    label: "Degree Programs",
    description: "Associate and bachelor pathways in construction operations, engineering technology, and management.",
    credentialType: "Academic Degree",
  },
  {
    key: "certification",
    label: "Certification",
    description: "Professional credentials in safety, project controls, estimating, BIM, and field leadership.",
    credentialType: "Professional Certificate",
  },
  {
    key: "licensure",
    label: "Licensure Prep",
    description: "Virginia DPOR, trade licensure, NASCLA business law, and contractor compliance exam preparation.",
    credentialType: "Licensure Prep",
  },
  {
    key: "professional",
    label: "Professional Development",
    description: "FCA operator guides, onboarding, and continuing education tied to live portal workflows.",
    credentialType: "Continuing Education",
  },
];

export const CATALOG_TOPICS = [
  // Apprenticeship
  { key: "electrical", pathwayKey: "apprenticeship", label: "Electrical", description: "Electrical apprenticeship from core through commercial power systems." },
  { key: "plumbing", pathwayKey: "apprenticeship", label: "Plumbing", description: "Plumbing trade apprenticeship and journeyman progression." },
  { key: "hvac", pathwayKey: "apprenticeship", label: "HVAC", description: "HVAC installation, service, and controls apprenticeship." },
  { key: "carpentry", pathwayKey: "apprenticeship", label: "Carpentry", description: "Framing, finish carpentry, and jobsite coordination." },
  { key: "masonry", pathwayKey: "apprenticeship", label: "Masonry", description: "Masonry trade foundations and contractor readiness." },
  { key: "welding", pathwayKey: "apprenticeship", label: "Welding", description: "Welding processes, code awareness, and field safety." },
  { key: "pipefitting", pathwayKey: "apprenticeship", label: "Pipefitting", description: "Industrial and commercial pipefitting apprenticeship." },
  { key: "sheet-metal", pathwayKey: "apprenticeship", label: "Sheet Metal", description: "Duct, fabrication, and mechanical sheet metal trades." },
  { key: "fire-sprinkler", pathwayKey: "apprenticeship", label: "Fire Sprinkler", description: "Fire protection and sprinkler systems apprenticeship." },
  // Degree
  { key: "construction-operations", pathwayKey: "degree", label: "Construction Operations", description: "Integrated operations studio using the FCA command spine." },
  { key: "construction-management", pathwayKey: "degree", label: "Construction Management", description: "AAS and BS construction management degree tracks." },
  { key: "architectural-engineering", pathwayKey: "degree", label: "Architectural Engineering", description: "Building systems, design coordination, and engineering technology." },
  { key: "civil-engineering", pathwayKey: "degree", label: "Civil Engineering Technology", description: "Site, structural, and infrastructure engineering technology." },
  { key: "bim-digital", pathwayKey: "degree", label: "BIM & Digital Construction", description: "Modeling, coordination, and digital delivery workflows." },
  { key: "safety-health", pathwayKey: "degree", label: "Occupational Safety & Health", description: "Safety management and health program degree preparation." },
  { key: "business-administration", pathwayKey: "degree", label: "Business Administration", description: "Contractor business administration and financial operations." },
  { key: "project-management", pathwayKey: "degree", label: "Project Management", description: "Construction-focused project management degree pathway." },
  { key: "sustainable-built-environment", pathwayKey: "degree", label: "Sustainable Built Environment", description: "Green building, LEED alignment, and sustainability operations." },
  { key: "general-education", pathwayKey: "degree", label: "General Education Core", description: "Foundational academic core for degree completion." },
  // Certification
  { key: "safety-osha", pathwayKey: "certification", label: "Safety & OSHA", description: "OSHA 10/30, fall protection, and jobsite safety credentials." },
  { key: "project-controls", pathwayKey: "certification", label: "Project Controls", description: "Schedule, cost, earned value, and portfolio controls." },
  { key: "construction-management-cert", pathwayKey: "certification", label: "Construction Management", description: "Construction management professional certification." },
  { key: "estimating-preconstruction", pathwayKey: "certification", label: "Estimating & Preconstruction", description: "Precon estimating and bid package discipline." },
  { key: "bim-certification", pathwayKey: "certification", label: "BIM", description: "Building information modeling certification track." },
  { key: "superintendent", pathwayKey: "certification", label: "Superintendent", description: "Field superintendent and production leadership." },
  { key: "qaqc", pathwayKey: "certification", label: "QA/QC", description: "Quality assurance and quality control certification." },
  { key: "commissioning", pathwayKey: "certification", label: "Commissioning", description: "Systems commissioning and turnover readiness." },
  { key: "sustainability-leed", pathwayKey: "certification", label: "Sustainability & LEED", description: "LEED and sustainability professional credentials." },
  { key: "trade-journeyman", pathwayKey: "certification", label: "Trade Journeyman", description: "Journeyman-level trade certification pathways." },
  // Licensure
  { key: "virginia-dpor", pathwayKey: "licensure", label: "Virginia DPOR", description: "Virginia residential and commercial contractor licensing." },
  { key: "business-law-compliance", pathwayKey: "licensure", label: "Business Law & Compliance", description: "Entity formation, construction law, and NASCLA business law." },
  { key: "electrical-licensure", pathwayKey: "licensure", label: "Electrical Licensure", description: "Journeyman, master, and electrical contractor exam prep." },
  { key: "trade-licensure", pathwayKey: "licensure", label: "Trade Licensure", description: "Plumbing, HVAC, welding, and specialty trade licensure prep." },
  { key: "general-contractor-licensure", pathwayKey: "licensure", label: "General Contractor", description: "General contractor and NASCLA exam preparation." },
  { key: "licensure-readiness", pathwayKey: "licensure", label: "Exam Readiness", description: "Diagnostic assessment and licensure exam fundamentals." },
  // Professional
  { key: "fca-platform", pathwayKey: "professional", label: "FCA Platform", description: "Workspace onboarding and Contractor Command operator guides." },
  { key: "workforce-readiness", pathwayKey: "professional", label: "Workforce Readiness", description: "Launch classrooms and field-readiness reinforcement." },
];

/** Static program placement and enrollment gates (syllabus always public). */
export const PROGRAM_CATALOG_META = {
  "fca-workspace-quick-start": {
    pathwayKey: "professional",
    topicKey: "fca-platform",
    enrollment: { syllabusPublic: true, requiresAuth: false, minimumPlan: null, addonKey: null, prerequisiteProgramKeys: [] },
  },
  "electrical-apprenticeship-year1": {
    pathwayKey: "apprenticeship",
    topicKey: "electrical",
    enrollment: { syllabusPublic: true, requiresAuth: true, minimumPlan: "starter-team", addonKey: "apprenticeship-track", prerequisiteProgramKeys: [] },
  },
  "osha30-certification-prep": {
    pathwayKey: "certification",
    topicKey: "safety-osha",
    enrollment: { syllabusPublic: true, requiresAuth: true, minimumPlan: "starter-team", addonKey: "certification-track", prerequisiteProgramKeys: [] },
  },
  "aas-construction-operations-sem1": {
    pathwayKey: "degree",
    topicKey: "construction-operations",
    enrollment: { syllabusPublic: true, requiresAuth: true, minimumPlan: "operations", addonKey: null, prerequisiteProgramKeys: [] },
  },
  "virginia-dpor-residential-license-prep": {
    pathwayKey: "licensure",
    topicKey: "virginia-dpor",
    enrollment: { syllabusPublic: true, requiresAuth: true, minimumPlan: "starter-team", addonKey: "licensure-pack", prerequisiteProgramKeys: ["contractor-business-formation-legal"] },
  },
  "fca-contractor-command-user-guide": {
    pathwayKey: "professional",
    topicKey: "fca-platform",
    enrollment: { syllabusPublic: true, requiresAuth: false, minimumPlan: null, addonKey: null, prerequisiteProgramKeys: [] },
  },
  "contractor-business-formation-legal": {
    pathwayKey: "licensure",
    topicKey: "business-law-compliance",
    enrollment: { syllabusPublic: true, requiresAuth: true, minimumPlan: "starter-team", addonKey: "legal-pack", prerequisiteProgramKeys: [] },
  },
  "contractor-construction-law-essentials": {
    pathwayKey: "licensure",
    topicKey: "business-law-compliance",
    enrollment: { syllabusPublic: true, requiresAuth: true, minimumPlan: "starter-team", addonKey: "legal-pack", prerequisiteProgramKeys: ["contractor-business-formation-legal"] },
  },
};

const PLAN_RANK = {
  startup: 1,
  "starter-team": 2,
  pilot: 3,
  team: 4,
  operations: 5,
  growth: 6,
  enterprise: 7,
};

const TOPIC_KEY_HEURISTICS = [
  { topicKey: "electrical", match: (key) => key.startsWith("electrical-") || key.includes("electrical") },
  { topicKey: "plumbing", match: (key) => key.startsWith("plumbing-") },
  { topicKey: "hvac", match: (key) => key.startsWith("hvac-") },
  { topicKey: "safety-osha", match: (key) => key.includes("osha") || key === "field-readiness" || key.includes("fall-protection") || key.includes("hazcom") },
  { topicKey: "project-controls", match: (key) => key.startsWith("project-controls") || key.startsWith("cert-schedule") || key.startsWith("cert-cost") || key.startsWith("cert-earned") },
  { topicKey: "virginia-dpor", match: (key) => key.includes("dpor") || key.includes("virginia-dpor") },
  { topicKey: "business-law-compliance", match: (key) => key.includes("business-formation") || key.includes("construction-law") || key.includes("nascla") },
  { topicKey: "electrical-licensure", match: (key) => key.startsWith("lic-electrical") },
  { topicKey: "construction-operations", match: (key) => key.includes("construction-operations") || key.startsWith("deg-cmgt") },
  { topicKey: "construction-management", match: (key) => key.includes("construction-management") && key.startsWith("degree-") },
  { topicKey: "architectural-engineering", match: (key) => key.includes("architectural") || key.includes("building-systems") },
  { topicKey: "civil-engineering", match: (key) => key.includes("civil-engineering") },
  { topicKey: "bim-digital", match: (key) => key.includes("bim") },
  { topicKey: "general-education", match: (key) => key.includes("general-education") },
  { topicKey: "fca-platform", match: (key) => key.includes("workspace") || key.includes("user-guide") || key.includes("quick-start") },
];

const PATHWAY_KEY_HEURISTICS = [
  { pathwayKey: "apprenticeship", match: (key, p) => p?.lane === "apprenticeship" || p?.pathway?.includes("Apprenticeship") || key.startsWith("electrical-core") },
  { pathwayKey: "degree", match: (key, p) => p?.lane === "degree" || key.startsWith("deg-") || key.startsWith("degree-") || p?.pathway?.includes("AAS") || p?.pathway?.includes("BS") },
  { pathwayKey: "certification", match: (key, p) => p?.lane === "certification" || key.startsWith("cert-") || p?.pathway?.includes("Certification") },
  { pathwayKey: "licensure", match: (key, p) => p?.lane === "licensure" || key.startsWith("lic-") || p?.pathway?.includes("Licensure") || p?.pathway?.includes("DPOR") },
  { pathwayKey: "professional", match: () => true },
];

export function getTopicByKey(topicKey) {
  return CATALOG_TOPICS.find((topic) => topic.key === topicKey) || null;
}

export function getPathwayByKey(pathwayKey) {
  return CATALOG_PATHWAYS.find((pathway) => pathway.key === pathwayKey) || null;
}

export function getTopicsForPathway(pathwayKey) {
  return CATALOG_TOPICS.filter((topic) => topic.pathwayKey === pathwayKey);
}

export function resolveProgramCatalogMeta(program) {
  const staticMeta = PROGRAM_CATALOG_META[program.key];
  if (staticMeta) {
    return {
      pathwayKey: staticMeta.pathwayKey,
      topicKey: staticMeta.topicKey,
      enrollment: { ...staticMeta.enrollment },
    };
  }

  let pathwayKey = program.lane || program.pathwayKey;
  if (!pathwayKey) {
    const pathwayMatch = PATHWAY_KEY_HEURISTICS.find((entry) => entry.match(program.key, program));
    pathwayKey = pathwayMatch?.pathwayKey || "professional";
  }

  let topicKey = program.topicKey;
  if (!topicKey) {
    const topicMatch = TOPIC_KEY_HEURISTICS.find((entry) => entry.match(program.key, program));
    topicKey = topicMatch?.topicKey || "workforce-readiness";
    const topic = getTopicByKey(topicKey);
    if (topic && topic.pathwayKey !== pathwayKey) {
      const fallback = CATALOG_TOPICS.find((item) => item.pathwayKey === pathwayKey);
      topicKey = fallback?.key || topicKey;
    }
  }

  return {
    pathwayKey,
    topicKey,
    enrollment: program.enrollment || {
      syllabusPublic: true,
      requiresAuth: true,
      minimumPlan: pathwayKey === "degree" ? "operations" : pathwayKey === "professional" ? null : "starter-team",
      addonKey: pathwayKey === "licensure" ? "licensure-pack" : pathwayKey === "apprenticeship" ? "apprenticeship-track" : null,
      prerequisiteProgramKeys: program.prerequisiteProgramKeys || [],
    },
  };
}

export function planMeetsMinimum(selectedPlan, minimumPlan) {
  if (!minimumPlan) return true;
  const current = PLAN_RANK[selectedPlan] || 0;
  const required = PLAN_RANK[minimumPlan] || 0;
  return current >= required;
}

export function formatPlanLabel(planKey) {
  const labels = {
    startup: "Startup Workspace",
    "starter-team": "Starter Team Workspace",
    pilot: "Pilot Workspace",
    team: "Team Workspace",
    operations: "Operations Workspace",
    growth: "Growth Platform",
    enterprise: "Enterprise Rollout",
  };
  return labels[planKey] || planKey;
}

export function formatAddonLabel(addonKey) {
  const labels = {
    "apprenticeship-track": "Apprenticeship Track add-on",
    "certification-track": "Certification Track add-on",
    "licensure-pack": "Licensure Prep add-on",
    "legal-pack": "Contractor Legal Pack add-on",
  };
  return labels[addonKey] || addonKey;
}
