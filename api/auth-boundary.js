import crypto from "node:crypto";

const SESSION_COOKIE_NAME = "fca_session";
const DEFAULT_SESSION_SECRET = "FCA_SERVER_SESSION_DEV_ONLY_CHANGE_ME";

function getSessionSecret() {
  return process.env.FCA_SESSION_SECRET || DEFAULT_SESSION_SECRET;
}

function signPayload(payload) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function readSessionTokenFromCookieHeader(cookieHeader = "") {
  const parts = String(cookieHeader)
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  const match = parts.find((part) => part.startsWith(`${SESSION_COOKIE_NAME}=`));
  return match ? match.slice(SESSION_COOKIE_NAME.length + 1) : null;
}

export function validateSessionToken(token) {
  if (!token || !token.includes(".")) return null;

  const [encodedPayload, providedSignature] = token.split(".");
  const expectedSignature = signPayload(encodedPayload);

  if (providedSignature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload?.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
