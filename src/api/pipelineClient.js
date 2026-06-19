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

const LOCAL_PIPELINE_KEY = "fca_commercial_pipeline_v1";

export async function migrateLocalPipelineToApi(existingItems = []) {
  if (typeof window === "undefined") return existingItems;
  let local;
  try {
    local = JSON.parse(window.localStorage.getItem(LOCAL_PIPELINE_KEY) || "{}");
  } catch {
    return existingItems;
  }
  const existingBidIds = new Set((existingItems || []).map((item) => item.bidId));
  const toMigrate = Object.entries(local).filter(([bidId]) => bidId && !existingBidIds.has(bidId));
  if (toMigrate.length === 0) return existingItems;

  const migrated = [...(existingItems || [])];
  for (const [bidId, link] of toMigrate) {
    try {
      const payload = await upsertPipelineLink({
        bidId,
        projectId: link.projectId,
        invoiceId: link.invoiceId,
        estimateSkipped: Boolean(link.estimateSkipped),
        currentStep: link.currentStep,
      });
      if (payload.item) migrated.push(payload.item);
    } catch {
      break;
    }
  }
  if (migrated.length > (existingItems || []).length) {
    try {
      window.localStorage.removeItem(LOCAL_PIPELINE_KEY);
    } catch {
      // best effort
    }
  }
  return migrated;
}
