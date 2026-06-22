import { centralFetch } from "./backendBase";

function unwrap(payload) {
  if (!payload?.ok) {
    throw new Error(payload?.error || "Design Workspace request failed.");
  }
  return payload.data ?? payload;
}

export async function fetchFileManifest(fileId) {
  const response = await centralFetch(`/api/files/${encodeURIComponent(fileId)}/manifest`, { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to load sheet manifest.");
  }
  return unwrap(payload);
}

export async function fetchDesignIntelligence(projectId, params = {}) {
  const search = new URLSearchParams();
  if (params.fileId) search.set("fileId", params.fileId);
  if (params.sheetId) search.set("sheetId", params.sheetId);
  const query = search.toString() ? `?${search.toString()}` : "";
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/design/intelligence${query}`, { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to load design intelligence.");
  return unwrap(payload);
}

export async function fetchDesignLayers(projectId, fileId) {
  const response = await centralFetch(
    `/api/projects/${encodeURIComponent(projectId)}/design/layers?fileId=${encodeURIComponent(fileId)}`,
    { method: "GET" },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to load markup layers.");
  return unwrap(payload);
}

export async function fetchViewerToken(projectId, fileId, options = {}) {
  const params = new URLSearchParams({ fileId: String(fileId) });
  if (options.format) params.set("format", String(options.format));
  const method = options.queue ? "POST" : "GET";
  const response = await centralFetch(
    `/api/projects/${encodeURIComponent(projectId)}/design/viewer-token?${params.toString()}`,
    {
      method,
      headers: method === "POST" ? { "Content-Type": "application/json" } : undefined,
      body: method === "POST" ? JSON.stringify({ queue: true, format: options.format || "" }) : undefined,
    },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to load viewer session.");
  return unwrap(payload);
}

export async function fetchFileContent(fileId) {
  const response = await centralFetch(`/api/files/${encodeURIComponent(fileId)}/content`, { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to load file content.");
  }
  return unwrap(payload);
}

export async function uploadDesignFile(actionBody) {
  const response = await centralFetch("/api/files", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "upload-binary", ...actionBody }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to upload design file.");
  }
  return payload;
}

export async function fetchDesignSessions(projectId) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/design/sessions`, { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to load design sessions.");
  }
  return unwrap(payload);
}

export async function createDesignSession(projectId, body = {}) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/design/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to create design session.");
  }
  return unwrap(payload);
}

export async function fetchDesignMarkups(projectId, params = {}) {
  const search = new URLSearchParams();
  if (params.fileId) search.set("fileId", params.fileId);
  if (params.sheetId) search.set("sheetId", params.sheetId);
  const query = search.toString() ? `?${search.toString()}` : "";
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/design/markups${query}`, { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to load markups.");
  }
  return unwrap(payload);
}

export async function createDesignMarkup(projectId, body = {}) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/design/markups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to create markup.");
  }
  return unwrap(payload);
}

export async function updateDesignMarkup(projectId, body = {}) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/design/markups`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to update markup.");
  }
  return unwrap(payload);
}

export async function fetchDesignContext(projectId, params = {}) {
  const search = new URLSearchParams();
  if (params.fileId) search.set("fileId", params.fileId);
  if (params.sheetId) search.set("sheetId", params.sheetId);
  const query = search.toString() ? `?${search.toString()}` : "";
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/design/context${query}`, { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to load design context.");
  }
  return unwrap(payload);
}

export async function createTakeoffFromMarkup(projectId, body = {}) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/takeoffs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to create takeoff.");
  }
  return payload?.data ?? payload;
}

export async function startDesignCollab(projectId, body = {}) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/design/collab`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to start collaboration session.");
  }
  return unwrap(payload);
}

export async function compareRevisions(projectId, body = {}) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/design/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to compare revisions.");
  }
  return unwrap(payload);
}

export async function linkMarkupToRfi(projectId, markupId, body = {}) {
  const response = await centralFetch(
    `/api/projects/${encodeURIComponent(projectId)}/design/markups/${encodeURIComponent(markupId)}/rfi`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to link markup to RFI.");
  }
  return unwrap(payload);
}

export async function exportDesignPackage(projectId, body = {}) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/design/export`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to export design package.");
  }
  return unwrap(payload);
}

export async function fetchCadDocument(projectId, fileId) {
  const response = await centralFetch(
    `/api/projects/${encodeURIComponent(projectId)}/design/cad?fileId=${encodeURIComponent(fileId)}`,
    { method: "GET" },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to load CAD document.");
  }
  return unwrap(payload);
}

export async function saveCadDocument(projectId, body = {}) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/design/cad`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to save CAD document.");
  }
  return unwrap(payload);
}

export async function fetchBimModel(projectId, fileId) {
  const response = await centralFetch(
    `/api/projects/${encodeURIComponent(projectId)}/design/bim?fileId=${encodeURIComponent(fileId)}`,
    { method: "GET" },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to load BIM model.");
  }
  return unwrap(payload);
}

export async function saveBimModel(projectId, body = {}) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/design/bim`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to save BIM model.");
  }
  return unwrap(payload);
}

export async function runBimClashDetection(projectId, fileId) {
  const response = await centralFetch(
    `/api/projects/${encodeURIComponent(projectId)}/design/bim?fileId=${encodeURIComponent(fileId)}&action=clash`,
    { method: "GET" },
  );
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || "Unable to run clash detection.");
  }
  return unwrap(payload);
}
