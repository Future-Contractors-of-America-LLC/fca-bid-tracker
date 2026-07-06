import { adminGovernance } from "../src/adminGovernance.js";
import {
  evaluateRevenueConstraints,
  runAutonomousProspecting,
  generateDynamicValueCase,
  generateProposalAsApi,
  assessHighStakesRelationshipRisk,
} from "../src/auricruxRevenueEngine.js";

const module26 = adminGovernance.module26RevenueAutonomy || {};

if (module26.mode !== "auricrux-only") {
  console.error("[module26] mode must be auricrux-only");
  process.exit(1);
}

if (module26.baselineHumanIntervention !== "zero") {
  console.error("[module26] baselineHumanIntervention must be zero");
  process.exit(1);
}

const candidate = {
  id: "MK-validate-001",
  company: "Validation Contractors",
  persona: "Owner",
  annualRevenueUsd: 9000000,
  estimatedMarginPct: 15,
  estimatedValue: 850000,
};

const constraints = evaluateRevenueConstraints(candidate, adminGovernance);
if (!constraints.passed) {
  console.error("[module26] candidate should pass strategy constraints", constraints.reasons);
  process.exit(1);
}

const prospecting = runAutonomousProspecting(candidate, adminGovernance);
if (!prospecting.ok || prospecting.status !== "initiated") {
  console.error("[module26] autonomous prospecting did not initiate");
  process.exit(1);
}

const valueCase = generateDynamicValueCase(candidate, {
  employeeCount: 50,
  adminHoursWeekly: 14,
  loadedLaborRateUsd: 85,
  schedulingInefficiencyPct: 18,
  expectedRecoveryPct: 38,
});

if (!valueCase.annualRecoveredUsd || valueCase.annualRecoveredUsd <= 0) {
  console.error("[module26] dynamic value case invalid");
  process.exit(1);
}

const proposal = generateProposalAsApi(candidate, valueCase, adminGovernance);
if (!proposal.id || !proposal.proposalSections?.length) {
  console.error("[module26] proposal API payload invalid");
  process.exit(1);
}

const risk = assessHighStakesRelationshipRisk(candidate, {
  sentiment: "negative",
  negativeTouches: 6,
  legalComplexityScore: 80,
}, adminGovernance);

if (!risk.needsEscalation) {
  console.error("[module26] high-stakes risk should trigger escalation");
  process.exit(1);
}

console.log("[module26] PASSED", JSON.stringify({
  checkedAt: new Date().toISOString(),
  autonomyMode: module26.mode,
  baselineHumanIntervention: module26.baselineHumanIntervention,
  riskScore: risk.riskScore,
}));
