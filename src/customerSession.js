import { centralApi, centralFetch } from "./api/backendBase.js";

export const CUSTOMER_SESSION_KEY = "fca_customer_session_v1";
export const CUSTOMER_SESSION_EVENT = "fca-customer-session-updated";
export const CUSTOMER_SESSION_EXPIRED_EVENT = "fca-customer-session-expired";

const DEFAULT_POST_LOGIN_HREF = "/portal/platform";

const ADMIN_PAYROLL_ROUTE_PREFIXES = ["/portal/admin", "/portal/admin/payroll"];
const EMPLOYEE_PAYROLL_ROUTE_PREFIXES = ["/portal/employee", "/portal/employee/payroll", "/portal/employee/internal"];

let hydrateSessionPromise = null;

const DEFAULT_AUTH_BOUNDARY = {
  productionAuthReady: false,
  activeMode: "server-session",
  identityProvider: "fca-native-auth",
  tenantIsolation: "single-repo-account-store",
  sessionValidation: "signed-http-only-cookie",
  nextBuildStep: "Verify managed account onboarding, session secret rotation, and tenant-level access controls.",
};

function normalizeEnabledProducts(enabledProducts) {
  return {
    saas: enabledProducts?.saas !== false,
    lms: enabledProducts?.lms !== false,
    auricrux: enabledProducts?.auricrux !== false,
  };
}

function normalizeEnabledComms(enabledComms) {
  return {
    chat: enabledComms?.chat !== false,
    sms: enabledComms?.sms !== false,
    phone: enabledComms?.phone !== false,
    email: enabledComms?.email !== false,
    teams: enabledComms?.teams !== false,
    conference: enabledComms?.conference !== false,
    lecture: enabledComms?.lecture !== false,
  };
}

function normalizeAuthBoundary(authBoundary) {
  return {
    ...DEFAULT_AUTH_BOUNDARY,
    ...(authBoundary || {}),
  };
}

function isCteStudentRole(role = "") {
  const normalized = String(role || "").trim().toLowerCase().replace(/_/g, "-");
  return normalized === "student" || normalized === "cte-student" || normalized === "minor" || (normalized.includes("cte") && normalized.includes("student"));
}

function normalizeRoleToken(role = "") {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isAdminRole(role = "") {
  const normalized = normalizeRoleToken(role);
  if (!normalized) return false;
  return [
    "owner",
    "admin",
    "founder",
    "system admin",
    "accounting",
    "payroll admin",
    "hr",
  ].some((token) => normalized.includes(token));
}

function isEmployeeRole(role = "") {
  const normalized = normalizeRoleToken(role);
  if (!normalized) return false;
  return [
    "employee",
    "project coordinator",
    "superintendent",
    "field operations",
    "estimator",
  ].some((token) => normalized.includes(token));
}

export function isCteProtectedRoute(pathname = "/") {
  if (pathname === "/cte/login" || pathname.startsWith("/cte/login/")) return false;
  return pathname === "/cte" || pathname.startsWith("/cte/");
}

export function isCteOnlySession(session = null) {
  if (!session?.authenticated) return false;
  return session.cteProgramEnabled === true || isCteStudentRole(session.role);
}

function broadcastCustomerSessionUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CUSTOMER_SESSION_EVENT));
}


async function readJsonSafe(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) return null;

  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function readCustomerSession() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CUSTOMER_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.authenticated) return null;

    return {
      ...parsed,
      role: parsed.role || "Owner / Admin",
      customerId: parsed.customerId || "CUST-FCA-LIVE-001",
      selectedPlan: parsed.selectedPlan || "startup",
      accountSource: parsed.accountSource || "server-session",
      accountMode: parsed.accountMode || (isCteStudentRole(parsed.role) ? "cte-shadow" : "live"),
      cteProgramEnabled: parsed.cteProgramEnabled === true || isCteStudentRole(parsed.role),
      authBoundary: normalizeAuthBoundary(parsed.authBoundary),
      enabledProducts: normalizeEnabledProducts(parsed.enabledProducts),
      enabledComms: normalizeEnabledComms(parsed.enabledComms),
    };
  } catch {
    return null;
  }
}

export function writeCustomerSession(session) {
  if (typeof window === "undefined") return null;

  const payload = {
    authenticated: true,
    email: session.email,
    company: session.company,
    role: session.role || "Owner / Admin",
    customerId: session.customerId || "CUST-FCA-LIVE-001",
    workspaceLabel: session.workspaceLabel || session.company,
    lastLoginAt: session.lastLoginAt || new Date().toISOString(),
    nextHref: session.nextHref || "/portal/platform",
    selectedPlan: session.selectedPlan || "startup",
    accountSource: session.accountSource || "server-session",
    accountMode: session.accountMode || (isCteStudentRole(session.role) ? "cte-shadow" : "live"),
    cteProgramEnabled: session.cteProgramEnabled === true || isCteStudentRole(session.role),
    issuedAt: session.issuedAt,
    accessTokenExpiresAt: session.accessTokenExpiresAt,
    refreshTokenExpiresAt: session.refreshTokenExpiresAt,
    authEpoch: session.authEpoch,
    sessionVersion: session.sessionVersion,
    authBoundary: normalizeAuthBoundary(session.authBoundary),
    enabledProducts: normalizeEnabledProducts(session.enabledProducts),
    enabledComms: normalizeEnabledComms(session.enabledComms),
  };

  try {
    window.localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(payload));
    broadcastCustomerSessionUpdate();
  } catch {
    // keep login best-effort during shell hardening phase
  }

  return payload;
}

function isSameOriginCentralApi(path = "/api/customer-session") {
  if (typeof window === "undefined") return false;
  return centralApi(path).startsWith(window.location.origin);
}

function broadcastSessionExpired() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CUSTOMER_SESSION_EXPIRED_EVENT));
}

export async function syncCustomerSessionFromServer() {
  if (typeof window === "undefined") return null;

  const localSession = readCustomerSession();
  const sameOriginApi = isSameOriginCentralApi("/api/customer-session");

  try {
    const response = await centralFetch("/api/customer-session", {
      method: "GET",
    });

    const payload = await readJsonSafe(response);

    if (response.ok && payload?.ok && payload?.authenticated && payload?.account) {
      return writeCustomerSession({
        ...payload.account,
        authenticated: true,
        accountSource: payload.session?.sessionSource || payload.authenticationMode || "server-session",
        accountMode: payload.account?.accountMode || "seeded",
        authBoundary: payload.authBoundary,
        lastLoginAt: new Date().toISOString(),
        nextHref: localSession?.nextHref || payload.account?.nextHref || DEFAULT_POST_LOGIN_HREF,
      });
    }

    if (response.ok && payload?.ok && !payload?.authenticated && localSession && sameOriginApi) {
      await clearCustomerSession({ server: false });
      broadcastSessionExpired();
      return null;
    }

    // Cross-origin API cannot read browser session cookies from the SWA domain — keep local session.
    return localSession;
  } catch {
    return localSession;
  }
}

export function hydrateCustomerSession() {
  if (typeof window === "undefined") return Promise.resolve(readCustomerSession());

  if (!hydrateSessionPromise) {
    hydrateSessionPromise = syncCustomerSessionFromServer()
      .catch(() => readCustomerSession())
      .finally(() => {
        hydrateSessionPromise = null;
      });
  }

  return hydrateSessionPromise;
}

export function canRenderProtectedRouteImmediately(pathname = "/") {
  if (typeof window === "undefined") return false;
  if (!isProtectedCustomerRoute(pathname)) return true;
  return Boolean(readCustomerSession()?.authenticated);
}

export function updateCustomerSession(updates = {}) {
  const currentSession = readCustomerSession();
  if (!currentSession) return null;

  return writeCustomerSession({
    ...currentSession,
    ...updates,
    authBoundary: normalizeAuthBoundary({
      ...currentSession.authBoundary,
      ...updates.authBoundary,
    }),
    enabledProducts: normalizeEnabledProducts({
      ...currentSession.enabledProducts,
      ...updates.enabledProducts,
    }),
    enabledComms: normalizeEnabledComms({
      ...currentSession.enabledComms,
      ...updates.enabledComms,
    }),
  });
}

export async function clearCustomerSession({ server = false } = {}) {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(CUSTOMER_SESSION_KEY);
      broadcastCustomerSessionUpdate();
    } catch {
      // best-effort logout only
    }
  }

  if (server && typeof window !== "undefined") {
    try {
      await centralFetch("/api/customer-logout", {
        method: "POST",
      });
    } catch {
      // best-effort server logout only
    }
  }
}

const ACADEMY_PUBLIC_PREFIXES = ["/academy/catalog"];

function isAcademyModuleLessonRoute(pathname = "/") {
  return /^\/academy\/programs\/[^/]+\/modules\/[^/]+\/?$/.test(pathname);
}

export function isAcademyProtectedRoute(pathname = "/") {
  if (!pathname.startsWith("/academy")) return false;
  if (ACADEMY_PUBLIC_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return false;
  }
  if (pathname === "/academy") return true;
  if (pathname === "/academy/dashboard" || pathname === "/academy/credentials") return true;
  if (isAcademyModuleLessonRoute(pathname)) return true;
  if (pathname.startsWith("/portal/academy")) return true;
  return false;
}

export function isProtectedCustomerRoute(pathname = "/") {
  return pathname.startsWith("/portal") || isAcademyProtectedRoute(pathname) || isCteProtectedRoute(pathname);
}

export function isAllowedPostLoginHref(href = "/") {
  if (!href || typeof href !== "string") return false;
  return href.startsWith("/portal") || isAcademyProtectedRoute(href) || href.startsWith("/academy/programs/") || isCteProtectedRoute(href);
}

export function resolveCustomerProduct(pathname = "/") {
  if (isCteProtectedRoute(pathname)) return "cte";
  if (isAcademyProtectedRoute(pathname) || pathname.startsWith("/portal/academy")) return "lms";
  if (pathname.startsWith("/portal/auricrux")) return "auricrux";
  if (pathname.startsWith("/portal") || pathname === "/login") return "saas";
  if (pathname === "/auricrux") return "public";
  return "public";
}

export function hasCustomerProductAccess(session, pathname = "/") {
  const product = resolveCustomerProduct(pathname);
  if (product === "public") return true;
  if (!session?.authenticated) return false;

  if (isCteOnlySession(session)) {
    return product === "cte";
  }

  if (product === "cte") {
    return false;
  }

  return session.enabledProducts?.[product] !== false;
}

export function isAdminPayrollRoute(pathname = "/") {
  return ADMIN_PAYROLL_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isEmployeePayrollRoute(pathname = "/") {
  return EMPLOYEE_PAYROLL_ROUTE_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export function isPayrollAdminSession(session = readCustomerSession()) {
  if (!session?.authenticated) return false;
  if (isCteOnlySession(session)) return false;
  return isAdminRole(session.role);
}

export function isPayrollEmployeeSession(session = readCustomerSession()) {
  if (!session?.authenticated) return false;
  if (isCteOnlySession(session)) return false;
  if (isPayrollAdminSession(session)) return false;
  return isEmployeeRole(session.role);
}

export function hasRoleRouteAccess(session, pathname = "/") {
  if (!isAdminPayrollRoute(pathname) && !isEmployeePayrollRoute(pathname)) return true;
  if (isAdminPayrollRoute(pathname)) return isPayrollAdminSession(session);
  if (isEmployeePayrollRoute(pathname)) return isPayrollEmployeeSession(session);
  return true;
}

export function resolveLoginHref(nextPath = null) {
  if (nextPath && isProtectedCustomerRoute(nextPath)) {
    if (isCteProtectedRoute(nextPath)) {
      return `/cte/login?next=${encodeURIComponent(nextPath)}`;
    }
    return `/login?next=${encodeURIComponent(nextPath)}`;
  }
  return "/login";
}

export function resolveAdminWorkspaceHref(session = readCustomerSession()) {
  const adminPath = "/portal/admin";
  if (session?.authenticated && hasCustomerProductAccess(session, adminPath)) {
    return adminPath;
  }
  return resolveLoginHref(adminPath);
}

export function isFounderSession(session = readCustomerSession()) {
  const email = (session?.email || "").trim().toLowerCase();
  return session?.role === "Founder / Owner" || email === "michael@futurecontractorsofamerica.com";
}

export function resolveFounderAutologinHref(next = "/portal/platform", accountKey = "test") {
  const params = new URLSearchParams({
    seeded: "1",
    autologin: "1",
    next,
  });
  const normalizedKey = (accountKey || "test").trim().toLowerCase();
  if (normalizedKey && normalizedKey !== "test") {
    params.set("account", normalizedKey);
  }
  return `/login?${params.toString()}`;
}

export function resolveSandboxLoginHref(next = "/portal/platform") {
  return `/login?seeded=1&next=${encodeURIComponent(next)}`;
}

export function resolveProfileHref(session = readCustomerSession()) {
  return session?.authenticated ? "/portal/profile" : resolveLoginHref();
}

export function resolveDefaultPostLoginHref(session = readCustomerSession()) {
  if (!session?.authenticated) return DEFAULT_POST_LOGIN_HREF;
  if (isCteOnlySession(session) && hasCustomerProductAccess(session, "/cte")) return "/cte";
  if (hasCustomerProductAccess(session, DEFAULT_POST_LOGIN_HREF)) return DEFAULT_POST_LOGIN_HREF;
  if (hasCustomerProductAccess(session, "/portal/pipeline")) return "/portal/pipeline";
  if (hasCustomerProductAccess(session, "/portal/auricrux")) return "/portal/auricrux";
  if (hasCustomerProductAccess(session, "/academy")) return "/academy";
  if (hasCustomerProductAccess(session, "/cte")) return "/cte";
  return "/portal/profile";
}

export function resolveWorkspaceEntryHref(session = readCustomerSession(), requestedPath = DEFAULT_POST_LOGIN_HREF) {
  if (!session?.authenticated) return resolveLoginHref(requestedPath);
  if (requestedPath && isProtectedCustomerRoute(requestedPath) && hasCustomerProductAccess(session, requestedPath)) return requestedPath;
  if (session.nextHref && isProtectedCustomerRoute(session.nextHref) && hasCustomerProductAccess(session, session.nextHref)) return session.nextHref;
  return resolveDefaultPostLoginHref(session);
}

export function resolveSessionExpiredLoginHref(nextPath = null) {
  const base = resolveLoginHref(nextPath);
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}session=expired`;
}
