import crypto from "node:crypto";
import { allowSeededCustomerFallback, hasManagedCustomerAccounts } from "./customer-account-store.js";

const SESSION_COOKIE_NAME = "fca_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const STUDENT_IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const DEFAULT_SESSION_SECRET = "FCA_SERVER_SESSION_DEV_ONLY_CHANGE_ME";

export const CHPS_TENANT_CONFIG = {
  tenantId: "TEN-CHPS-PILOT-001",
  schoolYear: "2026-2027",
  auricruxLiveEnabled: false,
  cteProgramAuricruxEnabled: true,
  maxStudentAccounts: 80,
  sessionIdleTimeoutMinutes: 30,
  dataRetentionEndDate: "2027-06-30",
  dpaStatus: "pending-signature",
};

function getSessionSecret() {
  return process.env.FCA_SESSION_SECRET || DEFAULT_SESSION_SECRET;
}

function hasManagedSessionSecret() {
  return Boolean(process.env.FCA_SESSION_SECRET);
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

export function buildAuthBoundary(overrides = {}) {
  const managedAccountsReady = hasManagedCustomerAccounts();
  const managedSecretReady = hasManagedSessionSecret();
  const productionAuthReady = managedAccountsReady && managedSecretReady;

  return {
    productionAuthReady,
    activeMode: productionAuthReady ? "managed-server-session" : managedAccountsReady ? "managed-server-session-with-fallback-secret" : "seeded-server-session",
    identityProvider: "fca-native-auth",
    tenantIsolation: managedAccountsReady ? "managed-customer-account-store" : "single-repo-account-store",
    sessionValidation: "signed-http-only-cookie",
    usingFallbackSecret: !managedSecretReady,
    seededFallbackEnabled: allowSeededCustomerFallback(),
    nextBuildStep: productionAuthReady
      ? "Managed customer auth is live in repo configuration; verify runtime and rotate credentials through controlled onboarding."
      : managedAccountsReady
        ? "Set FCA_SESSION_SECRET in the deployment environment to promote managed customer auth out of fallback-secret mode."
        : "Set FCA_CUSTOMER_ACCOUNTS_JSON and FCA_SESSION_SECRET to activate managed customer authentication.",
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
    sessionSource: account.authenticationMode || "server-session",
    customer: {
      email: account.email,
      company: account.company,
      role: account.role,
      customerId: account.customerId,
      workspaceLabel: account.workspaceLabel,
      selectedPlan: account.selectedPlan,
      enabledProducts: account.enabledProducts,
      enabledComms: account.enabledComms,
      accountMode: account.accountMode || "seeded",
    },
  };
}

export function createSessionCookie(account, now = Date.now()) {
  const payload = JSON.stringify({
    email: account.email,
    customerId: account.customerId,
    company: account.company,
    role: account.role,
    cteProgramEnabled: account.cteProgramEnabled || false,
    workspaceLabel: account.workspaceLabel,
    selectedPlan: account.selectedPlan,
    enabledProducts: account.enabledProducts,
    enabledComms: account.enabledComms,
    accountMode: account.accountMode || "seeded",
    lastActiveAt: now,
    exp: now + SESSION_TTL_SECONDS * 1000,
  });

  const encodedPayload = base64UrlEncode(payload);
  const signature = signPayload(encodedPayload);
  const token = `${encodedPayload}.${signature}`;
  const cookie = `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${SESSION_TTL_SECONDS}; SameSite=Strict; Secure`;

  return { token, cookie };
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict; Secure`;
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

const AUTH_REQUIRED_RESPONSE = {
  status: 401,
  jsonBody: {
    status: 401,
    ok: false,
    error: "Authentication required.",
    authContext: { authenticated: false, source: "missing-session" },
  },
};

const IDLE_TIMEOUT_RESPONSE = {
  status: 401,
  jsonBody: {
    status: 401,
    ok: false,
    error: "Authentication required.",
    authContext: { authenticated: false, source: "idle-timeout", reason: "idle-timeout" },
  },
};

function isStudentRole(role) {
  return role === "student";
}

/**
 * Validates authentication from the request cookie.
 * Returns { ok: true, session, tenantId, refreshCookie } on success.
 * Returns { ok: false, response } on failure — routes must return response immediately.
 */
export function requireAuth(request, now = Date.now()) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = readSessionTokenFromCookieHeader(cookieHeader);
  const session = validateSessionToken(token);

  if (!session) {
    return { ok: false, response: AUTH_REQUIRED_RESPONSE };
  }

  if (isStudentRole(session.role)) {
    const lastActive = session.lastActiveAt || 0;
    if (now - lastActive > STUDENT_IDLE_TIMEOUT_MS) {
      return { ok: false, response: IDLE_TIMEOUT_RESPONSE, idleTimeout: true, session };
    }
  }

  const refreshedAccount = {
    ...session,
    lastActiveAt: now,
  };
  const { cookie: refreshCookie } = createSessionCookie(refreshedAccount, now);

  return {
    ok: true,
    session,
    tenantId: session.customerId || null,
    refreshCookie,
  };
}
