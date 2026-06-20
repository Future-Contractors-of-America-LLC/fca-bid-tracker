/** Pathway → topic → course hierarchy for FCA Academy catalog navigation. */

export const US_JURISDICTIONS = [
  { code: "universal", label: "Universal / NASCLA", description: "Multi-state contractor exams, NASCLA business law, code navigation, and renewal fundamentals." },
  { code: "al", label: "Alabama", description: "Alabama contractor and trade licensure exam preparation." },
  { code: "ak", label: "Alaska", description: "Alaska contractor and trade licensure exam preparation." },
  { code: "az", label: "Arizona", description: "Arizona contractor and trade licensure exam preparation." },
  { code: "ar", label: "Arkansas", description: "Arkansas contractor and trade licensure exam preparation." },
  { code: "ca", label: "California", description: "California contractor and trade licensure exam preparation." },
  { code: "co", label: "Colorado", description: "Colorado contractor and trade licensure exam preparation." },
  { code: "ct", label: "Connecticut", description: "Connecticut contractor and trade licensure exam preparation." },
  { code: "de", label: "Delaware", description: "Delaware contractor and trade licensure exam preparation." },
  { code: "dc", label: "District of Columbia", description: "DC contractor and trade licensure exam preparation." },
  { code: "fl", label: "Florida", description: "Florida contractor and trade licensure exam preparation." },
  { code: "ga", label: "Georgia", description: "Georgia contractor and trade licensure exam preparation." },
  { code: "hi", label: "Hawaii", description: "Hawaii contractor and trade licensure exam preparation." },
  { code: "id", label: "Idaho", description: "Idaho contractor and trade licensure exam preparation." },
  { code: "il", label: "Illinois", description: "Illinois contractor and trade licensure exam preparation." },
  { code: "in", label: "Indiana", description: "Indiana contractor and trade licensure exam preparation." },
  { code: "ia", label: "Iowa", description: "Iowa contractor and trade licensure exam preparation." },
  { code: "ks", label: "Kansas", description: "Kansas contractor and trade licensure exam preparation." },
  { code: "ky", label: "Kentucky", description: "Kentucky contractor and trade licensure exam preparation." },
  { code: "la", label: "Louisiana", description: "Louisiana contractor and trade licensure exam preparation." },
  { code: "me", label: "Maine", description: "Maine contractor and trade licensure exam preparation." },
  { code: "md", label: "Maryland", description: "Maryland contractor and trade licensure exam preparation." },
  { code: "ma", label: "Massachusetts", description: "Massachusetts contractor and trade licensure exam preparation." },
  { code: "mi", label: "Michigan", description: "Michigan contractor and trade licensure exam preparation." },
  { code: "mn", label: "Minnesota", description: "Minnesota contractor and trade licensure exam preparation." },
  { code: "ms", label: "Mississippi", description: "Mississippi contractor and trade licensure exam preparation." },
  { code: "mo", label: "Missouri", description: "Missouri contractor and trade licensure exam preparation." },
  { code: "mt", label: "Montana", description: "Montana contractor and trade licensure exam preparation." },
  { code: "ne", label: "Nebraska", description: "Nebraska contractor and trade licensure exam preparation." },
  { code: "nv", label: "Nevada", description: "Nevada contractor and trade licensure exam preparation." },
  { code: "nh", label: "New Hampshire", description: "New Hampshire contractor and trade licensure exam preparation." },
  { code: "nj", label: "New Jersey", description: "New Jersey contractor and trade licensure exam preparation." },
  { code: "nm", label: "New Mexico", description: "New Mexico contractor and trade licensure exam preparation." },
  { code: "ny", label: "New York", description: "New York contractor and trade licensure exam preparation." },
  { code: "nc", label: "North Carolina", description: "North Carolina contractor and trade licensure exam preparation." },
  { code: "nd", label: "North Dakota", description: "North Dakota contractor and trade licensure exam preparation." },
  { code: "oh", label: "Ohio", description: "Ohio contractor and trade licensure exam preparation." },
  { code: "ok", label: "Oklahoma", description: "Oklahoma contractor and trade licensure exam preparation." },
  { code: "or", label: "Oregon", description: "Oregon contractor and trade licensure exam preparation." },
  { code: "pa", label: "Pennsylvania", description: "Pennsylvania contractor and trade licensure exam preparation." },
  { code: "ri", label: "Rhode Island", description: "Rhode Island contractor and trade licensure exam preparation." },
  { code: "sc", label: "South Carolina", description: "South Carolina contractor and trade licensure exam preparation." },
  { code: "sd", label: "South Dakota", description: "South Dakota contractor and trade licensure exam preparation." },
  { code: "tn", label: "Tennessee", description: "Tennessee contractor and trade licensure exam preparation." },
  { code: "tx", label: "Texas", description: "Texas contractor and trade licensure exam preparation." },
  { code: "ut", label: "Utah", description: "Utah contractor and trade licensure exam preparation." },
  { code: "vt", label: "Vermont", description: "Vermont contractor and trade licensure exam preparation." },
  { code: "va", label: "Virginia", description: "Virginia DPOR residential and commercial contractor licensing." },
  { code: "wa", label: "Washington", description: "Washington contractor and trade licensure exam preparation." },
  { code: "wv", label: "West Virginia", description: "West Virginia contractor and trade licensure exam preparation." },
  { code: "wi", label: "Wisconsin", description: "Wisconsin contractor and trade licensure exam preparation." },
  { code: "wy", label: "Wyoming", description: "Wyoming contractor and trade licensure exam preparation." },
];

export const CATALOG_PATHWAYS = [
  {
    key: "apprenticeship",
    label: "Apprenticeship",
    description: "NCCER-style trade pathways from core jobsite foundations through Level 10 specialization across nine trades.",
    credentialType: "Apprenticeship Certificate",
  },
  {
    key: "degree",
    label: "Degree Programs",
    description: "Associate (60 credits) and bachelor (120 credits) pathways with standard 3-credit courses.",
    credentialType: "Academic Degree",
  },
  {
    key: "certification",
    label: "Certification",
    description: "Professional credentials in safety, project controls, estimating, BIM, superintendent, QA/QC, commissioning, and LEED.",
    credentialType: "Professional Certificate",
  },
  {
    key: "licensure",
    label: "Licensure Prep",
    description: "State contractor boards, trade licensure, NASCLA business law, and universal exam readiness.",
    credentialType: "Licensure Prep",
  },
  {
    key: "professional",
    label: "Professional Development",
    description: "FCA operator guides, continuing education, and workforce readiness tied to live portal workflows.",
    credentialType: "Continuing Education",
  },
];

const APPRENTICESHIP_TOPICS = [
  { key: "electrical", label: "Electrical", description: "Electrical apprenticeship from core through commercial power systems." },
  { key: "plumbing", label: "Plumbing", description: "Plumbing trade apprenticeship and journeyman progression." },
  { key: "hvac", label: "HVAC", description: "HVAC installation, service, and controls apprenticeship." },
  { key: "carpentry", label: "Carpentry", description: "Framing, finish carpentry, and jobsite coordination." },
  { key: "masonry", label: "Masonry", description: "Masonry trade foundations and contractor readiness." },
  { key: "welding", label: "Welding", description: "Welding processes, code awareness, and field safety." },
  { key: "pipefitting", label: "Pipefitting", description: "Industrial and commercial pipefitting apprenticeship." },
  { key: "sheet-metal", label: "Sheet Metal", description: "Duct, fabrication, and mechanical sheet metal trades." },
  { key: "fire-sprinkler", label: "Fire Sprinkler", description: "Fire protection and sprinkler systems apprenticeship." },
];

const DEGREE_TOPICS = [
  {
    key: "general-education",
    label: "General Education Core",
    description: "Shared 45-credit academic core (15 courses × 3 credits) for all degree pathways.",
    degreeLevel: "Shared",
    totalCredits: 45,
    creditsPerCourse: 3,
    typicalCourseCount: 15,
  },
  {
    key: "aas-construction-management",
    label: "Construction Management AAS",
    description: "Associate of Applied Science — 60 credits (20 courses × 3 credits).",
    degreeLevel: "AAS",
    totalCredits: 60,
    creditsPerCourse: 3,
    typicalCourseCount: 20,
  },
  {
    key: "aas-civil-engineering-technology",
    label: "Civil Engineering Technology AAS",
    description: "Associate of Applied Science — 60 credits (20 courses × 3 credits).",
    degreeLevel: "AAS",
    totalCredits: 60,
    creditsPerCourse: 3,
    typicalCourseCount: 20,
  },
  {
    key: "aas-bim-digital-construction",
    label: "BIM & Digital Construction AAS",
    description: "Associate of Applied Science — 60 credits (20 courses × 3 credits).",
    degreeLevel: "AAS",
    totalCredits: 60,
    creditsPerCourse: 3,
    typicalCourseCount: 20,
  },
  {
    key: "aas-occupational-safety-health",
    label: "Occupational Safety & Health AAS",
    description: "Associate of Applied Science — 60 credits (20 courses × 3 credits).",
    degreeLevel: "AAS",
    totalCredits: 60,
    creditsPerCourse: 3,
    typicalCourseCount: 20,
  },
  {
    key: "aas-business-administration-contractors",
    label: "Business Administration for Contractors AAS",
    description: "Associate of Applied Science — 60 credits (20 courses × 3 credits).",
    degreeLevel: "AAS",
    totalCredits: 60,
    creditsPerCourse: 3,
    typicalCourseCount: 20,
  },
  {
    key: "bs-construction-management",
    label: "Construction Management BS",
    description: "Bachelor of Science — 120 credits (40 courses × 3 credits).",
    degreeLevel: "BS",
    totalCredits: 120,
    creditsPerCourse: 3,
    typicalCourseCount: 40,
  },
  {
    key: "bs-project-management",
    label: "Project Management BS",
    description: "Bachelor of Science — 120 credits (40 courses × 3 credits).",
    degreeLevel: "BS",
    totalCredits: 120,
    creditsPerCourse: 3,
    typicalCourseCount: 40,
  },
  {
    key: "bs-sustainable-built-environment",
    label: "Sustainable Built Environment BS",
    description: "Bachelor of Science — 120 credits (40 courses × 3 credits).",
    degreeLevel: "BS",
    totalCredits: 120,
    creditsPerCourse: 3,
    typicalCourseCount: 40,
  },
  {
    key: "bas-construction-technology-innovation",
    label: "Construction Technology BAS",
    description: "Bachelor of Applied Science — 120 credits (40 courses × 3 credits).",
    degreeLevel: "BAS",
    totalCredits: 120,
    creditsPerCourse: 3,
    typicalCourseCount: 40,
  },
];

const CERTIFICATION_TOPICS = [
  { key: "safety-osha", label: "Safety & OSHA", description: "OSHA 10/30, fall protection, confined space, and jobsite safety credentials." },
  { key: "project-controls", label: "Project Controls", description: "Schedule, cost, earned value, and portfolio controls." },
  { key: "construction-management-cert", label: "Construction Management", description: "Construction management professional certification." },
  { key: "estimating-preconstruction", label: "Estimating & Preconstruction", description: "Precon estimating and bid package discipline." },
  { key: "bim-certification", label: "BIM", description: "Building information modeling certification track." },
  { key: "superintendent", label: "Superintendent", description: "Field superintendent and production leadership." },
  { key: "qaqc", label: "QA/QC", description: "Quality assurance and quality control certification." },
  { key: "commissioning", label: "Commissioning", description: "Systems commissioning and turnover readiness." },
  { key: "sustainability-leed", label: "Sustainability & LEED", description: "LEED and sustainability professional credentials." },
  { key: "trade-journeyman", label: "Trade Journeyman", description: "Journeyman-level trade certification pathways." },
];

const LICENSURE_TRADE_TOPICS = [
  { key: "business-law-compliance", label: "Business Law & Compliance", description: "Entity formation, construction law, and compliance fundamentals." },
  { key: "electrical-licensure", label: "Electrical Licensure", description: "Journeyman, master, and electrical contractor exam prep." },
  { key: "trade-licensure", label: "Trade Licensure", description: "Plumbing, HVAC, welding, and specialty trade licensure prep." },
  { key: "licensure-readiness", label: "Exam Readiness", description: "Diagnostic assessment and licensure exam fundamentals." },
];

const PROFESSIONAL_TOPICS = [
  { key: "fca-platform", label: "FCA Platform", description: "Workspace onboarding and Contractor Command operator guides." },
  { key: "fca-bids-estimates", label: "Bids & Estimates", description: "Qualification, estimating, and proposal workflows in FCA." },
  { key: "fca-projects-execution", label: "Projects & Execution", description: "Project setup, stage control, and field execution in FCA." },
  { key: "fca-files-governance", label: "Files & Governance", description: "File spine, audit continuity, and document governance." },
  { key: "fca-billing-revenue", label: "Billing & Revenue", description: "Invoicing, billing readiness, and revenue continuity." },
  { key: "fca-legal-compliance", label: "Legal & Compliance", description: "Contractor Legal Command and compliance workflows." },
  { key: "fca-support-auricrux", label: "Support & Auricrux", description: "Field support, Auricrux guidance, and escalation continuity." },
  { key: "continuing-education", label: "Continuing Education", description: "License renewal CE, OSHA refreshers, and professional development." },
  { key: "workforce-readiness", label: "Workforce Readiness", description: "Launch classrooms and field-readiness reinforcement." },
];

function buildLicensureStateTopics() {
  return US_JURISDICTIONS.map((jurisdiction) => ({
    key: jurisdiction.code === "universal" ? "universal-licensure" : `state-${jurisdiction.code}`,
    pathwayKey: "licensure",
    label: jurisdiction.label,
    description: jurisdiction.description,
    stateCode: jurisdiction.code === "universal" ? null : jurisdiction.code.toUpperCase(),
    alwaysShow: true,
  }));
}

export const CATALOG_TOPICS = [
  ...APPRENTICESHIP_TOPICS.map((topic) => ({ ...topic, pathwayKey: "apprenticeship" })),
  ...DEGREE_TOPICS.map((topic) => ({ ...topic, pathwayKey: "degree" })),
  ...CERTIFICATION_TOPICS.map((topic) => ({ ...topic, pathwayKey: "certification" })),
  ...LICENSURE_TRADE_TOPICS.map((topic) => ({ ...topic, pathwayKey: "licensure" })),
  ...buildLicensureStateTopics(),
  ...PROFESSIONAL_TOPICS.map((topic) => ({ ...topic, pathwayKey: "professional" })),
];

/** Static program placement and enrollment gates (syllabus always public). */
export const PROGRAM_CATALOG_META = {
  "fca-workspace-quick-start": {
    pathwayKey: "professional",
    topicKey: "fca-platform",
    enrollment: { syllabusPublic: true, requiresAuth: false, minimumPlan: null, addonKey: null, prerequisiteProgramKeys: [] },
  },
  "fca-contractor-command-user-guide": {
    pathwayKey: "professional",
    topicKey: "fca-platform",
    enrollment: { syllabusPublic: true, requiresAuth: false, minimumPlan: null, addonKey: null, prerequisiteProgramKeys: [] },
  },
  "fca-bids-qualification-estimates": {
    pathwayKey: "professional",
    topicKey: "fca-bids-estimates",
    enrollment: { syllabusPublic: true, requiresAuth: false, minimumPlan: null, addonKey: null, prerequisiteProgramKeys: ["fca-workspace-quick-start"] },
  },
  "fca-projects-stage-control": {
    pathwayKey: "professional",
    topicKey: "fca-projects-execution",
    enrollment: { syllabusPublic: true, requiresAuth: false, minimumPlan: null, addonKey: null, prerequisiteProgramKeys: ["fca-workspace-quick-start"] },
  },
  "fca-files-audit-governance": {
    pathwayKey: "professional",
    topicKey: "fca-files-governance",
    enrollment: { syllabusPublic: true, requiresAuth: false, minimumPlan: null, addonKey: null, prerequisiteProgramKeys: ["fca-workspace-quick-start"] },
  },
  "fca-billing-invoicing": {
    pathwayKey: "professional",
    topicKey: "fca-billing-revenue",
    enrollment: { syllabusPublic: true, requiresAuth: false, minimumPlan: null, addonKey: null, prerequisiteProgramKeys: ["fca-workspace-quick-start"] },
  },
  "fca-legal-command-workspace": {
    pathwayKey: "professional",
    topicKey: "fca-legal-compliance",
    enrollment: { syllabusPublic: true, requiresAuth: false, minimumPlan: null, addonKey: null, prerequisiteProgramKeys: ["fca-workspace-quick-start"] },
  },
  "fca-support-auricrux-operator": {
    pathwayKey: "professional",
    topicKey: "fca-support-auricrux",
    enrollment: { syllabusPublic: true, requiresAuth: false, minimumPlan: null, addonKey: null, prerequisiteProgramKeys: ["fca-workspace-quick-start"] },
  },
  "fca-academy-progress-tracking": {
    pathwayKey: "professional",
    topicKey: "fca-platform",
    enrollment: { syllabusPublic: true, requiresAuth: false, minimumPlan: null, addonKey: null, prerequisiteProgramKeys: ["fca-workspace-quick-start"] },
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
    topicKey: "aas-construction-management",
    enrollment: { syllabusPublic: true, requiresAuth: true, minimumPlan: "operations", addonKey: null, prerequisiteProgramKeys: [] },
  },
  "virginia-dpor-residential-license-prep": {
    pathwayKey: "licensure",
    topicKey: "state-va",
    enrollment: { syllabusPublic: true, requiresAuth: true, minimumPlan: "starter-team", addonKey: "licensure-pack", prerequisiteProgramKeys: ["contractor-business-formation-legal"] },
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

const APPRENTICESHIP_PREFIXES = [
  { prefix: "fire-sprinkler-", topicKey: "fire-sprinkler" },
  { prefix: "sheet-metal-", topicKey: "sheet-metal" },
  { prefix: "pipefitting-", topicKey: "pipefitting" },
  { prefix: "electrical-", topicKey: "electrical" },
  { prefix: "plumbing-", topicKey: "plumbing" },
  { prefix: "hvac-", topicKey: "hvac" },
  { prefix: "carpentry-", topicKey: "carpentry" },
  { prefix: "masonry-", topicKey: "masonry" },
  { prefix: "welding-", topicKey: "welding" },
];

const GEN_ED_PREFIXES = [
  "deg-engl-",
  "deg-math-",
  "deg-comm-",
  "deg-sci-",
  "deg-hist-",
  "deg-soc-",
  "deg-psyc-",
  "deg-econ-",
  "deg-ethc-",
  "deg-arts-",
  "deg-tech-",
  "deg-busa-",
];

function parseDegCourseNumber(key) {
  const match = String(key).match(/^deg-[a-z]+-(\d+)/);
  return match ? Number.parseInt(match[1], 10) : null;
}

function resolveApprenticeshipTopic(key) {
  const match = APPRENTICESHIP_PREFIXES.find((entry) => key.startsWith(entry.prefix));
  return match?.topicKey || null;
}

function resolveDegreeTopic(key) {
  if (GEN_ED_PREFIXES.some((prefix) => key.startsWith(prefix))) {
    return "general-education";
  }
  if (key.startsWith("deg-cmgt-")) {
    const courseNumber = parseDegCourseNumber(key);
    return courseNumber !== null && courseNumber < 300 ? "aas-construction-management" : "bs-construction-management";
  }
  if (key.startsWith("deg-ciet-")) return "aas-civil-engineering-technology";
  if (key.startsWith("deg-bimd-")) return "aas-bim-digital-construction";
  if (key.startsWith("deg-safe-")) return "aas-occupational-safety-health";
  if (key.startsWith("deg-bcon-")) return "aas-business-administration-contractors";
  if (key.startsWith("deg-pmgt-")) return "bs-project-management";
  if (key.startsWith("deg-sust-")) return "bs-sustainable-built-environment";
  if (key.startsWith("deg-ctin-")) return "bas-construction-technology-innovation";
  if (key.startsWith("degree-general-education")) return "general-education";
  if (key.startsWith("degree-aas-construction-management")) return "aas-construction-management";
  if (key.startsWith("degree-aas-civil-engineering")) return "aas-civil-engineering-technology";
  if (key.startsWith("degree-aas-bim-digital")) return "aas-bim-digital-construction";
  if (key.startsWith("degree-aas-occupational-safety")) return "aas-occupational-safety-health";
  if (key.startsWith("degree-aas-business-administration")) return "aas-business-administration-contractors";
  if (key.startsWith("degree-bs-construction-management")) return "bs-construction-management";
  if (key.startsWith("degree-bs-project-management")) return "bs-project-management";
  if (key.startsWith("degree-bs-sustainable-built-environment")) return "bs-sustainable-built-environment";
  if (key.startsWith("degree-bas-construction-technology")) return "bas-construction-technology-innovation";
  return null;
}

function resolveCertificationTopic(key) {
  if (key === "safety-osha-certification" || key.startsWith("cert-osha-") || key.startsWith("cert-fall-") || key.startsWith("cert-confined-") || key.startsWith("cert-hazcom-") || key === "field-readiness") {
    return "safety-osha";
  }
  if (key === "project-controls-certification" || key === "project-controls" || key.startsWith("cert-schedule-") || key.startsWith("cert-cost-") || key.startsWith("cert-earned-") || key.startsWith("cert-portfolio-")) {
    return "project-controls";
  }
  if (key === "construction-management-certification" || key.startsWith("cert-cm-")) {
    return "construction-management-cert";
  }
  if (key === "estimating-preconstruction-certification" || key === "precon-estimating" || key.startsWith("cert-quantity-") || key.startsWith("cert-bid-") || key.startsWith("cert-value-") || key.startsWith("cert-precon-")) {
    return "estimating-preconstruction";
  }
  if (key === "bim-certification" || key.startsWith("cert-bim-")) {
    return "bim-certification";
  }
  if (key === "superintendent-certification" || key.startsWith("cert-superintendent-") || key.startsWith("cert-production-") || key.startsWith("cert-multi-trade-") || key.startsWith("cert-owner-gc-") || key.startsWith("cert-executive-superintendent")) {
    return "superintendent";
  }
  if (key === "qaqc-certification" || key.startsWith("cert-qaqc-") || key.startsWith("cert-inspection-") || key.startsWith("cert-deficiency-") || key.startsWith("cert-closeout-") || key.startsWith("cert-quality-")) {
    return "qaqc";
  }
  if (key === "commissioning-certification" || key.startsWith("cert-commissioning-") || key.startsWith("cert-mep-commissioning") || key.startsWith("cert-envelope-") || key.startsWith("cert-functional-") || key.startsWith("cert-cx-")) {
    return "commissioning";
  }
  if (key === "sustainability-leed-certification" || key.startsWith("cert-sustainability-") || key.startsWith("cert-leed-") || key.startsWith("cert-energy-") || key.startsWith("cert-sustainable-")) {
    return "sustainability-leed";
  }
  if (key === "trade-journeyman-certification" || /cert-(electrical|plumbing|hvac|carpentry|masonry|welding|pipefitting|sheet-metal|fire-sprinkler)-/.test(key)) {
    return "trade-journeyman";
  }
  return null;
}

function resolveLicensureTopic(key) {
  if (key.includes("dpor") || key.startsWith("lic-general-contractor-") || key === "virginia-dpor-residential-license-prep") {
    return "state-va";
  }
  if (key.startsWith("lic-nascla-") || key.startsWith("lic-code-book-") || key.startsWith("lic-osha-licensure-") || key.startsWith("lic-application-checklist-")) {
    return "universal-licensure";
  }
  if (key.startsWith("lic-contractor-business-") || key.startsWith("lic-construction-law-") || key.includes("business-formation") || key.includes("construction-law")) {
    return "business-law-compliance";
  }
  if (key.startsWith("lic-electrical-")) {
    return "electrical-licensure";
  }
  if (/^lic-(plumbing|hvac|carpentry|masonry|welding|pipefitting|sheet-metal|fire-sprinkler)-/.test(key)) {
    return "trade-licensure";
  }
  return "licensure-readiness";
}

function resolveProfessionalTopic(key) {
  if (key.startsWith("fca-bids-") || key.includes("bids") && key.includes("estimate")) return "fca-bids-estimates";
  if (key.startsWith("fca-projects-") || key.includes("project")) return "fca-projects-execution";
  if (key.startsWith("fca-files-") || key.includes("files") || key.includes("audit")) return "fca-files-governance";
  if (key.startsWith("fca-billing-") || key.includes("billing") || key.includes("invoice")) return "fca-billing-revenue";
  if (key.startsWith("fca-legal-") || key.includes("legal")) return "fca-legal-compliance";
  if (key.startsWith("fca-support-") || key.includes("auricrux") || key.includes("support")) return "fca-support-auricrux";
  if (key.startsWith("fca-") || key.includes("workspace") || key.includes("user-guide") || key.includes("quick-start") || key.includes("academy-progress")) {
    return "fca-platform";
  }
  if (key.includes("continuing-education") || key.includes("renewal-ce")) return "continuing-education";
  return "workforce-readiness";
}

function resolvePathwayKey(program) {
  if (program.lane) return program.lane;
  if (program.pathwayKey) return program.pathwayKey;

  const key = program.key || "";
  if (resolveApprenticeshipTopic(key)) return "apprenticeship";
  if (key.startsWith("deg-") || key.startsWith("degree-")) return "degree";
  if (key.startsWith("cert-") || key.endsWith("-certification") || key === "project-controls" || key === "precon-estimating" || key === "field-readiness") {
    return "certification";
  }
  if (key.startsWith("lic-") || key.includes("dpor") || key.includes("licensure")) return "licensure";
  if (program.pathway?.includes("Apprenticeship")) return "apprenticeship";
  if (program.pathway?.includes("Certification")) return "certification";
  if (program.pathway?.includes("AAS") || program.pathway?.includes("BS") || program.pathway?.includes("BAS") || program.pathway === "General Education Core") {
    return "degree";
  }
  if (program.pathway?.includes("Licensure") || program.pathway?.includes("DPOR") || program.pathway?.includes("Exam Prep")) {
    return "licensure";
  }
  return "professional";
}

export function resolveTopicKeyFromProgram(program) {
  const key = program.key || "";

  if (program.topicKey) return program.topicKey;

  const apprenticeshipTopic = resolveApprenticeshipTopic(key);
  if (apprenticeshipTopic) return apprenticeshipTopic;

  if (key.startsWith("deg-") || key.startsWith("degree-")) {
    return resolveDegreeTopic(key) || "general-education";
  }

  if (key.startsWith("cert-") || key.endsWith("-certification") || key === "project-controls" || key === "precon-estimating" || key === "field-readiness") {
    return resolveCertificationTopic(key) || "safety-osha";
  }

  if (key.startsWith("lic-") || key.includes("dpor") || key.includes("lic-")) {
    return resolveLicensureTopic(key);
  }

  return resolveProfessionalTopic(key);
}

export function getTopicByKey(topicKey) {
  return CATALOG_TOPICS.find((topic) => topic.key === topicKey) || null;
}

export function getPathwayByKey(pathwayKey) {
  return CATALOG_PATHWAYS.find((pathway) => pathway.key === pathwayKey) || null;
}

export function getTopicsForPathway(pathwayKey, { includeEmpty = false } = {}) {
  const topics = CATALOG_TOPICS.filter((topic) => topic.pathwayKey === pathwayKey);
  if (includeEmpty) return topics;
  return topics;
}

export function resolveProgramCatalogMeta(program) {
  const staticMeta = PROGRAM_CATALOG_META[program.key];
  if (staticMeta) {
    const topic = getTopicByKey(staticMeta.topicKey);
    return {
      pathwayKey: staticMeta.pathwayKey,
      topicKey: staticMeta.topicKey,
      degreeLevel: topic?.degreeLevel || program.degreeLevel || null,
      totalCredits: topic?.totalCredits || program.totalCredits || null,
      creditsPerCourse: topic?.creditsPerCourse || 3,
      stateCode: topic?.stateCode || program.stateCode || null,
      enrollment: { ...staticMeta.enrollment },
    };
  }

  const pathwayKey = resolvePathwayKey(program);
  const topicKey = resolveTopicKeyFromProgram(program);
  const topic = getTopicByKey(topicKey);

  return {
    pathwayKey,
    topicKey,
    degreeLevel: topic?.degreeLevel || program.degreeLevel || null,
    totalCredits: topic?.totalCredits || program.totalCredits || null,
    creditsPerCourse: topic?.creditsPerCourse || (pathwayKey === "degree" ? 3 : null),
    stateCode: topic?.stateCode || program.stateCode || null,
    enrollment: program.enrollment || {
      syllabusPublic: true,
      requiresAuth: true,
      minimumPlan: pathwayKey === "degree" ? "operations" : pathwayKey === "professional" ? null : "starter-team",
      addonKey: pathwayKey === "licensure" ? "licensure-pack" : pathwayKey === "apprenticeship" ? "apprenticeship-track" : pathwayKey === "certification" ? "certification-track" : null,
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
