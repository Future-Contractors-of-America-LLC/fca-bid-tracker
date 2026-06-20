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
  if (!payload?.ok) {
    throw new Error(payload?.error || "Commercial request failed.");
  }
  return payload;
}

export async function fetchEstimates() {
  const response = await centralFetch("/api/estimates", { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok) throw new Error(payload?.error || "Unable to load estimates.");
  return unwrap(payload);
}

export async function mutateEstimate(action, body = {}) {
  const response = await centralFetch("/api/estimates", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...body }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok) throw new Error(payload?.error || "Unable to update estimate.");
  return unwrap(payload);
}

export async function fetchProposals() {
  const response = await centralFetch("/api/proposals", { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok) throw new Error(payload?.error || "Unable to load proposals.");
  return unwrap(payload);
}

export async function mutateProposal(action, body = {}) {
  const response = await centralFetch("/api/proposals", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...body }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok) throw new Error(payload?.error || "Unable to update proposal.");
  return unwrap(payload);
}
