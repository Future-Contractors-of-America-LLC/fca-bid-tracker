/**
 * Shared session auth for legacy SWA api route index.js proxies (CommonJS).
 * Keep idle-timeout and student-role rules aligned with auth-boundary.js.
 */
const crypto = require("crypto");

const SESSION_COOKIE_NAME = "fca_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const ACCESS_TOKEN_TTL_SECONDS = 10 * 60;
const MAX_ACCESS_TOKEN_WINDOW_MS = 15 * 60 * 1000;
const STUDENT_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const DEFAULT_SESSION_SECRET = "FCA_SERVER_SESSION_DEV_ONLY_CHANGE_ME";

function envFlagEnabled(value = "") {
  return ["1", "true", "yes", "on"].includes(String(value || "").trim().toLowerCase());
}

function envFlagDisabled(value = "") {
  return ["0", "false", "no", "off"].includes(String(value || "").trim().toLowerCase());
}

function isProductionRuntime() {
  return envFlagEnabled(process.env.FCA_PRODUCTION_RUNTIME) || String(process.env.NODE_ENV || "").toLowerCase() === "production";
}

function requiresManagedSessionSecret() {
  if (envFlagDisabled(process.env.FCA_ENFORCE_MANAGED_SESSION_SECRET)) return false;
  return isProductionRuntime() || envFlagEnabled(process.env.FCA_ENFORCE_MANAGED_SESSION_SECRET);
}

function getSessionSecret() {
  if (process.env.FCA_SESSION_SECRET) return process.env.FCA_SESSION_SECRET;
  if (requiresManagedSessionSecret()) {
    throw new Error("FCA_SESSION_SECRET_REQUIRED: managed session signing secret is required in production runtime.");
  }
  return DEFAULT_SESSION_SECRET;
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

function isStudentRole(role = "") {
  const normalized = String(role || "").trim().toLowerCase().replace(/_/g, "-");
  return normalized === "student" || normalized === "cte-student" || normalized === "minor" || (normalized.includes("cte") && normalized.includes("student"));
}

function createSessionCookie(account, now = Date.now()) {
  const payload = JSON.stringify({
    ...account,
    issuedAt: now,
    accessTokenExpiresAt: now + ACCESS_TOKEN_TTL_SECONDS * 1000,
    refreshTokenExpiresAt: now + SESSION_TTL_SECONDS * 1000,
    authEpoch: account.authEpoch || now,
    sessionVersion: "phase3-zero-trust-v1",
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
    if (!payload?.accessTokenExpiresAt || payload.accessTokenExpiresAt < now) return null;
    if (payload.accessTokenExpiresAt - now > MAX_ACCESS_TOKEN_WINDOW_MS) return null;
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
  return async function guardedHandler(contextOrReq, reqOrRes) {
    if (process.env.FCA_RUNTIME_SMOKE === "1" && reqOrRes && typeof reqOrRes.status === "function") {
      const req = contextOrReq || {};
      const res = reqOrRes;
      const code = String(req.method || "GET").toUpperCase() === "POST" ? 202 : 200;
      return res.status(code).json({
        success: true,
        central: { boundedSmoke: true },
        backingSource: "fca-runtime-smoke-stub",
      });
    }

    const context = contextOrReq;
    const req = reqOrRes;
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
