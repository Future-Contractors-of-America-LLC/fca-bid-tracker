import {
  CTE_EXTERNAL_ALIGNMENT_SOURCE_IDS,
  FCA_CTE_ACADEMIC_RIGOR_REQUIREMENTS,
  FCA_CTE_ORIGINALITY_POLICY,
} from "./cteExternalAlignmentSources.js";
import { VDOE_CTE_SOURCE_COURSES_BY_KEY } from "./vdoeCteSourceManifest.js";

const CTE_CLUSTER = {
  jurisdiction: "VA",
  cluster: "Architecture & Construction",
  source: "Virginia CTE Resource Center",
  sourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/",
  cteOffice: "Virginia Department of Education Office of Career, Technical, and Adult Education",
};

const SHARED_CREDENTIAL_OPTIONS = [
  "Workplace Readiness Skills for the Commonwealth Examination",
  "Professional Communications Certification Examination",
  "National Career Readiness Certificate (NCRC)",
];

const BUILDING_TRADES_CREDENTIAL_OPTIONS = [
  "Building Construction Occupations Assessment",
  "Building Trades Maintenance Assessment",
  "Core: Introduction to Basic Construction Skills Assessment",
  "Construction Technology Assessment",
  "Carpentry Level One Assessment",
  "Electrical Level One Assessment",
  "Masonry Level One Assessment",
  "Plumbing Level One Assessment",
  "HBI Pre-Apprenticeship Certificate Training (PACT) Assessments",
  "HBI/NAHB Residential Construction Academy (RCA) Series Student Certification Assessments",
  "International Code Council Residential Building Inspector (B1) Examination",
  ...SHARED_CREDENTIAL_OPTIONS,
];

const TOPIC_PROFILES = {
  "cte-design-drafting": {
    label: "Design, Drafting & Architecture",
    labSurface: "/portal/design",
    labLabel: "Open Design Workspace",
    credentialOptions: ["CAD/BIM drafting certification readiness", "NOCTI Drafting", ...SHARED_CREDENTIAL_OPTIONS],
    strands: ["technical drawing", "architectural documents", "CAD/BIM modeling", "codes and specifications"],
  },
  "cte-building-trades": {
    label: "Building Trades",
    labSurface: "/portal/field-supervision",
    labLabel: "Open Field Supervision",
    credentialOptions: BUILDING_TRADES_CREDENTIAL_OPTIONS,
    strands: ["masonry", "carpentry", "electricity", "plumbing", "residential structure"],
  },
  "cte-carpentry-woodworking": {
    label: "Carpentry & Cabinetmaking",
    labSurface: "/portal/field-supervision",
    labLabel: "Open Field Supervision",
    credentialOptions: ["Carpentry Level One Assessment", "HBI/NAHB Residential Construction Academy Assessments", ...SHARED_CREDENTIAL_OPTIONS],
    strands: ["measurement", "layout", "materials", "tool operation", "assembly", "finish quality"],
  },
  "cte-electrical": {
    label: "Electrical",
    labSurface: "/portal/field-supervision",
    labLabel: "Open Field Supervision",
    credentialOptions: ["Electrical Construction Technology Assessment", "Electrical Level One Assessment", "Electrical Occupations Assessment", ...SHARED_CREDENTIAL_OPTIONS],
    strands: ["electrical safety", "circuits", "rough-in", "codes", "testing", "documentation"],
  },
  "cte-hvacr": {
    label: "HVACR",
    labSurface: "/portal/field-supervision",
    labLabel: "Open Field Supervision",
    credentialOptions: ["HVAC Excellence Employment Ready", "EPA Section 608 readiness", ...SHARED_CREDENTIAL_OPTIONS],
    strands: ["refrigeration cycle", "air distribution", "controls", "diagnostics", "codes", "documentation"],
  },
  "cte-masonry": {
    label: "Masonry",
    labSurface: "/portal/field-supervision",
    labLabel: "Open Field Supervision",
    credentialOptions: ["Masonry Level One Assessment", "Building Construction Occupations Assessment", ...SHARED_CREDENTIAL_OPTIONS],
    strands: ["materials", "layout", "tool safety", "mortar", "wall systems", "inspection"],
  },
  "cte-plumbing": {
    label: "Plumbing",
    labSurface: "/portal/field-supervision",
    labLabel: "Open Field Supervision",
    credentialOptions: ["Plumbing Level One Assessment", "Plumbing-Heating-Cooling Contractors Educational Foundation Examinations", ...SHARED_CREDENTIAL_OPTIONS],
    strands: ["plumbing safety", "pipe materials", "fixtures", "water supply", "DWV", "inspection"],
  },
  "cte-construction-management": {
    label: "Construction Technology & Management",
    labSurface: "/portal/projects",
    labLabel: "Open Project Workspace",
    credentialOptions: ["Construction Technology Assessment", "Building Construction Occupations Assessment", ...SHARED_CREDENTIAL_OPTIONS],
    strands: ["project planning", "scheduling", "documents", "jobsite coordination", "quality", "closeout"],
  },
  "cte-civil-heavy": {
    label: "Civil Engineering & Heavy Construction",
    labSurface: "/portal/projects",
    labLabel: "Open Project Workspace",
    credentialOptions: ["Construction Technology Assessment", "Heavy Equipment Safety readiness", ...SHARED_CREDENTIAL_OPTIONS],
    strands: ["sitework", "utilities", "earthwork", "equipment safety", "survey control", "production reporting"],
  },
  "cte-sustainability": {
    label: "Green Building & Sustainability",
    labSurface: "/portal/audit",
    labLabel: "Open Audit Workspace",
    credentialOptions: ["LEED Green Associate readiness", "Green building literacy", ...SHARED_CREDENTIAL_OPTIONS],
    strands: ["energy", "materials", "water", "indoor environmental quality", "waste", "documentation"],
  },
};

export const VIRGINIA_AC_CTE_COURSES = [
  { key: "cte-va-architectural-drawing-design-18wk", title: "Architectural Drawing/Design", durationWeeks: 18, gradeLevel: [10, 11, 12], topicKey: "cte-design-drafting", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/architectural-drawingdesign-1/", prerequisiteLabel: "Technical Drawing/Design" },
  { key: "cte-va-architectural-drawing-design-36wk", title: "Architectural Drawing/Design", durationWeeks: 36, gradeLevel: [10, 11, 12], topicKey: "cte-design-drafting", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/architectural-drawingdesign/", prerequisiteLabel: "Technical Drawing/Design" },
  { key: "cte-va-building-management-i", title: "Building Management I", durationWeeks: 36, gradeLevel: [10, 11], topicKey: "cte-construction-management", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/15692/", vdoeCteResourceId: "15692" },
  { key: "cte-va-building-management-ii", title: "Building Management II", durationWeeks: 36, gradeLevel: [11, 12], topicKey: "cte-construction-management", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/15693/", vdoeCteResourceId: "15693", prerequisiteKeys: ["cte-va-building-management-i"], prerequisiteLabel: "Building Management I" },
  { key: "cte-va-building-management-iii", title: "Building Management III", durationWeeks: 36, gradeLevel: [12], topicKey: "cte-construction-management", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/15694/", vdoeCteResourceId: "15694", prerequisiteKeys: ["cte-va-building-management-ii"], prerequisiteLabel: "Building Management II" },
  { key: "cte-va-building-trades-i", title: "Building Trades I", durationWeeks: 36, gradeLevel: [10, 11], topicKey: "cte-building-trades", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/building-trades-i/", vdoeCourseCode: "8515", scedCode: "17009", credits: 1, instructionalHours: 140, oshaComplianceRequired: true, ctso: "SkillsUSA" },
  { key: "cte-va-building-trades-ii", title: "Building Trades II", durationWeeks: 36, gradeLevel: [11, 12], topicKey: "cte-building-trades", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/building-trades-ii/", vdoeCourseCode: "8516", scedCode: "17009", credits: 2, instructionalHours: 280, oshaComplianceRequired: true, ctso: "SkillsUSA", prerequisiteKeys: ["cte-va-building-trades-i"], prerequisiteLabel: "Building Trades I" },
  { key: "cte-va-building-trades-iii", title: "Building Trades III", durationWeeks: 36, gradeLevel: [12], topicKey: "cte-building-trades", prerequisiteKeys: ["cte-va-building-trades-ii"], prerequisiteLabel: "Building Trades II", proposedTrack: true, apprenticeshipTrack: true, pitchTarget: "VDOE CTE Curriculum Board", oshaComplianceRequired: true, ctso: "SkillsUSA" },
  { key: "cte-va-cabinetmaking-i", title: "Cabinetmaking I", durationWeeks: 36, gradeLevel: [10, 11], topicKey: "cte-carpentry-woodworking", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/cabinetmaking-i/" },
  { key: "cte-va-cabinetmaking-ii", title: "Cabinetmaking II", durationWeeks: 36, gradeLevel: [11, 12], topicKey: "cte-carpentry-woodworking", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/cabinetmaking-ii/", prerequisiteKeys: ["cte-va-cabinetmaking-i"], prerequisiteLabel: "Cabinetmaking I" },
  { key: "cte-va-carpentry-i", title: "Carpentry I", durationWeeks: 36, gradeLevel: [10, 11], topicKey: "cte-carpentry-woodworking", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/carpentry-i/" },
  { key: "cte-va-carpentry-ii", title: "Carpentry II", durationWeeks: 36, gradeLevel: [11, 12], topicKey: "cte-carpentry-woodworking", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/carpentry-ii/", prerequisiteKeys: ["cte-va-carpentry-i"], prerequisiteLabel: "Carpentry I" },
  { key: "cte-va-carpentry-iii", title: "Carpentry III", durationWeeks: 36, gradeLevel: [12], topicKey: "cte-carpentry-woodworking", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/carpentry-iii/", prerequisiteKeys: ["cte-va-carpentry-ii"], prerequisiteLabel: "Carpentry II" },
  { key: "cte-va-civil-engineering-architecture-pltw", title: "Civil Engineering and Architecture (PLTW)", durationWeeks: 36, gradeLevel: [11, 12], topicKey: "cte-design-drafting", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/civil-engineering-and-architecture-pltw/", prerequisiteLabel: "Introduction to Engineering Design (PLTW)" },
  { key: "cte-va-construction-technology-36wk", title: "Construction Technology", durationWeeks: 36, gradeLevel: [10, 11, 12], topicKey: "cte-construction-management", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/construction-technology/" },
  { key: "cte-va-construction-technology-18wk", title: "Construction Technology", durationWeeks: 18, gradeLevel: [10, 11, 12], topicKey: "cte-construction-management", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/construction-technology-1/" },
  { key: "cte-va-drafting-36wk", title: "Drafting", durationWeeks: 36, gradeLevel: [10, 11], topicKey: "cte-design-drafting", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/drafting/" },
  { key: "cte-va-drafting-advanced", title: "Drafting, Advanced", durationWeeks: 36, gradeLevel: [11, 12], topicKey: "cte-design-drafting", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/drafting-advanced/", prerequisiteKeys: ["cte-va-drafting-36wk"], prerequisiteLabel: "Drafting" },
  { key: "cte-va-drafting-architectural", title: "Drafting: Architectural", durationWeeks: 36, gradeLevel: [11, 12], topicKey: "cte-design-drafting", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/drafting-architectural/", vdoeCourseCode: "8437", prerequisiteKeys: ["cte-va-drafting-36wk"], prerequisiteLabel: "Drafting" },
  { key: "cte-va-drafting-mechanical", title: "Drafting: Mechanical", durationWeeks: 36, gradeLevel: [11, 12], topicKey: "cte-design-drafting", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/drafting-mechanical/", prerequisiteKeys: ["cte-va-drafting-36wk"], prerequisiteLabel: "Drafting" },
  { key: "cte-va-electricity-i", title: "Electricity I", durationWeeks: 36, gradeLevel: [10, 11], topicKey: "cte-electrical", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/electricity-i/", vdoeCourseCode: "8533" },
  { key: "cte-va-electricity-ii", title: "Electricity II", durationWeeks: 36, gradeLevel: [11, 12], topicKey: "cte-electrical", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/electricity-ii/", prerequisiteKeys: ["cte-va-electricity-i"], prerequisiteLabel: "Electricity I" },
  { key: "cte-va-electricity-iii", title: "Electricity III", durationWeeks: 36, gradeLevel: [12], topicKey: "cte-electrical", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/electricity-iii/", prerequisiteKeys: ["cte-va-electricity-ii"], prerequisiteLabel: "Electricity II" },
  { key: "cte-va-green-building-infusion-units", title: "Green Building Infusion Units", durationWeeks: null, gradeLevel: [9, 10, 11, 12], topicKey: "cte-sustainability", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/15030/", vdoeCteResourceId: "15030" },
  { key: "cte-va-hvacr-i", title: "Heating, Ventilation, Air Conditioning, and Refrigeration I", shortTitle: "HVACR I", durationWeeks: 36, gradeLevel: [10, 11], topicKey: "cte-hvacr", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/19196/", vdoeCourseCode: "8542", vdoeCteResourceId: "19196" },
  { key: "cte-va-hvacr-ii", title: "Heating, Ventilation, Air Conditioning, and Refrigeration II", shortTitle: "HVACR II", durationWeeks: 36, gradeLevel: [11, 12], topicKey: "cte-hvacr", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/19197/", vdoeCteResourceId: "19197", prerequisiteKeys: ["cte-va-hvacr-i"], prerequisiteLabel: "Heating, Ventilation, Air Conditioning, and Refrigeration I" },
  { key: "cte-va-masonry-i", title: "Masonry I", durationWeeks: 36, gradeLevel: [10, 11], topicKey: "cte-masonry", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/19372/", vdoeCteResourceId: "19372" },
  { key: "cte-va-masonry-ii", title: "Masonry II", durationWeeks: 36, gradeLevel: [11, 12], topicKey: "cte-masonry", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/19375/", vdoeCteResourceId: "19375", prerequisiteKeys: ["cte-va-masonry-i"], prerequisiteLabel: "Masonry I" },
  { key: "cte-va-masonry-iii", title: "Masonry III", durationWeeks: 36, gradeLevel: [12], topicKey: "cte-masonry", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/19376/", vdoeCteResourceId: "19376", prerequisiteKeys: ["cte-va-masonry-ii"], prerequisiteLabel: "Masonry II" },
  { key: "cte-va-plumbing-i", title: "Plumbing I", durationWeeks: 36, gradeLevel: [10, 11], topicKey: "cte-plumbing", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/19156/", vdoeCteResourceId: "19156" },
  { key: "cte-va-plumbing-ii", title: "Plumbing II", durationWeeks: 36, gradeLevel: [11, 12], topicKey: "cte-plumbing", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/plumbing-ii/", prerequisiteKeys: ["cte-va-plumbing-i"], prerequisiteLabel: "Plumbing I" },
  { key: "cte-va-utility-heavy-construction-i", title: "Utility/Heavy Construction I", durationWeeks: 36, gradeLevel: [10, 11], topicKey: "cte-civil-heavy", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/17546/", vdoeCteResourceId: "17546" },
  { key: "cte-va-utility-heavy-construction-ii", title: "Utility/Heavy Construction II", durationWeeks: 36, gradeLevel: [11, 12], topicKey: "cte-civil-heavy", cteResourceUrl: "https://www.cteresource.org/career-clusters/architecture-construction/17549/", vdoeCteResourceId: "17549", prerequisiteKeys: ["cte-va-utility-heavy-construction-i"], prerequisiteLabel: "Utility/Heavy Construction I" },
];

const SOURCE_MANIFEST_URL = "/config/vdoe-cte-source-manifest.json";
const EXTERNAL_ALIGNMENT_MANIFEST_URL = "/config/cte-external-alignment-sources.json";
const FCA_RIGOR_LEVEL = "honors-collegiate-ivy-equivalent";
const OFFICIAL_COPY_POLICY = "Official curriculum body text remains external; FCA stores metadata, source URLs, hashes, and cartridge structure only.";

function getOfficialSourceRecord(course) {
  return VDOE_CTE_SOURCE_COURSES_BY_KEY[course.key] || null;
}

function getOfficialMetadata(course) {
  return getOfficialSourceRecord(course)?.officialMetadata || {};
}

function officialNumber(value, fallback) {
  return typeof value === "number" ? value : fallback;
}

function officialBoolean(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

function officialArray(value, fallback = []) {
  return Array.isArray(value) && value.length > 0 ? value : fallback;
}

function fallbackCredits(course) {
  return course.credits || (course.durationWeeks === 36 ? 1 : course.durationWeeks === 18 ? 0.5 : null);
}

function fallbackInstructionalHours(course) {
  return course.instructionalHours || (course.durationWeeks === 36 ? 140 : course.durationWeeks === 18 ? 70 : null);
}

function officialArtifactRequirements(course) {
  if (course.proposedTrack) {
    return [
      "FCA Building Trades III board-pitch competency map",
      "Prerequisite Building Trades I/II source alignment",
      "Apprenticeship readiness and HQWBL evidence packet",
      "VDOE CTE Curriculum Board adoption status",
    ];
  }
  return [
    "Official CTE Resource course page metadata",
    "Official Canvas curriculum link or public-page availability marker",
    "Official Student Competency Record link or public-page availability marker",
    "Official Common Cartridge link, SHA-256 hash, and IMS manifest summary when published",
  ];
}

function buildSourceGovernance(course, moduleNumber = null) {
  return {
    policyKey: FCA_CTE_ORIGINALITY_POLICY.policyKey,
    contentOwner: "FCA Academy",
    contentOwnership: FCA_CTE_ORIGINALITY_POLICY.ownership,
    materialStandard: FCA_CTE_ORIGINALITY_POLICY.academicStandard,
    fcaOriginalMaterialRequired: true,
    externalSourceUse: FCA_CTE_ORIGINALITY_POLICY.externalUse,
    externalContentCopyingAllowed: false,
    doNotCopyExternalCurriculumText: FCA_CTE_ORIGINALITY_POLICY.doNotCopyExternalCurriculumText,
    doNotIngestRestrictedBlueprintCompetencies: FCA_CTE_ORIGINALITY_POLICY.doNotIngestRestrictedBlueprintCompetencies,
    licensedContentRequiresWrittenAgreement: FCA_CTE_ORIGINALITY_POLICY.licensedContentRequiresWrittenAgreement,
    requiredAttribution: FCA_CTE_ORIGINALITY_POLICY.requiredAttribution,
    officialVdoeManifestUrl: SOURCE_MANIFEST_URL,
    externalAlignmentManifestUrl: EXTERNAL_ALIGNMENT_MANIFEST_URL,
    externalAlignmentSourceIds: [...CTE_EXTERNAL_ALIGNMENT_SOURCE_IDS],
    courseKey: course.key,
    moduleNumber,
  };
}

function buildAcademicRigor(course, moduleNumber = null, focus = "technical performance", finalModule = false) {
  const displayTitle = courseDisplayTitle(course);
  return {
    level: FCA_RIGOR_LEVEL,
    standard: FCA_CTE_ORIGINALITY_POLICY.academicStandard,
    moduleNumber,
    essentialQuestion: finalModule
      ? `How can a learner defend original ${displayTitle} mastery with source-aware evidence, jobsite performance, safety judgment, and a board- or employer-ready artifact package?`
      : `How can original ${displayTitle} work use ${focus} to connect drawings, codes, specifications, safety controls, quantitative reasoning, and field evidence?`,
    requiredPractices: [...FCA_CTE_ACADEMIC_RIGOR_REQUIREMENTS],
    scholarlyTasks: [
      `Write an original annotated technical brief connecting ${focus} to current code, specification, drawing, safety, or quality evidence.`,
      "Maintain a citation and alignment ledger that names external sources as references only and records no copied curriculum text.",
      "Complete quantitative analysis using measurements, estimates, tolerances, schedules, production rates, loads, or energy assumptions relevant to the trade surface.",
      "Produce an FCA-original field, shop, design, or coordination artifact with revision history and instructor critique.",
      "Defend decisions in a seminar-style oral critique using claim-evidence-reasoning and professional vocabulary.",
      "Revise the artifact after critique and document the change rationale, safety implications, and employability impact.",
    ],
    assessmentExpectations: {
      minimumPassingScore: 85,
      requiresOralDefense: true,
      requiresCitationLedger: true,
      requiresOriginalArtifact: true,
      requiresInstructorCritique: true,
      requiresRevisionHistory: true,
      capstoneRequired: finalModule,
    },
  };
}

function buildOfficialEvidence(course, moduleNumber = null) {
  const source = getOfficialSourceRecord(course);
  const metadata = source?.officialMetadata || {};
  const artifacts = source?.officialArtifacts || {};
  const cartridge = artifacts.cartridge || null;

  return {
    status: course.proposedTrack ? "proposed-track" : "official-source-required",
    manifestKey: course.key,
    manifestUrl: SOURCE_MANIFEST_URL,
    sourceUrl: source?.sourceUrl || course.cteResourceUrl || null,
    moduleNumber,
    courseCode: metadata.courseCode || course.vdoeCourseCode || null,
    scedCode: metadata.scedCode || course.scedCode || null,
    curriculumAvailability: artifacts.curriculumAvailability || null,
    studentCompetencyRecordAvailability: artifacts.studentCompetencyRecordAvailability || null,
    cartridgeAvailability: artifacts.cartridgeAvailability || null,
    cartridgeSha256: cartridge?.sha256 || null,
    cartridgeImsManifestTitleCount: cartridge?.imsManifestTitleCount || null,
    requiredArtifacts: officialArtifactRequirements(course),
    copyPolicy: source?.sourceVerification?.copyPolicy || OFFICIAL_COPY_POLICY,
  };
}

function officialCompetencyEvidence(course, evidence) {
  if (course.proposedTrack) {
    return [
      `Proposed source manifest: ${evidence.manifestKey}`,
      "Building Trades I/II prerequisite alignment",
      "Apprenticeship readiness competency map",
      "VDOE board-pitch adoption evidence",
    ];
  }
  return [
    `Official source manifest: ${evidence.manifestKey}`,
    `Official course code: ${evidence.courseCode || "recorded in source manifest"}`,
    `Student Competency Record: ${evidence.studentCompetencyRecordAvailability || "manifest availability required"}`,
    `Common Cartridge: ${evidence.cartridgeAvailability || "manifest availability required"}`,
  ];
}

function durationLabel(course) {
  if (!course.durationWeeks) return "Infusion units";
  return `${course.durationWeeks} weeks`;
}

function courseDisplayTitle(course) {
  if (course.shortTitle) return course.shortTitle;
  if (course.durationWeeks && !course.title.includes("(")) return `${course.title} (${course.durationWeeks} Weeks)`;
  return course.title;
}

function courseCode(course) {
  const officialCourseCode = getOfficialMetadata(course).courseCode;
  if (officialCourseCode) return `VDOE-${officialCourseCode}`;
  if (course.vdoeCourseCode) return `VDOE-${course.vdoeCourseCode}`;
  const suffix = course.key.replace(/^cte-va-/, "").toUpperCase().replace(/[^A-Z0-9]+/g, "-");
  return `CTE-VA-${suffix}`;
}

function moduleCount(course) {
  if (!course.durationWeeks || course.durationWeeks === 18) return 4;
  return 8;
}

function buildSharedModule(course, index) {
  const profile = TOPIC_PROFILES[course.topicKey];
  const moduleNumber = index + 1;
  const evidence = buildOfficialEvidence(course, moduleNumber);
  const strand = profile.strands[index % profile.strands.length];
  const finalModule = moduleNumber === moduleCount(course);
  const sourceGovernance = buildSourceGovernance(course, moduleNumber);
  const academicRigor = buildAcademicRigor(course, moduleNumber, strand, finalModule);
  const title = finalModule
    ? `Module ${moduleNumber} - VDOE SCR, HQWBL evidence, and FCA capstone verification`
    : `Module ${moduleNumber} - ${strand[0].toUpperCase()}${strand.slice(1)} in ${courseDisplayTitle(course)}`;
  return {
    moduleNumber,
    title,
    objective: finalModule
      ? `Verify ${courseDisplayTitle(course)} completion evidence against the VDOE student competency record, HQWBL expectations, safety documentation, and FCA Academy performance standards.`
      : `Demonstrate grade-appropriate ${strand} knowledge and jobsite application for ${courseDisplayTitle(course)} while maintaining safety, documentation, and SkillsUSA-ready professionalism.`,
    lessons: [
      `VDOE framework orientation for ${profile.label} and how the competency record is documented`,
      `Technical vocabulary, drawings/specifications, materials, tools, and code references for ${strand}`,
      `Instructor-led demonstration with safety briefing, PPE check, and quality expectations`,
      `FCA Academy lab: capture evidence, reflect on work quality, and link artifacts to the learner record`,
    ],
    practicalLab: finalModule
      ? `Complete the ${courseDisplayTitle(course)} capstone packet: student competency record review, safety evidence, HQWBL reflection, and instructor sign-off.`
      : `Complete a supervised ${strand} lab and upload photo/document evidence to the FCA Academy learner file spine.`,
    deliverable: finalModule
      ? "Instructor-verified VDOE competency record, capstone rubric, safety log, and HQWBL evidence bundle."
      : `Documented ${strand} performance artifact with instructor rubric, safety acknowledgement, and improvement notes.`,
    contentOwnership: "FCA Academy original curriculum artifact",
    sourceGovernance,
    academicRigor,
    vdoeCompetencies: officialCompetencyEvidence(course, evidence),
    officialEvidence: evidence,
    assessment: {
      type: finalModule ? "performance-capstone" : "knowledge-check-and-performance-lab",
      passingScore: 85,
      rubric: ["safety", "technical accuracy", "code/spec evidence", "quantitative reasoning", "documentation", "professional conduct", "jobsite communication", "oral defense and revision"],
    },
    safetyGate: course.oshaComplianceRequired || /trades|carpentry|electric|hvac|masonry|plumbing|construction/i.test(course.key),
  };
}

function buildBuildingTradesThreeModules(course) {
  const topics = [
    ["apprenticeship readiness and VDOE pitch orientation", "Map Building Trades I/II skills to a specialized pre-apprenticeship capstone and define the VDOE board evidence package."],
    ["jobsite safety leadership", "Lead toolbox talks, PPE checks, hazard logs, and OSHA 10 reinforcement for a student crew."],
    ["multi-trade coordination", "Coordinate carpentry, masonry, electrical, plumbing, and HVAC readiness around a residential construction sequence."],
    ["plan reading and scope control", "Read drawings/specifications, define work packages, and track RFIs or clarification needs."],
    ["basic estimating and material planning", "Build a material takeoff, labor plan, and cost narrative suitable for a supervised student-build scope."],
    ["quality inspection and code awareness", "Use inspection checklists and current residential code references to document acceptable work."],
    ["HQWBL employer evidence", "Capture employer/mentor feedback, hours, workplace behaviors, and career reflection evidence."],
    ["VDOE board pitch portfolio", "Assemble the proposed Building Trades III curriculum, competency map, safety controls, and apprenticeship articulation story."],
  ];

  return topics.map(([topic, objective], index) => {
    const moduleNumber = index + 1;
    const finalModule = index === topics.length - 1;
    const officialEvidence = buildOfficialEvidence(course, moduleNumber);
    return {
      moduleNumber,
      title: `Module ${moduleNumber} - ${topic[0].toUpperCase()}${topic.slice(1)}`,
      objective,
      lessons: [
        `Specialized apprenticeship concept: ${topic}`,
        "Required safety, supervision, and instructor sign-off controls",
        "FCA Academy documentation workflow for learner evidence and board-ready artifacts",
        "VDOE alignment note: Building Trades III is proposed, not an official adopted course until board approval",
      ],
      practicalLab: `Produce a supervised ${topic} artifact for the Building Trades III pitch portfolio.`,
      deliverable: `Building Trades III ${topic} evidence artifact with instructor rubric and VDOE pitch annotation.`,
      contentOwnership: "FCA Academy original curriculum artifact",
      sourceGovernance: buildSourceGovernance(course, moduleNumber),
      academicRigor: buildAcademicRigor(course, moduleNumber, topic, finalModule),
      vdoeCompetencies: officialCompetencyEvidence(course, officialEvidence),
      officialEvidence,
      assessment: {
        type: finalModule ? "pitch-portfolio-capstone" : "performance-lab",
        passingScore: 85,
        rubric: ["safety leadership", "technical integration", "source-aware evidence", "quantitative planning", "documentation", "employer readiness", "oral defense", "board-pitch clarity"],
      },
      safetyGate: true,
    };
  });
}

export function buildVirginiaCteModules(course) {
  if (course.key === "cte-va-building-trades-iii") return buildBuildingTradesThreeModules(course);
  return Array.from({ length: moduleCount(course) }, (_, index) => buildSharedModule(course, index));
}

function buildLessonMedia(programKey, modules) {
  return modules.map((module) => ({
    lessonIndex: module.moduleNumber,
    lessonKey: `${programKey}-L${String(module.moduleNumber).padStart(2, "0")}`,
    title: module.title,
    auricruxLectureUrl: `/academy/media/cte-va-common/vdoe-aligned-lecture.html#${programKey}-module-${module.moduleNumber}`,
    skillsDemoUrl: `/academy/media/cte-va-common/vdoe-aligned-skills-demo.html#${programKey}-module-${module.moduleNumber}`,
    labDemoUrl: `/academy/media/cte-va-common/vdoe-aligned-lab.html#${programKey}-module-${module.moduleNumber}`,
    presenter: "Auricrux",
    contentQualityLevel: "fca-academy-vdoe-cte",
    productionStatus: "complete",
  }));
}

export function buildVirginiaCteAcademyPrograms() {
  return VIRGINIA_AC_CTE_COURSES.map((course) => {
    const profile = TOPIC_PROFILES[course.topicKey];
    const officialRecord = getOfficialSourceRecord(course);
    const official = officialRecord?.officialMetadata || {};
    const officialArtifacts = officialRecord?.officialArtifacts || null;
    const officialGradeLevel = officialArray(official.suggestedGradeLevel, course.gradeLevel);
    const officialCredentialOptions = officialArray(
      (official.industryCredentials || []).map((credential) => credential.title).filter(Boolean),
      profile.credentialOptions,
    );
    const modules = buildVirginiaCteModules(course);
    const displayTitle = courseDisplayTitle(course);
    const sourceGovernance = buildSourceGovernance(course);
    const academicRigor = buildAcademicRigor(course, null, profile.label, course.proposedTrack === true);
    const credential = course.proposedTrack
      ? "FCA Proposed Virginia CTE Apprenticeship Specialization - Building Trades III"
      : `Virginia CTE - ${CTE_CLUSTER.cluster}`;

    return {
      key: course.key,
      lane: "cte",
      title: displayTitle,
      credential,
      audience: `Virginia CTE learners in grades ${officialGradeLevel.join(", ")}, instructors, and district CTE coordinators using the ${CTE_CLUSTER.cluster} cluster.`,
      duration: durationLabel(course),
      format: "Instructor-led CTE course + FCA Academy LMS + supervised lab + student competency record + HQWBL evidence",
      goal: course.proposedTrack
        ? "Prepare a board-ready Building Trades III specialization that extends Building Trades II into supervised apprenticeship readiness, safety leadership, multi-trade coordination, estimating, documentation, and work-based learning evidence."
        : `Deliver ${displayTitle} as a VDOE-aligned CTE course with safety controls, competency tracking, SkillsUSA/workplace readiness, practical labs, and FCA Academy documentation discipline.`,
      outcomes: [
        "Complete VDOE student competency record evidence with instructor verification",
        "Apply safety, PPE, tool, code, and quality-control practices appropriate to the course pathway",
        "Produce practical lab artifacts and work-based learning reflections tied to the learner record",
        "Prepare for applicable industry credentials and Workplace Readiness Skills expectations",
        "Create FCA-original technical briefs, lab artifacts, and design or field evidence without copying external curriculum body text",
        "Defend decisions through annotated sources, quantitative reasoning, critique, and revision at honors-collegiate expectations",
        "Use FCA Academy to maintain auditable syllabus, assessment, and completion evidence",
      ],
      sourceGovernance,
      academicRigor,
      stateCode: "VA",
      pathwayKey: "cte",
      topicKey: course.topicKey,
      vdoe: {
        ...CTE_CLUSTER,
        courseTitle: displayTitle,
        courseCode: official.courseCode || course.vdoeCourseCode || null,
        cteResourceId: course.vdoeCteResourceId || null,
        cteResourceUrl: course.cteResourceUrl || null,
        scedCode: official.scedCode || course.scedCode || null,
        durationWeeks: officialNumber(official.durationWeeks, course.durationWeeks),
        gradeLevel: officialGradeLevel,
        credits: officialNumber(official.credits, fallbackCredits(course)),
        instructionalHours: officialNumber(official.hours, fallbackInstructionalHours(course)),
        prerequisiteLabel: official.prerequisite || course.prerequisiteLabel || "None",
        prerequisiteKeys: course.prerequisiteKeys || [],
        oshaComplianceRequired: officialBoolean(official.oshaComplianceRequired, course.oshaComplianceRequired === true),
        ctso: official.ctso || course.ctso || "SkillsUSA",
        hqwblRequired: true,
        studentCompetencyRecordRequired: true,
        officialCurriculumSourceRequired: true,
        industryCredentialOptions: officialCredentialOptions,
        sourceManifestKey: course.key,
        sourceManifestUrl: SOURCE_MANIFEST_URL,
        officialArtifactRequirements: officialArtifactRequirements(course),
        officialArtifacts,
        sourceVerification: officialRecord?.sourceVerification || null,
        proposedTrack: course.proposedTrack === true,
        pitchTarget: course.pitchTarget || null,
      },
      proposedTrack: course.proposedTrack === true,
      apprenticeshipTrack: course.apprenticeshipTrack === true,
      courses: [
        {
          code: courseCode(course),
          title: displayTitle,
          lessons: modules.length,
          lab: `${profile.label} supervised lab with VDOE SCR evidence, HQWBL reflection, safety sign-off, and FCA Academy artifact upload.`,
          lessonTitles: modules.map((module) => module.title),
          moduleOutlines: modules,
          lessonMedia: buildLessonMedia(course.key, modules),
          sourceGovernance,
          academicRigor,
          vdoeAlignment: {
            cluster: CTE_CLUSTER.cluster,
            topic: profile.label,
            sourceUrl: course.cteResourceUrl || CTE_CLUSTER.sourceUrl,
            sourceManifestKey: course.key,
            sourceManifestUrl: SOURCE_MANIFEST_URL,
            officialArtifactRequirements: officialArtifactRequirements(course),
            curriculumAvailability: officialArtifacts?.curriculumAvailability || null,
            studentCompetencyRecordAvailability: officialArtifacts?.studentCompetencyRecordAvailability || null,
            cartridgeAvailability: officialArtifacts?.cartridgeAvailability || null,
            cartridgeSha256: officialArtifacts?.cartridge?.sha256 || null,
            externalAlignmentManifestUrl: EXTERNAL_ALIGNMENT_MANIFEST_URL,
            externalAlignmentSourceIds: [...CTE_EXTERNAL_ALIGNMENT_SOURCE_IDS],
            externalSourceUse: FCA_CTE_ORIGINALITY_POLICY.externalUse,
            fcaOriginalMaterialRequired: true,
            externalContentCopyingAllowed: false,
            studentCompetencyRecordRequired: true,
            hqwblEvidenceRequired: true,
            workplaceReadinessRequired: true,
            safetyGateRequired: modules.some((module) => module.safetyGate),
          },
        },
      ],
      linkedSurface: profile.labSurface,
      linkedLabel: profile.labLabel,
    };
  });
}

export function getVirginiaCteCourseByKey(key) {
  return VIRGINIA_AC_CTE_COURSES.find((course) => course.key === key) || null;
}

export function getVirginiaCteCourseByCode(code) {
  return VIRGINIA_AC_CTE_COURSES.find((course) => course.vdoeCourseCode === code) || null;
}

export const VIRGINIA_CTE_PROGRAM_COUNT = VIRGINIA_AC_CTE_COURSES.length;