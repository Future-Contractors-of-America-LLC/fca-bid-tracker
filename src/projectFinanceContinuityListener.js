import { mutateFinancialWorkspace } from "./api/financialClient";
import { PROJECT_EVENT_TYPES } from "./projectEventContracts";
import { subscribeProjectEvents } from "./projectEventBus";

const PROCESSED_MARKER_KEY = "fca_project_finance_forecast_markers_v1";

function readProcessedMarkers() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(PROCESSED_MARKER_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeProcessedMarkers(state) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROCESSED_MARKER_KEY, JSON.stringify(state));
  } catch {
    // Best effort only.
  }
}

function markerKey(projectId, marker) {
  return `${projectId || "project"}:${marker || "marker"}`;
}

export function startProjectFinanceContinuityListener({ onNotice, onError } = {}) {
  return subscribeProjectEvents(async (event) => {
    if (!event || event.type !== PROJECT_EVENT_TYPES.SCHEDULE_FORECAST_CASCADED) return;

    const projectId = event.projectId || "";
    const marker = event.data?.marker || event.id;
    const amount = Number(event.data?.amount || 0);

    if (!projectId || !Number.isFinite(amount) || amount <= 0) return;

    const processed = readProcessedMarkers();
    const dedupeKey = markerKey(projectId, marker);
    if (processed[dedupeKey]) return;

    try {
      await mutateFinancialWorkspace("create-recurring-invoice", {
        label: `${projectId} milestone forecast`,
        cadence: "milestone",
        amount: String(amount),
        projectId,
        note: `Auto-generated from project event ${event.type} (${event.id}).`,
      });
      processed[dedupeKey] = new Date().toISOString();
      writeProcessedMarkers(processed);
      if (typeof onNotice === "function") {
        onNotice(`Financial forecast auto-updated from event bus for ${projectId}.`);
      }
    } catch (error) {
      if (typeof onError === "function") {
        onError(error?.message || "Unable to apply schedule forecast to finance workspace.");
      }
    }
  });
}
