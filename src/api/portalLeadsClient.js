import { centralFetch } from "./backendBase";

function normalizeLead(row, index = 0) {
  const client = row.client || {};
  const site = row.site || {};
  return {
    id: row.leadId || row.id || `LEAD-${index + 1}`,
    leadId: row.leadId || row.id || `LEAD-${index + 1}`,
    status: row.status || "new",
    company: client.company || client.name || row.company || "Unknown company",
    contact: client.contactName || client.contactEmail || "—",
    email: client.contactEmail || "",
    phone: client.contactPhone || "",
    location: site.city ? `${site.city}${site.state ? `, ${site.state}` : ""}` : site.jurisdiction || "—",
    serviceLine: row.serviceLine || "General",
    projectIntent: row.projectIntent || "",
    sourceChannel: row.sourceChannel || "intake",
    estimatedValue: site.estimatedValue || row.estimatedValue || 0,
    opportunityId: row.opportunityId || "",
    createdAt: row.createdAt || "",
    updatedAt: row.updatedAt || "",
    raw: row,
  };
}

export async function fetchPortalLeads() {
  try {
    const response = await centralFetch("/api/leads");
    const payload = await response.json().catch(() => ({}));
    if (response.ok && Array.isArray(payload?.items)) {
      const leads = payload.items.map(normalizeLead);
      return { leads, source: leads.length ? "live" : "empty", error: "" };
    }
    return {
      leads: [],
      source: "error",
      error: payload?.error || `Unable to load leads (HTTP ${response.status}).`,
    };
  } catch (error) {
    return { leads: [], source: "error", error: error?.message || "Unable to load leads." };
  }
}

export async function qualifyPortalLead(leadId, payload = {}) {
  const response = await centralFetch(`/api/leads/${encodeURIComponent(leadId)}/qualify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      budgetStatus: "confirmed",
      jurisdictionStatus: "validated",
      ownershipStatus: "verified",
      sourceRoute: "/portal/leads",
      qualifiedBy: "portal-operator",
      ...payload,
    }),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.error || `Qualify failed (HTTP ${response.status})`);
  }
  return body;
}

export async function createPortalLead(payload = {}) {
  const response = await centralFetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body?.ok === false) {
    throw new Error(body?.error || `Lead creation failed (HTTP ${response.status})`);
  }
  return body;
}
