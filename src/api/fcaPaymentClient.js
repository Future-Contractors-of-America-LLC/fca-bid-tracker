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

function unwrap(payload) {
  if (!payload?.ok) throw new Error(payload?.error || "FCA payment request failed.");
  return payload.data || payload;
}

export async function fetchFcaPaymentRailStatus() {
  const response = await centralFetch("/api/fca-payments/status", { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok) throw new Error(payload?.error || "Unable to load FCA payment rail status.");
  return unwrap(payload);
}

export async function createFcaPaymentIntake(body = {}) {
  const response = await centralFetch("/api/fca-payments/intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok) throw new Error(payload?.error || "Unable to create FCA payment intake.");
  return unwrap(payload);
}

export async function submitFcaNativeCheckout(body = {}) {
  const response = await centralFetch("/api/fca-payments/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok) throw new Error(payload?.error || "Unable to complete FCA native checkout.");
  return unwrap(payload);
}

export function stripeFallbackEnabled() {
  return import.meta.env?.VITE_FCA_STRIPE_FALLBACK === "1";
}
