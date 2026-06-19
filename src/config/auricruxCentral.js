export const CENTRAL_API =
  import.meta.env.VITE_AURICRUX_CENTRAL_API ||
  "https://auricrux-central.azurewebsites.net/api";

export const PILOT_PAYMENT_LINK =
  import.meta.env.VITE_FCA_PILOT_PAYMENT_LINK ||
  "https://buy.stripe.com/bJe14o0fQ5Pn8Tt7Bw5gc01";

export const bidsUrl = `${CENTRAL_API}/bids`;
export const leadsUrl = `${CENTRAL_API}/leads`;
export const commercialPipelineUrl = `${CENTRAL_API}/commercial-pipeline`;
export const executeUrl = `${CENTRAL_API}/execute`;
export const onboardingUrl = `${CENTRAL_API}/onboarding`;
export const stripeCheckoutUrl = `${CENTRAL_API}/stripe-checkout`;

export function pilotCheckoutUrl(referenceId) {
  return `${PILOT_PAYMENT_LINK}?client_reference_id=${encodeURIComponent(referenceId || "")}`;
}
