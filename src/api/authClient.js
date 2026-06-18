import { centralFetch } from "./backendBase";

async function readJsonSafe(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchCustomerAuthState() {
  const response = await centralFetch("/api/customer-auth-state", { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    const statusSuffix = response.status ? ` (status ${response.status})` : "";
    throw new Error(payload?.error || `Unable to load customer auth state${statusSuffix}.`);
  }
  return payload;
}
