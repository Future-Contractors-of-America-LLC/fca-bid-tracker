const { withSwaSessionAuth } = require("../_lib/swaSessionAuth.cjs");
const {
  enqueueInstructorReview,
  listInstructorReviewQueue,
  resolveInstructorReviewItem,
} = require("../_lib/runtime/cteSafeModeStore");
const {
  corsHeaders,
} = require("../_lib/runtime/cteShadowEnvironment");
const {
  buildSecureProxyHeaders,
  enforceSecurityHardening,
  writeTamperEvidentSecurityEvent,
} = require("../_lib/runtime/securityHardeningControls");

const secureCorsHeaders = buildSecureProxyHeaders(corsHeaders);

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function parseStatusFromReq(req) {
  if (req.query?.status) return String(req.query.status);
  const raw = String(req.url || "");
  if (!raw.includes("?")) return "";
  const query = new URLSearchParams(raw.slice(raw.indexOf("?") + 1));
  return query.get("status") || "";
}

function parseLimitFromReq(req) {
  if (req.query?.limit) return parsePositiveInt(req.query.limit, 200);
  const raw = String(req.url || "");
  if (!raw.includes("?")) return 200;
  const query = new URLSearchParams(raw.slice(raw.indexOf("?") + 1));
  return parsePositiveInt(query.get("limit"), 200);
}

async function instructorReviewHandler(context, req) {
  const security = enforceSecurityHardening(req, {
    resourcePath: "/instructor-review",
    body: req.body || {},
    operation: "instructor-review",
  });
  if (!security.allowed) {
    context.res = {
      ...security.response,
      headers: buildSecureProxyHeaders({ ...corsHeaders, ...(security.response.headers || {}) }),
    };
    return;
  }

  if (req.method === "GET") {
    const limit = parseLimitFromReq(req);
    const status = parseStatusFromReq(req);
    const items = listInstructorReviewQueue({ limit, status });
    context.res = {
      status: 200,
      headers: secureCorsHeaders,
      body: {
        ok: true,
        status: 200,
        error: null,
        items,
        count: items.length,
        backingSource: "cte-safe-mode-review-spine",
      },
    };
    return;
  }

  if (req.method === "POST") {
    const item = enqueueInstructorReview(req.body || {});
    writeTamperEvidentSecurityEvent({
      eventType: "instructor_review_enqueued",
      action: "instructor-review",
      principal: security.principal,
      resourcePath: "/instructor-review",
      outcome: "allowed",
      severity: "info",
      reason: "instructor-review-enqueued",
      payload: item,
      request: req,
    });
    context.res = {
      status: 200,
      headers: secureCorsHeaders,
      body: {
        ok: true,
        status: 200,
        error: null,
        item,
        pendingReview: true,
        message: "Instructor review item queued.",
      },
    };
    return;
  }

  if (req.method === "PATCH") {
    const result = resolveInstructorReviewItem(req.body?.id, req.body || {});
    if (!result.ok) {
      context.res = {
        status: 400,
        headers: secureCorsHeaders,
        body: {
          ok: false,
          status: 400,
          error: result.error || "Unable to resolve instructor review item.",
        },
      };
      return;
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
      request: req,
    });

    context.res = {
      status: 200,
      headers: secureCorsHeaders,
      body: {
        ok: true,
        status: 200,
        error: null,
        item: result.item,
        message: "Instructor review item resolved.",
      },
    };
    return;
  }

  context.res = {
    status: 405,
    headers: secureCorsHeaders,
    body: {
      ok: false,
      status: 405,
      error: "Method not allowed.",
    },
  };
}

module.exports = withSwaSessionAuth(instructorReviewHandler);
