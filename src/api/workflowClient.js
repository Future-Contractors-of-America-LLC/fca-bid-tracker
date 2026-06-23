import { centralFetch } from "./backendBase";

export async function fetchWorkflowBids() {
  const response = await centralFetch("/api/bids", { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to load bid workflow state.");
  }
  if (Array.isArray(payload)) {
    return { ok: true, items: payload, count: payload.length };
  }
  if (!payload?.ok) {
    throw new Error(payload?.error || "Unable to load bid workflow state.");
  }
  return payload;
}

export async function mutateWorkflowBid(action, body = {}) {
  const response = await centralFetch("/api/bids", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...body }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to mutate bid workflow state.");
  }
  return payload;
}

export async function fetchWorkflowProjects() {
  const response = await centralFetch("/api/projects", { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to load project workflow state.");
  }
  return payload;
}

export async function mutateWorkflowProject(action, body = {}) {
  const response = await centralFetch("/api/projects", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...body }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to mutate project workflow state.");
  }
  return payload;
}

export async function fetchWorkflowFiles(params = {}) {
  const search = new URLSearchParams();
  if (params.projectId) search.set("projectId", params.projectId);
  if (params.category && params.category !== "All") search.set("category", params.category);
  if (params.status && params.status !== "All") search.set("status", params.status);
  if (params.q) search.set("q", params.q);
  const query = search.toString() ? `?${search.toString()}` : "";
  const response = await centralFetch(`/api/files${query}`, { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to load workflow file state.");
  }
  return payload;
}

export async function mutateWorkflowFile(action, body = {}) {
  const response = await centralFetch("/api/files", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...body }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to mutate workflow file state.");
  }
  return payload;
}

export async function fetchWorkflowAudit(params = {}) {
  const search = new URLSearchParams();
  if (params.projectId) search.set("projectId", params.projectId);
  if (params.eventType && params.eventType !== "All") search.set("eventType", params.eventType);
  if (params.actorType && params.actorType !== "All") search.set("actorType", params.actorType);
  if (params.q) search.set("q", params.q);
  const query = search.toString() ? `?${search.toString()}` : "";
  const response = await centralFetch(`/api/workflow-audit${query}`, { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to load workflow audit state.");
  }
  return payload;
}

export async function fetchOpportunityWorkspace(opportunityId) {
  const response = await centralFetch(
    `/api/opportunities/${encodeURIComponent(opportunityId)}/workspace`,
    { method: "GET" }
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok || !payload?.item) {
    throw new Error(payload?.error || "Unable to load opportunity workspace.");
  }
  return payload;
}

export async function convertOpportunityToProject(opportunityId, body = {}) {
  const response = await centralFetch(
    `/api/opportunities/${encodeURIComponent(opportunityId)}/convert-to-project`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to convert opportunity to project.");
  }
  return payload;
}

export async function fetchProjectDetail(projectId) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}`, { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok || !payload?.item) {
    throw new Error(payload?.error || "Unable to load project detail.");
  }
  return payload;
}

export async function fetchProjectWorkspace(projectId) {
  const response = await centralFetch(
    `/api/projects/${encodeURIComponent(projectId)}/workspace`,
    { method: "GET" }
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok || !payload?.item) {
    throw new Error(payload?.error || "Unable to load project workspace.");
  }
  return payload;
}

export async function fetchProjectRfis(projectId) {
  const response = await centralFetch(
    `/api/projects/${encodeURIComponent(projectId)}/rfis`,
    { method: "GET" }
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to load project RFIs.");
  }
  return payload;
}

export async function fetchProjectTakeoffs(projectId) {
  const response = await centralFetch(
    `/api/projects/${encodeURIComponent(projectId)}/takeoffs`,
    { method: "GET" }
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to load project takeoffs.");
  }
  return payload;
}

export async function fetchFileSummary(ownerObjectType, ownerObjectId) {
  const search = new URLSearchParams();
  if (ownerObjectType) search.set("ownerObjectType", ownerObjectType);
  if (ownerObjectId) search.set("ownerObjectId", ownerObjectId);
  const response = await centralFetch(`/api/files/summary?${search.toString()}`, { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok || !payload?.summary) {
    throw new Error(payload?.error || "Unable to load file summary.");
  }
  return payload;
}

export async function fetchAuditSummary(relatedObjectType, relatedObjectId) {
  const search = new URLSearchParams();
  if (relatedObjectType) search.set("relatedObjectType", relatedObjectType);
  if (relatedObjectId) search.set("relatedObjectId", relatedObjectId);
  const response = await centralFetch(`/api/audit-events/summary?${search.toString()}`, { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok || !payload?.summary) {
    throw new Error(payload?.error || "Unable to load audit summary.");
  }
  return payload;
}
