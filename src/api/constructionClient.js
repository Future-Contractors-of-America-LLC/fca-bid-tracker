import { centralFetch } from "./backendBase";
import { isCteSafeModeEnabled } from "../lib/cteSafeModeConfig";
import { enqueueInstructorReview } from "../lib/instructorReviewQueue";

async function readJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchJobCosts(projectId) {
  const search = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
  const response = await centralFetch(`/api/job-cost${search}`, { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to load job costs.");
  return payload;
}

export async function postJobCostActual(body) {
  const response = await centralFetch("/api/job-cost", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to post job cost actual.");
  return payload;
}

export async function fetchCloseoutPackages(projectId) {
  const search = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
  const response = await centralFetch(`/api/closeout-packages${search}`, { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to load closeout packages.");
  return payload;
}

export async function createCloseoutPackage(body) {
  const response = await centralFetch("/api/closeout-packages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to create closeout package.");
  return payload;
}

export async function advanceCloseoutPackage(body) {
  if (isCteSafeModeEnabled()) {
    const reviewItem = await enqueueInstructorReview({
      actionType: "advance-closeout-package",
      sourceRoute: body?.sourceRoute || "/portal/closeout",
      targetObjectType: "CloseoutPackage",
      targetObjectId: String(body?.closeoutPackageId || ""),
      summary: `Closeout package requires instructor approval before status change (${body?.status || "in_progress"}).`,
      payload: body,
    });
    return {
      ok: true,
      deterministic: true,
      pendingReview: true,
      reviewItem,
      message: "Safe-Mode active: closeout advancement queued for instructor review.",
    };
  }

  const response = await centralFetch("/api/closeout-packages", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "advance-closeout-package", ...body }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to advance closeout package.");
  return payload;
}

export async function fetchWarrantyCases(projectId) {
  const search = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
  const response = await centralFetch(`/api/warranty-cases${search}`, { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to load warranty cases.");
  return payload;
}

export async function createWarrantyCase(body) {
  const response = await centralFetch("/api/warranty-cases", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to create warranty case.");
  return payload;
}

export async function advanceWarrantyCase(body) {
  if (isCteSafeModeEnabled()) {
    const reviewItem = await enqueueInstructorReview({
      actionType: "advance-warranty-case",
      sourceRoute: body?.sourceRoute || "/portal/warranty",
      targetObjectType: "WarrantyCase",
      targetObjectId: String(body?.warrantyCaseId || ""),
      summary: `Warranty case requires instructor approval before status change (${body?.status || "in_progress"}).`,
      payload: body,
    });
    return {
      ok: true,
      deterministic: true,
      pendingReview: true,
      reviewItem,
      message: "Safe-Mode active: warranty progression queued for instructor review.",
    };
  }

  const response = await centralFetch("/api/warranty-cases", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "advance-warranty-case", ...body }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to advance warranty case.");
  return payload;
}

export async function fetchChangeOrders(projectId) {
  const search = projectId ? `?projectId=${encodeURIComponent(projectId)}` : "";
  const response = await centralFetch(`/api/change-orders${search}`, { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to load change orders.");
  return payload;
}

export async function fetchProjectRfis(projectId) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/rfis`, { method: "GET" });
  const payload = await readJsonSafe(response);
  if (!response.ok) throw new Error(payload?.error || "Unable to load RFIs.");
  return payload?.data?.items || payload?.items || [];
}

export async function createProjectRfi(projectId, body) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/rfis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, sourceRoute: body?.sourceRoute || "/portal/rfis" }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || payload?.ok === false) throw new Error(payload?.error || "Unable to create RFI.");
  return payload?.data?.item || payload?.item || payload?.data || payload;
}

export async function respondProjectRfi(projectId, rfiId, responseText) {
  const response = await centralFetch(`/api/projects/${encodeURIComponent(projectId)}/rfis`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rfiId, response: responseText, sourceRoute: "/portal/rfis" }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || payload?.ok === false) throw new Error(payload?.error || "Unable to save RFI response.");
  return payload?.data?.item || payload?.item || payload?.data || payload;
}

export async function createChangeOrder(body) {
  const response = await centralFetch("/api/change-orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, sourceRoute: body?.sourceRoute || "/portal/change-orders" }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to create change order.");
  return payload;
}

export async function advanceChangeOrder(body) {
  if (isCteSafeModeEnabled()) {
    const reviewItem = await enqueueInstructorReview({
      actionType: "advance-change-order",
      sourceRoute: body?.sourceRoute || "/portal/change-orders",
      targetObjectType: "ChangeOrder",
      targetObjectId: String(body?.changeOrderId || ""),
      summary: `Change-order signoff requires instructor approval before financial finality (${body?.status || "approved"}).`,
      payload: body,
    });
    return {
      ok: true,
      deterministic: true,
      pendingReview: true,
      reviewItem,
      message: "Safe-Mode active: change-order advancement queued for instructor review.",
    };
  }

  const response = await centralFetch("/api/change-orders", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "advance-change-order", ...body, sourceRoute: body?.sourceRoute || "/portal/change-orders" }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to advance change order.");
  return payload;
}
