export const CUSTOMER_AUTOMATION_LOG_KEY = "fca_customer_automation_log_v1";

function normalizeEntry(entry = {}) {
  return {
    id: entry.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: entry.type || "automation-event",
    title: entry.title || "Automation event recorded",
    detail: entry.detail || "Auricrux recorded a customer-session automation event.",
    route: entry.route || "/portal/platform",
    createdAt: entry.createdAt || new Date().toISOString(),
  };
}

export function readAutomationLog() {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(CUSTOMER_AUTOMATION_LOG_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeEntry).slice(0, 25);
  } catch {
    return [];
  }
}

export function appendAutomationLog(entry = {}) {
  if (typeof window === "undefined") return [];

  const nextEntries = [normalizeEntry(entry), ...readAutomationLog()].slice(0, 25);

  try {
    window.localStorage.setItem(CUSTOMER_AUTOMATION_LOG_KEY, JSON.stringify(nextEntries));
  } catch {
    // best-effort persistence only during shell hardening phase
  }

  return nextEntries;
}

export function clearAutomationLog() {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(CUSTOMER_AUTOMATION_LOG_KEY);
  } catch {
    // best-effort cleanup only
  }
}
