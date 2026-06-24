import { centralFetch } from "./backendBase";

function unwrap(payload) {
  if (!payload?.ok) {
    throw new Error(payload?.error || "Immersive request failed.");
  }
  return payload.data ?? payload;
}

export async function fetchImmersiveNextActions(params = {}) {
  const search = new URLSearchParams();
  if (params.projectId) search.set("projectId", params.projectId);
  if (params.userId) search.set("userId", params.userId);
  const query = search.toString() ? `?${search.toString()}` : "";
  const response = await centralFetch(`/api/immersive-experiences/next-actions${query}`, { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to load immersive next actions.");
  return unwrap(payload);
}

export async function fetchImmersiveCatalog(params = {}) {
  const search = new URLSearchParams();
  if (params.surface) search.set("surface", params.surface);
  if (params.projectId) search.set("projectId", params.projectId);
  if (params.userId) search.set("userId", params.userId);
  const query = search.toString() ? `?${search.toString()}` : "";
  const response = await centralFetch(`/api/immersive-experiences${query}`, { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to load immersive catalog.");
  return unwrap(payload);
}

export async function startImmersiveSession(body) {
  const response = await centralFetch("/api/immersive-experiences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to start immersive session.");
  return unwrap(payload);
}

export async function completeImmersiveSession(body) {
  const response = await centralFetch("/api/immersive-experiences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "complete", ...body }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to complete immersive session.");
  return unwrap(payload);
}

export async function fetchImmersiveAssets(projectId) {
  const response = await centralFetch(
    `/api/projects/${encodeURIComponent(projectId)}/immersive/assets`,
    { method: "GET" },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to load immersive assets.");
  return unwrap(payload);
}

export async function fetchFieldOverlays(projectId) {
  const response = await centralFetch(
    `/api/projects/${encodeURIComponent(projectId)}/field-overlays`,
    { method: "GET" },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to load field overlays.");
  return unwrap(payload);
}

export async function saveFieldOverlay(projectId, body) {
  const response = await centralFetch(
    `/api/projects/${encodeURIComponent(projectId)}/field-overlays`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to save field overlay.");
  return unwrap(payload);
}
