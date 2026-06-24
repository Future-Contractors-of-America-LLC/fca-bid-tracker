import { centralFetch } from "./backendBase";

export async function fetchCustomerEntitlements() {
  const response = await centralFetch("/api/customer-entitlements", { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to load customer entitlements.");
  }
  return payload;
}

export async function mutateCustomerEntitlements(body) {
  const response = await centralFetch("/api/customer-entitlements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    return { ok: false, error: payload?.error || "Entitlement change rejected by server." };
  }
  return payload;
}
