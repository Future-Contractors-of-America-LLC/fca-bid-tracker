export const PROJECT_EVENT_TYPES = Object.freeze({
  CONTEXT_SELECTED: "project.context.selected",
  STAGE_ADVANCED: "project.stage.advanced",
  STAGE_GATE_BLOCKED: "project.stage.gate_blocked",
  PERMIT_BLOCKER_CLEARED: "project.permit.blocker_cleared",
  COMMAND_NOTES_UPDATED: "project.command.notes_updated",
  DELAY_NOTICE_DRAFTED: "project.delay.notice_drafted",
  SCHEDULE_FORECAST_CASCADED: "project.schedule.forecast_cascaded",
  UNKNOWN: "project.event.unknown",
});

export const PROJECT_EVENT_REQUIRED_FIELDS = Object.freeze([
  "id",
  "type",
  "projectId",
  "actorType",
  "severity",
  "route",
  "timestamp",
]);
