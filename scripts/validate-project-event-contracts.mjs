import { PROJECT_EVENT_REQUIRED_FIELDS, PROJECT_EVENT_TYPES } from "../src/projectEventContracts.js";

const eventValues = Object.values(PROJECT_EVENT_TYPES);

if (!Array.isArray(PROJECT_EVENT_REQUIRED_FIELDS) || PROJECT_EVENT_REQUIRED_FIELDS.length < 6) {
  console.error("[project-events] required field contract is missing or incomplete");
  process.exit(1);
}

if (!eventValues.length) {
  console.error("[project-events] no event types declared");
  process.exit(1);
}

if (new Set(eventValues).size !== eventValues.length) {
  console.error("[project-events] duplicate event type values detected");
  process.exit(1);
}

const invalid = eventValues.filter((eventType) => !String(eventType).startsWith("project."));
if (invalid.length) {
  console.error("[project-events] all event types must start with 'project.'", invalid);
  process.exit(1);
}

const mandatory = [
  "project.context.selected",
  "project.stage.advanced",
  "project.stage.gate_blocked",
  "project.schedule.forecast_cascaded",
];

for (const expected of mandatory) {
  if (!eventValues.includes(expected)) {
    console.error(`[project-events] missing mandatory contract event: ${expected}`);
    process.exit(1);
  }
}

console.log("[project-events] PASSED", JSON.stringify({
  checkedAt: new Date().toISOString(),
  eventTypeCount: eventValues.length,
  requiredFieldCount: PROJECT_EVENT_REQUIRED_FIELDS.length,
}));
