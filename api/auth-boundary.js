import crypto from "node:crypto";

export const AUTH_BOUNDARY = {
  productionAuthReady: false,
  activeMode: "server-session",
  identityProvider: "fca-native-auth",
  tenantIsolation: "single-repo-account-store",
  sessionValidation: "signed-http-only-cookie",
  nextBuildStep: "Move customer accounts and session secret into managed identity-backed storage.",
};

const SESSION_COOKIE_NAME = "fca_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
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
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function buildAuthBoundary(overrides = {}) {
  return {
    ...AUTH_BOUNDARY,
    usingFallbackSecret: !process.env.FCA_SESSION_SECRET,
    ...overrides,
    timestamp: new Date().toISOString(),
  };
}

export function buildServerSession(account = null) {
  if (!account) {
    return {
      authenticated: false,
      sessionSource: "none",
      customer: null,
    };
  }

  return {
    authenticated: true,
    sessionSource: "server-session",
    customer: {
      email: account.email,
      company: account.company,
      role: account.role,
      customerId: account.customerId,
      workspaceLabel: account.workspaceLabel,
      selectedPlan: account.selectedPlan,
      enabledProducts: account.enabledProducts,
      enabledComms: account.enabledComms,
    },
  };
}

export function createSessionCookie(account) {
  const payload = JSON.stringify({
    email: account.email,
    customerId: account.customerId,
    company: account.company,
    role: account.role,
    workspaceLabel: account.workspaceLabel,
    selectedPlan: account.selectedPlan,
    enabledProducts: account.enabledProducts,
    enabledComms: account.enabledComms,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  });

  const encodedPayload = base64UrlEncode(payload);
  const signature = signPayload(encodedPayload);
  const token = `${encodedPayload}.${signature}`;
  const cookie = `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_SECONDS}; SameSite=Lax; Secure`;

  return { token, cookie };
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure`;
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
