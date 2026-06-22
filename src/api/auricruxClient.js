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

export async function sendAuricruxMessage({ message, route, context }) {
  const response = await centralFetch("/api/auricrux", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, route, context }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to reach Auricrux assistant"));
  }
  return payload;
}

export async function sendAuricruxFeedback({ rating, message, reply, route, context, correction }) {
  const response = await centralFetch("/api/auricrux", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rating, message, reply, route, context, correction }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to record Auricrux feedback"));
  }
  return payload;
}

export async function fetchAuricruxTrainingStatus() {
  const response = await centralFetch("/api/auricrux?scope=training", { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to load Auricrux training status"));
  }
  return payload.training;
}
