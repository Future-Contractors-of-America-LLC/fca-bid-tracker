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

export async function fetchAcademyCommerceCatalog(options = {}) {
  const params = new URLSearchParams();
  if (options.lane) params.set("lane", options.lane);
  if (options.purchaseType) params.set("purchaseType", options.purchaseType);
  const query = params.toString();
  const response = await centralFetch(`/api/academy-commerce${query ? `?${query}` : ""}`, { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to load academy store"));
  }
  return payload;
}

export async function fetchAcademyCommerceItem({ programKey, pathwayKey } = {}) {
  const params = new URLSearchParams();
  if (programKey) params.set("programKey", programKey);
  if (pathwayKey) params.set("pathwayKey", pathwayKey);
  const response = await centralFetch(`/api/academy-commerce?${params.toString()}`, { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to load store item"));
  }
  return payload;
}

export async function startAcademyCheckout(body) {
  const response = await centralFetch("/api/academy-commerce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "checkout", ...body }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to start checkout"));
  }
  return payload;
}

export async function submitAcademyContactSales(body) {
  const response = await centralFetch("/api/academy-commerce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "contact-sales", ...body }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to submit purchase request"));
  }
  return payload;
}

export async function enrollAfterAcademyPurchase(body) {
  const response = await centralFetch("/api/academy-commerce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "enroll-after-purchase", ...body }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to confirm enrollment"));
  }
  return payload;
}

export function formatUsd(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
