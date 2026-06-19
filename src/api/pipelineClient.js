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

export function pipelineItemsToMap(items = []) {
  return Object.fromEntries(
    (items || [])
      .filter((item) => item?.bidId)
      .map((item) => [item.bidId, item]),
  );
}

export async function fetchCommercialPipeline() {
  const response = await centralFetch("/api/commercial-pipeline", { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to load commercial pipeline"));
  }
  return payload;
}

export async function fetchPipelineByBid(bidId) {
  const response = await centralFetch(`/api/commercial-pipeline?bidId=${encodeURIComponent(bidId)}`, { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to load pipeline record"));
  }
  return payload;
}

export async function upsertPipelineLink(body) {
  const response = await centralFetch("/api/commercial-pipeline", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to save pipeline link"));
  }
  return payload;
}
