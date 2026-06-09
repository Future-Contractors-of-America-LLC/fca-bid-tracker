const API_ROUTE = "/api/continuity-objects";

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function createContinuityObjectRemote(input = {}) {
  const response = await fetch(API_ROUTE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = await safeJson(response);

  if (!response.ok || !payload?.ok) {
    const error = new Error(payload?.message || "Continuity object API request failed");
    error.payload = payload;
    throw error;
  }

  return payload.item;
}

export async function listContinuityObjectsRemote(projectId = "") {
  const query = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
  const response = await fetch(`${API_ROUTE}${query}`);
  const payload = await safeJson(response);

  if (!response.ok || !payload?.ok) {
    const error = new Error(payload?.message || "Continuity object listing failed");
    error.payload = payload;
    throw error;
  }

  return Array.isArray(payload.items) ? payload.items : [];
}

export function shouldUseRemoteContinuityApi() {
  return typeof fetch === "function";
}
