import {
  PERSONA_MANIFESTS,
  TRIAD_EVENT_TYPES,
  TRIAD_JOB_SCHEMA,
  validateTriadContract,
} from "../src/triadFlywheel.js";

function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

const errors = [];

assert(Boolean(TRIAD_JOB_SCHEMA?.lead?.leadId), "TRIAD_JOB_SCHEMA.lead.leadId is required", errors);
assert(Boolean(TRIAD_JOB_SCHEMA?.project?.projectId), "TRIAD_JOB_SCHEMA.project.projectId is required", errors);
assert(Array.isArray(TRIAD_JOB_SCHEMA?.project?.workspaceFolders), "TRIAD_JOB_SCHEMA.project.workspaceFolders must be an array", errors);

const requiredEventTypes = [
  "LEAD_WON",
  "FIELD_MILESTONE_COMPLETED",
  "FINANCE_PAYAPP_DRAFTED",
  "SAFETY_INCIDENT_DETECTED",
  "AUDIT_BLACKBOX_LOGGED",
  "PERSONA_DECISION_ENQUEUED",
  "PERSONA_DECISION_OVERRIDDEN",
];

for (const key of requiredEventTypes) {
  assert(Boolean(TRIAD_EVENT_TYPES?.[key]), `TRIAD_EVENT_TYPES.${key} missing`, errors);
}

const requiredPersonas = ["estimator", "fieldGuardian", "governance"];
for (const personaId of requiredPersonas) {
  const persona = PERSONA_MANIFESTS?.[personaId];
  assert(Boolean(persona), `PERSONA_MANIFESTS.${personaId} missing`, errors);
  assert(Boolean(persona?.instructions), `PERSONA_MANIFESTS.${personaId}.instructions missing`, errors);
  assert(Boolean(persona?.weights && Object.keys(persona.weights).length), `PERSONA_MANIFESTS.${personaId}.weights missing`, errors);
}

const stateValidation = validateTriadContract();
if (!stateValidation.ok) {
  for (const issue of stateValidation.errors) errors.push(`state: ${issue}`);
}

if (errors.length) {
  console.error("[triad-contract] FAILED");
  for (const issue of errors) console.error(` - ${issue}`);
  process.exit(1);
}

console.log("[triad-contract] PASSED", JSON.stringify({
  checkedAt: stateValidation.checkedAt,
  jobsChecked: stateValidation.jobsChecked,
  decisionQueueChecked: stateValidation.decisionQueueChecked,
}));
