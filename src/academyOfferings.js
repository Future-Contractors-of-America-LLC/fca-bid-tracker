import { academyCatalog } from "./academyCatalog.js";
import {
  CATALOG_PATHWAYS,
  getLicensureSharedProgramKeys,
  getPathwayByKey,
  getTopicByKey,
  getTopicsForPathway,
  resolveProgramCatalogMeta,
} from "./academyCatalogTaxonomy.js";

/** Organized Academy taxonomy aligned with backend lanes. */
export const OFFERING_LANES = [
  {
    key: "apprenticeship",
    label: "Apprenticeship",
    description: "FCA trade-standard apprenticeship pathways across nine construction trades from Core Level 1 through Level 10 specialization.",
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
    description: "39 FCA Matrix-aligned associate and bachelor pathways covering the full construction lifecycle, platform operations, and Contractor Command.",
    credentialType: "Academic Degree",
  },
  {
    key: "licensure",
    label: "Licensure Prep",
    description: "Trade and contractor licensure exam preparation across nine trades, Virginia DPOR classifications, NASCLA business and law, code navigation, and license renewal.",
    credentialType: "Licensure Prep",
  },
  {
    key: "professional",
    label: "Professional Development",
    description: "Deep continuing education, leadership, ethics, finance literacy, and workforce readiness.",
    credentialType: "Continuing Education",
  },
  {
    key: "fca-how-to",
    label: "FCA How-To and Operator Guides",
    description: "Live portal operator guides for Contractor Command — Auricrux-led mini-LMS for FCA workflows.",
    credentialType: "FCA Operator Certificate",
  },
];

const STATIC_LANE_BY_PROGRAM_KEY = {
  "fca-workspace-quick-start": "fca-how-to",
  "fca-contractor-command-user-guide": "fca-how-to",
  "fca-bids-qualification-estimates": "fca-how-to",
  "fca-projects-stage-control": "fca-how-to",
  "fca-files-audit-governance": "fca-how-to",
  "fca-billing-invoicing": "fca-how-to",
  "fca-legal-command-workspace": "fca-how-to",
  "fca-support-auricrux-operator": "fca-how-to",
  "fca-academy-progress-tracking": "fca-how-to",
  "electrical-apprenticeship-year1": "apprenticeship",
  "osha30-certification-prep": "certification",
  "aas-construction-operations-sem1": "degree",
  "virginia-dpor-residential-license-prep": "licensure",
  "contractor-business-formation-legal": "licensure",
  "contractor-construction-law-essentials": "licensure",
};

const FCA_HOWTO_PREFIXES = ["fca-"];

const CERTIFICATION_PREFIXES = ["cert-", "project-controls", "precon-estimating", "field-readiness"];
const DEGREE_PREFIXES = ["deg-"];
const LICENSURE_PREFIXES = ["lic-", "virginia-dpor", "contractor-business", "contractor-construction"];

/** FCA Coverage Matrix-aligned degree pathway summaries (backend-aligned). */
export const DEGREE_PATHWAYS = [
  { key: "degree-general-education-core", label: "General Education Core", pathway: "General Education Core", courses: 15, credits: 45 },
  { key: "degree-aas-construction-management", label: "Construction Management AAS", pathway: "Construction Management AAS", courses: 20, credits: 60, level: "AAS", fcaMatrix: "Project Setup · Scheduling · Field Execution" },
  { key: "degree-aas-civil-engineering-technology", label: "Civil Engineering Technology AAS", pathway: "Civil and Construction Engineering Technology AAS", courses: 20, credits: 60, level: "AAS", fcaMatrix: "Heavy Civil · Infrastructure" },
  { key: "degree-aas-bim-digital-construction", label: "BIM and Digital Construction AAS", pathway: "Building Information Modeling and Digital Construction AAS", courses: 20, credits: 60, level: "AAS", fcaMatrix: "Documents & Plans · Takeoffs" },
  { key: "degree-aas-occupational-safety-health", label: "Occupational Safety and Health AAS", pathway: "Occupational Safety and Health AAS", courses: 20, credits: 60, level: "AAS", fcaMatrix: "Field Execution · Audit" },
  { key: "degree-aas-business-administration-contractors", label: "Business Administration for Contractors AAS", pathway: "Business Administration for Contractors AAS", courses: 20, credits: 60, level: "AAS", fcaMatrix: "Accounting · Admin Control" },
  { key: "degree-aas-building-construction-technology", label: "Building Construction Technology AAS", pathway: "Building Construction Technology AAS", courses: 20, credits: 60, level: "AAS", fcaMatrix: "Field Execution · QC & Punch" },
  { key: "degree-aas-architectural-engineering-technology", label: "Architectural Engineering Technology AAS", pathway: "Architectural Engineering Technology AAS", courses: 20, credits: 60, level: "AAS", fcaMatrix: "Documents & Plans · Design" },
  { key: "degree-aas-estimating-preconstruction", label: "Estimating and Preconstruction AAS", pathway: "Estimating and Preconstruction AAS", courses: 20, credits: 60, level: "AAS", fcaMatrix: "Bid · Estimate · Proposal" },
  { key: "degree-aas-mep-systems-technology", label: "MEP Systems Technology AAS", pathway: "MEP Systems Technology AAS", courses: 20, credits: 60, level: "AAS", fcaMatrix: "MEP · Commissioning" },
  { key: "degree-aas-heavy-civil-infrastructure", label: "Heavy Civil and Infrastructure AAS", pathway: "Heavy Civil and Infrastructure AAS", courses: 20, credits: 60, level: "AAS", fcaMatrix: "Heavy Civil · Infrastructure" },
  { key: "degree-aas-document-control-digital-delivery", label: "Document Control and Digital Delivery AAS", pathway: "Document Control and Digital Delivery AAS", courses: 20, credits: 60, level: "AAS", fcaMatrix: "Document Control · RFIs · Takeoffs" },
  { key: "degree-aas-field-operations-scheduling", label: "Field Operations and Scheduling AAS", pathway: "Field Operations and Scheduling AAS", courses: 20, credits: 60, level: "AAS", fcaMatrix: "Scheduling · Field Execution" },
  { key: "degree-aas-construction-accounting-job-cost", label: "Construction Accounting and Job Cost AAS", pathway: "Construction Accounting and Job Cost AAS", courses: 20, credits: 60, level: "AAS", fcaMatrix: "Job Cost · Billing · Accounting" },
  { key: "degree-aas-quality-control-inspection", label: "Quality Control and Inspection AAS", pathway: "Quality Control and Inspection AAS", courses: 20, credits: 60, level: "AAS", fcaMatrix: "Quality Control · Punch · Closeout" },
  { key: "degree-aas-construction-law-compliance", label: "Construction Law and Compliance AAS", pathway: "Construction Law and Compliance AAS", courses: 20, credits: 60, level: "AAS", fcaMatrix: "Legal · Audit · Governance" },
  { key: "degree-aas-residential-construction", label: "Residential Construction AAS", pathway: "Residential Construction AAS", courses: 20, credits: 60, level: "AAS", fcaMatrix: "Residential · Customer Portal" },
  { key: "degree-aas-facilities-maintenance", label: "Facilities and Maintenance Technology AAS", pathway: "Facilities and Maintenance Technology AAS", courses: 20, credits: 60, level: "AAS", fcaMatrix: "Facilities · Warranty" },
  { key: "degree-aas-warranty-service-operations", label: "Warranty and Service Operations AAS", pathway: "Warranty and Service Operations AAS", courses: 20, credits: 60, level: "AAS", fcaMatrix: "Warranty · Recurring Work" },
  { key: "degree-aas-fca-platform-operations", label: "FCA Platform Operations AAS", pathway: "FCA Platform Operations AAS", courses: 20, credits: 60, level: "AAS", fcaMatrix: "FCA Platform · Auricrux · Academy" },
  { key: "degree-bs-construction-management", label: "Construction Management BS", pathway: "Construction Management BS", courses: 40, credits: 120, level: "BS", fcaMatrix: "Full lifecycle · Program management" },
  { key: "degree-bs-project-management-construction", label: "Project Management BS", pathway: "Project Management BS (Construction Focus)", courses: 40, credits: 120, level: "BS", fcaMatrix: "Project Controls · Change Orders" },
  { key: "degree-bs-sustainable-built-environment", label: "Sustainable Built Environment BS", pathway: "Sustainable Built Environment BS", courses: 40, credits: 120, level: "BS", fcaMatrix: "Sustainability · Commissioning" },
  { key: "degree-bas-construction-technology-innovation", label: "Construction Technology BAS", pathway: "Construction Technology and Innovation BAS", courses: 40, credits: 120, level: "BAS", fcaMatrix: "Technology · Innovation" },
  { key: "degree-bs-architectural-engineering", label: "Architectural Engineering BS", pathway: "Architectural Engineering BS", courses: 40, credits: 120, level: "BS", fcaMatrix: "Design · Building Systems" },
  { key: "degree-bs-building-construction-science", label: "Building Construction Science BS", pathway: "Building Construction Science BS", courses: 40, credits: 120, level: "BS", fcaMatrix: "Field Execution · QC" },
  { key: "degree-bs-estimating-construction-finance", label: "Estimating and Construction Finance BS", pathway: "Estimating and Construction Finance BS", courses: 40, credits: 120, level: "BS", fcaMatrix: "Bid · Estimate · Finance" },
  { key: "degree-bs-digital-project-delivery", label: "Digital Project Delivery BS", pathway: "Digital Project Delivery BS", courses: 40, credits: 120, level: "BS", fcaMatrix: "Documents · RFIs · Change Orders" },
  { key: "degree-bs-field-operations-management", label: "Field Operations Management BS", pathway: "Field Operations Management BS", courses: 40, credits: 120, level: "BS", fcaMatrix: "Field Execution · Scheduling" },
  { key: "degree-bs-construction-finance-accounting", label: "Construction Finance and Accounting BS", pathway: "Construction Finance and Accounting BS", courses: 40, credits: 120, level: "BS", fcaMatrix: "Accounting · Billing · Job Cost" },
  { key: "degree-bs-quality-punch-closeout", label: "Quality, Punch and Closeout BS", pathway: "Quality, Punch and Closeout BS", courses: 40, credits: 120, level: "BS", fcaMatrix: "QC · Punch · Closeout" },
  { key: "degree-bs-heavy-civil-engineering", label: "Heavy Civil Engineering BS", pathway: "Heavy Civil Engineering BS", courses: 40, credits: 120, level: "BS", fcaMatrix: "Heavy Civil · Infrastructure" },
  { key: "degree-bs-mep-engineering-technology", label: "MEP Engineering Technology BS", pathway: "MEP Engineering Technology BS", courses: 40, credits: 120, level: "BS", fcaMatrix: "MEP · Commissioning" },
  { key: "degree-bs-construction-safety-management", label: "Construction Safety Management BS", pathway: "Construction Safety Management BS", courses: 40, credits: 120, level: "BS", fcaMatrix: "Safety · Audit" },
  { key: "degree-bs-construction-law", label: "Construction Law BS", pathway: "Construction Law BS", courses: 40, credits: 120, level: "BS", fcaMatrix: "Legal · Governance" },
  { key: "degree-bs-facilities-asset-management", label: "Facilities and Asset Management BS", pathway: "Facilities and Asset Management BS", courses: 40, credits: 120, level: "BS", fcaMatrix: "Facilities · Warranty" },
  { key: "degree-bs-real-estate-development", label: "Real Estate Development BS", pathway: "Real Estate Development BS", courses: 40, credits: 120, level: "BS", fcaMatrix: "Market Network · Development" },
  { key: "degree-bs-contractor-entrepreneurship", label: "Contractor Entrepreneurship BS", pathway: "Contractor Entrepreneurship BS", courses: 40, credits: 120, level: "BS", fcaMatrix: "Business · Admin Control" },
  { key: "degree-bs-fca-contractor-operations", label: "FCA Contractor Command Operations BS", pathway: "FCA Contractor Command Operations BS", courses: 40, credits: 120, level: "BS", fcaMatrix: "FCA Platform · Full spine" },
  { key: "degree-bs-digital-construction-bim", label: "Digital Construction and BIM BS", pathway: "Digital Construction and BIM BS", courses: 40, credits: 120, level: "BS", fcaMatrix: "BIM · Takeoffs · Design" },
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
  { key: "business-development-certification", label: "Business Development", pathway: "Business Development Certification", units: 5 },
  { key: "billing-payapps-certification", label: "Billing and Pay Apps", pathway: "Billing and Pay Application Certification", units: 5 },
  { key: "customer-communications-certification", label: "Customer Communications", pathway: "Customer Communications Certification", units: 5 },
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

/** Thirteen licensure pathway summaries (backend-aligned). */
export const LICENSURE_PATHWAYS = [
  { key: "electrical-licensure-exam-prep", label: "Electrical Licensure", pathway: "Electrical Licensure Exam Prep", units: 3 },
  { key: "plumbing-licensure-exam-prep", label: "Plumbing Licensure", pathway: "Plumbing Licensure Exam Prep", units: 3 },
  { key: "hvac-licensure-exam-prep", label: "HVAC Licensure", pathway: "HVAC Licensure Exam Prep", units: 3 },
  { key: "carpentry-licensure-exam-prep", label: "Carpentry Contractor", pathway: "Carpentry Contractor Licensure Exam Prep", units: 1 },
  { key: "masonry-licensure-exam-prep", label: "Masonry Contractor", pathway: "Masonry Contractor Licensure Exam Prep", units: 1 },
  { key: "welding-licensure-exam-prep", label: "Welding and CWI", pathway: "Welding Licensure and CWI Exam Prep", units: 2 },
  { key: "pipefitting-licensure-exam-prep", label: "Pipefitting Licensure", pathway: "Pipefitting Licensure Exam Prep", units: 2 },
  { key: "sheet-metal-licensure-exam-prep", label: "Sheet Metal Licensure", pathway: "Sheet Metal Licensure Exam Prep", units: 2 },
  { key: "fire-sprinkler-licensure-exam-prep", label: "Fire Sprinkler Licensure", pathway: "Fire Sprinkler Licensure Exam Prep", units: 2 },
  { key: "general-contractor-licensure", label: "General Contractor", pathway: "General Contractor Licensure Exam Prep", units: 3 },
  { key: "virginia-dpor-contractor-licensing", label: "Virginia DPOR", pathway: "Virginia DPOR Contractor Licensing", units: 4 },
  { key: "contractor-business-law-licensure", label: "Business and Law", pathway: "Contractor Business and Law Exam Prep", units: 3 },
  { key: "licensure-exam-readiness-fundamentals", label: "Exam Readiness", pathway: "Licensure Exam Readiness Fundamentals", units: 3 },
];

/** Electrical licensure exam prep progression (backend-aligned). */
export const ELECTRICAL_LICENSURE_UNITS = [
  { unit: 1, key: "lic-electrical-journeyman-exam-prep", title: "Journeyman Electrician", modules: 7 },
  { unit: 2, key: "lic-electrical-master-exam-prep", title: "Master Electrician", modules: 7 },
  { unit: 3, key: "lic-electrical-contractor-exam-prep", title: "Electrical Contractor", modules: 8 },
];

/** Virginia DPOR contractor licensing progression (backend-aligned). */
export const DPOR_LICENSURE_UNITS = [
  { unit: 1, key: "lic-dpor-residential-contractor-prep", title: "Residential Contractor", modules: 7 },
  { unit: 2, key: "lic-dpor-class-a-contractor-prep", title: "Class A Contractor", modules: 8 },
  { unit: 3, key: "lic-dpor-class-b-contractor-prep", title: "Class B Contractor", modules: 8 },
  { unit: 4, key: "lic-dpor-class-c-contractor-prep", title: "Class C Contractor", modules: 7 },
];

/** NASCLA and business law licensure progression (backend-aligned). */
export const BUSINESS_LAW_LICENSURE_UNITS = [
  { unit: 1, key: "lic-nascla-business-law-exam-prep", title: "NASCLA Business and Law", modules: 8 },
  { unit: 2, key: "lic-contractor-business-formation", title: "Business Formation", modules: 6 },
  { unit: 3, key: "lic-construction-law-essentials", title: "Construction Law", modules: 6 },
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

/** Core level progression template for any apprenticeship trade. */
export function buildApprenticeshipCoreLevels(tradeKey, tradeLabel) {
  return [1, 2, 3, 4, 5, 6].map((level) => ({
    level,
    key: `${tradeKey}-core-level-${level}`,
    title: `${tradeLabel} Core / Level ${level}`,
    modules: 12,
  }));
}

export const APPRENTICESHIP_TRADE_LEVELS = Object.fromEntries(
  APPRENTICESHIP_TRADES.map((trade) => [trade.key, buildApprenticeshipCoreLevels(trade.key, trade.label)]),
);

/** Professional development topic summaries. */
export const PROFESSIONAL_PATHWAYS = [
  { key: "continuing-education", label: "Continuing Education", programs: 4 },
  { key: "workforce-readiness", label: "Workforce Readiness", programs: 4 },
  { key: "leadership-management", label: "Leadership and Management", programs: 3 },
  { key: "ethics-professional-conduct", label: "Ethics and Professional Conduct", programs: 1 },
  { key: "project-leadership", label: "Project Leadership", programs: 2 },
  { key: "construction-finance", label: "Construction Finance", programs: 2 },
  { key: "safety-leadership", label: "Safety Leadership", programs: 2 },
  { key: "contract-administration", label: "Contract Administration", programs: 1 },
  { key: "customer-excellence", label: "Customer Excellence", programs: 1 },
  { key: "mentoring-coaching", label: "Mentoring and Coaching", programs: 1 },
  { key: "technology-adoption", label: "Technology and Field Ops", programs: 1 },
  { key: "executive-readiness", label: "Executive Readiness", programs: 1 },
];

/** FCA How-To operator guide sequence. */
export const FCA_HOWTO_SEQUENCE = [
  { order: 1, key: "fca-workspace-quick-start", title: "Workspace Quick Start", topicKey: "fca-platform" },
  { order: 2, key: "fca-contractor-command-user-guide", title: "Contractor Command User Guide", topicKey: "fca-platform" },
  { order: 3, key: "fca-bids-qualification-estimates", title: "Bids and Estimates", topicKey: "fca-bids-estimates" },
  { order: 4, key: "fca-projects-stage-control", title: "Projects and Stage Control", topicKey: "fca-projects-execution" },
  { order: 5, key: "fca-files-audit-governance", title: "Files and Governance", topicKey: "fca-files-governance" },
  { order: 6, key: "fca-billing-invoicing", title: "Billing and Invoicing", topicKey: "fca-billing-revenue" },
  { order: 7, key: "fca-legal-command-workspace", title: "Legal Command", topicKey: "fca-legal-compliance" },
  { order: 8, key: "fca-support-auricrux-operator", title: "Support and Auricrux", topicKey: "fca-support-auricrux" },
  { order: 9, key: "fca-academy-progress-tracking", title: "Academy Progress", topicKey: "fca-platform" },
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
  if (LICENSURE_PREFIXES.some((prefix) => program.key?.startsWith(prefix))) return "licensure";
  if (program.pathway?.includes("Licensure") || program.pathway?.includes("DPOR") || program.pathway?.includes("Exam Prep")) return "licensure";
  if (FCA_HOWTO_PREFIXES.some((prefix) => program.key?.startsWith(prefix))) return "fca-how-to";
  if (program.pathway?.includes("How-To") || program.pathway?.includes("Operator")) return "fca-how-to";
  return "professional";
}

/** @deprecated Use organizeCatalogHierarchy */
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

/** Pathway → topic → course hierarchy for catalog navigation. */
export function organizeCatalogHierarchy(apiPrograms = [], options = {}) {
  const includeOperatorGuides = options.includeOperatorGuides === true;
  const includeCte = options.includeCte === true;
  const apiKeys = new Set(apiPrograms.map((program) => program.key));
  const allPrograms = apiPrograms.length > 0
    ? [...apiPrograms]
    : academyCatalog.programs.map((program) => ({ ...program, source: "catalog-preview" }));

  if (apiPrograms.length > 0) {
    for (const program of academyCatalog.programs) {
      if (!apiKeys.has(program.key)) {
        allPrograms.push({ ...program, source: "catalog-preview" });
      }
    }
  }

  const courseBuckets = Object.fromEntries(
    CATALOG_PATHWAYS.map((pathway) => [pathway.key, Object.fromEntries(getTopicsForPathway(pathway.key).map((topic) => [topic.key, []]))]),
  );

  for (const program of allPrograms) {
    const { pathwayKey, topicKey, enrollment } = resolveProgramCatalogMeta(program);
    if (!includeCte && pathwayKey === "vdoe-cte") continue;
    if (!courseBuckets[pathwayKey]) continue;
    if (!courseBuckets[pathwayKey][topicKey]) {
      courseBuckets[pathwayKey][topicKey] = [];
    }
    const bucket = courseBuckets[pathwayKey][topicKey];
    if (!bucket.some((entry) => entry.key === program.key)) {
      bucket.push({
        ...program,
        pathwayKey,
        topicKey,
        enrollment,
      });
    }
  }

  // Link multi-state licensure shared courses to every state topic page.
  const programByKey = Object.fromEntries(allPrograms.map((program) => [program.key, program]));
  for (const pathway of CATALOG_PATHWAYS) {
    if (pathway.key !== "licensure") continue;
    for (const topic of getTopicsForPathway("licensure", { includeEmpty: true })) {
      if (!topic.key?.startsWith("state-")) continue;
      const sharedKeys = getLicensureSharedProgramKeys(topic.key);
      for (const sharedKey of sharedKeys) {
        const sharedProgram = programByKey[sharedKey];
        if (!sharedProgram) continue;
        const meta = resolveProgramCatalogMeta(sharedProgram);
        const bucket = courseBuckets.licensure[topic.key] || [];
        if (bucket.some((entry) => entry.key === sharedKey)) continue;
        if (!courseBuckets.licensure[topic.key]) {
          courseBuckets.licensure[topic.key] = [];
        }
        courseBuckets.licensure[topic.key].push({
          ...sharedProgram,
          pathwayKey: "licensure",
          topicKey: topic.key,
          enrollment: meta.enrollment,
          sharedFromTopic: meta.topicKey,
          licensureScope: "multi-state",
        });
      }
    }
  }

  return CATALOG_PATHWAYS
    .filter((pathway) => {
      if (!includeOperatorGuides && pathway.key === "fca-how-to") return false;
      if (!includeCte && pathway.key === "vdoe-cte") return false;
      return true;
    })
    .map((pathway) => {
    const knownTopics = getTopicsForPathway(pathway.key);
    const topics = knownTopics
      .map((topic) => ({
        ...topic,
        courses: (courseBuckets[pathway.key][topic.key] || []).sort((a, b) => (a.level || 0) - (b.level || 0)),
      }))
      .filter((topic) => topic.courses.length > 0 || topic.alwaysShow);

    const knownTopicKeys = new Set(knownTopics.map((topic) => topic.key));
    const orphanTopics = Object.entries(courseBuckets[pathway.key] || {})
      .filter(([topicKey, courses]) => !knownTopicKeys.has(topicKey) && courses.length > 0)
      .map(([topicKey, courses]) => ({
        key: topicKey,
        label: topicKey.replace(/^vdoe-cte-/, "").replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        description: `${pathway.label} programs`,
        pathwayKey: pathway.key,
        courses: courses.sort((a, b) => (a.level || 0) - (b.level || 0)),
      }));

    const mergedTopics = [...topics, ...orphanTopics];
    const courseCount = mergedTopics.reduce((sum, topic) => sum + topic.courses.length, 0);

    return {
      ...pathway,
      topics: mergedTopics,
      courseCount,
    };
  }).filter((pathway) => pathway.courseCount > 0 || pathway.key === "licensure" || (includeCte && pathway.key === "vdoe-cte") || (includeOperatorGuides && pathway.key === "fca-how-to"));
}

export function findCatalogPlacement(pathwayKey, topicKey, programKey) {
  const pathway = getPathwayByKey(pathwayKey);
  const topic = getTopicByKey(topicKey);
  if (!pathway || !topic || topic.pathwayKey !== pathwayKey) return null;
  return { pathway, topic };
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
