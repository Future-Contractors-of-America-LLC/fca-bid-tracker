import { centralApi, centralFetch } from "./backendBase";
import { createFcaPaymentIntake, stripeFallbackEnabled } from "./fcaPaymentClient";
import {
  academyCourseCheckoutFromCatalog,
  academyPathwayCheckoutFromCatalog,
  loadStripeCatalog,
} from "../stripeCatalog.js";
import {
  academyDegradedError,
  classifyAcademyResponse,
  readAcademyResponse,
} from "./academyResponseGuard";

function formatApiError(response, payload, fallbackMessage) {
  const statusSuffix = response.status ? ` (status ${response.status})` : "";
  return payload?.error || `${fallbackMessage}${statusSuffix}.`;
}

/**
 * Slice 07 protective wrapper for academy-commerce reads. See
 * docs/SLICE_07_ACADEMY_PROTECTION.md for the upstream failure pattern
 * (auricrux-central /api/academy-commerce returning empty bodies).
 */
async function readAcademyCommerceApi(response, fallbackMessage) {
  const { payload, isEmptyBody } = await readAcademyResponse(response);
  const degraded = classifyAcademyResponse(response, payload, isEmptyBody);
  if (degraded) {
    throw academyDegradedError(degraded, fallbackMessage);
  }
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, fallbackMessage));
  }
  return payload;
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
  let lastEmptyBody = false;

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
      const { payload, isEmptyBody } = await readAcademyResponse(response);
      lastPayload = payload;
      lastStatus = response.status;
      lastEmptyBody = isEmptyBody;

      if (response.status === 404 || response.status === 405 || response.status === 502) {
        continue;
      }

      if (response.ok && payload?.ok) {
        return payload;
      }
    } catch (error) {
      lastPayload = { error: error.message };
    }
  }

  if (lastEmptyBody || lastStatus >= 500) {
    throw academyDegradedError(
      { kind: lastEmptyBody ? "empty-body" : "upstream-5xx", retriable: true, status: lastStatus },
      "Unable to start academy checkout",
    );
  }
  const message = lastPayload?.error || `Unable to start academy checkout (status ${lastStatus}).`;
  throw new Error(message);
}

export async function fetchAcademyCommerceCatalog(options = {}) {
  const params = new URLSearchParams();
  if (options.lane) params.set("lane", options.lane);
  if (options.purchaseType) params.set("purchaseType", options.purchaseType);
  if (Number.isFinite(options.offset)) params.set("offset", String(options.offset));
  if (Number.isFinite(options.limit)) params.set("limit", String(options.limit));
  const query = params.toString();
  const response = await centralFetch(`/api/academy-commerce${query ? `?${query}` : ""}`, { method: "GET" });
  return readAcademyCommerceApi(response, "Unable to load academy store");
}

export async function fetchAcademyCommerceItem({ programKey, pathwayKey } = {}) {
  const params = new URLSearchParams();
  if (programKey) params.set("programKey", programKey);
  if (pathwayKey) params.set("pathwayKey", pathwayKey);
  const response = await centralFetch(`/api/academy-commerce?${params.toString()}`, { method: "GET" });
  return readAcademyCommerceApi(response, "Unable to load store item");
}

export async function createAcademyCheckout({
  programKey,
  pathwayKey,
  buyerEmail,
  successUrl,
  cancelUrl,
  clientReferenceId,
  uiMode = "embedded",
} = {}) {
  try {
    const native = await createFcaPaymentIntake({
      offerKind: pathwayKey ? "academy-pathway" : "academy-course",
      programKey,
      pathwayKey,
      email: buyerEmail,
      clientReferenceId,
    });
    if (native?.intake?.intakeId) {
      return {
        ok: true,
        mode: "fca-native",
        intake: native.intake,
        invoiceId: native.invoiceId,
        methods: native.methods,
        instructions: native.instructions,
        programKey,
        pathwayKey,
      };
    }
  } catch (error) {
    if (!stripeFallbackEnabled()) {
      throw error;
    }
  }

  if (!stripeFallbackEnabled()) {
    throw new Error("FCA native academy checkout is required.");
  }

  try {
    const payload = await postCommerce("/api/academy-commerce", {
      action: "checkout",
      programKey,
      pathwayKey,
      purchaseType: pathwayKey ? "pathway" : "course",
      buyerEmail,
      customerEmail: buyerEmail,
      successUrl,
      cancelUrl,
      returnUrl: successUrl,
      clientReferenceId,
      uiMode,
      embedded: uiMode === "embedded",
    });
    if (payload?.clientSecret || payload?.checkoutUrl || payload?.mode === "fca-native" || payload?.intake) {
      return payload;
    }
  } catch (error) {
    // Stripe acceleration path only below.
  }

  const catalog = await loadStripeCatalog();
  const catalogUrl = programKey
    ? academyCourseCheckoutFromCatalog(catalog, programKey)
    : academyPathwayCheckoutFromCatalog(catalog, pathwayKey);
  if (catalogUrl) {
    return { ok: true, checkoutUrl: catalogUrl, fallbackLink: true, programKey, pathwayKey };
  }

  throw new Error("No Stripe checkout is configured for this academy offering.");
}

export async function startAcademyCheckout(body) {
  return createAcademyCheckout(body);
}

export async function submitAcademyContactSales(body) {
  const response = await centralFetch("/api/academy-commerce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "contact-sales", ...body }),
  });
  return readAcademyCommerceApi(response, "Unable to submit purchase request");
}

export async function enrollAfterAcademyPurchase(body) {
  const response = await centralFetch("/api/academy-commerce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "enroll-after-purchase", ...body }),
  });
  return readAcademyCommerceApi(response, "Unable to confirm enrollment");
}

export function formatUsd(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
