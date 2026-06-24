/** Canonical commercial checkout paths for self-serve revenue lanes. */
const PORTAL_ORIGIN =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_FCA_PORTAL_ORIGIN
    ? import.meta.env.VITE_FCA_PORTAL_ORIGIN.replace(/\/$/, "")
    : "https://futurecontractorsofamerica.com";

export const PILOT_CHECKOUT_URL = `${PORTAL_ORIGIN}/checkout?plan=pilot`;

export const STARTUP_CHECKOUT_URL = `${PORTAL_ORIGIN}/checkout?plan=startup`;

/** @deprecated Stripe buy links — use FCA native checkout paths instead. */
export const LEGACY_STRIPE_PILOT_URL = "https://buy.stripe.com/bJe14o0fQ5Pn8Tt7Bw5gc01";

export const commercialOffers = {
  pilot: {
    id: "pilot",
    name: "FCA Pilot (30 Days)",
    priceLabel: "$2,500 one-time",
    checkoutUrl: PILOT_CHECKOUT_URL,
    status: "active",
  },
  startup: {
    id: "startup",
    name: "FCA Startup Workspace",
    priceLabel: "$99/mo",
    checkoutUrl: STARTUP_CHECKOUT_URL,
    status: "active",
  },
};

function workspaceCheckoutPath(tierKey, options = {}) {
  const params = new URLSearchParams({ plan: tierKey });
  if (options.email) params.set("email", options.email);
  if (options.ref) params.set("ref", options.ref);
  if (options.cancelled) params.set("cancelled", "1");
  return `/checkout?${params.toString()}`;
}

/** Prefer workspaceCheckoutHref — FCA native checkout is the primary payment rail. */
export function checkoutUrlForTier(tierKey) {
  if (!tierKey) return "/checkout";
  return workspaceCheckoutPath(tierKey);
}

export function checkoutPathForTier(tierKey, options = {}) {
  if (!tierKey) return "/checkout";
  return workspaceCheckoutPath(tierKey, options);
}
