import { centralFetch } from "./backendBase";

async function readJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function formatApiError(response, payload, fallbackMessage) {
  const statusSuffix = response.status ? ` (status ${response.status})` : "";
  return payload?.error || `${fallbackMessage}${statusSuffix}.`;
}

export async function fetchImmersiveSession(projectId) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/immersive/session`, { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to load immersive session"));
  }
  return payload.data || payload;
}

export async function startImmersiveLab(projectId, body = {}) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/immersive/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "start",
      labType: body.labType || "field-overlay",
      vrMode: body.vrMode || "field-overlay-lab",
      sourceRoute: body.sourceRoute || "/portal/immersive",
    }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to start immersive lab"));
  }
  return payload.session || payload.data?.session || payload;
}

export async function recordImmersiveEvidence(projectId, sessionId, body = {}) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/immersive/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "record-evidence",
      sessionId,
      evidenceType: body.evidenceType || "field-overlay-note",
      note: body.note || "",
      vrMode: body.vrMode,
      sourceRoute: body.sourceRoute || "/portal/immersive",
    }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to record immersive evidence"));
  }
  return payload.session || payload;
}

export function detectWebXrSupport() {
  if (typeof navigator === "undefined") return false;
  return Boolean(navigator.xr && typeof navigator.xr.isSessionSupported === "function");
}

export async function probeImmersiveVrSupport() {
  if (!detectWebXrSupport()) {
    return { webXr: false, immersiveVr: false, recommendedMode: "desktop-simulation" };
  }
  try {
    const immersiveVr = await navigator.xr.isSessionSupported("immersive-vr");
    return {
      webXr: true,
      immersiveVr,
      recommendedMode: immersiveVr ? "immersive-vr" : "field-overlay-lab",
    };
  } catch {
    return { webXr: true, immersiveVr: false, recommendedMode: "field-overlay-lab" };
  }
}
