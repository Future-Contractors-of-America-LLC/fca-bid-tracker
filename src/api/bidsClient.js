import { centralFetch } from "./backendBase";

function unwrapNextActions(payload) {
  if (!payload?.ok) {
    throw new Error(payload?.error || "Bids next-actions request failed.");
  }
  return payload.data ?? payload;
}

export async function fetchBidsNextActions() {
  const response = await centralFetch("/api/bids/next-actions", { method: "GET" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error || "Unable to load bids next actions.");
  return unwrapNextActions(payload);
}
