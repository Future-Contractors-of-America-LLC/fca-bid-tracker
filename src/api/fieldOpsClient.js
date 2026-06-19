import { centralFetch } from "./backendBase";

async function readJsonSafe(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function formatApiError(response, payload, fallbackMessage) {
  const statusSuffix = response.status ? ` (status ${response.status})` : "";
  return payload?.error || `${fallbackMessage}${statusSuffix}.`;
}

export async function fetchFieldTasks(params = {}) {
  const search = new URLSearchParams();
  if (params.projectId) search.set("projectId", params.projectId);
  const query = search.toString() ? `?${search.toString()}` : "";
  const response = await centralFetch(`/api/field-tasks${query}`, { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to load field tasks"));
  }
  return payload;
}

export async function createFieldTask(body) {
  const response = await centralFetch("/api/field-tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to create field task"));
  }
  return payload;
}

export async function completeFieldTask(taskId) {
  const response = await centralFetch("/api/field-tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "complete", taskId }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to complete field task"));
  }
  return payload;
}

export async function fetchFieldSchedule(params = {}) {
  const search = new URLSearchParams();
  if (params.projectId) search.set("projectId", params.projectId);
  const query = search.toString() ? `?${search.toString()}` : "";
  const response = await centralFetch(`/api/field-schedule${query}`, { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to load field schedule"));
  }
  return payload;
}

export async function createFieldScheduleEvent(body) {
  const response = await centralFetch("/api/field-schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to create scheduled event"));
  }
  return payload;
}

export async function completeFieldScheduleEvent(eventId) {
  const response = await centralFetch("/api/field-schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "complete", eventId }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to complete scheduled event"));
  }
  return payload;
}
