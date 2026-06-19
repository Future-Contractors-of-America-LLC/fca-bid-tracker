import { centralFetch } from "./backendBase";

async function readJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchJobCosts(projectId) {
  const search = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
  const response = await centralFetch(`/api/job-cost${search}`, { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to load job costs.");
  return payload;
}

export async function fetchChangeOrders(projectId) {
  const search = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
  const response = await centralFetch(`/api/change-orders${search}`, { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to load change orders.");
  return payload;
}

export async function fetchProjectRfis(projectId) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/rfis`, { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok) throw new Error(payload?.error || "Unable to load RFIs.");
  return payload?.data?.items || payload?.items || [];
}
