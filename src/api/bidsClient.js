/**
 * Auricrux Central bids API client (frontend-only, read-mostly).
 * Keeps bid fetch logic out of portal hooks to avoid cross-agent conflicts.
 */
import { centralFetch } from "./backendBase";

export function slugifyCustomerId(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "default-customer";
}

export function resolveCustomerIdFromSearch(searchParams) {
  if (!searchParams) return "";
  const direct =
    searchParams.get("customerId") ||
    searchParams.get("customer_id") ||
    "";
  if (direct) return direct.trim();

  const slugSource =
    searchParams.get("customer") ||
    searchParams.get("company") ||
    searchParams.get("customerName") ||
    "";
  return slugSource ? slugifyCustomerId(slugSource) : "";
}

export async function fetchBids(options = {}) {
  const customerId = options.customerId ? String(options.customerId).trim() : "";

  if (customerId) {
    try {
      const qs = "?" + new URLSearchParams({ customerId }).toString();
      const response = await centralFetch("/api/bids" + qs, { method: "GET" });
      const payload = await response.json().catch(() => []);
      if (response.ok && Array.isArray(payload)) {
        return payload;
      }
    } catch {
      // Fall through to client-side scope when partition filter is unavailable.
    }
  }

  const response = await centralFetch("/api/bids", { method: "GET" });
  const payload = await response.json().catch(() => []);
  if (!response.ok) {
    throw new Error(
      (payload && payload.error) || "Unable to load bids from Auricrux Central.",
    );
  }
  const all = Array.isArray(payload) ? payload : [];
  if (!customerId) return all;

  const normalized = customerId.toLowerCase();
  return all.filter((bid) => {
    const bidCustomerId = String(bid.customerId || "").toLowerCase();
    if (bidCustomerId === normalized) return true;
    return slugifyCustomerId(bid.company || bid.customerName || "") === normalized;
  });
}

export async function fetchBidById(bidId, options = {}) {
  const bids = await fetchBids(options);
  return bids.find((bid) => bid.id === bidId) || null;
}
