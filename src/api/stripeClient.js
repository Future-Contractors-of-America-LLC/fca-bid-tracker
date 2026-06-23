import { centralApi } from "./backendBase";

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

function commerceEndpoints(path) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const urls = [];
  if (typeof window !== "undefined") {
    urls.push(`${window.location.origin}${normalized}`);
  }
  urls.push(centralApi(normalized));
  return [...new Set(urls)];
}

async function postCommerce(path, body) {
  let lastPayload = null;
  let lastStatus = 0;

  for (const url of commerceEndpoints(path)) {
    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "omit",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      const payload = await readJsonSafe(response);
      lastPayload = payload;
      lastStatus = response.status;

      if (response.status === 404 || response.status === 405 || response.status === 502) {
        continue;
      }

      if (!response.ok || !payload?.ok) {
        throw new Error(formatApiError(response, payload, "Unable to start Stripe checkout"));
      }

      return payload;
    } catch (error) {
      if (error.message?.includes("Unable to start Stripe checkout")) {
        throw error;
      }
      lastPayload = { error: error.message };
    }
  }

  throw new Error(formatApiError({ status: lastStatus }, lastPayload, "Unable to start Stripe checkout"));
}

export async function createStripeCheckout(body) {
  return postCommerce("/api/stripe-checkout", body);
}

export async function createInvoiceCheckout(invoiceId, options = {}) {
  return createStripeCheckout({
    action: "invoice",
    invoiceId,
    successUrl: options.successUrl,
    cancelUrl: options.cancelUrl,
    customerEmail: options.customerEmail,
    uiMode: options.uiMode,
    embedded: options.uiMode === "embedded",
    returnUrl: options.returnUrl || options.successUrl,
  });
}

export async function createPlanCheckout(planKey, options = {}) {
  const uiMode = options.uiMode || "embedded";
  return createStripeCheckout({
    action: "plan",
    planKey,
    successUrl: options.successUrl,
    cancelUrl: options.cancelUrl,
    returnUrl: options.returnUrl || options.successUrl,
    customerEmail: options.customerEmail,
    clientReferenceId: options.clientReferenceId,
    company: options.company,
    contactName: options.contactName,
    metadata: options.metadata,
    uiMode,
    embedded: uiMode === "embedded",
  });
}

export async function createAcademyCheckout(options = {}) {
  return createStripeCheckout({
    action: options.pathwayKey ? "academy-pathway" : "academy-course",
    purchaseType: options.purchaseType,
    programKey: options.programKey,
    pathwayKey: options.pathwayKey,
    successUrl: options.successUrl,
    cancelUrl: options.cancelUrl,
    customerEmail: options.buyerEmail || options.customerEmail,
    buyerEmail: options.buyerEmail || options.customerEmail,
  });
}

export async function createPortalBillingPortal(options = {}) {
  return createStripeCheckout({
    action: "portal",
    customerEmail: options.customerEmail,
    successUrl: options.returnUrl,
    returnUrl: options.returnUrl,
    uiMode: "redirect",
  });
}
