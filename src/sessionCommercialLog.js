export const CUSTOMER_COMMERCIAL_LOG_KEY = "fca_customer_commercial_log_v1";

function normalizeEntry(entry = {}) {
  return {
    id: entry.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: entry.type || "commercial-event",
    title: entry.title || "Commercial continuity event recorded",
    detail: entry.detail || "Auricrux recorded a revenue or rollout continuity event.",
    route: entry.route || "/pricing",
    createdAt: entry.createdAt || new Date().toISOString(),
  };
}

export function readCommercialLog() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CUSTOMER_COMMERCIAL_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeEntry).slice(0, 25);
  } catch {
    return [];
  }
}

export function appendCommercialLog(entry = {}) {
  if (typeof window === "undefined") return [];

  const nextEntries = [normalizeEntry(entry), ...readCommercialLog()].slice(0, 25);

  try {
    window.localStorage.setItem(CUSTOMER_COMMERCIAL_LOG_KEY, JSON.stringify(nextEntries));
  } catch {
    // best-effort persistence only during shell hardening phase
  }

  return nextEntries;
}

export function clearCommercialLog() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(CUSTOMER_COMMERCIAL_LOG_KEY);
  } catch {
    // best-effort cleanup only
  }
}
