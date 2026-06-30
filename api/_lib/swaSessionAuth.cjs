/**
 * Shared session auth for legacy SWA api/*/index.js proxies (CommonJS).
 * Keep idle-timeout and student-role rules aligned with auth-boundary.js.
 */
const crypto = require("crypto");

const SESSION_COOKIE_NAME = "fca_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const STUDENT_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const DEFAULT_SESSION_SECRET = "FCA_SERVER_SESSION_DEV_ONLY_CHANGE_ME";

function getSessionSecret() {
  return process.env.FCA_SESSION_SECRET || DEFAULT_SESSION_SECRET;
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function readSessionToken(req) {
  const cookieHeader = (req.headers && req.headers.cookie) || "";
  const parts = String(cookieHeader)
    .split(";")
    .map((p) => p.trim())
    .filter(Boolean);
  const match = parts.find((p) => p.startsWith(`${SESSION_COOKIE_NAME}=`));
  return match ? match.slice(SESSION_COOKIE_NAME.length + 1) : null;
}

function isStudentRole(role) {
  return role === "student" || role === "cte-student";
}

function createSessionCookie(account, now = Date.now()) {
  const payload = JSON.stringify({
    ...account,
    lastActiveAt: now,
    exp: now + SESSION_TTL_SECONDS * 1000,
  });
  const encodedPayload = base64UrlEncode(payload);
  const signature = signPayload(encodedPayload);
  const token = `${encodedPayload}.${signature}`;
  const cookie = `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_SECONDS}; SameSite=Strict; Secure`;
  return { token, cookie };
}

function validateSessionToken(token, now = Date.now()) {
  if (!token || !token.includes(".")) return null;
  const [encodedPayload, providedSignature] = token.split(".");
  if (signPayload(encodedPayload) !== providedSignature) return null;
  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload?.exp || payload.exp < now) return null;
    if (isStudentRole(payload.role)) {
      const lastActive = payload.lastActiveAt || 0;
      if (now - lastActive > STUDENT_IDLE_TIMEOUT_MS) {
        return { idleTimeout: true, payload };
      }
    }
    return { session: payload };
  } catch {
    return null;
  }
}

function requireAuthFromSwaReq(req, now = Date.now()) {
  const token = readSessionToken(req);
  const result = validateSessionToken(token, now);
  if (!result) {
    return {
      ok: false,
      response: {
        status: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 401,
          ok: false,
          error: "Authentication required.",
          authContext: { authenticated: false, source: "missing-session" },
        }),
      },
    };
  }
  if (result.idleTimeout) {
    return {
      ok: false,
      response: {
        status: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: 401,
          ok: false,
          error: "Authentication required.",
          authContext: { authenticated: false, source: "idle-timeout", reason: "idle-timeout" },
        }),
      },
    };
  }
  const { cookie: refreshCookie } = createSessionCookie({ ...result.session, lastActiveAt: now }, now);
  return { ok: true, session: result.session, refreshCookie };
}

function withSwaSessionAuth(proxyHandler) {
  return async function guardedHandler(context, req) {
    if (req.method === "OPTIONS") {
      context.res = { status: 204, body: "" };
      return;
    }
    const auth = requireAuthFromSwaReq(req);
    if (!auth.ok) {
      context.res = auth.response;
      return;
    }
    await proxyHandler(context, req);
    if (context.res && auth.refreshCookie) {
      context.res.headers = {
        ...(context.res.headers || {}),
        "Set-Cookie": auth.refreshCookie,
      };
    }
  };
}

module.exports = {
  requireAuthFromSwaReq,
  withSwaSessionAuth,
};
