import { centralFetch } from "./backendBase";
import {
  academyCourseCheckoutFromCatalog,
  academyPathwayCheckoutFromCatalog,
  loadStripeCatalog,
} from "../stripeCatalog.js";

async function readJsonSafe(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return null;
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function resolveAcademyCheckoutUrl({ programKey, pathwayKey } = {}) {
  const catalog = await loadStripeCatalog();
  if (programKey) {
    const url = academyCourseCheckoutFromCatalog(catalog, programKey);
    if (url) return { checkoutUrl: url, fallbackLink: true, programKey };
  }
  if (pathwayKey) {
    const url = academyPathwayCheckoutFromCatalog(catalog, pathwayKey);
    if (url) return { checkoutUrl: url, fallbackLink: true, pathwayKey };
  }
  return null;
}

export async function createAcademyCheckout({ programKey, pathwayKey, buyerEmail, successUrl, cancelUrl } = {}) {
  try {
    const response = await centralFetch("/api/academy-commerce", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "checkout",
        programKey,
        pathwayKey,
        purchaseType: pathwayKey ? "pathway" : "course",
        buyerEmail,
        customerEmail: buyerEmail,
        successUrl,
        cancelUrl,
      }),
    });
    const payload = await readJsonSafe(response);
    if (response.ok && payload?.ok && payload?.checkoutUrl) {
      return payload;
    }
  } catch {
    // Fall through to catalog payment links.
  }

  const catalogFallback = await resolveAcademyCheckoutUrl({ programKey, pathwayKey });
  if (catalogFallback?.checkoutUrl) {
    return { ok: true, ...catalogFallback };
  }

  throw new Error("No Stripe checkout is configured for this academy offering.");
}
