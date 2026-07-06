import { academyCatalog } from "../src/academyCatalog.js";
import {
  FCA_ACADEMY_EXCELLENCE_LEVEL,
  FCA_ACADEMY_EXCELLENCE_REQUIREMENTS,
  FCA_ACADEMY_SOURCE_POLICY_KEY,
  FCA_TRADE_TRAINING_COMPLIANCE_LEVEL,
  FCA_TRADE_TRAINING_COMPLIANCE_REQUIREMENTS,
} from "../src/academyCourseStandards.js";

const failures = [];

function fail(message) {
  failures.push(message);
}

function validateSourceGovernance(label, governance) {
  if (!governance) {
    fail(`${label} missing source governance.`);
    return;
  }
  const validPolicyKeys = new Set([FCA_ACADEMY_SOURCE_POLICY_KEY, "fca-cte-original-materials-reference-only-alignment"]);
  if (!validPolicyKeys.has(governance.policyKey)) fail(`${label} source governance policy key is not an FCA Academy policy.`);
  if (governance.contentOwner !== "FCA Academy") fail(`${label} must declare FCA Academy content ownership.`);
  if (governance.fcaOriginalMaterialRequired !== true) fail(`${label} must require FCA-original materials.`);
  if (governance.externalSourceUse !== "reference-and-alignment-only") fail(`${label} must use external sources for reference and alignment only.`);
  if (governance.externalContentCopyingAllowed !== false) fail(`${label} must forbid copying external curriculum content.`);
  if (governance.doNotCopyExternalCurriculumText !== true) fail(`${label} must block external curriculum text copying.`);
  if (governance.doNotIngestRestrictedBlueprintCompetencies !== true) fail(`${label} must block restricted blueprint competency ingestion.`);
  if (governance.licensedContentRequiresWrittenAgreement !== true) fail(`${label} must require written license rights for licensed content.`);
}

function validateExcellence(label, excellence) {
  if (!excellence) {
    fail(`${label} missing Academy academic excellence contract.`);
    return;
  }
  if (excellence.level !== FCA_ACADEMY_EXCELLENCE_LEVEL) fail(`${label} must use ${FCA_ACADEMY_EXCELLENCE_LEVEL}.`);
  if (!excellence.essentialQuestion || excellence.essentialQuestion.length < 80) fail(`${label} essential question is too thin.`);
  if (!Array.isArray(excellence.requiredPractices) || excellence.requiredPractices.length < FCA_ACADEMY_EXCELLENCE_REQUIREMENTS.length) {
    fail(`${label} missing Academy excellence practices.`);
  } else {
    for (const requirement of FCA_ACADEMY_EXCELLENCE_REQUIREMENTS) {
      if (!excellence.requiredPractices.includes(requirement)) fail(`${label} missing excellence requirement: ${requirement}.`);
    }
  }
  if (!Array.isArray(excellence.scholarlyTasks) || excellence.scholarlyTasks.length < 6) fail(`${label} must define at least 6 scholarly tasks.`);
  const expectations = excellence.assessmentExpectations || {};
  if (expectations.minimumPassingScore < 85) fail(`${label} must require an 85+ mastery floor.`);
  for (const field of ["requiresOralDefense", "requiresCitationLedger", "requiresOriginalArtifact", "requiresInstructorCritique", "requiresRevisionHistory"]) {
    if (expectations[field] !== true) fail(`${label} must require ${field}.`);
  }
}

function validateTradeCompliance(label, compliance) {
  if (!compliance) {
    fail(`${label} missing trade-training compliance contract.`);
    return;
  }
  if (compliance.level !== FCA_TRADE_TRAINING_COMPLIANCE_LEVEL) fail(`${label} must use ${FCA_TRADE_TRAINING_COMPLIANCE_LEVEL}.`);
  if (compliance.exceedsNationalCraftTrainingCertificationControls !== true) fail(`${label} must exceed national craft-training certification controls.`);
  if (compliance.thirdPartyReferenceUseOnly !== true) fail(`${label} must treat third-party craft-training controls as reference-only.`);
  if (compliance.thirdPartyAffiliationClaimed !== false) fail(`${label} must not claim third-party craft-training affiliation/accreditation.`);
  for (const field of ["safetyGateRequired", "performanceVerificationRequired", "competencyRecordRequired", "evaluatorSignoffRequired", "auditTrailRequired"]) {
    if (compliance[field] !== true) fail(`${label} must require ${field}.`);
  }
  if (!Array.isArray(compliance.requiredControls) || compliance.requiredControls.length < FCA_TRADE_TRAINING_COMPLIANCE_REQUIREMENTS.length) {
    fail(`${label} missing trade-training compliance controls.`);
  } else {
    for (const requirement of FCA_TRADE_TRAINING_COMPLIANCE_REQUIREMENTS) {
      if (!compliance.requiredControls.includes(requirement)) fail(`${label} missing trade control: ${requirement}.`);
    }
  }
}

function validateAssessment(label, assessment) {
  if (!assessment) {
    fail(`${label} missing assessment contract.`);
    return;
  }
  if (assessment.passingScore < 85) fail(`${label} assessment must require 85+ passing score.`);
  const rubric = (assessment.rubric || []).join(" ").toLowerCase();
  for (const signal of ["safety", "evidence", "quantitative", "performance", "documentation", "defense"]) {
    if (!rubric.includes(signal)) fail(`${label} assessment rubric missing ${signal} signal.`);
  }
}

for (const program of academyCatalog.programs || []) {
  validateSourceGovernance(`${program.key} program`, program.sourceGovernance);
  validateExcellence(`${program.key} program`, program.academyExcellence);
  validateTradeCompliance(`${program.key} program`, program.tradeTrainingCompliance);

  for (const course of program.courses || []) {
    const courseLabel = `${program.key}/${course.code || course.title}`;
    const expectedLessons = course.lessons || course.lessonTitles?.length || course.moduleOutlines?.length || 0;
    validateSourceGovernance(`${courseLabel} course`, course.sourceGovernance);
    validateExcellence(`${courseLabel} course`, course.academyExcellence);
    validateTradeCompliance(`${courseLabel} course`, course.tradeTrainingCompliance);
    validateAssessment(`${courseLabel} course`, course.assessment);
    if (!Array.isArray(course.lessonStandards) || course.lessonStandards.length !== expectedLessons) {
      fail(`${courseLabel} must carry lessonStandards for all ${expectedLessons} lessons.`);
    }
    for (const lesson of course.lessonStandards || []) {
      const lessonLabel = `${courseLabel} lesson ${lesson.lessonIndex}`;
      validateSourceGovernance(lessonLabel, lesson.sourceGovernance);
      validateExcellence(lessonLabel, lesson.academyExcellence);
      validateTradeCompliance(lessonLabel, lesson.tradeTrainingCompliance);
      if (!Array.isArray(lesson.evidenceDeliverables) || lesson.evidenceDeliverables.length < 6) fail(`${lessonLabel} missing evidence deliverables.`);
    }
    for (const module of course.moduleOutlines || []) {
      const moduleLabel = `${courseLabel} module ${module.moduleNumber}`;
      validateSourceGovernance(moduleLabel, module.sourceGovernance);
      validateExcellence(moduleLabel, module.academyExcellence);
      validateTradeCompliance(moduleLabel, module.tradeTrainingCompliance);
      validateAssessment(moduleLabel, module.assessment);
    }
  }
}

if (failures.length > 0) {
  console.error("Academy excellence validation failed:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log(`Academy excellence validation passed for ${academyCatalog.programs.length} programs with Ivy-equivalent rigor and national craft-training control benchmarks.`);