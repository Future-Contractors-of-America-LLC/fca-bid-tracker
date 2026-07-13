import { centralApi, centralFetch } from "./api/backendBase.js";

export const CUSTOMER_SESSION_KEY = "fca_customer_session_v1";
export const CUSTOMER_SESSION_EVENT = "fca-customer-session-updated";
export const CUSTOMER_SESSION_EXPIRED_EVENT = "fca-customer-session-expired";

const DEFAULT_POST_LOGIN_HREF = "/portal/proof";

let hydrateSessionPromise = null;

const DEFAULT_AUTH_BOUNDARY = {
  productionAuthReady: false,
  activeMode: "server-session",
  identityProvider: "fca-native-auth",
  tenantIsolation: "single-repo-account-store",
  sessionValidation: "signed-http-only-cookie",
  nextBuildStep: "Move customer accounts and session secret into managed identity-backed storage.",
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

function normalizeProfile(profile, session = {}) {
  const email = (session?.email || "").trim().toLowerCase();
  const fallbackName = email.includes("@") ? email.split("@")[0].replace(/[._-]+/g, " ") : "";
  return {
    fullName: (profile?.fullName || fallbackName || "").trim(),
    title: (profile?.title || session?.role || "Owner / Admin").trim(),
    phone: (profile?.phone || "").trim(),
  };
}

function normalizeCompanySettings(companySettings, session = {}) {
  return {
    supportEmail: (companySettings?.supportEmail || session?.email || "").trim().toLowerCase(),
    phone: (companySettings?.phone || "").trim(),
    website: (companySettings?.website || "").trim(),
  };
}

const DASHBOARD_LAYOUTS = new Set(["balanced", "compact", "dense"]);

function normalizeDashboardLayout(value) {
  const layout = String(value || "balanced").trim().toLowerCase();
  return DASHBOARD_LAYOUTS.has(layout) ? layout : "balanced";
}

function normalizeBrandSkin(brandSkin = {}, session = {}) {
  const accent = (brandSkin?.accent || "#1d4ed8").trim() || "#1d4ed8";
  const surface = (brandSkin?.surface || "#eff6ff").trim() || "#eff6ff";
  return {
    companyName: (brandSkin?.companyName || session?.company || "").trim(),
    welcomeMessage: (brandSkin?.welcomeMessage || "").trim(),
    accent,
    surface,
    primaryColor: (brandSkin?.primaryColor || accent).trim() || accent,
    secondaryColor: (brandSkin?.secondaryColor || surface).trim() || surface,
    dashboardLayout: normalizeDashboardLayout(brandSkin?.dashboardLayout),
  };
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
      accountSource: parsed.accountSource || "workspace-shell",
      accountMode: parsed.accountMode || "seeded",
      authBoundary: normalizeAuthBoundary(parsed.authBoundary),
      enabledProducts: normalizeEnabledProducts(parsed.enabledProducts),
      enabledComms: normalizeEnabledComms(parsed.enabledComms),
      profile: normalizeProfile(parsed.profile, parsed),
      companySettings: normalizeCompanySettings(parsed.companySettings, parsed),
      brandSkin: normalizeBrandSkin(parsed.brandSkin, parsed),
      sessionToken: parsed.sessionToken || null,
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
    accountSource: session.accountSource || "workspace-shell",
    accountMode: session.accountMode || "seeded",
    authBoundary: normalizeAuthBoundary(session.authBoundary),
    enabledProducts: normalizeEnabledProducts(session.enabledProducts),
    enabledComms: normalizeEnabledComms(session.enabledComms),
    profile: normalizeProfile(session.profile, session),
    companySettings: normalizeCompanySettings(session.companySettings, session),
    brandSkin: normalizeBrandSkin(session.brandSkin, session),
    sessionToken: session.sessionToken || null,
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
        company: payload.account.company || localSession?.company,
        role: payload.account.role || localSession?.role,
        workspaceLabel: payload.account.workspaceLabel || localSession?.workspaceLabel,
        profile: payload.account.profile || localSession?.profile || null,
        companySettings: payload.account.companySettings || localSession?.companySettings || null,
        brandSkin: payload.account.brandSkin || localSession?.brandSkin || null,
        sessionToken: payload.sessionToken || localSession?.sessionToken || null,
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
    profile: normalizeProfile({
      ...currentSession.profile,
      ...updates.profile,
    }, {
      ...currentSession,
      ...updates,
    }),
    companySettings: normalizeCompanySettings({
      ...currentSession.companySettings,
      ...updates.companySettings,
    }, {
      ...currentSession,
      ...updates,
    }),
    brandSkin: normalizeBrandSkin({
      ...currentSession.brandSkin,
      ...updates.brandSkin,
    }, {
      ...currentSession,
      ...updates,
    }),
    sessionToken: updates.sessionToken || currentSession.sessionToken || null,
  });
}

export async function persistCustomerPreferences(updates = {}) {
  const currentSession = readCustomerSession();
  if (!currentSession?.authenticated) {
    return { ok: false, error: "No authenticated customer session was found." };
  }

  const optimistic = updateCustomerSession(updates);

  try {
    const response = await centralFetch("/api/customer-session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        company: updates.company,
        workspaceLabel: updates.workspaceLabel,
        role: updates.role,
        profile: updates.profile,
        companySettings: updates.companySettings,
        brandSkin: updates.brandSkin,
      }),
    });
    const payload = await readJsonSafe(response);
    if (!response.ok || !payload?.ok || !payload?.account) {
      return {
        ok: Boolean(optimistic),
        session: optimistic,
        warning: payload?.error || "Saved on this device only. Server preference sync is unavailable.",
        backingSource: "local-session",
      };
    }

    const saved = writeCustomerSession({
      ...optimistic,
      ...payload.account,
      sessionToken: payload.sessionToken || optimistic?.sessionToken || currentSession.sessionToken,
      authBoundary: payload.authBoundary || optimistic?.authBoundary,
      accountSource: payload.session?.sessionSource || optimistic?.accountSource,
    });
    return {
      ok: true,
      session: saved,
      backingSource: payload.backingSource || "customer-preferences",
    };
  } catch (error) {
    return {
      ok: Boolean(optimistic),
      session: optimistic,
      warning: error?.message || "Saved on this device only. Server preference sync failed.",
      backingSource: "local-session",
    };
  }
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
  return pathname.startsWith("/portal") || isAcademyProtectedRoute(pathname);
}

export function isAllowedPostLoginHref(href = "/") {
  if (!href || typeof href !== "string") return false;
  return href.startsWith("/portal") || isAcademyProtectedRoute(href) || href.startsWith("/academy/programs/");
}

export function resolveCustomerProduct(pathname = "/") {
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
  return session.enabledProducts?.[product] !== false;
}

export function resolveLoginHref(nextPath = null) {
  if (nextPath && isProtectedCustomerRoute(nextPath)) {
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

export function resolveFounderAutologinHref(next = "/portal/proof", accountKey = "test") {
  // Production: managed login only. Seeded autologin remains local-dev convenience.
  const host = typeof window !== "undefined" ? (window.location.hostname || "").toLowerCase() : "";
  const isLocal = !host || host.includes("localhost") || host.includes("127.0.0.1");
  if (!isLocal) {
    return `/login?next=${encodeURIComponent(next)}`;
  }
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

export function resolveSandboxLoginHref(next = "/portal/proof") {
  const host = typeof window !== "undefined" ? (window.location.hostname || "").toLowerCase() : "";
  const isLocal = !host || host.includes("localhost") || host.includes("127.0.0.1");
  if (!isLocal) {
    return `/login?next=${encodeURIComponent(next)}`;
  }
  return `/login?seeded=1&next=${encodeURIComponent(next)}`;
}

export function resolveProfileHref(session = readCustomerSession()) {
  return session?.authenticated ? "/portal/profile" : resolveLoginHref();
}

export function resolveDefaultPostLoginHref(session = readCustomerSession()) {
  if (!session?.authenticated) return DEFAULT_POST_LOGIN_HREF;
  if (hasCustomerProductAccess(session, DEFAULT_POST_LOGIN_HREF)) return DEFAULT_POST_LOGIN_HREF;
  if (hasCustomerProductAccess(session, "/portal/pipeline")) return "/portal/pipeline";
  if (hasCustomerProductAccess(session, "/portal/auricrux")) return "/portal/auricrux";
  if (hasCustomerProductAccess(session, "/academy")) return "/academy";
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
