import { centralFetch } from "./backendBase";

function unwrap(payload) {
  if (!payload?.ok) {
    throw new Error(payload?.error || "Precon continuity request failed.");
  }
  return payload.data ?? payload;
}

export async function fetchPreconContinuity(projectId) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/precon-continuity`, { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to load precon continuity.");
  return unwrap(payload);
}

export async function syncTakeoffsToEstimate(projectId, body = {}) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/precon/sync-estimate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to sync takeoffs to estimate.");
  return unwrap(payload);
}

export async function tetherTakeoffToEstimate(projectId, takeoffId, body = {}) {
  const response = await centralFetch(
    `/api/projects/${encodeURIComponent(projectId)}/takeoffs/${encodeURIComponent(takeoffId)}/tether-estimate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to tether takeoff to estimate.");
  return unwrap(payload);
}

export async function fetchProjectTakeoffs(projectId) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/takeoffs`, { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to load takeoffs.");
  return payload?.data?.items || payload?.data?.data?.items || [];
}

export async function priceEstimateFromTakeoffs(projectId, body = {}) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/precon/price-estimate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to price estimate from takeoffs.");
  return unwrap(payload);
}
