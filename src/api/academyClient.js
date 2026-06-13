import { readCustomerSession } from "../customerSession";

function resolveAcademyTenant() {
  const session = readCustomerSession();
  return {
    customerId: session?.customerId || "CUST-FCA-LIVE-001",
    customerName: session?.company || session?.workspaceLabel || "Future Contractors of America Workspace",
  };
}

function buildAcademyQuery() {
  const tenant = resolveAcademyTenant();
  return `customerId=${encodeURIComponent(tenant.customerId)}&customerName=${encodeURIComponent(tenant.customerName)}`;
}

export async function fetchAcademyLms() {
  const tenant = resolveAcademyTenant();
  const response = await fetch(`/api/academy-lms?${buildAcademyQuery()}`, {
    method: "GET",
    credentials: "same-origin",
    headers: {
      Accept: "application/json",
      "X-FCA-Customer-Id": tenant.customerId,
      "X-FCA-Customer-Name": tenant.customerName,
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to load academy state.");
  }

  return payload;
}

export async function mutateAcademyLms(action, body = {}) {
  const tenant = resolveAcademyTenant();
  const response = await fetch("/api/academy-lms", {
    method: "PATCH",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-FCA-Customer-Id": tenant.customerId,
      "X-FCA-Customer-Name": tenant.customerName,
    },
    body: JSON.stringify({
      action,
      customerId: tenant.customerId,
      customerName: tenant.customerName,
      ...body,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || "Unable to mutate academy state.");
  }

  return payload;
}
