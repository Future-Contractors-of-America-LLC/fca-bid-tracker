export async function fetchWorkflowBids() {
  const response = await fetch("/api/bids", {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to load bid workflow state.");
  }

  return payload;
}

export async function mutateWorkflowBid(action, body = {}) {
  const response = await fetch("/api/bids", {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ action, ...body }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to mutate bid workflow state.");
  }

  return payload;
}

export async function fetchWorkflowProjects() {
  const response = await fetch("/api/projects", {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to load project workflow state.");
  }

  return payload;
}

export async function mutateWorkflowProject(action, body = {}) {
  const response = await fetch("/api/projects", {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ action, ...body }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to mutate project workflow state.");
  }

  return payload;
}

export async function fetchCanonicalProjects(params = {}) {
  const search = new URLSearchParams();
  if (params.customerId) search.set("customerId", params.customerId);
  const query = search.toString() ? `?${search.toString()}` : "";

  const response = await fetch(`/api/projects${query}`, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await response.json().catch(() => ([]));
  if (!response.ok) {
    throw new Error("Unable to load canonical project state.");
  }

  return Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
}

export async function upsertCanonicalProject(project = {}) {
  const response = await fetch("/api/projects", {
    method: project?.id ? "PATCH" : "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(project),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to save canonical project state.");
  }

  return payload?.item || payload;
}

export async function fetchWorkflowFiles(params = {}) {
  const search = new URLSearchParams();
  if (params.projectId) search.set("projectId", params.projectId);
  if (params.category && params.category !== "All") search.set("category", params.category);
  if (params.status && params.status !== "All") search.set("status", params.status);
  if (params.q) search.set("q", params.q);

  const query = search.toString() ? `?${search.toString()}` : "";
  const response = await fetch(`/api/files${query}`, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to load workflow file state.");
  }

  return payload;
}

export async function mutateWorkflowFile(action, body = {}) {
  const response = await fetch("/api/files", {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ action, ...body }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to mutate workflow file state.");
  }

  return payload;
}

export async function fetchCanonicalFiles(params = {}) {
  const search = new URLSearchParams();
  if (params.customerId) search.set("customerId", params.customerId);
  if (params.projectId) search.set("projectId", params.projectId);
  if (params.category && params.category !== "All") search.set("category", params.category);
  if (params.status && params.status !== "All") search.set("status", params.status);
  if (params.q) search.set("q", params.q);

  const query = search.toString() ? `?${search.toString()}` : "";
  const response = await fetch(`/api/files${query}`, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await response.json().catch(() => ([]));
  if (!response.ok) {
    throw new Error("Unable to load canonical file state.");
  }

  return Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
}

export async function registerCanonicalFiles(body = {}) {
  const response = await fetch("/api/files", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to register canonical files.");
  }

  return payload?.items || payload;
}

export async function upsertCanonicalFile(file = {}) {
  const response = await fetch("/api/files", {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(file),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to update canonical file state.");
  }

  return payload?.item || payload;
}

export async function fetchWorkflowAudit(params = {}) {
  const search = new URLSearchParams();
  if (params.projectId) search.set("projectId", params.projectId);
  if (params.eventType && params.eventType !== "All") search.set("eventType", params.eventType);
  if (params.actorType && params.actorType !== "All") search.set("actorType", params.actorType);
  if (params.q) search.set("q", params.q);

  const query = search.toString() ? `?${search.toString()}` : "";
  const response = await fetch(`/api/workflow-audit${query}`, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to load workflow audit state.");
  }

  return payload;
}

export async function fetchCanonicalDocumentBriefings(params = {}) {
  const search = new URLSearchParams();
  if (params.customerId) search.set("customerId", params.customerId);
  if (params.projectId) search.set("projectId", params.projectId);
  const query = search.toString() ? `?${search.toString()}` : "";

  const response = await fetch(`/api/document-briefings${query}`, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await response.json().catch(() => ([]));
  if (!response.ok) {
    throw new Error("Unable to load canonical document briefings.");
  }

  return Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
}

export async function createCanonicalDocumentBriefing(body = {}) {
  const response = await fetch("/api/document-briefings", {
    method: "POST",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to create canonical document briefing.");
  }

  return payload?.item || payload;
}

export async function fetchOpportunityWorkspace(opportunityId) {
  const response = await fetch(`/api/opportunities/${encodeURIComponent(opportunityId)}/workspace`, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok || !payload?.item) {
    throw new Error(payload?.error || "Unable to load opportunity workspace.");
  }

  return payload;
}

export async function fetchProjectWorkspace(projectId) {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/workspace`, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok || !payload?.item) {
    throw new Error(payload?.error || "Unable to load project workspace.");
  }

  return payload;
}

export async function fetchFileSummary(ownerObjectType, ownerObjectId) {
  const search = new URLSearchParams();
  if (ownerObjectType) search.set("ownerObjectType", ownerObjectType);
  if (ownerObjectId) search.set("ownerObjectId", ownerObjectId);

  const response = await fetch(`/api/files/summary?${search.toString()}`, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

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

  const response = await fetch(`/api/audit-events/summary?${search.toString()}`, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok || !payload?.summary) {
    throw new Error(payload?.error || "Unable to load audit summary.");
  }

  return payload;
}
