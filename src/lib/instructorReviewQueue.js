import { readCteSafeProfile } from "./cteSafeModeConfig";
import { centralFetch } from "../api/backendBase";

const INSTRUCTOR_REVIEW_QUEUE_KEY = "fca_cte_instructor_review_queue_v1";

function readQueue() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(INSTRUCTOR_REVIEW_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeQueue(items) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(INSTRUCTOR_REVIEW_QUEUE_KEY, JSON.stringify(items));
  } catch {
    // best effort only
  }
}

async function readJsonSafe(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function toApiQueueItem(reviewEvent = {}) {
  const profile = readCteSafeProfile();
  return {
    schoolId: reviewEvent.schoolId || profile.schoolId,
    courseCode: reviewEvent.courseCode || profile.courseCode,
    studentId: reviewEvent.studentId || profile.studentId,
    instructorId: reviewEvent.instructorId || profile.instructorId,
    actionType: reviewEvent.actionType || "operation",
    sourceRoute: reviewEvent.sourceRoute || "/portal/platform",
    targetObjectType: reviewEvent.targetObjectType || "Operation",
    targetObjectId: reviewEvent.targetObjectId || "",
    summary: reviewEvent.summary || "Student submitted an action for instructor review.",
    feedbackPayload: reviewEvent.feedbackPayload || "",
    payload: reviewEvent.payload || {},
  };
}

function toLocalFallbackQueueItem(reviewEvent = {}) {
  const profile = readCteSafeProfile();
  const now = new Date().toISOString();
  return {
    id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    status: "Pending Review",
    createdAt: now,
    updatedAt: now,
    schoolId: reviewEvent.schoolId || profile.schoolId,
    courseCode: reviewEvent.courseCode || profile.courseCode,
    studentId: reviewEvent.studentId || profile.studentId,
    instructorId: reviewEvent.instructorId || profile.instructorId,
    actionType: reviewEvent.actionType || "operation",
    sourceRoute: reviewEvent.sourceRoute || "/portal/platform",
    targetObjectType: reviewEvent.targetObjectType || "Operation",
    targetObjectId: reviewEvent.targetObjectId || "",
    summary: reviewEvent.summary || "Student submitted an action for instructor review.",
    feedbackPayload: reviewEvent.feedbackPayload || "",
    payload: reviewEvent.payload || {},
  };
}

export async function enqueueInstructorReview(reviewEvent = {}) {
  const requestBody = toApiQueueItem(reviewEvent);
  try {
    const response = await centralFetch("/api/instructor-review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    const payload = await readJsonSafe(response);
    const item = payload?.item;
    if (!response.ok || !payload?.ok || !item) throw new Error(payload?.error || "Unable to queue instructor review item.");
    writeQueue([item, ...readQueue().filter((current) => current.id !== item.id)].slice(0, 500));
    return item;
  } catch {
    const fallback = toLocalFallbackQueueItem(reviewEvent);
    writeQueue([fallback, ...readQueue()].slice(0, 500));
    return fallback;
  }
}

export async function listInstructorReviewQueue({ limit = 200, status = "" } = {}) {
  const search = new URLSearchParams();
  if (limit) search.set("limit", String(limit));
  if (status) search.set("status", String(status));
  const query = search.toString() ? `?${search.toString()}` : "";
  try {
    const response = await centralFetch(`/api/instructor-review${query}`, { method: "GET" });
    const payload = await readJsonSafe(response);
    const items = Array.isArray(payload?.items) ? payload.items : [];
    if (!response.ok || !payload?.ok) throw new Error(payload?.error || "Unable to load instructor review queue.");
    writeQueue(items.slice(0, 500));
    return items;
  } catch {
    return readQueue().slice(0, Math.max(1, Number(limit) || 200));
  }
}

export async function resolveInstructorReviewItem(id, resolution = {}) {
  if (!id) {
    throw new Error("Instructor review id is required.");
  }
  const response = await centralFetch("/api/instructor-review", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...resolution }),
  });
  const payload = await readJsonSafe(response);
  if (!response.ok || !payload?.ok || !payload?.item) {
    throw new Error(payload?.error || "Unable to resolve instructor review item.");
  }
  const item = payload.item;
  writeQueue([item, ...readQueue().filter((current) => current.id !== item.id)].slice(0, 500));
  return item;
}
