import { centralFetch } from "./backendBase";

function unwrapList(payload) {
  if (!payload?.ok) {
    throw new Error(payload?.error || "Leads request failed.");
  }
  return payload;
}

function unwrapNextActions(payload) {
  if (!payload?.ok) {
    throw new Error(payload?.error || "Leads next-actions request failed.");
  }
  return payload.data ?? payload;
}

export async function fetchLeads() {
  const response = await centralFetch("/api/leads", { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to load leads.");
  return unwrapList(payload);
}

export async function fetchLeadById(leadId) {
  const response = await centralFetch(`/api/leads/${encodeURIComponent(leadId)}`, { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to load lead.");
  return unwrapList(payload);
}

export async function createLead(body) {
  const response = await centralFetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to create lead.");
  return unwrapList(payload);
}

export async function updateLead(leadId, body) {
  const response = await centralFetch(`/api/leads/${encodeURIComponent(leadId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...body,
      updatedBy: "fca-lead-intelligence",
      sourceRoute: body.sourceRoute || "/portal/leads",
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to update lead.");
  return unwrapList(payload);
}

export async function qualifyLead(leadId, body) {
  const response = await centralFetch(`/api/leads/${encodeURIComponent(leadId)}/qualify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to qualify lead.");
  return unwrapList(payload);
}

export async function fetchLeadsNextActions() {
  const response = await centralFetch("/api/leads/next-actions", { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to load leads next actions.");
  return unwrapNextActions(payload);
}
