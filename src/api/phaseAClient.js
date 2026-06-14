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
    throw new Error("Unable to load canonical projects.");
  }

  return Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];
}

export async function upsertCanonicalProject(project = {}) {
  const method = project?.id ? "PATCH" : "POST";
  const response = await fetch("/api/projects", {
    method,
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(project),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to save canonical project.");
  }

  return payload?.item || payload;
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
    throw new Error("Unable to load canonical files.");
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
    throw new Error(payload?.error || "Unable to update canonical file.");
  }

  return payload?.item || payload;
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
