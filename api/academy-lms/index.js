const { createCentralProxy } = require("../_lib/proxyToCentral");
const crypto = require("crypto");

const SESSION_COOKIE_NAME = "fca_session";
const DEFAULT_SESSION_SECRET = "FCA_SERVER_SESSION_DEV_ONLY_CHANGE_ME";

function getSessionSecret() {
  return process.env.FCA_SESSION_SECRET || DEFAULT_SESSION_SECRET;
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function signPayload(payload) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("hex");
}

function readSessionToken(req) {
  const cookieHeader = (req.headers && req.headers["cookie"]) || "";
  const parts = String(cookieHeader).split(";").map((p) => p.trim()).filter(Boolean);
  const match = parts.find((p) => p.startsWith(`${SESSION_COOKIE_NAME}=`));
  return match ? match.slice(SESSION_COOKIE_NAME.length + 1) : null;
}

function validateToken(token) {
  if (!token || !token.includes(".")) return null;
  const [encodedPayload, providedSignature] = token.split(".");
  if (signPayload(encodedPayload) !== providedSignature) return null;
  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload?.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

const UNAUTH_RESPONSE = {
  status: 401,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    status: 401,
    ok: false,
    error: "Authentication required.",
    authContext: { authenticated: false, source: "missing-session" },
  }),
};

const centralProxy = createCentralProxy("/academy-lms");

/** SWA proxy: forwards /api/academy-lms → Auricrux Central with auth enforcement. */
module.exports = function academyLmsHandler(context, req) {
  if (req.method === "OPTIONS") {
    context.res = { status: 204, body: "" };
    return;
  }
  const token = readSessionToken(req);
  const session = validateToken(token);
  if (!session) {
    context.res = UNAUTH_RESPONSE;
    return;
  }
  return centralProxy(context, req);
};
