import { centralFetch } from "./backendBase";

async function readJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

async function probe(path) {
  try {
    const response = await centralFetch(path, { method: "GET" });
    const payload = await readJsonSafe(response);
    const ok = Boolean(response.ok && (payload?.ok ?? true));
    return {
      ok,
      status: response.status,
      source: payload?.backingSource || payload?.source || "central-api",
      error: ok ? null : payload?.error || "API probe failed.",
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      source: "offline",
      error: error?.message || "API probe failed.",
    };
  }
}

export function probeCommandTowerCapability() {
  return probe("/api/workflow-audit?limit=1");
}

export function probeDecisionQueueCapability() {
  return probe("/api/instructor-review?limit=1");
}

export function probeLegalCapability() {
  return probe("/api/customer-session");
}
