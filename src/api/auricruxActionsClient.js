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

export async function fetchAuricruxActions() {
  const response = await centralFetch("/api/auricrux/actions", { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to load Auricrux actions"));
  }
  return payload;
}

export async function submitAuricruxAction({
  mode,
  targetObjectType,
  targetObjectId,
  capabilityId,
  rationale,
  sourceRoute,
  beforeSnapshotJson,
  afterSnapshotJson,
}) {
  const response = await centralFetch("/api/auricrux/actions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode,
      targetObjectType,
      targetObjectId,
      capabilityId,
      rationale,
      sourceRoute,
      beforeSnapshotJson,
      afterSnapshotJson,
    }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to submit Auricrux action"));
  }
  return payload;
}

export async function runBidDoTeachWorkflow({ bidId, sourceRoute, rationale }) {
  const response = await centralFetch("/api/bid-doteach-workflow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bidId,
      sourceRoute: sourceRoute || "/portal/bids",
      executeRationale: rationale,
    }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to run bid Do→Teach workflow"));
  }
  return payload;
}
