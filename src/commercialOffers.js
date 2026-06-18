/** Canonical commercial checkout URLs for self-serve revenue lanes. */
export const PILOT_CHECKOUT_URL =
  "https://buy.stripe.com/bJe14o0fQ5Pn8Tt7Bw5gc01";

export const STARTUP_CHECKOUT_URL =
  typeof import.meta !== "undefined" && import.meta.env?.VITE_STRIPE_STARTUP_CHECKOUT_URL
    ? import.meta.env.VITE_STRIPE_STARTUP_CHECKOUT_URL
    : "";

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
    status: STARTUP_CHECKOUT_URL ? "active" : "pending_link",
  },
};

export function checkoutUrlForTier(tierKey) {
  if (tierKey === "pilot") return PILOT_CHECKOUT_URL;
  if (tierKey === "startup") return STARTUP_CHECKOUT_URL || null;
  return null;
}
