import {
  CTE_EXTERNAL_ALIGNMENT_SOURCE_IDS,
  FCA_CTE_ACADEMIC_RIGOR_REQUIREMENTS,
  FCA_CTE_ORIGINALITY_POLICY,
} from "./cteExternalAlignmentSources.js";

export const FCA_ACADEMY_EXCELLENCE_LEVEL = "honors-collegiate-ivy-equivalent";
export const FCA_TRADE_TRAINING_COMPLIANCE_LEVEL = "exceeds-national-craft-training-certification-controls";
export const FCA_ACADEMY_SOURCE_POLICY_KEY = "fca-academy-original-materials-reference-only-alignment";

export const FCA_ACADEMY_EXCELLENCE_REQUIREMENTS = Object.freeze([
  ...FCA_CTE_ACADEMIC_RIGOR_REQUIREMENTS,
  "Original construction-operations artifact tied to live FCA workspace evidence",
  "Credential, licensure, compliance, or jobsite-readiness reflection with instructor critique",
]);

export const FCA_TRADE_TRAINING_COMPLIANCE_REQUIREMENTS = Object.freeze([
  "Documented safety orientation, PPE expectations, stop-work authority, and incident escalation",
  "Instructor or qualified evaluator verification for practical performance tasks",
  "Knowledge assessment plus hands-on or simulated performance verification",
  "Competency record with date, evaluator, evidence artifact, revision notes, and learner attestation",
  "Tool, material, drawing, specification, code, and scope-control literacy appropriate to the course",
  "Quantitative trade reasoning using measurements, estimates, schedules, production rates, or tolerances",
  "Work-based learning or realistic jobsite scenario evidence with professional conduct expectations",
  "Credential-readiness mapping that exceeds national craft-training controls without claiming third-party approval",
  "Quality assurance audit trail for syllabus, lesson evidence, rubric results, and completion decision",
  "Equity, accessibility, ethics, labor, environmental, and customer-impact review",
]);

const EXTERNAL_ALIGNMENT_MANIFEST_URL = "/config/cte-external-alignment-sources.json";

function textFor(program = {}, course = {}, lessonTitle = "") {
  return `${program.key || ""} ${program.title || ""} ${program.credential || ""} ${course.code || ""} ${course.title || ""} ${course.lab || ""} ${lessonTitle}`.toLowerCase();
}

function isDirectTradeTraining(program = {}, course = {}, lessonTitle = "") {
  return /apprentice|apprenticeship|cte-|osha|safety|field|jobsite|trade|trades|electrical|carpentry|hvac|masonry|plumbing|building|construction|drafting|heavy|utility|cabinet|code|inspection/.test(textFor(program, course, lessonTitle));
}

export function buildAcademySourceGovernance(program = {}, course = {}, lessonIndex = null) {
  return {
    policyKey: FCA_ACADEMY_SOURCE_POLICY_KEY,
    contentOwner: "FCA Academy",
    contentOwnership: "FCA original curriculum, assessments, labs, rubrics, lectures, simulations, and learner artifacts",
    materialStandard: FCA_CTE_ORIGINALITY_POLICY.academicStandard,
    fcaOriginalMaterialRequired: true,
    externalSourceUse: FCA_CTE_ORIGINALITY_POLICY.externalUse,
    externalContentCopyingAllowed: false,
    doNotCopyExternalCurriculumText: true,
    doNotIngestRestrictedBlueprintCompetencies: true,
    licensedContentRequiresWrittenAgreement: true,
    requiredAttribution: FCA_CTE_ORIGINALITY_POLICY.requiredAttribution,
    externalAlignmentManifestUrl: EXTERNAL_ALIGNMENT_MANIFEST_URL,
    externalAlignmentSourceIds: [...CTE_EXTERNAL_ALIGNMENT_SOURCE_IDS],
    programKey: program.key || null,
    courseCode: course.code || null,
    lessonIndex,
  };
}

export function buildAcademyExcellence(program = {}, course = {}, lessonTitle = "", lessonIndex = null) {
  const courseTitle = course.title || program.title || "FCA Academy course";
  const lessonLabel = lessonTitle || courseTitle;
  return {
    level: FCA_ACADEMY_EXCELLENCE_LEVEL,
    standard: FCA_CTE_ORIGINALITY_POLICY.academicStandard,
    programKey: program.key || null,
    courseCode: course.code || null,
    lessonIndex,
    essentialQuestion: `How can a learner defend original ${courseTitle} mastery through ${lessonLabel} using source-aware reasoning, quantitative analysis, safety judgment, critique, and professional construction evidence?`,
    requiredPractices: [...FCA_ACADEMY_EXCELLENCE_REQUIREMENTS],
    scholarlyTasks: [
      "Produce an FCA-original technical artifact connected to the live construction workflow or training scenario.",
      "Maintain a reference ledger that records alignment sources without copying external curriculum body text.",
      "Apply quantitative reasoning to scope, time, cost, quality, safety, production, or compliance decisions.",
      "Use official, licensed, or instructor-approved references as evidence and cite their alignment purpose.",
      "Complete instructor critique, peer review, oral defense, and revision before mastery is awarded.",
      "Document ethical, safety, labor, accessibility, environmental, and customer-impact implications.",
    ],
    assessmentExpectations: {
      minimumPassingScore: 85,
      requiresOralDefense: true,
      requiresCitationLedger: true,
      requiresOriginalArtifact: true,
      requiresInstructorCritique: true,
      requiresRevisionHistory: true,
      capstoneRequired: lessonIndex === null,
    },
  };
}

export function buildTradeTrainingCompliance(program = {}, course = {}, lessonTitle = "", lessonIndex = null) {
  const directTradeTraining = isDirectTradeTraining(program, course, lessonTitle);
  return {
    level: FCA_TRADE_TRAINING_COMPLIANCE_LEVEL,
    benchmark: "National craft-training certification controls are a reference benchmark only; FCA does not copy protected third-party curriculum or claim outside accreditation without written authorization.",
    exceedsNationalCraftTrainingCertificationControls: true,
    thirdPartyReferenceUseOnly: true,
    thirdPartyAffiliationClaimed: false,
    applicability: directTradeTraining ? "direct-field-shop-or-cte-training" : "construction-operations-training-with-trade-compliance-controls",
    programKey: program.key || null,
    courseCode: course.code || null,
    lessonIndex,
    safetyGateRequired: true,
    performanceVerificationRequired: true,
    competencyRecordRequired: true,
    evaluatorSignoffRequired: true,
    auditTrailRequired: true,
    requiredControls: [...FCA_TRADE_TRAINING_COMPLIANCE_REQUIREMENTS],
  };
}

function buildCourseAssessment(course = {}) {
  const existingRubric = Array.isArray(course.assessment?.rubric) ? course.assessment.rubric : [];
  const rubric = [
    ...existingRubric,
    "safety and compliance judgment",
    "source-aware evidence",
    "quantitative trade reasoning",
    "performance verification",
    "documentation and audit trail",
    "oral defense and revision",
  ];
  return {
    ...(course.assessment || {}),
    type: course.assessment?.type || "knowledge-assessment-performance-verification-and-oral-defense",
    passingScore: Math.max(course.assessment?.passingScore || 0, 85),
    rubric: [...new Set(rubric)],
  };
}

function lessonCountFor(course = {}) {
  return course.lessons || course.lessonTitles?.length || course.moduleOutlines?.length || 0;
}

function applyLessonStandards(program, course) {
  const count = lessonCountFor(course);
  course.lessonStandards = Array.from({ length: count }, (_, index) => {
    const lessonIndex = index + 1;
    const lessonTitle = course.lessonTitles?.[index] || course.moduleOutlines?.[index]?.title || `Lesson ${lessonIndex}`;
    return {
      lessonIndex,
      title: lessonTitle,
      sourceGovernance: buildAcademySourceGovernance(program, course, lessonIndex),
      academyExcellence: buildAcademyExcellence(program, course, lessonTitle, lessonIndex),
      tradeTrainingCompliance: buildTradeTrainingCompliance(program, course, lessonTitle, lessonIndex),
      evidenceDeliverables: [
        "FCA-original learner artifact",
        "reference-only source alignment ledger",
        "quantitative reasoning note",
        "safety or compliance check",
        "instructor critique and revision record",
        "oral defense or practical sign-off",
      ],
    };
  });
}

function applyModuleStandards(program, course) {
  for (const module of course.moduleOutlines || []) {
    const lessonTitle = module.title || `Module ${module.moduleNumber || ""}`;
    module.academyExcellence ||= buildAcademyExcellence(program, course, lessonTitle, module.moduleNumber || null);
    module.sourceGovernance ||= buildAcademySourceGovernance(program, course, module.moduleNumber || null);
    module.tradeTrainingCompliance ||= buildTradeTrainingCompliance(program, course, lessonTitle, module.moduleNumber || null);
    module.assessment = buildCourseAssessment(module);
  }
}

export function applyAcademyCourseStandards(programs = []) {
  for (const program of programs) {
    const programSourceGovernance = program.sourceGovernance || buildAcademySourceGovernance(program);
    program.sourceGovernance = programSourceGovernance;
    program.academyExcellence ||= buildAcademyExcellence(program);
    program.academicRigor ||= program.academyExcellence;
    program.tradeTrainingCompliance ||= buildTradeTrainingCompliance(program);

    for (const course of program.courses || []) {
      course.sourceGovernance ||= buildAcademySourceGovernance(program, course);
      course.academyExcellence ||= buildAcademyExcellence(program, course);
      course.academicRigor ||= course.academyExcellence;
      course.tradeTrainingCompliance ||= buildTradeTrainingCompliance(program, course);
      course.assessment = buildCourseAssessment(course);
      applyLessonStandards(program, course);
      applyModuleStandards(program, course);
    }
  }
  return programs;
}