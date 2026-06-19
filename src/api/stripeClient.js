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

function formatApiError(response, payload, fallbackMessage) {
  const statusSuffix = response.status ? ` (status ${response.status})` : "";
  return payload?.error || `${fallbackMessage}${statusSuffix}.`;
}

export async function createStripeCheckout(body) {
  const response = await centralFetch("/api/stripe-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to start Stripe checkout"));
  }
  return payload;
}

export async function createInvoiceCheckout(invoiceId, options = {}) {
  return createStripeCheckout({
    action: "invoice",
    invoiceId,
    successUrl: options.successUrl,
    cancelUrl: options.cancelUrl,
    customerEmail: options.customerEmail,
  });
}

export async function createPlanCheckout(planKey, options = {}) {
  return createStripeCheckout({
    action: "plan",
    planKey,
    successUrl: options.successUrl,
    cancelUrl: options.cancelUrl,
    customerEmail: options.customerEmail,
  });
}
