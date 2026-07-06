import { adminGovernance } from "../src/adminGovernance.js";
import {
  checkCredentialGate,
  computeFutureCapacityDemand,
  createContextualDossier,
  evaluateCultureAlignment,
  planAutonomousOnboarding,
  runZeroTouchInterview,
  shouldEscalateToFounder,
} from "../src/auricruxTalentOrchestrator.js";

const module27 = adminGovernance.module27TalentAutonomy || {};

if (module27.mode !== "auricrux-only") {
  console.error("[module27] mode must be auricrux-only");
  process.exit(1);
}

if (module27.baselineHumanIntervention !== "zero") {
  console.error("[module27] baselineHumanIntervention must be zero");
  process.exit(1);
}

const candidate = {
  id: "CAND-VALIDATE-001",
  name: "Validation Candidate",
  culturalFit: 96,
  skillFit: 97,
  retentionLikelihood: 95,
  certifications: ["FCA Core Certification", "Advanced Field Safety Leadership", "Critical Path Recovery"],
  culturalSignals: {
    safetyOwnership: 97,
    accountability: 95,
    teamHumility: 94,
  },
};

const credentialGate = checkCredentialGate(candidate, adminGovernance);
if (!credentialGate.pass) {
  console.error("[module27] credential gate should pass for validation candidate");
  process.exit(1);
}

const culture = evaluateCultureAlignment(candidate, adminGovernance);
if (!culture.score || culture.score < 70) {
  console.error("[module27] culture alignment score unexpectedly low");
  process.exit(1);
}

const screening = runZeroTouchInterview(candidate, ["Advanced Field Safety Leadership", "Critical Path Recovery"], adminGovernance);
if (!screening.zeroTouchEligible) {
  console.error("[module27] zero-touch interview should be eligible for high-trust candidate");
  process.exit(1);
}

const demand = computeFutureCapacityDemand([
  { date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), task: "Specialized electrician deployment" },
  { date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(), task: "Electrical panel supervision" },
], 6);

if (demand.futureRows < 1) {
  console.error("[module27] predictive provisioning demand scan failed");
  process.exit(1);
}

const onboarding = planAutonomousOnboarding(candidate, [{ id: "PRJ-100", name: "Validation Project" }], [{ id: "TASK-1", task: "Critical Path Recovery task" }]);
if (!onboarding.projectAssignment || !onboarding.firstTaskAssignment) {
  console.error("[module27] onboarding assignment did not produce project/task mapping");
  process.exit(1);
}

const escalation = shouldEscalateToFounder({
  salaryNegotiationAmountUsd: 180000,
  performanceDisciplinary: false,
  cultureFitDispute: false,
}, adminGovernance);

if (!escalation.escalate) {
  console.error("[module27] high salary negotiation should trigger founder escalation");
  process.exit(1);
}

const dossier = createContextualDossier(candidate, {
  type: "hiring-sensitive-case",
  summary: "Validation founder escalation dossier",
}, ["Path 1", "Path 2", "Path 3"]);

if (!dossier.id || !dossier.recommendedPaths?.length) {
  console.error("[module27] dossier generation failed");
  process.exit(1);
}

console.log("[module27] PASSED", JSON.stringify({
  checkedAt: new Date().toISOString(),
  zeroTouchEligible: screening.zeroTouchEligible,
  cultureScore: culture.score,
  escalationReasons: escalation.reasons,
}));
