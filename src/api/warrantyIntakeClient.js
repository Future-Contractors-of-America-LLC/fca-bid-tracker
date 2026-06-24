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

function unwrap(payload) {
  if (!payload?.ok) throw new Error(payload?.error || "Warranty intake request failed.");
  return payload.data || payload;
}

export async function fetchWarrantyServiceStatus() {
  const response = await centralFetch("/api/fca-warranty/status", { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok) throw new Error(payload?.error || "Unable to load warranty service status.");
  return unwrap(payload);
}

export async function submitPublicWarrantyIntake(body = {}) {
  const response = await centralFetch("/api/fca-warranty/intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok) throw new Error(payload?.error || "Unable to submit warranty intake.");
  return unwrap(payload);
}

export async function fetchWarrantyContinuity(projectId) {
  const search = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
  const response = await centralFetch(`/api/fca-warranty/continuity${search}`, { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok) throw new Error(payload?.error || "Unable to load warranty continuity.");
  return unwrap(payload);
}
