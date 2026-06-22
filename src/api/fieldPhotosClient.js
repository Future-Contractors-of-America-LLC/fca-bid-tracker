import { centralApi, centralFetch } from "./backendBase";

async function readJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchFieldPhotos(projectId) {
  const search = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
  const response = await centralFetch(`/api/field-photos${search}`, { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to load field photos.");
  return payload;
}

export async function uploadFieldPhoto(body) {
  const response = await centralFetch("/api/field-photos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to upload field photo.");
  return payload;
}

export async function updateFieldPhoto(photoId, body) {
  const response = await centralFetch(`/api/field-photos?photoId=${encodeURIComponent(photoId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ photoId, ...body }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to update field photo.");
  return payload;
}

export async function compareFieldPhoto(photoId, body = {}) {
  const response = await centralFetch("/api/field-photos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "compare-to-plan", photoId, ...body }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to compare field photo.");
  return payload;
}

export async function autoRedlineFromPhoto(photoId, body = {}) {
  const response = await centralFetch("/api/field-photos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "auto-redline", photoId, ...body }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to generate redlines.");
  return payload;
}

export async function fetchFieldPhotoFeedback(photoId) {
  const response = await centralFetch("/api/field-photos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "auricrux-feedback", photoId }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to load Auricrux feedback.");
  return payload;
}

export async function fetchFieldIntelligence(projectId) {
  const response = await centralFetch(
    `/api/field-photos?projectId=${encodeURIComponent(projectId)}&intelligence=1`,
    { method: "GET" },
  );
  const payload = await readJsonSafe(response);
  if (!response.ok) throw new Error(payload?.error || "Unable to load field intelligence.");
  return payload?.data || payload;
}

export function fieldPhotoStreamUrl(photoId) {
  return centralApi(`/api/field-photos?photoId=${encodeURIComponent(photoId)}&download=1`);
}
