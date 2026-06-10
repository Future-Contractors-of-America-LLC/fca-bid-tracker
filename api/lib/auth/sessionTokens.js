import { createHmac, timingSafeEqual } from "node:crypto";

const TOKEN_VERSION = "fca_customer_session_v1";
const DEFAULT_TTL_SECONDS = 60 * 60 * 12;

function base64UrlEncode(value) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(value) {
  const normalized = String(value || "")
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, "base64").toString("utf8");
}

function signParts(headerPart, payloadPart, secret) {
  return createHmac("sha256", secret)
    .update(`${headerPart}.${payloadPart}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function issueSessionToken(account, options = {}) {
  const secret = options.secret || process.env.FCA_AUTH_SESSION_SECRET;
  if (!secret) {
    throw new Error("FCA_AUTH_SESSION_SECRET is required.");
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + Number(options.ttlSeconds || DEFAULT_TTL_SECONDS);
  const payload = {
    ver: TOKEN_VERSION,
    sub: account.customerId,
    email: account.email,
    company: account.company,
    role: account.role,
    selectedPlan: account.selectedPlan,
    enabledProducts: account.enabledProducts,
    enabledComms: account.enabledComms,
    workspaceLabel: account.workspaceLabel,
    iat: issuedAt,
    exp: expiresAt,
  };

  const headerPart = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadPart = base64UrlEncode(JSON.stringify(payload));
  const signaturePart = signParts(headerPart, payloadPart, secret);
  return `${headerPart}.${payloadPart}.${signaturePart}`;
}

export function verifySessionToken(token, options = {}) {
  const secret = options.secret || process.env.FCA_AUTH_SESSION_SECRET;
  if (!secret) {
    throw new Error("FCA_AUTH_SESSION_SECRET is required.");
  }

  const [headerPart, payloadPart, signaturePart] = String(token || "").split(".");
  if (!headerPart || !payloadPart || !signaturePart) return null;

  const expectedSignature = signParts(headerPart, payloadPart, secret);
  const provided = Buffer.from(signaturePart);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  const payload = JSON.parse(base64UrlDecode(payloadPart));
  if (payload?.ver !== TOKEN_VERSION) return null;
  if (!payload?.exp || payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}
