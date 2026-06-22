export function stripePublishableKey() {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_STRIPE_PUBLISHABLE_KEY) {
    return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  }
  if (typeof window !== "undefined" && window.FCA_BACKEND?.stripePublishableKey) {
    return window.FCA_BACKEND.stripePublishableKey;
  }
  return "";
}
