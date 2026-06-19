/**
 * FCA ↔ Auricrux Central API contract (frontend source of truth).
 * Backend: auricrux-central (Azure Function App)
 * Mobile: auricrux-mobile-maui
 */
(function (global) {
  const CENTRAL_API =
    global.FCA_CENTRAL_API ||
    "https://auricrux-central.azurewebsites.net/api";

  const PILOT_PAYMENT_LINK =
    global.FCA_PILOT_PAYMENT_LINK ||
    "https://buy.stripe.com/bJe14o0fQ5Pn8Tt7Bw5gc01";

  function url(path) {
    return CENTRAL_API + path;
  }

  function pilotCheckoutUrl(referenceId) {
    return (
      PILOT_PAYMENT_LINK +
      "?client_reference_id=" +
      encodeURIComponent(referenceId || "")
    );
  }

  async function centralFetch(path, options) {
    const response = await fetch(url(path), {
      cache: "no-store",
      ...(options || {})
    });
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    if (!response.ok) {
      const message =
        (data && typeof data === "object" && (data.error || data.message)) ||
        (typeof data === "string" ? data : "") ||
        "Request failed (" + response.status + ")";
      throw new Error(message);
    }
    return data;
  }

  global.FCA_AURICRUX = {
    CENTRAL_API: CENTRAL_API,
    PILOT_PAYMENT_LINK: PILOT_PAYMENT_LINK,
    bidsUrl: url("/bids"),
    leadsUrl: url("/leads"),
    commercialPipelineUrl: url("/commercial-pipeline"),
    onboardingUrl: url("/onboarding"),
    stripeCheckoutUrl: url("/stripe-checkout"),
    stripeWebhookUrl: url("/stripe/webhook"),
    executeUrl: url("/execute"),
    healthUrl: url("/health"),
    statusUrl: url("/status"),
    auricruxChatUrl: url("/auricrux"),
    url: url,
    pilotCheckoutUrl: pilotCheckoutUrl,
    centralFetch: centralFetch,
    fetchBids: function (query) {
      const qs = query ? "?" + new URLSearchParams(query).toString() : "";
      return centralFetch("/bids" + qs);
    },
    postBid: function (payload) {
      return centralFetch("/bids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    }
  };
})(window);
