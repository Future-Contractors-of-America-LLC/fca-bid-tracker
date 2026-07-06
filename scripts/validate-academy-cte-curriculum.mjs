import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { academyCatalog } from "../src/academyCatalog.js";
import {
  CTE_EXTERNAL_ALIGNMENT_MANIFEST,
  CTE_EXTERNAL_ALIGNMENT_SOURCE_IDS,
  FCA_CTE_ACADEMIC_RIGOR_REQUIREMENTS,
  FCA_CTE_ORIGINALITY_POLICY,
} from "../src/cteExternalAlignmentSources.js";
import { VIRGINIA_AC_CTE_COURSES, VIRGINIA_CTE_PROGRAM_COUNT } from "../src/virginiaCteCourses.js";
import { VDOE_CTE_SOURCE_COURSES_BY_KEY, VDOE_CTE_SOURCE_MANIFEST } from "../src/vdoeCteSourceManifest.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicRegistryPath = path.join(root, "public", "config", "virginia-cte-ac-courses.json");
const publicSourceManifestPath = path.join(root, "public", "config", "vdoe-cte-source-manifest.json");
const publicExternalAlignmentManifestPath = path.join(root, "public", "config", "cte-external-alignment-sources.json");
const externalAlignmentManifestUrl = "/config/cte-external-alignment-sources.json";
const cteRigorLevel = "honors-collegiate-ivy-equivalent";
const failures = [];

function fail(message) {
  failures.push(message);
}

function normalizeUrlPath(url = "") {
  return url.split("#")[0].split("?")[0].replace(/^\//, "");
}

function publicFileExists(url = "") {
  if (!url.startsWith("/")) return true;
  return fs.existsSync(path.join(root, "public", normalizeUrlPath(url)));
}

function expectedModuleCount(course) {
  if (!course.durationWeeks || course.durationWeeks === 18) return 4;
  return 8;
}

function officialArray(value, fallback = []) {
  return Array.isArray(value) && value.length > 0 ? value : fallback;
}

function officialNumber(value, fallback) {
  return typeof value === "number" ? value : fallback;
}

function explicitAvailability(value) {
  return value === "linked-on-public-course-page" || value === "not-published-on-public-course-page";
}

function validateLinkedOrExplicitArtifact(programKey, artifacts, availabilityField, urlField) {
  const availability = artifacts?.[availabilityField];
  if (!explicitAvailability(availability)) {
    fail(`${programKey} missing explicit ${availabilityField} official artifact state.`);
    return;
  }
  if (availability === "linked-on-public-course-page" && !artifacts?.[urlField]) {
    fail(`${programKey} ${availabilityField} is linked but ${urlField} is missing.`);
  }
}

function referenceOnlySourcePolicy(source = {}) {
  const policyText = `${source.ingestionPolicy || ""} ${source.alignmentUse || ""}`.toLowerCase();
  return policyText.includes("only") || policyText.includes("no-") || policyText.includes("do not") || policyText.includes("without copying");
}

function validateSourceGovernance(label, governance) {
  if (!governance) {
    fail(`${label} missing FCA source-governance policy.`);
    return;
  }
  if (governance.policyKey !== FCA_CTE_ORIGINALITY_POLICY.policyKey) fail(`${label} source-governance policy key mismatch.`);
  if (governance.contentOwner !== "FCA Academy") fail(`${label} must declare FCA Academy as content owner.`);
  if (governance.fcaOriginalMaterialRequired !== true) fail(`${label} must require FCA-original materials.`);
  if (governance.externalSourceUse !== FCA_CTE_ORIGINALITY_POLICY.externalUse) fail(`${label} external source use must be reference-and-alignment-only.`);
  if (governance.externalContentCopyingAllowed !== false) fail(`${label} must forbid copying external curriculum content.`);
  if (governance.doNotCopyExternalCurriculumText !== true) fail(`${label} must explicitly block external curriculum text copying.`);
  if (governance.doNotIngestRestrictedBlueprintCompetencies !== true) fail(`${label} must block restricted blueprint competency ingestion.`);
  if (governance.licensedContentRequiresWrittenAgreement !== true) fail(`${label} must require written license agreements for licensed content.`);
  if (governance.officialVdoeManifestUrl !== "/config/vdoe-cte-source-manifest.json") fail(`${label} must retain the official VDOE manifest pointer.`);
  if (governance.externalAlignmentManifestUrl !== externalAlignmentManifestUrl) fail(`${label} must point to the external reference-only alignment manifest.`);
  const sourceIds = governance.externalAlignmentSourceIds || [];
  const expectedIds = new Set(CTE_EXTERNAL_ALIGNMENT_SOURCE_IDS);
  if (!Array.isArray(sourceIds) || sourceIds.length !== expectedIds.size) {
    fail(`${label} must carry every external alignment source id.`);
  } else {
    for (const sourceId of sourceIds) {
      if (!expectedIds.has(sourceId)) fail(`${label} carries unknown external alignment source id ${sourceId}.`);
    }
  }
}

function validateAcademicRigor(label, rigor) {
  if (!rigor) {
    fail(`${label} missing FCA academic-rigor contract.`);
    return;
  }
  if (rigor.level !== cteRigorLevel) fail(`${label} must use ${cteRigorLevel} rigor level.`);
  if (rigor.standard !== FCA_CTE_ORIGINALITY_POLICY.academicStandard) fail(`${label} academic standard mismatch.`);
  if (!rigor.essentialQuestion || rigor.essentialQuestion.length < 70) fail(`${label} essential question is too thin for honors-collegiate rigor.`);
  const practices = rigor.requiredPractices || [];
  if (!Array.isArray(practices) || practices.length < FCA_CTE_ACADEMIC_RIGOR_REQUIREMENTS.length) {
    fail(`${label} must include the full FCA CTE rigor practice set.`);
  } else {
    for (const requirement of FCA_CTE_ACADEMIC_RIGOR_REQUIREMENTS) {
      if (!practices.includes(requirement)) fail(`${label} missing rigor practice: ${requirement}.`);
    }
  }
  if (!Array.isArray(rigor.scholarlyTasks) || rigor.scholarlyTasks.length < 6) fail(`${label} must define at least 6 scholarly tasks.`);
  const expectations = rigor.assessmentExpectations || {};
  if (expectations.minimumPassingScore < 85) fail(`${label} must set a minimum passing score of 85 or higher.`);
  for (const field of ["requiresOralDefense", "requiresCitationLedger", "requiresOriginalArtifact", "requiresInstructorCritique", "requiresRevisionHistory"]) {
    if (expectations[field] !== true) fail(`${label} assessment expectation ${field} must be required.`);
  }
}

const ctePrograms = academyCatalog.programs.filter((program) => program.key?.startsWith("cte-va-"));
if (ctePrograms.length !== VIRGINIA_CTE_PROGRAM_COUNT) {
  fail(`Expected ${VIRGINIA_CTE_PROGRAM_COUNT} Virginia CTE programs, found ${ctePrograms.length}.`);
}

const programByKey = Object.fromEntries(academyCatalog.programs.map((program) => [program.key, program]));
const sourceByKey = Object.fromEntries(VIRGINIA_AC_CTE_COURSES.map((course) => [course.key, course]));

if (!fs.existsSync(publicRegistryPath)) {
  fail("Missing public/config/virginia-cte-ac-courses.json registry.");
} else {
  const registry = JSON.parse(fs.readFileSync(publicRegistryPath, "utf8"));
  const registryKeys = new Set((registry.courses || []).map((course) => course.key));
  for (const key of Object.keys(sourceByKey)) {
    if (!registryKeys.has(key)) fail(`Public CTE registry missing ${key}.`);
  }
  if (registryKeys.size !== VIRGINIA_CTE_PROGRAM_COUNT) {
    fail(`Public CTE registry expected ${VIRGINIA_CTE_PROGRAM_COUNT} records, found ${registryKeys.size}.`);
  }
}

if (!fs.existsSync(publicSourceManifestPath)) {
  fail("Missing public/config/vdoe-cte-source-manifest.json official source manifest.");
} else {
  const publicSourceManifest = JSON.parse(fs.readFileSync(publicSourceManifestPath, "utf8"));
  const publicKeys = new Set((publicSourceManifest.courses || []).map((course) => course.key));
  for (const key of Object.keys(sourceByKey)) {
    if (!publicKeys.has(key)) fail(`Official VDOE source manifest missing ${key}.`);
  }
  if (publicSourceManifest.meta?.courseCount !== VIRGINIA_CTE_PROGRAM_COUNT) {
    fail(`Official VDOE source manifest expected ${VIRGINIA_CTE_PROGRAM_COUNT} records, found ${publicSourceManifest.meta?.courseCount}.`);
  }
  if (publicSourceManifest.meta?.parserVersion !== VDOE_CTE_SOURCE_MANIFEST.meta?.parserVersion) {
    fail("Official VDOE public manifest and source module parser versions differ.");
  }
}

if (!fs.existsSync(publicExternalAlignmentManifestPath)) {
  fail("Missing public/config/cte-external-alignment-sources.json reference-only source manifest.");
} else {
  const publicExternalManifest = JSON.parse(fs.readFileSync(publicExternalAlignmentManifestPath, "utf8"));
  if (publicExternalManifest.meta?.sourceCount !== CTE_EXTERNAL_ALIGNMENT_SOURCE_IDS.length) {
    fail(`External alignment manifest expected ${CTE_EXTERNAL_ALIGNMENT_SOURCE_IDS.length} records, found ${publicExternalManifest.meta?.sourceCount}.`);
  }
  if (CTE_EXTERNAL_ALIGNMENT_MANIFEST.meta?.sourceCount !== CTE_EXTERNAL_ALIGNMENT_SOURCE_IDS.length) {
    fail("External alignment source module count does not match source id count.");
  }
  if (publicExternalManifest.originalityPolicy?.externalUse !== FCA_CTE_ORIGINALITY_POLICY.externalUse) {
    fail("External alignment manifest must mark all external resources as reference-and-alignment-only.");
  }
  if (publicExternalManifest.originalityPolicy?.doNotCopyExternalCurriculumText !== true) {
    fail("External alignment manifest must forbid copying external curriculum text.");
  }
  if (!Array.isArray(publicExternalManifest.academicRigorRequirements) || publicExternalManifest.academicRigorRequirements.length < FCA_CTE_ACADEMIC_RIGOR_REQUIREMENTS.length) {
    fail("External alignment manifest must publish the FCA CTE academic rigor requirements.");
  }
  const publicSourceIds = new Set((publicExternalManifest.sources || []).map((source) => source.id));
  for (const sourceId of CTE_EXTERNAL_ALIGNMENT_SOURCE_IDS) {
    if (!publicSourceIds.has(sourceId)) fail(`External alignment manifest missing source ${sourceId}.`);
  }
  for (const source of publicExternalManifest.sources || []) {
    if (!source.sourceUrl || !source.artifactTypes?.length || !source.alignmentUse || !source.ingestionPolicy) {
      fail(`External alignment source ${source.id || "unknown"} missing source URL, artifacts, alignment use, or ingestion policy.`);
    }
    if (!referenceOnlySourcePolicy(source)) fail(`External alignment source ${source.id || "unknown"} is not restricted to reference/alignment-only use.`);
  }
}

if (VDOE_CTE_SOURCE_MANIFEST.meta?.officialCourseCount !== VIRGINIA_CTE_PROGRAM_COUNT - 1) {
  fail("Official VDOE source manifest must verify all non-proposed CTE courses.");
}

for (const sourceCourse of VIRGINIA_AC_CTE_COURSES) {
  const program = programByKey[sourceCourse.key];
  const sourceRecord = VDOE_CTE_SOURCE_COURSES_BY_KEY[sourceCourse.key];
  const official = sourceRecord?.officialMetadata || {};
  const artifacts = sourceRecord?.officialArtifacts || null;
  const expectedGradeLevel = officialArray(official.suggestedGradeLevel, sourceCourse.gradeLevel);
  const expectedDurationWeeks = officialNumber(official.durationWeeks, sourceCourse.durationWeeks);
  if (!program) {
    fail(`Academy catalog missing CTE program ${sourceCourse.key}.`);
    continue;
  }

  if (!sourceRecord) {
    fail(`${sourceCourse.key} missing generated official VDOE source record.`);
    continue;
  }

  if (sourceCourse.proposedTrack) {
    if (sourceRecord.sourceVerification?.status !== "proposed-fca-track") fail(`${sourceCourse.key} must be marked as a proposed FCA track in the source manifest.`);
  } else {
    if (sourceRecord.sourceVerification?.status !== "verified") fail(`${sourceCourse.key} official source record must be verified.`);
    if (sourceRecord.page?.status !== 200 || sourceRecord.page?.ok !== true) fail(`${sourceCourse.key} official CTE page must be reachable with HTTP 200.`);
    if (sourceRecord.sourceUrl !== sourceCourse.cteResourceUrl) fail(`${sourceCourse.key} source manifest URL mismatch.`);
    if (!official.courseTitle || !official.courseCode) fail(`${sourceCourse.key} official source metadata missing course title or course code.`);
    validateLinkedOrExplicitArtifact(sourceCourse.key, artifacts, "curriculumAvailability", "curriculumUrl");
    validateLinkedOrExplicitArtifact(sourceCourse.key, artifacts, "studentCompetencyRecordAvailability", "studentCompetencyRecordUrl");
    validateLinkedOrExplicitArtifact(sourceCourse.key, artifacts, "cartridgeAvailability", "cartridgeUrl");
    if (artifacts?.cartridgeAvailability === "linked-on-public-course-page") {
      if (!artifacts.cartridge?.ok || !artifacts.cartridge?.sha256) fail(`${sourceCourse.key} linked cartridge must be downloaded and hashed.`);
      if (!artifacts.cartridge?.hasImsManifest || artifacts.cartridge?.imsManifestTitleCount < 1) fail(`${sourceCourse.key} linked cartridge must expose an IMS manifest summary.`);
    }
  }

  if (program.lane !== "cte" || program.pathwayKey !== "cte") fail(`${program.key} must be in the cte pathway.`);
  if (program.topicKey !== sourceCourse.topicKey) fail(`${program.key} topic mismatch: ${program.topicKey} !== ${sourceCourse.topicKey}.`);
  if (!program.title || !program.credential || !program.audience || !program.goal) fail(`${program.key} missing public catalog metadata.`);
  if (!Array.isArray(program.outcomes) || program.outcomes.length < 5) fail(`${program.key} must define at least 5 learner outcomes.`);
  if (!program.linkedSurface || !program.linkedLabel) fail(`${program.key} must link to an FCA lab surface.`);
  validateSourceGovernance(`${program.key} program`, program.sourceGovernance);
  validateAcademicRigor(`${program.key} program`, program.academicRigor);

  const vdoe = program.vdoe;
  if (!vdoe) {
    fail(`${program.key} missing VDOE metadata.`);
    continue;
  }
  if (vdoe.jurisdiction !== "VA") fail(`${program.key} must declare VA jurisdiction.`);
  if (vdoe.cluster !== "Architecture & Construction") fail(`${program.key} must declare Architecture & Construction cluster.`);
  if (JSON.stringify(vdoe.gradeLevel) !== JSON.stringify(expectedGradeLevel)) fail(`${program.key} grade levels mismatch.`);
  if (vdoe.durationWeeks !== expectedDurationWeeks) fail(`${program.key} duration mismatch.`);
  if (official.courseCode && vdoe.courseCode !== official.courseCode) fail(`${program.key} official course code mismatch.`);
  if (official.scedCode && vdoe.scedCode !== official.scedCode) fail(`${program.key} official SCED code mismatch.`);
  if (typeof official.credits === "number" && vdoe.credits !== official.credits) fail(`${program.key} official credits mismatch.`);
  if (typeof official.hours === "number" && vdoe.instructionalHours !== official.hours) fail(`${program.key} official hours mismatch.`);
  if (vdoe.sourceManifestKey !== sourceCourse.key || vdoe.sourceManifestUrl !== "/config/vdoe-cte-source-manifest.json") {
    fail(`${program.key} must point to the official VDOE source manifest.`);
  }
  if (!Array.isArray(vdoe.officialArtifactRequirements) || vdoe.officialArtifactRequirements.length < 4) fail(`${program.key} missing official artifact requirements.`);
  if (sourceCourse.cteResourceUrl && vdoe.cteResourceUrl !== sourceCourse.cteResourceUrl) fail(`${program.key} CTE Resource URL mismatch.`);
  if (!sourceCourse.proposedTrack && !vdoe.cteResourceUrl) fail(`${program.key} must have an official CTE Resource URL.`);
  if (vdoe.studentCompetencyRecordRequired !== true) fail(`${program.key} must require a Student Competency Record.`);
  if (vdoe.hqwblRequired !== true) fail(`${program.key} must require HQWBL evidence.`);
  if (vdoe.officialCurriculumSourceRequired !== true) fail(`${program.key} must require official curriculum source evidence.`);
  if (!Array.isArray(vdoe.industryCredentialOptions) || vdoe.industryCredentialOptions.length < 3) fail(`${program.key} must list industry credential options.`);
  if (sourceCourse.proposedTrack && (!program.proposedTrack || !vdoe.proposedTrack || !vdoe.pitchTarget)) {
    fail(`${program.key} must preserve proposed Building Trades III board-pitch status.`);
  }

  const course = program.courses?.[0];
  if (!course) {
    fail(`${program.key} missing LMS course object.`);
    continue;
  }
  validateSourceGovernance(`${program.key} course`, course.sourceGovernance);
  validateAcademicRigor(`${program.key} course`, course.academicRigor);
  const modules = course.moduleOutlines || [];
  const expected = expectedModuleCount(sourceCourse);
  if (course.lessons !== expected) fail(`${program.key} course.lessons expected ${expected}, found ${course.lessons}.`);
  if (modules.length !== expected) fail(`${program.key} moduleOutlines expected ${expected}, found ${modules.length}.`);
  if (!course.vdoeAlignment?.studentCompetencyRecordRequired || !course.vdoeAlignment?.hqwblEvidenceRequired) {
    fail(`${program.key} course must carry SCR and HQWBL alignment.`);
  }
  if (course.vdoeAlignment?.sourceManifestKey !== sourceCourse.key || course.vdoeAlignment?.sourceManifestUrl !== "/config/vdoe-cte-source-manifest.json") {
    fail(`${program.key} course must carry official source manifest alignment.`);
  }
  if (course.vdoeAlignment?.externalAlignmentManifestUrl !== externalAlignmentManifestUrl) fail(`${program.key} course must carry the external reference-only manifest URL.`);
  if (course.vdoeAlignment?.externalSourceUse !== FCA_CTE_ORIGINALITY_POLICY.externalUse) fail(`${program.key} course external source use must be reference-and-alignment-only.`);
  if (course.vdoeAlignment?.fcaOriginalMaterialRequired !== true || course.vdoeAlignment?.externalContentCopyingAllowed !== false) {
    fail(`${program.key} course must require FCA-original material and forbid external copying.`);
  }
  if (!Array.isArray(course.vdoeAlignment?.externalAlignmentSourceIds) || course.vdoeAlignment.externalAlignmentSourceIds.length !== CTE_EXTERNAL_ALIGNMENT_SOURCE_IDS.length) {
    fail(`${program.key} course must carry all external reference source ids.`);
  }

  const media = course.lessonMedia || [];
  if (media.length !== expected) fail(`${program.key} lessonMedia expected ${expected}, found ${media.length}.`);
  for (const slot of media) {
    for (const field of ["auricruxLectureUrl", "skillsDemoUrl", "labDemoUrl"]) {
      if (!slot[field]) fail(`${program.key} media slot ${slot.lessonIndex} missing ${field}.`);
      else if (!publicFileExists(slot[field])) fail(`${program.key} media slot ${slot.lessonIndex} missing file for ${field}: ${slot[field]}.`);
    }
  }

  for (const module of modules) {
    if (!module.title || !module.objective || module.objective.length < 40) fail(`${program.key} module ${module.moduleNumber} objective is too thin.`);
    if (!Array.isArray(module.lessons) || module.lessons.length < 4) fail(`${program.key} module ${module.moduleNumber} must define at least 4 lesson steps.`);
    if (!module.practicalLab || !module.deliverable) fail(`${program.key} module ${module.moduleNumber} missing lab/deliverable.`);
    if (module.contentOwnership !== "FCA Academy original curriculum artifact") fail(`${program.key} module ${module.moduleNumber} must declare FCA-original content ownership.`);
    validateSourceGovernance(`${program.key} module ${module.moduleNumber}`, module.sourceGovernance);
    validateAcademicRigor(`${program.key} module ${module.moduleNumber}`, module.academicRigor);
    if (!Array.isArray(module.vdoeCompetencies) || module.vdoeCompetencies.length < 4) fail(`${program.key} module ${module.moduleNumber} missing VDOE competency evidence.`);
    if (module.vdoeCompetencies.includes("Student Competency Record alignment")) fail(`${program.key} module ${module.moduleNumber} still uses generic SCR alignment text.`);
    if (!module.officialEvidence) fail(`${program.key} module ${module.moduleNumber} missing official source evidence.`);
    else {
      const expectedStatus = sourceCourse.proposedTrack ? "proposed-track" : "official-source-required";
      if (module.officialEvidence.status !== expectedStatus) fail(`${program.key} module ${module.moduleNumber} official evidence status mismatch.`);
      if (module.officialEvidence.manifestKey !== sourceCourse.key || module.officialEvidence.manifestUrl !== "/config/vdoe-cte-source-manifest.json") {
        fail(`${program.key} module ${module.moduleNumber} missing official manifest pointer.`);
      }
      if (!Array.isArray(module.officialEvidence.requiredArtifacts) || module.officialEvidence.requiredArtifacts.length < 4) {
        fail(`${program.key} module ${module.moduleNumber} missing official artifact requirements.`);
      }
    }
    if (!module.assessment?.passingScore || !Array.isArray(module.assessment?.rubric) || module.assessment.rubric.length < 5) {
      fail(`${program.key} module ${module.moduleNumber} missing assessment rubric/passing score.`);
    }
    if (module.assessment?.passingScore < 85) fail(`${program.key} module ${module.moduleNumber} passing score must be 85 or higher.`);
    const rubricText = (module.assessment?.rubric || []).join(" ").toLowerCase();
    for (const requiredRubricSignal of ["evidence", "quantitative", "defense"]) {
      if (!rubricText.includes(requiredRubricSignal)) fail(`${program.key} module ${module.moduleNumber} rubric missing ${requiredRubricSignal} signal.`);
    }
  }
}

if (failures.length > 0) {
  console.error("Academy CTE curriculum validation failed:");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log(`Academy CTE curriculum validation passed for ${VIRGINIA_CTE_PROGRAM_COUNT} Virginia Architecture & Construction courses.`);