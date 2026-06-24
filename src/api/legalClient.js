import { centralFetch } from "./backendBase";

async function readJson(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchLegalWorkspace() {
  const response = await centralFetch("/api/legal-workspace");
  const payload = await readJson(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to load legal workspace.");
  }
  return payload.workspace;
}

export async function saveLegalWorkspace(workspace) {
  const response = await centralFetch("/api/legal-workspace", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workspace }),
  });
  const payload = await readJson(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to save legal workspace.");
  }
  return payload.workspace;
}
