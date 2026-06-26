/** Production host detection — no demo fallbacks on live FCA domains. */

export function isProductionHost() {
  if (typeof window === "undefined") {
    return import.meta.env.PROD;
  }
  const host = (window.location.hostname || "").toLowerCase();
  return !host.includes("localhost") && !host.includes("127.0.0.1");
}

export function allowDemoFallbacks() {
  return !isProductionHost();
}
