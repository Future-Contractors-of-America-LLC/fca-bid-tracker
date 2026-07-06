import {
  runSandboxValidation,
  issueComplianceCertificate,
  publishFederatedInsight,
  issueTalentPassport,
} from "../src/phase4Ecosystem.js";

const sandbox = runSandboxValidation(
  {
    id: "persona-civil-scheduler",
    title: "Civil Scheduler Persona",
    instructions: "Optimize civil sequence while enforcing constitutional margin and compliance prompts.",
    capabilities: ["schedule-optimization", "crew-leveling"],
    marginReviewThresholdPct: 16,
    requiresDirectProdWrite: false,
  },
  {
    prompts: ["optimize schedule"],
    responses: ["resource shift proposal"],
  },
);

if (!sandbox.ok) {
  console.error("[phase4-ecosystem] sandbox validation failed", sandbox.violations);
  process.exit(1);
}

const insight = publishFederatedInsight({
  workflowKey: "drywall-framing",
  technique: "staggered-crew-handoff",
  observedDeltaPct: 9.2,
  confidence: 0.81,
  companyName: "hidden-by-redaction",
});

if (insight.payload.companyName) {
  console.error("[phase4-ecosystem] federated redaction failed");
  process.exit(1);
}

const passport = issueTalentPassport(
  { workerId: "worker-100", role: "superintendent" },
  ["Advanced Field Safety Leadership"],
  [{ eventType: "triad.field.milestone_completed", score: 97 }],
);

if (!passport.provenanceHash) {
  console.error("[phase4-ecosystem] talent passport missing provenance hash");
  process.exit(1);
}

const certificate = issueComplianceCertificate(
  "PRJ-100",
  [{ eventType: "triad.field.milestone_completed" }],
  [{ type: "triad.field.milestone_completed" }],
);

if (!certificate.passed || !certificate.proofHash) {
  console.error("[phase4-ecosystem] compliance certificate failed");
  process.exit(1);
}

console.log("[phase4-ecosystem] PASSED", JSON.stringify({
  checkedAt: new Date().toISOString(),
  sandboxScore: sandbox.score,
  certificatePassed: certificate.passed,
}));
