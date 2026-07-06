import { createWorkflowAuditEvent } from "./api/workflowClient";
import { logTriadBlackboxEvent } from "./triadFlywheel";
import { PROJECT_EVENT_REQUIRED_FIELDS, PROJECT_EVENT_TYPES } from "./projectEventContracts";

const PROJECT_EVENT_CHANNEL = "fca.project.event";
const PROJECT_EVENT_LOG_KEY = "fca_project_event_log_v1";

function nowIso() {
  return new Date().toISOString();
}

function readEventLog() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PROJECT_EVENT_LOG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeEventLog(items) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROJECT_EVENT_LOG_KEY, JSON.stringify(items.slice(0, 300)));
  } catch {
    // Best effort only.
  }
}

function dispatchProjectEvent(event) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(PROJECT_EVENT_CHANNEL, { detail: event }));
}

function buildAuditNote(event) {
  const parts = [event.type, event.projectId, event.stage].filter(Boolean);
  const detail = String(event.detail || "").trim();
  return `${parts.join(" | ")}${detail ? ` | ${detail}` : ""}`;
}

export async function publishProjectEvent(type, payload = {}) {
  const event = {
    id: `prj-evt-${Math.random().toString(36).slice(2, 10)}`,
    type: String(type || PROJECT_EVENT_TYPES.UNKNOWN),
    projectId: payload.projectId || "",
    stage: payload.stage || "",
    detail: payload.detail || "",
    actorType: payload.actorType || "auricrux",
    severity: payload.severity || "E4",
    route: payload.route || "/portal/projects",
    data: payload.data || {},
    timestamp: nowIso(),
  };

  for (const field of PROJECT_EVENT_REQUIRED_FIELDS) {
    if (!event[field]) {
      throw new Error(`Missing required project event field: ${field}`);
    }
  }

  const next = [event, ...readEventLog()];
  writeEventLog(next);
  dispatchProjectEvent(event);

  logTriadBlackboxEvent("project-event", {
    projectId: event.projectId,
    eventType: event.type,
    stage: event.stage,
    severity: event.severity,
    route: event.route,
  });

  try {
    await createWorkflowAuditEvent({
      eventType: event.type,
      actorType: event.actorType,
      severity: event.severity,
      note: buildAuditNote(event),
      route: event.route,
      projectId: event.projectId,
      stage: event.stage,
      details: event.data,
    });
  } catch {
    // Keep event flow non-blocking even if audit API is unavailable.
  }

  return event;
}

export function subscribeProjectEvents(callback) {
  if (typeof window === "undefined") return () => {};
  const handler = (event) => callback(event.detail);
  window.addEventListener(PROJECT_EVENT_CHANNEL, handler);
  return () => window.removeEventListener(PROJECT_EVENT_CHANNEL, handler);
}

export function listRecentProjectEvents(limit = 50) {
  return readEventLog().slice(0, Math.max(1, limit));
}
