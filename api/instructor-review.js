import { app } from "@azure/functions";
import { createRequire } from "node:module";
import { requireAuth, withSessionRefresh } from "./auth-boundary.js";

const require = createRequire(import.meta.url);
const {
  enqueueInstructorReview,
  listInstructorReviewQueue,
  resolveInstructorReviewItem,
} = require("./_lib/runtime/cteSafeModeStore.cjs");
const {
  enforceSecurityHardeningForFetchRequest,
  toFetchSecurityResponse,
  writeTamperEvidentSecurityEvent,
} = require("./_lib/runtime/securityHardeningControls.cjs");

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function buildEnvelope(status, jsonBody) {
  return {
    status,
    jsonBody: {
      status,
      ok: status >= 200 && status < 400,
      error: status >= 400 ? jsonBody?.error || "Request failed." : null,
      ...(jsonBody || {}),
    },
  };
}

async function readJsonBody(request) {
  if (request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS") return {};
  try {
    return await request.json();
  } catch {
    return {};
  }
}

app.http("instructor-review", {
  methods: ["GET", "POST", "PATCH", "OPTIONS"],
  authLevel: "anonymous",
  route: "instructor-review",
  handler: async (request) => {
    if (request.method === "OPTIONS") return { status: 204 };

    const auth = requireAuth(request);
    if (!auth.ok) return auth.response;

    const security = await enforceSecurityHardeningForFetchRequest(request, {
      resourcePath: "/instructor-review",
      operation: "instructor-review",
    });
    if (!security.allowed) {
      return withSessionRefresh(toFetchSecurityResponse(security), auth);
    }

    if (request.method === "GET") {
      const url = new URL(request.url);
      const limit = parsePositiveInt(url.searchParams.get("limit"), 200);
      const status = url.searchParams.get("status") || "";
      const items = listInstructorReviewQueue({ limit, status });
      return withSessionRefresh(buildEnvelope(200, {
        items,
        count: items.length,
        backingSource: "cte-safe-mode-review-spine",
      }), auth);
    }

    const body = await readJsonBody(request);

    if (request.method === "POST") {
      const item = enqueueInstructorReview(body || {});
      writeTamperEvidentSecurityEvent({
        eventType: "instructor_review_enqueued",
        action: "instructor-review",
        principal: security.principal,
        resourcePath: "/instructor-review",
        outcome: "allowed",
        severity: "info",
        reason: "instructor-review-enqueued",
        payload: item,
        request,
      });
      return withSessionRefresh(buildEnvelope(200, {
        item,
        pendingReview: true,
        message: "Instructor review item queued.",
      }), auth);
    }

    if (request.method === "PATCH") {
      const result = resolveInstructorReviewItem(body?.id, body || {});
      if (!result.ok) {
        return withSessionRefresh(buildEnvelope(400, {
          ok: false,
          error: result.error || "Unable to resolve instructor review item.",
        }), auth);
      }
      writeTamperEvidentSecurityEvent({
        eventType: "instructor_review_resolved",
        action: "instructor-review",
        principal: security.principal,
        resourcePath: "/instructor-review",
        outcome: "allowed",
        severity: "medium",
        reason: `instructor-review-${String(result.item?.status || "resolved").toLowerCase()}`,
        payload: {
          id: result.item?.id,
          status: result.item?.status,
          resolution: result.item?.resolution || null,
        },
        request,
      });
      return withSessionRefresh(buildEnvelope(200, {
        item: result.item,
        message: "Instructor review item resolved.",
      }), auth);
    }

    return withSessionRefresh(buildEnvelope(405, {
      ok: false,
      error: "Method not allowed.",
    }), auth);
  },
});
