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

      if (response.status === 404 || response.status === 502) {
        continue;
      }

      if (response.ok && payload?.ok) {
        return payload;
      }
    } catch (error) {
      lastPayload = { error: error.message };
    }
  }

  const message = lastPayload?.error || `Unable to start academy checkout (status ${lastStatus}).`;
  throw new Error(message);
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
  return postCommerce("/api/academy-commerce", {
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
}
