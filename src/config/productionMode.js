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

/** Seeded/autologin theater is local-dev only. Production requires managed login. */
export function allowSeededLogin() {
  return !isProductionHost();
}

/** Canonical live project used by the Founder Proof Path (Package A-117). */
export const FOUNDER_PROOF_PROJECT_ID = "PRJ-BID-1";
export const FOUNDER_PROOF_PROJECT_LABEL = "Package A-117";
export const FOUNDER_PROOF_PATH = "/portal/proof";
