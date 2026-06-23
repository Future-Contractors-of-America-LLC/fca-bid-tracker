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

export async function fetchPortalMessages() {
  const response = await centralFetch("/api/portal-messages", { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to load portal messages"));
  }
  return payload;
}

export async function sendPortalMessage(body) {
  const response = await centralFetch("/api/portal-messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to send portal message"));
  }
  return payload;
}

export async function fetchPortalInvoices() {
  const response = await centralFetch("/api/portal-invoices", { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to load portal invoices"));
  }
  return payload;
}

export async function createPortalInvoice(body) {
  const response = await centralFetch("/api/portal-invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to create portal invoice"));
  }
  return payload;
}

export async function issuePortalInvoice(invoiceId) {
  const response = await centralFetch("/api/portal-invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "issue", invoiceId }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to issue portal invoice"));
  }
  return payload;
}

export async function fetchInvoiceSummary(invoiceId, options = {}) {
  const params = new URLSearchParams();
  if (options.companyName) params.set("companyName", options.companyName);
  const query = params.toString() ? `?${params.toString()}` : "";
  let response = await centralFetch(`/api/portal-invoices/${encodeURIComponent(invoiceId)}${query}`, { method: "GET" });
  if (response.status === 404) {
    const fallbackParams = new URLSearchParams({ invoiceId });
    if (options.companyName) fallbackParams.set("companyName", options.companyName);
    response = await centralFetch(`/api/portal-invoices?${fallbackParams.toString()}`, { method: "GET" });
  }
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to load invoice summary"));
  }
  return payload;
}

export async function deliverPortalInvoice(invoiceId, options = {}) {
  const response = await centralFetch("/api/portal-invoices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "deliver",
      invoiceId,
      companyName: options.companyName,
      recipientEmail: options.recipientEmail,
    }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to deliver invoice"));
  }
  return payload;
}

export async function fetchBillingSummary() {
  const response = await centralFetch("/api/billing-summary", { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to load billing summary"));
  }
  return payload;
}

export async function fetchSupportTickets() {
  const response = await centralFetch("/api/support-tickets", { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to load support tickets"));
  }
  return payload;
}

export async function createSupportTicket(body) {
  const response = await centralFetch("/api/support-tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to create support ticket"));
  }
  return payload;
}

export async function resolveSupportTicket(ticketId) {
  const response = await centralFetch("/api/support-tickets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "resolve", ticketId }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) {
    throw new Error(formatApiError(response, payload, "Unable to resolve support ticket"));
  }
  return payload;
}
