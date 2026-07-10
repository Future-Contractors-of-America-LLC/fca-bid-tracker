import { centralFetch } from "./backendBase";

export async function fetchEntraAuthStatus() {
  const response = await centralFetch("/api/customer-entra");
  const payload = await response.json();
  return {
    configured: Boolean(payload?.configured),
    enabled: Boolean(payload?.enabled),
    authBoundary: payload?.authBoundary || null,
  };
}

export async function startEntraSignIn(returnUrl) {
  const params = new URLSearchParams({
    action: "authorize",
    returnUrl: returnUrl || `${window.location.origin}/login`,
  });
  const response = await centralFetch(`/api/customer-entra?${params.toString()}`);
  const payload = await response.json();
  if (!response.ok || !payload?.authorizeUrl) {
    throw new Error(payload?.error || "Microsoft sign-in is unavailable.");
  }
  window.location.assign(payload.authorizeUrl);
}

export async function exchangeEntraSession(exchangeToken) {
  const response = await centralFetch("/api/customer-entra", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "exchange", exchange: exchangeToken }),
  });
  const payload = await response.json();
  if (!response.ok || !payload?.ok || !payload?.account) {
    throw new Error(payload?.error || "Microsoft sign-in could not be completed.");
  }
  return payload;
}

export function readEntraExchangeFromLocation() {
  if (typeof window === "undefined") return "";
  const params = new URLSearchParams(window.location.search);
  return params.get("entraExchange") || "";
}

export function clearEntraExchangeFromLocation() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has("entraExchange")) return;
  url.searchParams.delete("entraExchange");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}
