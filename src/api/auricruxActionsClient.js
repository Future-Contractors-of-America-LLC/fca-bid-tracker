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

export async function executeAuricruxAction({
  mode,
  targetObjectType,
  targetObjectId,
  rationale,
  capabilityId,
  sourceRoute,
}) {
  const response = await centralFetch("/api/auricrux-actions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode,
      targetObjectType,
      targetObjectId,
      rationale,
      capabilityId,
      sourceRoute,
    }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to run Auricrux action"));
  }
  return payload;
}

export async function runBidDoTeachWorkflow({ bidId = "BID-1", sourceRoute, fileName }) {
  const response = await centralFetch("/api/bid-doteach-workflow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      bidId,
      sourceRoute: sourceRoute || "/portal/bids",
      fileName: fileName || "Package A-117 Interior Demo Plan Set Rev 3.pdf",
    }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to run Package A-117 Do→Teach workflow"));
  }
  return payload;
}

export async function fetchSpineContext({ targetObjectType = "Bid", targetObjectId = "BID-1" }) {
  const params = new URLSearchParams({
    targetObjectType,
    targetObjectId,
  });
  const response = await centralFetch(`/api/auricrux-spine?${params.toString()}`);
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to read Auricrux spine context"));
  }
  return payload;
}
